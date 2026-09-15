import vine from '@vinejs/vine'

import { CUSTOMER_STATUS_VALUES } from '#enums/crm'
import { crmMessagesProvider } from '#validators/messages'

/**
 * Campos opcionais chegam do formulário HTML como string vazia. O `parse` roda
 * antes das validações, então trocamos `''` por `null` e o `nullable()` aceita.
 */
const emptyToNull = (value: unknown) => (value === '' ? null : value)

/**
 * Fábrica dos campos: cada validador recebe instâncias próprias do schema,
 * evitando compartilhar estado entre os dois `vine.compile()`.
 */
const customerFields = () => ({
  name: vine.string().trim().minLength(2).maxLength(150),

  email: vine
    .string()
    .parse(emptyToNull)
    .trim()
    .email()
    .normalizeEmail()
    .nullable()
    .optional(),

  phone: vine.string().parse(emptyToNull).trim().maxLength(30).nullable().optional(),

  company: vine.string().parse(emptyToNull).trim().maxLength(150).nullable().optional(),

  status: vine.enum(CUSTOMER_STATUS_VALUES),
})

export const createCustomerValidator = vine.compile(vine.object(customerFields()))

export const updateCustomerValidator = vine.compile(vine.object(customerFields()))

// Mensagens de erro em portugues (o VineJS congela o provider na compilacao).
createCustomerValidator.messagesProvider = crmMessagesProvider
updateCustomerValidator.messagesProvider = crmMessagesProvider

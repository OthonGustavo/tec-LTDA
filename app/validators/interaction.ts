import vine from '@vinejs/vine'
import { crmMessagesProvider } from '#validators/messages'

export const createInteractionValidator = vine.compile(
  vine.object({
    note: vine.string().trim().minLength(3).maxLength(2000),
  })
)

// Mensagens de erro em portugues (o VineJS congela o provider na compilacao).
createInteractionValidator.messagesProvider = crmMessagesProvider

import vine from '@vinejs/vine'
import { OPPORTUNITY_STAGE_VALUES } from '#enums/crm'
import { crmMessagesProvider } from '#validators/messages'

/**
 * Campos de uma oportunidade. `estimatedValue` chega como string do
 * <input type="number">; o VineJS converte para número antes de validar o mínimo.
 */
function opportunityFields() {
  return {
    title: vine.string().trim().minLength(3).maxLength(150),
    estimatedValue: vine.number().min(0),
    stage: vine.enum(OPPORTUNITY_STAGE_VALUES),
  }
}

export const createOpportunityValidator = vine.compile(vine.object(opportunityFields()))

export const updateOpportunityValidator = vine.compile(vine.object(opportunityFields()))

// Mensagens de erro em portugues (o VineJS congela o provider na compilacao).
createOpportunityValidator.messagesProvider = crmMessagesProvider
updateOpportunityValidator.messagesProvider = crmMessagesProvider

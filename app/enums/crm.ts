/**
 * Valores canônicos do CRM. Models, validators e views importam daqui para que
 * o banco, os formulários e os rótulos exibidos nunca saiam de sincronia.
 */

export const CUSTOMER_STATUS = {
  LEAD: 'lead',
  NEGOCIACAO: 'em_negociacao',
  ATENDIDO: 'cliente_atendido',
} as const

export type CustomerStatus = (typeof CUSTOMER_STATUS)[keyof typeof CUSTOMER_STATUS]

export const CUSTOMER_STATUS_VALUES = Object.values(CUSTOMER_STATUS) as CustomerStatus[]

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  [CUSTOMER_STATUS.LEAD]: 'Lead',
  [CUSTOMER_STATUS.NEGOCIACAO]: 'Em Negociação',
  [CUSTOMER_STATUS.ATENDIDO]: 'Cliente Atendido',
}

/** Classes Tailwind do badge de status, usadas nas tabelas e no detalhe. */
export const CUSTOMER_STATUS_CLASSES: Record<CustomerStatus, string> = {
  [CUSTOMER_STATUS.LEAD]: 'bg-slate-100 text-slate-700 ring-slate-200',
  [CUSTOMER_STATUS.NEGOCIACAO]: 'bg-amber-100 text-amber-800 ring-amber-200',
  [CUSTOMER_STATUS.ATENDIDO]: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
}

export const OPPORTUNITY_STAGE = {
  CONTATO: 'contato_inicial',
  PROPOSTA: 'proposta_enviada',
  GANHO: 'ganho',
  PERDIDO: 'perdido',
} as const

export type OpportunityStage = (typeof OPPORTUNITY_STAGE)[keyof typeof OPPORTUNITY_STAGE]

export const OPPORTUNITY_STAGE_VALUES = Object.values(OPPORTUNITY_STAGE) as OpportunityStage[]

export const OPPORTUNITY_STAGE_LABELS: Record<OpportunityStage, string> = {
  [OPPORTUNITY_STAGE.CONTATO]: 'Contato Inicial',
  [OPPORTUNITY_STAGE.PROPOSTA]: 'Proposta Enviada',
  [OPPORTUNITY_STAGE.GANHO]: 'Ganho',
  [OPPORTUNITY_STAGE.PERDIDO]: 'Perdido',
}

export const OPPORTUNITY_STAGE_CLASSES: Record<OpportunityStage, string> = {
  [OPPORTUNITY_STAGE.CONTATO]: 'bg-sky-100 text-sky-800 ring-sky-200',
  [OPPORTUNITY_STAGE.PROPOSTA]: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
  [OPPORTUNITY_STAGE.GANHO]: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  [OPPORTUNITY_STAGE.PERDIDO]: 'bg-rose-100 text-rose-800 ring-rose-200',
}

/** Etapas que ainda contam como negociação aberta (entram no valor do funil). */
export const OPEN_STAGES: OpportunityStage[] = [
  OPPORTUNITY_STAGE.CONTATO,
  OPPORTUNITY_STAGE.PROPOSTA,
]

/** Formata um número em Real brasileiro, ex.: 12500 -> "R$ 12.500,00". */
export function formatBRL(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(amount) ? amount : 0)
}

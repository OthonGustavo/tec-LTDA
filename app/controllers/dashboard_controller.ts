import type { HttpContext } from '@adonisjs/core/http'

import Customer from '#models/customer'
import Interaction from '#models/interaction'
import Opportunity from '#models/opportunity'
import {
  CUSTOMER_STATUS_CLASSES,
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_STATUS_VALUES,
  OPEN_STAGES,
  OPPORTUNITY_STAGE,
  OPPORTUNITY_STAGE_CLASSES,
  OPPORTUNITY_STAGE_LABELS,
  OPPORTUNITY_STAGE_VALUES,
} from '#enums/crm'
import type { CustomerStatus, OpportunityStage } from '#enums/crm'

/** Números agregados de uma etapa do funil, já normalizados para `number`. */
type StageAggregate = {
  count: number
  total: number
}

export default class DashboardController {
  /**
   * RF08 — tela inicial com total de clientes, valor em negociação e taxa de conversão.
   * Todas as somas e contagens são feitas em SQL (GROUP BY), nunca carregando as
   * tabelas inteiras em memória.
   */
  async index({ view }: HttpContext) {
    /**
     * Uma única consulta agregada por etapa alimenta o valor do funil, a taxa de
     * conversão e a distribuição exibida na tela.
     */
    const stageRows = await Opportunity.query()
      .select('stage')
      .count('* as count')
      .sum('estimated_value as total')
      .groupBy('stage')

    const stageTotals = {} as Record<OpportunityStage, StageAggregate>
    for (const stage of OPPORTUNITY_STAGE_VALUES) {
      stageTotals[stage] = { count: 0, total: 0 }
    }

    for (const row of stageRows) {
      // Ignora etapas desconhecidas que por algum motivo estejam gravadas no banco.
      if (!OPPORTUNITY_STAGE_VALUES.includes(row.stage)) {
        continue
      }

      // O SQLite devolve SUM/COUNT como string (ou null quando não há linhas).
      stageTotals[row.stage] = {
        count: Number(row.$extras.count ?? 0),
        total: Number(row.$extras.total ?? 0),
      }
    }

    const pipelineValue = OPEN_STAGES.reduce((total, stage) => total + stageTotals[stage].total, 0)
    const openCount = OPEN_STAGES.reduce((total, stage) => total + stageTotals[stage].count, 0)

    const wonValue = stageTotals[OPPORTUNITY_STAGE.GANHO].total
    const lostValue = stageTotals[OPPORTUNITY_STAGE.PERDIDO].total
    const wonCount = stageTotals[OPPORTUNITY_STAGE.GANHO].count
    const lostCount = stageTotals[OPPORTUNITY_STAGE.PERDIDO].count

    // Sem oportunidades fechadas não há taxa a exibir: 0 em vez de NaN.
    const closedCount = wonCount + lostCount
    const conversionRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 1000) / 10 : 0

    const stageBreakdown = OPPORTUNITY_STAGE_VALUES.map((stage) => ({
      stage,
      label: OPPORTUNITY_STAGE_LABELS[stage],
      classes: OPPORTUNITY_STAGE_CLASSES[stage],
      count: stageTotals[stage].count,
      total: stageTotals[stage].total,
    }))

    // Referência para a largura das barras de progresso na view.
    const maxStageTotal = stageBreakdown.reduce((max, item) => Math.max(max, item.total), 0)

    const customersCountRows = await Customer.query().count('* as total')
    const totalCustomers = Number(customersCountRows[0]?.$extras.total ?? 0)

    const statusRows = await Customer.query().select('status').count('* as total').groupBy('status')

    const customersByStatus = {} as Record<CustomerStatus, number>
    for (const status of CUSTOMER_STATUS_VALUES) {
      customersByStatus[status] = 0
    }

    for (const row of statusRows) {
      if (!CUSTOMER_STATUS_VALUES.includes(row.status)) {
        continue
      }

      customersByStatus[row.status] = Number(row.$extras.total ?? 0)
    }

    const recentCustomers = await Customer.query()
      .withCount('opportunities')
      .orderBy('created_at', 'desc')
      .limit(5)

    const recentInteractions = await Interaction.query()
      .preload('customer')
      .preload('user')
      .orderBy('created_at', 'desc')
      .limit(5)

    return view.render('pages/dashboard', {
      totalCustomers,
      customersByStatus,
      statusLabels: CUSTOMER_STATUS_LABELS,
      statusClasses: CUSTOMER_STATUS_CLASSES,
      pipelineValue,
      openCount,
      wonValue,
      lostValue,
      wonCount,
      lostCount,
      conversionRate,
      stageBreakdown,
      maxStageTotal,
      recentCustomers,
      recentInteractions,
    })
  }
}

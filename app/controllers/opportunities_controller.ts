import type { HttpContext } from '@adonisjs/core/http'
import Customer from '#models/customer'
import Opportunity from '#models/opportunity'
import {
  OPEN_STAGES,
  OPPORTUNITY_STAGE,
  OPPORTUNITY_STAGE_CLASSES,
  OPPORTUNITY_STAGE_LABELS,
  OPPORTUNITY_STAGE_VALUES,
} from '#enums/crm'
import {
  createOpportunityValidator,
  updateOpportunityValidator,
} from '#validators/opportunity'

/** Opções do <select> de etapa, na ordem canônica do enum. */
function stageOptions() {
  return OPPORTUNITY_STAGE_VALUES.map((value) => ({
    value,
    label: OPPORTUNITY_STAGE_LABELS[value],
  }))
}

export default class OpportunitiesController {
  /** Funil de vendas: uma coluna por etapa, com contagem e total em cada uma. */
  async index({ view }: HttpContext) {
    const opportunities = await Opportunity.query()
      .preload('customer')
      .orderBy('created_at', 'desc')

    const columns = OPPORTUNITY_STAGE_VALUES.map((stage) => {
      const items = opportunities.filter((opportunity) => opportunity.stage === stage)

      return {
        stage,
        label: OPPORTUNITY_STAGE_LABELS[stage],
        classes: OPPORTUNITY_STAGE_CLASSES[stage],
        items,
        total: items.reduce((sum, opportunity) => sum + Number(opportunity.estimatedValue), 0),
        count: items.length,
      }
    })

    const totalOfStage = (stage: (typeof OPPORTUNITY_STAGE_VALUES)[number]) =>
      columns.find((column) => column.stage === stage)?.total ?? 0

    const pipelineValue = columns
      .filter((column) => OPEN_STAGES.includes(column.stage))
      .reduce((sum, column) => sum + column.total, 0)

    return view.render('pages/opportunities/index', {
      columns,
      pipelineValue,
      wonValue: totalOfStage(OPPORTUNITY_STAGE.GANHO),
      lostValue: totalOfStage(OPPORTUNITY_STAGE.PERDIDO),
    })
  }

  /** `params.id` aqui é o id do CLIENTE dono da oportunidade. */
  async store({ params, request, response, session }: HttpContext) {
    const data = await request.validateUsing(createOpportunityValidator)
    const customer = await Customer.findOrFail(params.id)

    await Opportunity.create({
      customerId: customer.id,
      title: data.title,
      estimatedValue: data.estimatedValue,
      stage: data.stage,
    })

    session.flash('notification', { type: 'success', message: 'Oportunidade criada.' })
    return response.redirect().toRoute('customers.show', { id: customer.id })
  }

  async edit({ params, view }: HttpContext) {
    const opportunity = await Opportunity.query()
      .where('id', params.id)
      .preload('customer')
      .firstOrFail()

    return view.render('pages/opportunities/edit', {
      opportunity,
      stageOptions: stageOptions(),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const data = await request.validateUsing(updateOpportunityValidator)
    const opportunity = await Opportunity.findOrFail(params.id)

    opportunity.merge({
      title: data.title,
      estimatedValue: data.estimatedValue,
      stage: data.stage,
    })
    await opportunity.save()

    session.flash('notification', { type: 'success', message: 'Oportunidade atualizada.' })
    return response.redirect().toRoute('customers.show', { id: opportunity.customerId })
  }

  async destroy({ params, response, session }: HttpContext) {
    const opportunity = await Opportunity.findOrFail(params.id)
    // Guardado antes do delete: depois de remover, o registro não serve de referência.
    const customerId = opportunity.customerId

    await opportunity.delete()

    session.flash('notification', { type: 'success', message: 'Oportunidade excluída.' })
    return response.redirect().toRoute('customers.show', { id: customerId })
  }
}

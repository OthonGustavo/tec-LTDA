import type { HttpContext } from '@adonisjs/core/http'

import Customer from '#models/customer'
import {
  CUSTOMER_STATUS_CLASSES,
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_STATUS_VALUES,
  OPEN_STAGES,
  OPPORTUNITY_STAGE_CLASSES,
  OPPORTUNITY_STAGE_LABELS,
  OPPORTUNITY_STAGE_VALUES,
} from '#enums/crm'
import { createCustomerValidator, updateCustomerValidator } from '#validators/customer'

/** Opções prontas para os `<select>` das views (as views não importam TS). */
const statusOptions = CUSTOMER_STATUS_VALUES.map((value) => ({
  value,
  label: CUSTOMER_STATUS_LABELS[value],
}))

const stageOptions = OPPORTUNITY_STAGE_VALUES.map((value) => ({
  value,
  label: OPPORTUNITY_STAGE_LABELS[value],
}))

/** Comparações feitas contra `string` para não depender do tipo exato da coluna. */
const statusValues: string[] = CUSTOMER_STATUS_VALUES
const openStages: string[] = OPEN_STAGES

const PER_PAGE = 10

export default class CustomersController {
  /** Lista paginada com busca livre (nome, e-mail, empresa) e filtro de status. */
  async index({ request, view }: HttpContext) {
    const page = Number(request.input('page', 1)) || 1
    const busca = String(request.input('busca', '') ?? '').trim()
    const statusInput = String(request.input('status', '') ?? '').trim()
    const status = statusValues.includes(statusInput) ? statusInput : ''

    const query = Customer.query().withCount('opportunities')

    if (busca) {
      const termo = `%${busca}%`
      query.where((builder) => {
        builder
          .where('name', 'like', termo)
          .orWhere('email', 'like', termo)
          .orWhere('company', 'like', termo)
      })
    }

    if (status) {
      query.where('status', status)
    }

    const customers = await query.orderBy('created_at', 'desc').paginate(page, PER_PAGE)

    customers.baseUrl('/customers')
    customers.queryString({ busca, status })

    return view.render('pages/customers/index', {
      customers,
      statusLabels: CUSTOMER_STATUS_LABELS,
      statusClasses: CUSTOMER_STATUS_CLASSES,
      statusOptions,
      busca,
      status,
    })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/customers/create', { statusOptions })
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(createCustomerValidator)

    const customer = await Customer.create({
      name: payload.name,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      company: payload.company ?? null,
      status: payload.status,
    })

    session.flash('notification', {
      type: 'success',
      message: 'Cliente cadastrado com sucesso.',
    })

    return response.redirect().toRoute('customers.show', { id: customer.id })
  }

  /** Detalhe do cliente com oportunidades e histórico de interações. */
  async show({ params, view }: HttpContext) {
    const customer = await Customer.query()
      .where('id', params.id)
      .preload('opportunities', (q) => q.orderBy('created_at', 'desc'))
      .preload('interactions', (q) => q.preload('user').orderBy('created_at', 'desc'))
      .firstOrFail()

    // Valor do funil: só as oportunidades que ainda estão em negociação.
    const openValue = customer.opportunities.reduce((total, opportunity) => {
      if (!openStages.includes(opportunity.stage)) {
        return total
      }

      const value = Number(opportunity.estimatedValue)
      return total + (Number.isFinite(value) ? value : 0)
    }, 0)

    return view.render('pages/customers/show', {
      customer,
      statusLabels: CUSTOMER_STATUS_LABELS,
      statusClasses: CUSTOMER_STATUS_CLASSES,
      stageLabels: OPPORTUNITY_STAGE_LABELS,
      stageClasses: OPPORTUNITY_STAGE_CLASSES,
      stageOptions,
      openValue,
    })
  }

  async edit({ params, view }: HttpContext) {
    const customer = await Customer.findOrFail(params.id)

    return view.render('pages/customers/edit', { customer, statusOptions })
  }

  async update({ params, request, response, session }: HttpContext) {
    const customer = await Customer.findOrFail(params.id)
    const payload = await request.validateUsing(updateCustomerValidator)

    customer.merge({
      name: payload.name,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      company: payload.company ?? null,
      status: payload.status,
    })

    await customer.save()

    session.flash('notification', { type: 'success', message: 'Cliente atualizado.' })

    return response.redirect().toRoute('customers.show', { id: customer.id })
  }

  async destroy({ params, response, session }: HttpContext) {
    const customer = await Customer.findOrFail(params.id)
    await customer.delete()

    session.flash('notification', { type: 'success', message: 'Cliente excluído.' })

    return response.redirect().toRoute('customers.index')
  }
}

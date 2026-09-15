import type { HttpContext } from '@adonisjs/core/http'
import Customer from '#models/customer'
import Interaction from '#models/interaction'
import { createInteractionValidator } from '#validators/interaction'

export default class InteractionsController {
  /** `params.id` aqui é o id do CLIENTE que recebe a anotação. */
  async store({ params, request, response, session, auth }: HttpContext) {
    const data = await request.validateUsing(createInteractionValidator)
    const customer = await Customer.findOrFail(params.id)

    await Interaction.create({
      customerId: customer.id,
      userId: auth.user!.id,
      note: data.note,
    })

    session.flash('notification', { type: 'success', message: 'Anotação registrada.' })
    return response.redirect().toRoute('customers.show', { id: customer.id })
  }

  async destroy({ params, response, session }: HttpContext) {
    const interaction = await Interaction.findOrFail(params.id)
    const customerId = interaction.customerId

    await interaction.delete()

    session.flash('notification', { type: 'success', message: 'Anotação removida.' })
    return response.redirect().toRoute('customers.show', { id: customerId })
  }
}

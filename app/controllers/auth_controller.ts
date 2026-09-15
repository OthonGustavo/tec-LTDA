import type { HttpContext } from '@adonisjs/core/http'
import { errors as authErrors } from '@adonisjs/auth'

import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'

export default class AuthController {
  /**
   * GET /register
   */
  async showRegister({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  /**
   * POST /register — cria a conta e já autentica o usuário.
   */
  async register({ request, response, auth, session }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(registerValidator)

    // Só os três campos do model: a confirmação de senha fica de fora de propósito.
    const user = await User.create({ fullName, email, password })

    await auth.use('web').login(user)

    session.flash('notification', { type: 'success', message: 'Conta criada. Bem-vindo(a)!' })

    return response.redirect().toRoute('dashboard')
  }

  /**
   * GET /login
   */
  async showLogin({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  /**
   * POST /login
   */
  async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
    } catch (error) {
      /**
       * Só tratamos E_INVALID_CREDENTIALS aqui; qualquer outra falha
       * (banco fora do ar, por exemplo) segue para o handler de exceções.
       */
      if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
        session.flash('notification', { type: 'error', message: 'E-mail ou senha inválidos.' })
        session.flashOnly(['email'])

        return response.redirect().back()
      }

      throw error
    }

    return response.redirect().toRoute('dashboard')
  }

  /**
   * POST /logout
   */
  async logout({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()

    session.flash('notification', { type: 'success', message: 'Sessão encerrada.' })

    return response.redirect().toRoute('auth.login.show')
  }
}

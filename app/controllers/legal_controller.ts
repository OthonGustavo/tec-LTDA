import type { HttpContext } from '@adonisjs/core/http'

/**
 * Páginas jurídicas públicas (Termos de Uso e Política de Privacidade).
 *
 * São documentos estáticos: não dependem de banco nem de usuário autenticado,
 * por isso as rotas ficam fora dos grupos `guest` e `auth`.
 */
export default class LegalController {
  async terms({ view }: HttpContext) {
    return view.render('pages/legal/terms')
  }

  async privacy({ view }: HttpContext) {
    return view.render('pages/legal/privacy')
  }
}

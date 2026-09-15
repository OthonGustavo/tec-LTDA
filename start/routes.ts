/*
|--------------------------------------------------------------------------
| Rotas da aplicação — CRM tec-LTDA
|--------------------------------------------------------------------------
|
| Só existem rotas GET e POST: os formulários são HTML puro, sem method
| spoofing. Os nomes definidos com `.as()` são usados nas views através do
| helper `route('nome')` e nos controllers com `response.redirect().toRoute()`.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const CustomersController = () => import('#controllers/customers_controller')
const OpportunitiesController = () => import('#controllers/opportunities_controller')
const InteractionsController = () => import('#controllers/interactions_controller')
const LegalController = () => import('#controllers/legal_controller')

// Raiz do site: manda direto para o painel (o middleware `auth` cuida do login).
router.on('/').redirectToPath('/dashboard')

/*
|--------------------------------------------------------------------------
| Autenticação — visitantes
|--------------------------------------------------------------------------
|
| O middleware `guest` impede que alguém já logado volte para login/registro.
|
*/
router
  .group(() => {
    router.get('/login', [AuthController, 'showLogin']).as('auth.login.show')
    router.post('/login', [AuthController, 'login']).as('auth.login')

    router.get('/register', [AuthController, 'showRegister']).as('auth.register.show')
    router.post('/register', [AuthController, 'register']).as('auth.register')
  })
  .use(middleware.guest())

// Sair da conta: só faz sentido para quem está autenticado.
router.post('/logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())

/*
|--------------------------------------------------------------------------
| Páginas públicas (jurídico)
|--------------------------------------------------------------------------
|
| Ficam fora dos grupos `guest` e `auth` de propósito: o rodapé aponta para
| elas em todas as telas, então precisam abrir tanto logado quanto deslogado.
|
*/
router.get('/termos-de-uso', [LegalController, 'terms']).as('legal.terms')
router.get('/politica-de-privacidade', [LegalController, 'privacy']).as('legal.privacy')

/*
|--------------------------------------------------------------------------
| Área autenticada — painel, clientes, oportunidades e interações
|--------------------------------------------------------------------------
|
| Atenção à ordem: `/customers/create` precisa vir antes de `/customers/:id`,
| caso contrário a palavra "create" seria capturada como se fosse um id.
|
*/
router
  .group(() => {
    // Painel com os indicadores do CRM.
    router.get('/dashboard', [DashboardController, 'index']).as('dashboard')

    // Clientes (CRUD completo).
    router.get('/customers', [CustomersController, 'index']).as('customers.index')
    router.get('/customers/create', [CustomersController, 'create']).as('customers.create')
    router.post('/customers', [CustomersController, 'store']).as('customers.store')
    router.get('/customers/:id', [CustomersController, 'show']).as('customers.show')
    router.get('/customers/:id/edit', [CustomersController, 'edit']).as('customers.edit')
    router.post('/customers/:id', [CustomersController, 'update']).as('customers.update')
    router.post('/customers/:id/delete', [CustomersController, 'destroy']).as('customers.destroy')

    // Anotações (interações) registradas no perfil do cliente.
    router
      .post('/customers/:id/interactions', [InteractionsController, 'store'])
      .as('interactions.store')
    router
      .post('/interactions/:id/delete', [InteractionsController, 'destroy'])
      .as('interactions.destroy')

    // Oportunidades: sempre nascem vinculadas a um cliente.
    router.get('/opportunities', [OpportunitiesController, 'index']).as('opportunities.index')
    router
      .post('/customers/:id/opportunities', [OpportunitiesController, 'store'])
      .as('opportunities.store')
    router
      .get('/opportunities/:id/edit', [OpportunitiesController, 'edit'])
      .as('opportunities.edit')
    router.post('/opportunities/:id', [OpportunitiesController, 'update']).as('opportunities.update')
    router
      .post('/opportunities/:id/delete', [OpportunitiesController, 'destroy'])
      .as('opportunities.destroy')
  })
  .use(middleware.auth())

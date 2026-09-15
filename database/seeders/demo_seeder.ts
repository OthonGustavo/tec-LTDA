import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { CUSTOMER_STATUS, OPPORTUNITY_STAGE } from '#enums/crm'
import type { CustomerStatus, OpportunityStage } from '#enums/crm'
import Customer from '#models/customer'
import Interaction from '#models/interaction'
import Opportunity from '#models/opportunity'
import User from '#models/user'

type CustomerSeed = {
  name: string
  email: string
  phone: string
  company: string
  status: CustomerStatus
}

type OpportunitySeed = {
  customerEmail: string
  title: string
  estimatedValue: number
  stage: OpportunityStage
}

type InteractionSeed = {
  customerEmail: string
  note: string
}

const DEMO_USER_EMAIL = 'admin@tecltda.com'

const CUSTOMERS: CustomerSeed[] = [
  {
    name: 'Mariana Alves',
    email: 'mariana.alves@alvesprado.com.br',
    phone: '(11) 98888-1234',
    company: 'Alves & Prado Contabilidade',
    status: CUSTOMER_STATUS.ATENDIDO,
  },
  {
    name: 'Ricardo Menezes',
    email: 'ricardo.menezes@menezeslog.com.br',
    phone: '(21) 99712-4455',
    company: 'Menezes Logística Ltda',
    status: CUSTOMER_STATUS.NEGOCIACAO,
  },
  {
    name: 'Juliana Barbosa',
    email: 'juliana.barbosa@clinicavidaplena.com.br',
    phone: '(31) 98431-2299',
    company: 'Clínica Vida Plena',
    status: CUSTOMER_STATUS.LEAD,
  },
  {
    name: 'Fernando Tavares',
    email: 'fernando.tavares@tavaresmateriais.com.br',
    phone: '(41) 99125-8877',
    company: 'Tavares Materiais de Construção',
    status: CUSTOMER_STATUS.NEGOCIACAO,
  },
  {
    name: 'Patrícia Nogueira',
    email: 'patricia.nogueira@nogueiraadv.com.br',
    phone: '(51) 98277-6310',
    company: 'Nogueira Advocacia Empresarial',
    status: CUSTOMER_STATUS.LEAD,
  },
  {
    name: 'Eduardo Lima',
    email: 'eduardo.lima@supermercadosbompreco.com.br',
    phone: '(85) 99604-7788',
    company: 'Supermercados Bom Preço',
    status: CUSTOMER_STATUS.ATENDIDO,
  },
]

const OPPORTUNITIES: OpportunitySeed[] = [
  {
    customerEmail: 'mariana.alves@alvesprado.com.br',
    title: 'Implantação do módulo fiscal',
    estimatedValue: 42500,
    stage: OPPORTUNITY_STAGE.GANHO,
  },
  {
    customerEmail: 'mariana.alves@alvesprado.com.br',
    title: 'Treinamento da equipe contábil',
    estimatedValue: 8900,
    stage: OPPORTUNITY_STAGE.PROPOSTA,
  },
  {
    customerEmail: 'ricardo.menezes@menezeslog.com.br',
    title: 'Integração com o sistema de frotas',
    estimatedValue: 68000,
    stage: OPPORTUNITY_STAGE.PROPOSTA,
  },
  {
    customerEmail: 'ricardo.menezes@menezeslog.com.br',
    title: 'Migração de dados do ERP antigo',
    estimatedValue: 15400,
    stage: OPPORTUNITY_STAGE.CONTATO,
  },
  {
    customerEmail: 'juliana.barbosa@clinicavidaplena.com.br',
    title: 'Licenças do CRM para 10 usuários',
    estimatedValue: 12000,
    stage: OPPORTUNITY_STAGE.CONTATO,
  },
  {
    customerEmail: 'fernando.tavares@tavaresmateriais.com.br',
    title: 'Automação do controle de estoque',
    estimatedValue: 54900,
    stage: OPPORTUNITY_STAGE.PROPOSTA,
  },
  {
    customerEmail: 'patricia.nogueira@nogueiraadv.com.br',
    title: 'Consultoria de processos internos',
    estimatedValue: 3500,
    stage: OPPORTUNITY_STAGE.PERDIDO,
  },
  {
    customerEmail: 'eduardo.lima@supermercadosbompreco.com.br',
    title: 'Painel gerencial de vendas',
    estimatedValue: 85000,
    stage: OPPORTUNITY_STAGE.GANHO,
  },
]

const INTERACTIONS: InteractionSeed[] = [
  {
    customerEmail: 'mariana.alves@alvesprado.com.br',
    note: 'Ligação realizada, cliente pediu proposta revisada até sexta.',
  },
  {
    customerEmail: 'mariana.alves@alvesprado.com.br',
    note: 'Implantação concluída. A equipe fiscal já está emitindo as guias pelo sistema.',
  },
  {
    customerEmail: 'ricardo.menezes@menezeslog.com.br',
    note: 'Reunião on-line com o gerente de operações. Pediram um piloto com três veículos antes de fechar.',
  },
  {
    customerEmail: 'ricardo.menezes@menezeslog.com.br',
    note: 'Proposta comercial enviada por e-mail. Retorno prometido para a próxima terça-feira.',
  },
  {
    customerEmail: 'juliana.barbosa@clinicavidaplena.com.br',
    note: 'Primeiro contato pelo formulário do site. Cliente quer entender os planos e o prazo de implantação.',
  },
  {
    customerEmail: 'fernando.tavares@tavaresmateriais.com.br',
    note: 'Visita presencial na loja matriz. Mapeamos o fluxo atual de entrada e saída do estoque.',
  },
  {
    customerEmail: 'fernando.tavares@tavaresmateriais.com.br',
    note: 'Cliente solicitou desconto de 10% e parcelamento em seis vezes. Pedido repassado ao financeiro.',
  },
  {
    customerEmail: 'patricia.nogueira@nogueiraadv.com.br',
    note: 'Cliente informou que fechou com outro fornecedor por causa do prazo. Retomar o contato em seis meses.',
  },
  {
    customerEmail: 'eduardo.lima@supermercadosbompreco.com.br',
    note: 'Painel gerencial entregue e aprovado pela diretoria na reunião de segunda.',
  },
  {
    customerEmail: 'eduardo.lima@supermercadosbompreco.com.br',
    note: 'Cliente elogiou o suporte e sinalizou interesse em expandir o CRM para as filiais.',
  },
]

export default class extends BaseSeeder {
  async run() {
    // O model User faz o hash da senha automaticamente (mixin AuthFinder).
    const admin = await User.updateOrCreate(
      { email: DEMO_USER_EMAIL },
      { fullName: 'Administrador tec-LTDA', password: 'admin123' }
    )

    // updateOrCreate em todas as etapas: rodar o seeder duas vezes não duplica nada.
    const customersByEmail = new Map<string, Customer>()
    for (const seed of CUSTOMERS) {
      const customer = await Customer.updateOrCreate({ email: seed.email }, seed)
      customersByEmail.set(seed.email, customer)
    }

    for (const seed of OPPORTUNITIES) {
      const customer = customersByEmail.get(seed.customerEmail)
      if (!customer) {
        continue
      }

      await Opportunity.updateOrCreate(
        { customerId: customer.id, title: seed.title },
        {
          customerId: customer.id,
          title: seed.title,
          estimatedValue: seed.estimatedValue,
          stage: seed.stage,
        }
      )
    }

    for (const seed of INTERACTIONS) {
      const customer = customersByEmail.get(seed.customerEmail)
      if (!customer) {
        continue
      }

      await Interaction.updateOrCreate(
        { customerId: customer.id, note: seed.note },
        { customerId: customer.id, note: seed.note, userId: admin.id }
      )
    }
  }
}

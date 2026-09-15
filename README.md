# CRM tec-LTDA

CRM básico full-stack construído em **AdonisJS v6**. O sistema permite cadastrar e autenticar
usuários, manter uma base de clientes, acompanhar oportunidades de venda dentro de um funil e
registrar anotações de cada contato — tudo resumido em um painel com os principais indicadores
comerciais. A interface é renderizada no servidor com Edge, sem SPA e sem build de front-end.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20+ |
| Framework | AdonisJS v6 |
| Banco de dados | Lucid ORM + SQLite (`better-sqlite3`) |
| Autenticação | Guard de sessão (`@adonisjs/auth`) |
| Templates | Edge (`edge.js`) |
| Segurança | Shield (proteção CSRF) |
| Validação | VineJS (`@vinejs/vine`) |
| Estilo | Tailwind CSS via CDN |

**Por que AdonisJS?** É o framework Node.js com baterias inclusas — o Django/Laravel do
ecossistema: ORM, autenticação, validação, sessão, CSRF e templates já vêm integrados e
configurados, sem precisar montar a estrutura peça por peça.

---

## Requisitos atendidos

| Requisito | Descrição | Como foi implementado |
|---|---|---|
| **RF01** | Cadastro, login e logout de usuários | `AuthController` com as rotas `auth.register`, `auth.login` e `auth.logout`; senhas com hash automático no model `User`; sessão via `@adonisjs/auth` |
| **RF02** | Telas protegidas só para autenticados | Todas as rotas do CRM ficam em um grupo com `middleware.auth()`; login/registro usam `middleware.guest()`; a raiz `/` redireciona para `/dashboard` |
| **RF03** | CRUD de clientes | `CustomersController` (`index`, `create`, `store`, `show`, `edit`, `update`, `destroy`) + views em `resources/views/pages/customers` |
| **RF04** | Cliente com Nome, E-mail, Telefone, Empresa, Status e Data de Cadastro | Tabela `customers` (`name`, `email`, `phone`, `company`, `status`, `created_at`); status restrito a **Lead**, **Em Negociação** e **Cliente Atendido** pelo enum `CUSTOMER_STATUS` |
| **RF05** | Oportunidades vinculadas a um cliente | Tabela `opportunities` com FK `customer_id` (`onDelete CASCADE`); relação `Customer hasMany Opportunity` / `Opportunity belongsTo Customer`; criação feita a partir do perfil do cliente |
| **RF06** | Oportunidade com Valor Estimado e Etapa do Funil | Colunas `estimated_value` (decimal 12,2) e `stage`; etapas **Contato Inicial**, **Proposta Enviada**, **Ganho** e **Perdido** no enum `OPPORTUNITY_STAGE` |
| **RF07** | Anotações textuais no perfil do cliente | Tabela `interactions` (`note`, `customer_id`, `user_id`); `InteractionsController` com `interactions.store` e `interactions.destroy`, listadas na tela do cliente com autor e data |
| **RF08** | Dashboard com indicadores | `DashboardController` calcula total de clientes, valor total em negociação (soma das oportunidades em etapas abertas) e taxa de conversão (clientes atendidos ÷ total de clientes) |

---

## Como rodar

**1.** Instale as dependências:

```bash
npm install
```

**2.** Crie o arquivo de ambiente a partir do exemplo:

```bash
cp .env.example .env
```

**3.** Gere a chave da aplicação (preenche o `APP_KEY` no `.env`):

```bash
node ace generate:key
```

**4.** Crie as tabelas do banco:

```bash
node ace migration:run
```

**5.** Popule o banco com dados de demonstração:

```bash
node ace db:seed
```

**6.** Suba o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação fica disponível em **http://localhost:3333**.

O seed cria um usuário pronto para uso:

- **E-mail:** `admin@tecltda.com`
- **Senha:** `admin123`

---

## Estrutura do projeto

```
tec-LTDA/
├── app/
│   ├── controllers/        # Auth, Dashboard, Customers, Opportunities, Interactions
│   ├── models/             # User, Customer, Opportunity, Interaction (Lucid)
│   ├── validators/         # Regras de validação VineJS de cada formulário
│   ├── enums/              # crm.ts — status, etapas do funil, labels e classes (fonte única)
│   └── middleware/         # auth_middleware e guest_middleware
├── database/
│   ├── migrations/         # users, customers, opportunities, interactions
│   └── seeders/            # demo_seeder.ts — usuário admin + dados de exemplo
├── resources/
│   └── views/
│       ├── pages/          # Telas: auth, dashboard, customers, opportunities, errors
│       └── components/     # layout.edge — navbar, flash de notificação e shell da página
├── start/
│   ├── routes.ts           # Todas as rotas da aplicação
│   └── kernel.ts           # Pilha de middlewares (bodyparser, session, shield, auth)
├── config/                 # Configuração de app, database, auth, session, shield, hash
└── tmp/
    └── db.sqlite3          # Banco SQLite (criado pela migration, não versionado)
```

---

## Rotas

| Método | URL | Nome | O que faz |
|---|---|---|---|
| GET | `/` | — | Redireciona para o dashboard |
| GET | `/login` | `auth.login.show` | Formulário de login |
| POST | `/login` | `auth.login` | Autentica o usuário e cria a sessão |
| GET | `/register` | `auth.register.show` | Formulário de cadastro |
| POST | `/register` | `auth.register` | Cria a conta e já autentica |
| POST | `/logout` | `auth.logout` | Encerra a sessão |
| GET | `/dashboard` | `dashboard` | Painel com total de clientes, valor em negociação e taxa de conversão |
| GET | `/customers` | `customers.index` | Lista os clientes |
| GET | `/customers/create` | `customers.create` | Formulário de novo cliente |
| POST | `/customers` | `customers.store` | Grava o novo cliente |
| GET | `/customers/:id` | `customers.show` | Perfil do cliente com oportunidades e anotações |
| GET | `/customers/:id/edit` | `customers.edit` | Formulário de edição do cliente |
| POST | `/customers/:id` | `customers.update` | Salva as alterações do cliente |
| POST | `/customers/:id/delete` | `customers.destroy` | Remove o cliente (e o que depende dele) |
| POST | `/customers/:id/interactions` | `interactions.store` | Adiciona uma anotação ao cliente |
| POST | `/interactions/:id/delete` | `interactions.destroy` | Remove uma anotação |
| GET | `/opportunities` | `opportunities.index` | Lista todas as oportunidades do funil |
| POST | `/customers/:id/opportunities` | `opportunities.store` | Cria uma oportunidade para o cliente |
| GET | `/opportunities/:id/edit` | `opportunities.edit` | Formulário de edição da oportunidade |
| POST | `/opportunities/:id` | `opportunities.update` | Salva as alterações da oportunidade |
| POST | `/opportunities/:id/delete` | `opportunities.destroy` | Remove a oportunidade |

> Só há rotas **GET** e **POST**: os formulários são HTML puro, sem method spoofing.

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor de desenvolvimento com HMR |
| `npm run build` | Gera a build de produção em `build/` |
| `npm start` | Executa a build de produção (`node bin/server.js`) |
| `npm run typecheck` | Checagem de tipos com `tsc --noEmit` |
| `npm run lint` | Analisa o código com ESLint |
| `npm run format` | Formata o código com Prettier |
| `node ace migration:run` | Aplica as migrations pendentes |
| `node ace db:seed` | Roda os seeders (usuário admin + dados de exemplo) |

---

## Sobre o banco de dados

O banco é um arquivo **SQLite** em `tmp/db.sqlite3`, criado automaticamente ao rodar
`node ace migration:run`. A pasta `tmp/` está no `.gitignore`, ou seja, **o banco não é
versionado** — cada ambiente gera o seu com as migrations e o seed.

Para começar do zero, basta apagar o arquivo e rodar `node ace migration:run` e
`node ace db:seed` novamente.

## Publicação na Vercel

O projeto está preparado para rodar na Vercel como função serverless:

- `api/index.ts` — inicializa o AdonisJS uma vez por instância e reaproveita o
  `server.handle()` entre as requisições, no lugar de escutar uma porta.
- `vercel.json` — roda `npm run build`, embarca a pasta `build/` na função e
  redireciona todas as rotas para ela.

### Limitação conhecida: o banco não é persistente

Na Vercel o sistema de arquivos é somente leitura, exceto `/tmp`, que é
efêmero e exclusivo de cada instância. Na primeira requisição a função copia
`database/demo.sqlite3` para `/tmp/db.sqlite3` e passa a usá-lo.

Consequência: **o que for cadastrado no ambiente publicado desaparece quando a
instância é reciclada**, e duas instâncias simultâneas não enxergam os dados
uma da outra. As páginas de leitura (dashboard, listas, funil, termos de uso e
política de privacidade) funcionam normalmente — a publicação serve como
demonstração, não para uso em produção.

Para tornar os dados duráveis, troque o SQLite por um Postgres gerenciado:

1. Provisione um banco (Neon, Supabase ou Vercel Postgres).
2. Instale o driver: `npm i pg`.
3. Em `config/database.ts`, troque a conexão `sqlite` por `pg`, lendo a URL de
   `env.get('DATABASE_URL')`.
4. Cadastre `DATABASE_URL` em Vercel → Settings → Environment Variables.
5. Rode `node ace migration:run` apontando para o banco remoto.

### Variáveis de ambiente

`api/index.ts` define valores padrão para o app conseguir subir sem
configuração manual. Em um ambiente de verdade, cadastre ao menos a `APP_KEY`
em Vercel → Settings → Environment Variables (gere uma com
`node ace generate:key`). Sem ela, a chave é derivada do id do deploy e as
sessões caem a cada nova publicação.

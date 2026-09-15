# CRM tec-LTDA

CRM básico full-stack em **AdonisJS v6**: autenticação por sessão, CRUD de clientes,
oportunidades em funil de vendas, anotações por cliente e um dashboard com indicadores.
Renderização no servidor com Edge — não há SPA nem build de front-end.

## Stack

- Node.js 20+, AdonisJS v6, TypeScript estrito, ESM (`"type": "module"`)
- Lucid ORM + SQLite (`better-sqlite3`), banco em `tmp/db.sqlite3`
- Auth por sessão (`@adonisjs/auth`), Shield (CSRF), VineJS (validação)
- Edge para as views, Tailwind CSS via CDN (carregado no layout)

## Comandos principais

```bash
npm run dev              # servidor de desenvolvimento em http://localhost:3333
npm run typecheck        # tsc --noEmit (rode sempre antes de encerrar uma tarefa)
npm run lint             # ESLint
npm run format           # Prettier
node ace migration:run   # aplica as migrations
node ace db:seed         # popula o banco (admin@tecltda.com / admin123)
node ace generate:key    # gera o APP_KEY do .env
```

## Convenções do projeto

**Enums do CRM** — `app/enums/crm.ts` é a **fonte única de verdade** para status de cliente
(`CUSTOMER_STATUS`) e etapas do funil (`OPPORTUNITY_STAGE`), junto com os `*_VALUES`,
`*_LABELS` e `*_CLASSES` (classes Tailwind dos badges) e o helper `formatBRL`. Importe com
`#enums/crm`. Nunca escreva um status ou etapa como string solta em controller, validator,
seeder ou view — sempre a partir do enum.

**Views não importam TypeScript.** Quem precisa de labels ou classes é o **controller**: ele
passa `statusLabels`, `stageClasses`, `stageOptions` etc. no objeto do `view.render()`.

**Mensagens flash** — sempre no mesmo formato e na mesma chave:

```ts
session.flash('notification', { type: 'success', message: 'Cliente criado.' })
session.flash('notification', { type: 'error', message: 'Não foi possível excluir.' })
```

O layout já renderiza esse flash; não crie outra chave nem outro formato.

**Layout** — `resources/views/components/layout.edge`, usado via `@component`:

```edge
@component('components/layout', { title: 'Clientes', active: 'customers' })
  <h1>...</h1>
@end
```

Props: `title` (string), `active` (`'dashboard' | 'customers' | 'opportunities'`) e `bare`
(`true` só em login/registro, esconde a navbar). As páginas **não** repetem `<html>`/`<body>`.

**Formulários** — são HTML puro: só existem rotas **GET** e **POST**, sem method spoofing.
Exclusões e updates usam POST em URLs próprias (`/customers/:id/delete`, `/customers/:id`).
Todo formulário POST precisa de `{{{ csrfField() }}}`, senão o Shield rejeita a requisição.
Use `old('campo', '')` para repopular e `@inputError('campo')` para exibir erros.

**Controllers** — validação com `await request.validateUsing(algumValidator)`; em falha o
AdonisJS já redireciona de volta com os erros, não trate manualmente. Busca com
`findOrFail(params.id)`. Redirecionamento com `response.redirect().toRoute('customers.index')`.

**Rotas** — todas em `start/routes.ts`, com nomes fixos (`customers.index`, `opportunities.store`,
...). Ao mexer, mantenha `/customers/create` **antes** de `/customers/:id`. Nas views use
`route('nome', { id })`; nunca escreva URLs na mão.

## Regra do workspace

Responda **sempre em português**. Textos da interface em português do Brasil; comentários em
português e só onde o código não é óbvio.

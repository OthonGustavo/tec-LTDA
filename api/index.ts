/*
|--------------------------------------------------------------------------
| Ponto de entrada serverless (Vercel)
|--------------------------------------------------------------------------
|
| O AdonisJS normalmente sobe um servidor HTTP de longa duração (bin/server.ts).
| Na Vercel não existe processo permanente: cada requisição entra por uma
| função. Este arquivo replica o que o Ignitor faz em `httpServer().start()`,
| mas para na hora de escutar uma porta — em vez disso guarda o
| `server.handle()` e o reaproveita entre as invocações da mesma instância.
|
| O app compilado (pasta `build/`) é gerado pelo `npm run build` e vai junto
| com a função através do `includeFiles` do vercel.json.
|
*/

import 'reflect-metadata'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { Ignitor } from '@adonisjs/core'

/*
|--------------------------------------------------------------------------
| Variaveis de ambiente
|--------------------------------------------------------------------------
|
| O start/env.ts exige estas variaveis para o app subir. Qualquer valor
| cadastrado em Vercel -> Settings -> Environment Variables tem prioridade;
| os defaults abaixo existem para a funcao conseguir rodar sem configuracao
| manual na primeira publicacao.
|
*/
process.env.NODE_ENV ||= 'production'
process.env.PORT ||= '3000'
process.env.HOST ||= '0.0.0.0'
process.env.LOG_LEVEL ||= 'info'
process.env.SESSION_DRIVER ||= 'cookie'
process.env.DATABASE_PATH ||= '/tmp/db.sqlite3'

/*
| A APP_KEY assina cookies e sessoes. Sem uma chave propria cadastrada na
| Vercel, derivamos uma do id do deploy: assim ela nao fica escrita no
| repositorio, mas as sessoes caem a cada nova publicacao. Para um ambiente
| de verdade, cadastre APP_KEY nas variaveis de ambiente do projeto.
*/
if (!process.env.APP_KEY) {
  const semente = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_URL || 'crm-tec-ltda-local'
  process.env.APP_KEY = createHash('sha256').update(semente).digest('hex').slice(0, 32)
}

const PROJECT_ROOT = process.cwd()

/** Raiz do app compilado. É lá que ficam adonisrc.js, config/, start/ e as views. */
const APP_ROOT = pathToFileURL(join(PROJECT_ROOT, 'build') + '/')

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

/**
 * Nunca é executada. Existe só para o rastreador de dependências da Vercel
 * enxergar os pacotes que o app carrega dinamicamente em tempo de execução —
 * sem isso eles não seriam empacotados junto com a função.
 */
export async function _incluirDependenciasDinamicas() {
  await import('@adonisjs/auth')
  await import('@adonisjs/auth/auth_provider')
  await import('@adonisjs/auth/initialize_auth_middleware')
  await import('@adonisjs/auth/mixins/lucid')
  await import('@adonisjs/auth/session')
  await import('@adonisjs/core/app')
  await import('@adonisjs/core/bodyparser')
  await import('@adonisjs/core/bodyparser_middleware')
  await import('@adonisjs/core/env')
  await import('@adonisjs/core/hash')
  await import('@adonisjs/core/helpers')
  await import('@adonisjs/core/http')
  await import('@adonisjs/core/logger')
  await import('@adonisjs/core/providers/app_provider')
  await import('@adonisjs/core/providers/edge_provider')
  await import('@adonisjs/core/providers/hash_provider')
  await import('@adonisjs/core/providers/vinejs_provider')
  await import('@adonisjs/core/services/app')
  await import('@adonisjs/core/services/hash')
  await import('@adonisjs/core/services/router')
  await import('@adonisjs/core/services/server')
  await import('@adonisjs/lucid')
  await import('@adonisjs/lucid/database_provider')
  await import('@adonisjs/lucid/orm')
  await import('@adonisjs/session')
  await import('@adonisjs/session/session_middleware')
  await import('@adonisjs/session/session_provider')
  await import('@adonisjs/shield')
  await import('@adonisjs/shield/shield_middleware')
  await import('@adonisjs/shield/shield_provider')
  await import('@adonisjs/static')
  await import('@adonisjs/static/static_middleware')
  await import('@adonisjs/static/static_provider')
  await import('@adonisjs/vite')
  await import('@adonisjs/vite/vite_middleware')
  await import('@adonisjs/vite/vite_provider')
  await import('@vinejs/vine')
  await import('better-sqlite3')
  await import('edge.js')
  await import('luxon')
}

/**
 * O disco da função é somente leitura, com exceção de /tmp. Na primeira
 * requisição de cada instância copiamos o banco de demonstração para lá, para
 * que a aplicação consiga ler e gravar.
 *
 * ATENÇÃO: /tmp é efêmero e não é compartilhado entre instâncias. O que for
 * cadastrado some quando a instância é reciclada. Para uso real, trocar o
 * SQLite por um Postgres gerenciado (ver README).
 */
function prepararBanco() {
  const destino = process.env.DATABASE_PATH
  if (!destino || existsSync(destino)) {
    return
  }

  const semente = join(PROJECT_ROOT, 'database', 'demo.sqlite3')
  if (existsSync(semente)) {
    copyFileSync(semente, destino)
  }
}

type NodeHandler = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>

/** Promessa do boot, memorizada para não reinicializar o app a cada requisição. */
let bootPromise: Promise<NodeHandler> | null = null

async function iniciar(): Promise<NodeHandler> {
  prepararBanco()

  const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER }).tap((app) => {
    app.booting(async () => {
      await import(new URL('start/env.js', APP_ROOT).href)
    })
  })

  const app = ignitor.createApp('web')
  await app.init()
  await app.boot()

  let handle: NodeHandler | null = null

  await app.start(async () => {
    const server = await app.container.make('server')
    await server.boot()
    handle = server.handle.bind(server) as NodeHandler
  })

  if (!handle) {
    throw new Error('Não foi possível inicializar o servidor HTTP do AdonisJS.')
  }

  return handle
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!bootPromise) {
    bootPromise = iniciar().catch((error) => {
      // Se o boot falhar, limpa o cache para a próxima requisição tentar de novo.
      bootPromise = null
      throw error
    })
  }

  const handle = await bootPromise
  return handle(req, res)
}

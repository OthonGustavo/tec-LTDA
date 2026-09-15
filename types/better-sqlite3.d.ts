/**
 * O better-sqlite3 não publica tipos próprios. Esta declaração mínima existe
 * apenas para que o `api/index.ts` possa referenciar o pacote ao fixar as
 * dependências dinâmicas para o empacotador da Vercel.
 */
declare module 'better-sqlite3'

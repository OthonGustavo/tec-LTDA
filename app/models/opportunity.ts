import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { OpportunityStage } from '#enums/crm'
import Customer from '#models/customer'

export default class Opportunity extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare customerId: number

  @column()
  declare title: string

  /** O SQLite devolve colunas decimal como string; normalizamos para number na leitura. */
  @column({ consume: (value) => Number(value ?? 0) })
  declare estimatedValue: number

  @column()
  declare stage: OpportunityStage

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>
}

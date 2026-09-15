import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import type { CustomerStatus } from '#enums/crm'
import Opportunity from '#models/opportunity'
import Interaction from '#models/interaction'

export default class Customer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string | null

  @column()
  declare phone: string | null

  @column()
  declare company: string | null

  @column()
  declare status: CustomerStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Opportunity)
  declare opportunities: HasMany<typeof Opportunity>

  @hasMany(() => Interaction)
  declare interactions: HasMany<typeof Interaction>
}

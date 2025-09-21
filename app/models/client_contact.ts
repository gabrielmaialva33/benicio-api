import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
  SnakeCaseNamingStrategy,
} from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Client from '#models/client'
import ClientAddress from '#models/client_address'

export default class ClientContact extends BaseModel {
  static table = 'client_contacts'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare client_id: number

  @column()
  declare address_id: number

  @column()
  declare name: string

  @column()
  declare work_area_id: number | null

  @column()
  declare position_id: number | null

  @column()
  declare participates_mailing: boolean

  @column()
  declare receives_billing: boolean

  @column()
  declare contact_type: 'phone' | 'email'

  @column()
  declare contact_value: string

  @column()
  declare is_blocked: boolean

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  /**
   * ------------------------------------------------------
   * Hooks
   * ------------------------------------------------------
   */
  @beforeCreate()
  static async setDefaultValues(contact: ClientContact) {
    // Set default participates_mailing if not explicitly set
    if (contact.participates_mailing === undefined || contact.participates_mailing === null) {
      contact.participates_mailing = false
    }

    // Set default receives_billing if not explicitly set
    if (contact.receives_billing === undefined || contact.receives_billing === null) {
      contact.receives_billing = true
    }

    // Set default is_blocked if not explicitly set
    if (contact.is_blocked === undefined || contact.is_blocked === null) {
      contact.is_blocked = false
    }
  }

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>

  @belongsTo(() => ClientAddress, {
    foreignKey: 'address_id',
  })
  declare address: BelongsTo<typeof ClientAddress>
}

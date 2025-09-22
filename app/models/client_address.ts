import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
  hasMany,
  scope,
  SnakeCaseNamingStrategy,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Client from '#models/client'
import ClientContact from '#models/client_contact'

export default class ClientAddress extends BaseModel {
  static table = 'client_addresses'
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
  declare company_name: string | null

  @column()
  declare fantasy_name: string | null

  @column()
  declare document: string | null

  @column()
  declare person_type: 'individual' | 'company' | null

  @column()
  declare postal_code: string

  @column()
  declare street: string

  @column()
  declare number: string

  @column()
  declare complement: string | null

  @column()
  declare neighborhood: string

  @column()
  declare city: string

  @column()
  declare state: string

  @column()
  declare country: string

  @column()
  declare cost_center_id: number | null

  @column()
  declare is_primary: boolean

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>

  @hasMany(() => ClientContact, {
    foreignKey: 'address_id',
  })
  declare contacts: HasMany<typeof ClientContact>

  /**
   * ------------------------------------------------------
   * Hooks
   * ------------------------------------------------------
   */
  @beforeCreate()
  static async setDefaultValues(address: ClientAddress) {
    // Set default country if not provided
    if (!address.country) {
      address.country = 'Brasil'
    }

    // Check if this is the first address for the client
    if (address.client_id && (address.is_primary === undefined || address.is_primary === null)) {
      const existingAddresses = await ClientAddress.query()
        .where('client_id', address.client_id)
        .count('* as total')

      // If no existing addresses, make this the primary address
      address.is_primary = existingAddresses[0]?.$extras.total === 0
    }
  }

  /**
   * ------------------------------------------------------
   * Computed Properties
   * ------------------------------------------------------
   */
  public get full_address(): string {
    let address = `${this.street}, ${this.number}`
    if (this.complement) {
      address += ` - ${this.complement}`
    }
    address += `, ${this.neighborhood}, ${this.city} - ${this.state}`
    if (this.postal_code) {
      address += `, ${this.postal_code}`
    }
    return address
  }
}

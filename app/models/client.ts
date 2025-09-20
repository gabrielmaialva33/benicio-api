import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeFetch,
  beforeFind,
  beforePaginate,
  belongsTo,
  column,
  hasMany,
  scope,
  SnakeCaseNamingStrategy,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import * as model from '@adonisjs/lucid/types/model'
import User from '#models/user'
import ClientAddress from '#models/client_address'
import ClientContact from '#models/client_contact'

type ClientBuilder = ModelQueryBuilderContract<typeof Client>

export default class Client extends BaseModel {
  static table = 'clients'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare person_type: 'individual' | 'company'

  @column()
  declare fantasy_name: string

  @column()
  declare company_name: string | null

  @column()
  declare document: string

  @column()
  declare document_type: 'cpf' | 'cnpj'

  @column()
  declare client_type:
    | 'prospect'
    | 'prospect_sic'
    | 'prospect_dbm'
    | 'client'
    | 'board_contact'
    | 'news_contact'

  @column()
  declare company_group_id: number | null

  @column()
  declare business_sector_id: number | null

  @column()
  declare revenue_range: 'small' | 'medium' | 'large' | 'enterprise' | null

  @column()
  declare employee_count_range: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null

  @column()
  declare is_active: boolean

  @column()
  declare is_favorite: boolean

  @column()
  declare ir_retention: boolean

  @column()
  declare pcc_retention: boolean

  @column()
  declare connection_code: string | null

  @column()
  declare accounting_account: string | null

  @column()
  declare monthly_sheet: number | null

  @column()
  declare notes: string | null

  @column()
  declare billing_notes: string | null

  @column()
  declare user_id: number | null

  @column()
  declare created_by_id: number

  @column()
  declare updated_by_id: number | null

  @column.dateTime()
  declare deleted_at: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'created_by_id',
  })
  declare created_by: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'updated_by_id',
  })
  declare updated_by: BelongsTo<typeof User>

  @hasMany(() => ClientAddress)
  declare addresses: HasMany<typeof ClientAddress>

  @hasMany(() => ClientContact)
  declare contacts: HasMany<typeof ClientContact>

  /**
   * ------------------------------------------------------
   * Hooks
   * ------------------------------------------------------
   */
  @beforeFind()
  @beforeFetch()
  static async softDeletes(query: model.ModelQueryBuilderContract<typeof Client>) {
    query.whereNull('deleted_at')
  }

  @beforePaginate()
  static async softDeletesPaginate(
    queries: [
      countQuery: model.ModelQueryBuilderContract<typeof Client>,
      fetchQuery: model.ModelQueryBuilderContract<typeof Client>,
    ]
  ) {
    queries.forEach((query) => query.whereNull('deleted_at'))
  }

  /**
   * ------------------------------------------------------
   * Query Scopes
   * ------------------------------------------------------
   */
  static active = scope((query) => {
    query.where('is_active', true)
  })

  static favorites = scope((query) => {
    query.where('is_favorite', true)
  })

  static byType = scope((query, type: 'individual' | 'company') => {
    query.where('person_type', type)
  })

  static byClientType = scope(
    (
      query,
      clientType:
        | 'prospect'
        | 'prospect_sic'
        | 'prospect_dbm'
        | 'client'
        | 'board_contact'
        | 'news_contact'
    ) => {
      query.where('client_type', clientType)
    }
  )

  static search = scope((query, searchTerm: string) => {
    const cleanedTerm = searchTerm.replace(/\D/g, '')

    query.where((q) => {
      q.whereILike('fantasy_name', `%${searchTerm}%`).orWhereILike(
        'company_name',
        `%${searchTerm}%`
      )

      // Check if it might be a document
      if (cleanedTerm.length === 11 || cleanedTerm.length === 14) {
        q.orWhere('document', cleanedTerm)
      }
    })
  })

  static withRelationships = scope((query: ClientBuilder) => {
    query.preload('addresses').preload('contacts')
  })

  static byCompanyGroup = scope((query, companyGroupId: number) => {
    query.where('company_group_id', companyGroupId)
  })

  static byBusinessSector = scope((query, businessSectorId: number) => {
    query.where('business_sector_id', businessSectorId)
  })
}

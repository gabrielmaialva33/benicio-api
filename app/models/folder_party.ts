import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
  scope,
  SnakeCaseNamingStrategy,
} from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import * as model from '@adonisjs/lucid/types/model'
import Folder from '#models/folder'
import Client from '#models/client'
import User from '#models/user'

export default class FolderParty extends BaseModel {
  static table = 'folder_parties'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare folder_id: number

  @column()
  declare client_id: number | null

  @column()
  declare party_type: string

  @column()
  declare name: string

  @column()
  declare document: string | null

  @column()
  declare document_type: string | null

  @column()
  declare email: string | null

  @column()
  declare phone: string | null

  @column()
  declare address: string | null

  @column()
  declare role: string

  @column()
  declare is_active: boolean

  @column()
  declare is_primary_party: boolean

  @column()
  declare legal_representative: string | null

  @column()
  declare notes: string | null

  @column()
  declare metadata: Record<string, any> | null

  @column()
  declare created_by_id: number | null

  @column()
  declare updated_by_id: number | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => Folder, {
    foreignKey: 'folder_id',
  })
  declare folder: BelongsTo<typeof Folder>

  @belongsTo(() => Client, {
    foreignKey: 'client_id',
  })
  declare client: BelongsTo<typeof Client>

  @belongsTo(() => User, {
    foreignKey: 'created_by_id',
  })
  declare created_by: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'updated_by_id',
  })
  declare updated_by: BelongsTo<typeof User>

  /**
   * ------------------------------------------------------
   * Hooks
   * ------------------------------------------------------
   */
  @beforeCreate()
  static async setDefaultValues(party: FolderParty) {
    if (party.is_active === undefined || party.is_active === null) {
      party.is_active = true
    }

    if (party.is_primary_party === undefined || party.is_primary_party === null) {
      party.is_primary_party = false
    }

    if (!party.party_type) {
      party.party_type = 'person'
    }

    if (!party.role) {
      party.role = 'other'
    }
  }

  /**
   * ------------------------------------------------------
   * Query Scopes
   * ------------------------------------------------------
   */
  static active = scope((query) => {
    query.where('is_active', true)
  })

  static byFolder = scope((query, folderId: number) => {
    query.where('folder_id', folderId)
  })

  static byType = scope((query, type: string) => {
    query.where('party_type', type)
  })

  static byRole = scope((query, role: string) => {
    query.where('role', role)
  })

  static primaryParties = scope((query) => {
    query.where('is_primary_party', true)
  })

  static search = scope((query, searchTerm: string) => {
    query.where((q) => {
      q.whereILike('name', `%${searchTerm}%`)
        .orWhereILike('document', `%${searchTerm}%`)
        .orWhereILike('email', `%${searchTerm}%`)
    })
  })

  static withRelationships = scope((query) => {
    query.preload('folder').preload('client').preload('created_by')
  })

  /**
   * ------------------------------------------------------
   * Computed Properties
   * ------------------------------------------------------
   */
  public get displayName(): string {
    return this.name
  }

  public get isPerson(): boolean {
    return this.party_type === 'person'
  }

  public get isCompany(): boolean {
    return this.party_type === 'company'
  }

  public get hasContact(): boolean {
    return !!(this.email || this.phone)
  }
}

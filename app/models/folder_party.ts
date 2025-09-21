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
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Folder from '#models/folder'
import Client from '#models/client'
import User from '#models/user'

type FolderPartyBuilder = ModelQueryBuilderContract<typeof FolderParty>

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
  declare folderId: number

  @column()
  declare clientId: number | null

  @column()
  declare partyType: string

  @column()
  declare name: string

  @column()
  declare document: string | null

  @column()
  declare documentType: string | null

  @column()
  declare email: string | null

  @column()
  declare phone: string | null

  @column()
  declare address: string | null

  @column()
  declare role: string

  @column()
  declare isActive: boolean

  @column()
  declare isPrimaryParty: boolean

  @column()
  declare legalRepresentative: string | null

  @column()
  declare notes: string | null

  @column()
  declare metadata: Record<string, any> | null

  @column()
  declare createdById: number | null

  @column()
  declare updatedById: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => Folder, {
    foreignKey: 'folderId',
  })
  declare folder: BelongsTo<typeof Folder>

  @belongsTo(() => Client, {
    foreignKey: 'clientId',
  })
  declare client: BelongsTo<typeof Client>

  @belongsTo(() => User, {
    foreignKey: 'createdById',
  })
  declare createdBy: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'updatedById',
  })
  declare updatedBy: BelongsTo<typeof User>

  /**
   * ------------------------------------------------------
   * Hooks
   * ------------------------------------------------------
   */
  @beforeCreate()
  static async setDefaultValues(party: FolderParty) {
    if (party.isActive === undefined || party.isActive === null) {
      party.isActive = true
    }

    if (party.isPrimaryParty === undefined || party.isPrimaryParty === null) {
      party.isPrimaryParty = false
    }

    if (!party.partyType) {
      party.partyType = 'person'
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
  static active = scope((query: FolderPartyBuilder) => {
    query.where('is_active', true)
  })

  static byFolder = scope((query: FolderPartyBuilder, folderId: number) => {
    query.where('folder_id', folderId)
  })

  static byType = scope((query: FolderPartyBuilder, type: string) => {
    query.where('party_type', type)
  })

  static byRole = scope((query: FolderPartyBuilder, role: string) => {
    query.where('role', role)
  })

  static primaryParties = scope((query: FolderPartyBuilder) => {
    query.where('is_primary_party', true)
  })

  static search = scope((query: FolderPartyBuilder, searchTerm: string) => {
    query.where((q) => {
      q.whereILike('name', `%${searchTerm}%`)
        .orWhereILike('document', `%${searchTerm}%`)
        .orWhereILike('email', `%${searchTerm}%`)
    })
  })

  static withRelationships = scope((query: FolderPartyBuilder) => {
    query.preload('folder').preload('client').preload('createdBy')
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
    return this.partyType === 'person'
  }

  public get isCompany(): boolean {
    return this.partyType === 'company'
  }

  public get hasContact(): boolean {
    return !!(this.email || this.phone)
  }
}

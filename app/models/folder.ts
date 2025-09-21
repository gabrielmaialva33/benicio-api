import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  beforeFind,
  beforeFetch,
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
import Client from '#models/client'
import FolderType from '#models/folder_type'
import Court from '#models/court'
import User from '#models/user'
import FolderDocument from '#models/folder_document'
import FolderMovement from '#models/folder_movement'
import FolderParty from '#models/folder_party'

type FolderBuilder = ModelQueryBuilderContract<typeof Folder>

export default class Folder extends BaseModel {
  static table = 'folders'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare cnjNumber: string | null

  @column()
  declare internalClientCode: string | null

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare clientId: number

  @column()
  declare folderTypeId: number

  @column()
  declare courtId: number | null

  @column()
  declare responsibleLawyerId: number | null

  @column()
  declare parentFolderId: number | null

  @column()
  declare path: string | null

  @column()
  declare level: number

  @column()
  declare status: string

  @column()
  declare instance: string

  @column()
  declare nature: string

  @column()
  declare actionType: string | null

  @column()
  declare electronic: boolean

  @column()
  declare phase: string

  @column()
  declare prognosis: string | null

  @column()
  declare comarca: string | null

  @column()
  declare distributionType: string | null

  @column()
  declare caseValue: number | null

  @column()
  declare convictionValue: number | null

  @column()
  declare costs: number | null

  @column()
  declare fees: number | null

  @column()
  declare migrated: boolean

  @column()
  declare searchIntimation: boolean

  @column()
  declare searchProgress: boolean

  @column()
  declare loyIntegrationData: Record<string, any> | null

  @column.dateTime()
  declare coverInformationUpdatedAt: DateTime | null

  @column.date()
  declare distributionDate: DateTime | null

  @column.date()
  declare citationDate: DateTime | null

  @column.date()
  declare nextHearingDate: DateTime | null

  @column.date()
  declare prescriptionDate: DateTime | null

  @column()
  declare observation: string | null

  @column()
  declare objectDetail: string | null

  @column()
  declare lastMovement: string | null

  @column()
  declare billingNotes: string | null

  @column()
  declare isActive: boolean

  @column()
  declare isFavorite: boolean

  @column()
  declare priority: number

  @column()
  declare createdById: number

  @column()
  declare updatedById: number | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => Client, {
    foreignKey: 'clientId',
  })
  declare client: BelongsTo<typeof Client>

  @belongsTo(() => FolderType, {
    foreignKey: 'folderTypeId',
  })
  declare folderType: BelongsTo<typeof FolderType>

  @belongsTo(() => Court, {
    foreignKey: 'courtId',
  })
  declare court: BelongsTo<typeof Court>

  @belongsTo(() => User, {
    foreignKey: 'responsibleLawyerId',
  })
  declare responsibleLawyer: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'createdById',
  })
  declare createdBy: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'updatedById',
  })
  declare updatedBy: BelongsTo<typeof User>

  @belongsTo(() => Folder, {
    foreignKey: 'parentFolderId',
  })
  declare parentFolder: BelongsTo<typeof Folder>

  @hasMany(() => Folder, {
    foreignKey: 'parentFolderId',
  })
  declare childFolders: HasMany<typeof Folder>

  @hasMany(() => FolderDocument, {
    foreignKey: 'folderId',
  })
  declare documents: HasMany<typeof FolderDocument>

  @hasMany(() => FolderMovement, {
    foreignKey: 'folderId',
  })
  declare movements: HasMany<typeof FolderMovement>

  @hasMany(() => FolderParty, {
    foreignKey: 'folderId',
  })
  declare parties: HasMany<typeof FolderParty>

  /**
   * ------------------------------------------------------
   * Hooks
   * ------------------------------------------------------
   */
  @beforeCreate()
  static async setDefaultValues(folder: Folder) {
    if (!folder.status) {
      folder.status = 'pre_registration'
    }

    if (!folder.instance) {
      folder.instance = 'first'
    }

    if (!folder.nature) {
      folder.nature = 'judicial'
    }

    if (folder.electronic === undefined || folder.electronic === null) {
      folder.electronic = true
    }

    if (!folder.phase) {
      folder.phase = 'knowledge'
    }

    if (folder.migrated === undefined || folder.migrated === null) {
      folder.migrated = false
    }

    if (folder.searchIntimation === undefined || folder.searchIntimation === null) {
      folder.searchIntimation = true
    }

    if (folder.searchProgress === undefined || folder.searchProgress === null) {
      folder.searchProgress = false
    }

    if (folder.isActive === undefined || folder.isActive === null) {
      folder.isActive = true
    }

    if (folder.isFavorite === undefined || folder.isFavorite === null) {
      folder.isFavorite = false
    }

    if (!folder.priority) {
      folder.priority = 1
    }

    if (!folder.level) {
      folder.level = 0
    }
  }

  @beforeFind()
  @beforeFetch()
  static async softDeletes(query: model.ModelQueryBuilderContract<typeof Folder>) {
    query.whereNull('deleted_at')
  }

  @beforePaginate()
  static async softDeletesPaginate(
    queries: [
      countQuery: model.ModelQueryBuilderContract<typeof Folder>,
      fetchQuery: model.ModelQueryBuilderContract<typeof Folder>,
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

  static byStatus = scope((query, status: string) => {
    query.where('status', status)
  })

  static byClient = scope((query, clientId: number) => {
    query.where('client_id', clientId)
  })

  static byLawyer = scope((query, lawyerId: number) => {
    query.where('responsible_lawyer_id', lawyerId)
  })

  static byType = scope((query, typeId: number) => {
    query.where('folder_type_id', typeId)
  })

  static byCourt = scope((query, courtId: number) => {
    query.where('court_id', courtId)
  })

  static byPriority = scope((query, priority: number) => {
    query.where('priority', priority)
  })

  static highPriority = scope((query) => {
    query.where('priority', '>=', 4)
  })

  static withUpcomingHearings = scope((query, days: number = 30) => {
    const futureDate = DateTime.now().plus({ days }).toSQLDate()
    query.whereBetween('next_hearing_date', [DateTime.now().toSQLDate(), futureDate])
  })

  static search = scope((query, searchTerm: string) => {
    const cleanedTerm = searchTerm.replace(/\D/g, '')

    query.where((q) => {
      q.whereILike('title', `%${searchTerm}%`)
        .orWhereILike('cnj_number', `%${searchTerm}%`)
        .orWhereILike('internal_client_code', `%${searchTerm}%`)
        .orWhereILike('description', `%${searchTerm}%`)

      if (cleanedTerm.length >= 15) {
        q.orWhere('cnj_number', 'LIKE', `%${cleanedTerm}%`)
      }
    })
  })

  static withRelationships = scope((query) => {
    query.preload('client').preload('folderType').preload('court').preload('responsibleLawyer')
  })

  static withCounts = scope((query) => {
    query
      .withAggregate('documents', (documentsQuery) => {
        documentsQuery.count('*').as('documents_count')
      })
      .withAggregate('movements', (movementsQuery) => {
        movementsQuery.count('*').as('movements_count')
      })
      .withAggregate('parties', (partiesQuery) => {
        partiesQuery.count('*').as('parties_count')
      })
  })

  /**
   * ------------------------------------------------------
   * Computed Properties
   * ------------------------------------------------------
   */
  public get displayTitle(): string {
    if (this.cnjNumber) {
      return `${this.title} (${this.cnjNumber})`
    }
    return this.title
  }

  public get statusDisplay(): string {
    const statusMap: Record<string, string> = {
      pre_registration: 'Pré-cadastro',
      awaiting_info: 'Aguardando Informações',
      info_updated: 'Informações Atualizadas',
      registered: 'Cadastrado',
      active: 'Ativo',
      suspended: 'Suspenso',
      archived: 'Arquivado',
      cancelled: 'Cancelado',
    }
    return statusMap[this.status] || this.status
  }

  public get isElectronic(): boolean {
    return this.electronic
  }

  public get hasUpcomingHearing(): boolean {
    if (!this.nextHearingDate) return false
    return DateTime.fromJSDate(this.nextHearingDate) > DateTime.now()
  }

  public get daysUntilHearing(): number | null {
    if (!this.nextHearingDate) return null
    const hearingDate = DateTime.fromJSDate(this.nextHearingDate)
    return Math.ceil(hearingDate.diff(DateTime.now(), 'days').days)
  }

  public get isHighPriority(): boolean {
    return this.priority >= 4
  }
}

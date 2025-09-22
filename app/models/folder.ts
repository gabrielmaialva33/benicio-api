import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
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
import Client from '#models/client'
import FolderType from '#models/folder_type'
import Court from '#models/court'
import User from '#models/user'
import FolderDocument from '#models/folder_document'
import FolderMovement from '#models/folder_movement'
import FolderParty from '#models/folder_party'

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
  declare cnj_number: string | null

  @column()
  declare internal_client_code: string | null

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare client_id: number

  @column()
  declare folder_type_id: number

  @column()
  declare court_id: number | null

  @column()
  declare responsible_lawyer_id: number | null

  @column()
  declare parent_folder_id: number | null

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
  declare action_type: string | null

  @column()
  declare electronic: boolean

  @column()
  declare phase: string

  @column()
  declare prognosis: string | null

  @column()
  declare comarca: string | null

  @column()
  declare distribution_type: string | null

  @column()
  declare case_value: number | null

  @column()
  declare conviction_value: number | null

  @column()
  declare costs: number | null

  @column()
  declare fees: number | null

  @column()
  declare migrated: boolean

  @column()
  declare search_intimation: boolean

  @column()
  declare search_progress: boolean

  @column()
  declare loy_integration_data: Record<string, any> | null

  @column.dateTime()
  declare cover_information_updated_at: DateTime | null

  @column.date()
  declare distribution_date: DateTime | null

  @column.date()
  declare citation_date: DateTime | null

  @column.date()
  declare next_hearing_date: DateTime | null

  @column.date()
  declare prescription_date: DateTime | null

  @column()
  declare observation: string | null

  @column()
  declare object_detail: string | null

  @column()
  declare last_movement: string | null

  @column()
  declare billing_notes: string | null

  @column()
  declare is_active: boolean

  @column()
  declare is_favorite: boolean

  @column()
  declare priority: number

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
  @belongsTo(() => Client, {
    foreignKey: 'client_id',
  })
  declare client: BelongsTo<typeof Client>

  @belongsTo(() => FolderType, {
    foreignKey: 'folder_type_id',
  })
  declare folder_type: BelongsTo<typeof FolderType>

  @belongsTo(() => Court, {
    foreignKey: 'court_id',
  })
  declare court: BelongsTo<typeof Court>

  @belongsTo(() => User, {
    foreignKey: 'responsible_lawyer_id',
  })
  declare responsible_lawyer: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'created_by_id',
  })
  declare created_by: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'updated_by_id',
  })
  declare updated_by: BelongsTo<typeof User>

  @belongsTo(() => Folder, {
    foreignKey: 'parent_folder_id',
  })
  declare parent_folder: BelongsTo<typeof Folder>

  @hasMany(() => Folder, {
    foreignKey: 'parent_folder_id',
  })
  declare child_folders: HasMany<typeof Folder>

  @hasMany(() => FolderDocument, {
    foreignKey: 'folder_id',
  })
  declare documents: HasMany<typeof FolderDocument>

  @hasMany(() => FolderMovement, {
    foreignKey: 'folder_id',
  })
  declare movements: HasMany<typeof FolderMovement>

  @hasMany(() => FolderParty, {
    foreignKey: 'folder_id',
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

    if (folder.search_intimation === undefined || folder.search_intimation === null) {
      folder.search_intimation = true
    }

    if (folder.search_progress === undefined || folder.search_progress === null) {
      folder.search_progress = false
    }

    if (folder.is_active === undefined || folder.is_active === null) {
      folder.is_active = true
    }

    if (folder.is_favorite === undefined || folder.is_favorite === null) {
      folder.is_favorite = false
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
  static async softDeletes(query: ModelQueryBuilderContract<typeof Folder>) {
    query.whereNull('deleted_at')
  }

  @beforePaginate()
  static async softDeletesPaginate(
    queries: [
      countQuery: ModelQueryBuilderContract<typeof Folder>,
      fetchQuery: ModelQueryBuilderContract<typeof Folder>,
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
    query.preload('client').preload('folder_type').preload('court').preload('responsible_lawyer')
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
    if (this.cnj_number) {
      return `${this.title} (${this.cnj_number})`
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
    if (!this.next_hearing_date) return false
    return this.next_hearing_date > DateTime.now()
  }

  public get daysUntilHearing(): number | null {
    if (!this.next_hearing_date) return null
    const hearingDate = this.next_hearing_date
    return Math.ceil(hearingDate.diff(DateTime.now(), 'days').days)
  }

  public get isHighPriority(): boolean {
    return this.priority >= 4
  }
}

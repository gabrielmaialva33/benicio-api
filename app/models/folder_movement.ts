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
import Folder from '#models/folder'
import User from '#models/user'

export default class FolderMovement extends BaseModel {
  static table = 'folder_movements'
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
  declare movement_type: string

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare full_text: string | null

  @column()
  declare court_protocol: string | null

  @column()
  declare responsible_party: string | null

  @column.dateTime()
  declare movement_date: DateTime

  @column.dateTime()
  declare registered_date: DateTime | null

  @column()
  declare source: string

  @column()
  declare requires_action: boolean

  @column()
  declare is_deadline: boolean

  @column.date()
  declare deadline_date: DateTime | null

  @column()
  declare urgency_level: string

  @column()
  declare notified: boolean

  @column()
  declare tags: string[] | null

  @column()
  declare category: string | null

  @column()
  declare is_favorable: boolean | null

  @column()
  declare changes_status: boolean

  @column()
  declare external_data: Record<string, any> | null

  @column()
  declare external_id: string | null

  @column()
  declare auto_generated: boolean

  @column()
  declare automation_metadata: Record<string, any> | null

  @column()
  declare attached_documents: string[] | null

  @column()
  declare created_by_id: number | null

  @column()
  declare updated_by_id: number | null

  @column()
  declare is_public: boolean

  @column()
  declare internal_notes: string | null

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
    localKey: 'id',
  })
  declare folder: BelongsTo<typeof Folder>

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
  static async setDefaultValues(movement: FolderMovement) {
    if (!movement.source) {
      movement.source = 'manual'
    }

    if (movement.requires_action === undefined || movement.requires_action === null) {
      movement.requires_action = false
    }

    if (movement.is_deadline === undefined || movement.is_deadline === null) {
      movement.is_deadline = false
    }

    if (!movement.urgency_level) {
      movement.urgency_level = 'normal'
    }

    if (movement.notified === undefined || movement.notified === null) {
      movement.notified = false
    }

    if (movement.changes_status === undefined || movement.changes_status === null) {
      movement.changes_status = false
    }

    if (movement.auto_generated === undefined || movement.auto_generated === null) {
      movement.auto_generated = false
    }

    if (movement.is_public === undefined || movement.is_public === null) {
      movement.is_public = true
    }

    if (!movement.movement_date) {
      movement.movement_date = DateTime.now()
    }
  }

  /**
   * ------------------------------------------------------
   * Query Scopes
   * ------------------------------------------------------
   */
  static byFolder = scope((query, folderId: number) => {
    query.where('folder_id', folderId)
  })

  static byType = scope((query, type: string) => {
    query.where('movement_type', type)
  })

  static requiresAction = scope((query) => {
    query.where('requires_action', true)
  })

  static withDeadlines = scope((query) => {
    query.where('is_deadline', true).whereNotNull('deadline_date')
  })

  static upcomingDeadlines = scope((query, days: number = 30) => {
    const futureDate = DateTime.now().plus({ days }).toSQLDate()
    query
      .where('is_deadline', true)
      .whereBetween('deadline_date', [DateTime.now().toSQLDate(), futureDate])
  })

  static byUrgency = scope((query, level: string) => {
    query.where('urgency_level', level)
  })

  static urgent = scope((query) => {
    query.whereIn('urgency_level', ['high', 'urgent'])
  })

  static favorable = scope((query) => {
    query.where('is_favorable', true)
  })

  static unfavorable = scope((query) => {
    query.where('is_favorable', false)
  })

  static automated = scope((query) => {
    query.where('auto_generated', true)
  })

  static manual = scope((query) => {
    query.where('auto_generated', false)
  })

  static publicMovements = scope((query) => {
    query.where('is_public', true)
  })

  static recent = scope((query, days: number = 30) => {
    const pastDate = DateTime.now().minus({ days })
    query.where('movement_date', '>=', pastDate.toSQL())
  })

  static search = scope((query, searchTerm: string) => {
    query.where((q) => {
      q.whereRaw('title ILIKE ?', [`%${searchTerm}%`])
        .orWhereRaw('description ILIKE ?', [`%${searchTerm}%`])
        .orWhereRaw('full_text ILIKE ?', [`%${searchTerm}%`])
        .orWhereRaw('court_protocol ILIKE ?', [`%${searchTerm}%`])
        .orWhereRaw('responsible_party ILIKE ?', [`%${searchTerm}%`])
    })
  })

  /**
   * ------------------------------------------------------
   * Computed Properties
   * ------------------------------------------------------
   */
  public get displayTitle(): string {
    return this.title
  }

  public get isOverdue(): boolean {
    if (!this.is_deadline || !this.deadline_date) return false
    return this.deadline_date < DateTime.now()
  }

  public get daysUntilDeadline(): number | null {
    if (!this.is_deadline || !this.deadline_date) return null
    const deadlineDate = this.deadline_date
    return Math.ceil(deadlineDate.diff(DateTime.now(), 'days').days)
  }

  public get isUrgent(): boolean {
    return ['high', 'urgent'].includes(this.urgency_level)
  }

  public get statusColor(): string {
    if (this.isOverdue) return '#EF4444' // red
    if (this.isUrgent) return '#F59E0B' // amber
    if (this.is_favorable === true) return '#10B981' // green
    if (this.is_favorable === false) return '#EF4444' // red
    return '#6B7280' // gray
  }

  public get ageInDays(): number {
    return Math.floor(DateTime.now().diff(this.movement_date, 'days').days)
  }

  public get hasAttachments(): boolean {
    return !!(this.attached_documents && this.attached_documents.length > 0)
  }

  public get isExternal(): boolean {
    return ['court_api', 'loy_system'].includes(this.source)
  }
}

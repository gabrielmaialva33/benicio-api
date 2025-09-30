import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, scope, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import * as model from '@adonisjs/lucid/types/model'
import User from '#models/user'
import Folder from '#models/folder'

export default class Task extends BaseModel {
  static table = 'tasks'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare folder_id: number | null

  @column()
  declare assigned_to_id: number

  @column()
  declare created_by_id: number

  @column.dateTime()
  declare due_date: DateTime

  @column.dateTime()
  declare completed_at: DateTime | null

  @column()
  declare status: 'pending' | 'in_progress' | 'completed' | 'cancelled'

  @column()
  declare priority: 'low' | 'medium' | 'high' | 'urgent'

  @column({
    prepare: (value: string[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => (value ? JSON.parse(value) : null),
  })
  declare tags: string[] | null

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
    foreignKey: 'assigned_to_id',
  })
  declare assignedTo: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'created_by_id',
  })
  declare createdBy: BelongsTo<typeof User>

  @belongsTo(() => Folder, {
    foreignKey: 'folder_id',
  })
  declare folder: BelongsTo<typeof Folder>

  /**
   * ------------------------------------------------------
   * Query Scopes
   * ------------------------------------------------------
   */
  static byAssignee = scope((query, userId: number) => {
    query.where('assigned_to_id', userId)
  })

  static byCreator = scope((query, userId: number) => {
    query.where('created_by_id', userId)
  })

  static byStatus = scope((query, status: Task['status']) => {
    query.where('status', status)
  })

  static byPriority = scope((query, priority: Task['priority']) => {
    query.where('priority', priority)
  })

  static overdue = scope((query) => {
    query
      .where('due_date', '<', DateTime.now().toSQL())
      .whereNotIn('status', ['completed', 'cancelled'])
  })

  static upcoming = scope((query, days: number = 7) => {
    const futureDate = DateTime.now().plus({ days })
    query
      .whereBetween('due_date', [DateTime.now().toSQL(), futureDate.toSQL()])
      .whereNotIn('status', ['completed', 'cancelled'])
  })

  static pending = scope((query) => {
    query.whereIn('status', ['pending', 'in_progress'])
  })

  /**
   * ------------------------------------------------------
   * Computed Properties
   * ------------------------------------------------------
   */
  public get isOverdue(): boolean {
    if (this.status === 'completed' || this.status === 'cancelled') return false
    return this.due_date < DateTime.now()
  }

  public get daysUntilDue(): number {
    return Math.ceil(this.due_date.diff(DateTime.now(), 'days').days)
  }

  public get isUrgent(): boolean {
    return this.priority === 'urgent' || this.priority === 'high'
  }

  public get statusColor(): string {
    switch (this.status) {
      case 'completed':
        return '#10B981' // green
      case 'cancelled':
        return '#6B7280' // gray
      case 'in_progress':
        return '#3B82F6' // blue
      case 'pending':
        return this.isOverdue ? '#EF4444' : '#F59E0B' // red if overdue, amber otherwise
      default:
        return '#6B7280'
    }
  }

  public get priorityColor(): string {
    switch (this.priority) {
      case 'urgent':
        return '#DC2626' // red
      case 'high':
        return '#F59E0B' // amber
      case 'medium':
        return '#3B82F6' // blue
      case 'low':
        return '#6B7280' // gray
      default:
        return '#6B7280'
    }
  }
}

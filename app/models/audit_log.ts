import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, scope, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class AuditLog extends BaseModel {
  static table = 'audit_logs'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  // User and session info
  @column()
  declare user_id: number | null

  @column()
  declare session_id: string | null

  @column()
  declare ip_address: string | null

  @column()
  declare user_agent: string | null

  // Permission info
  @column()
  declare resource: string

  @column()
  declare action: string

  @column()
  declare context: string | null

  @column()
  declare resource_id: number | null

  // Request info
  @column()
  declare method: string | null

  @column()
  declare url: string | null

  @column()
  declare request_data: Record<string, any> | null

  // Result info
  @column()
  declare result: 'granted' | 'denied'

  @column()
  declare reason: string | null

  @column()
  declare response_code: number | null

  // Additional metadata
  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime | null

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare user: BelongsTo<typeof User>

  /**
   * ------------------------------------------------------
   * Query Scopes
   * ------------------------------------------------------
   */
  static byUser = scope((query, userId: number) => {
    query.where('user_id', userId)
  })

  static byResource = scope((query, resource: string) => {
    query.where('resource', resource)
  })

  static byAction = scope((query, action: string) => {
    query.where('action', action)
  })

  static byResult = scope((query, result: 'granted' | 'denied') => {
    query.where('result', result)
  })

  static byDateRange = scope((query, startDate: DateTime, endDate: DateTime) => {
    query.whereBetween('created_at', [startDate.toSQL()!, endDate.toSQL()!])
  })

  static byIpAddress = scope((query, ipAddress: string) => {
    query.where('ip_address', ipAddress)
  })

  static recentFirst = scope((query) => {
    query.orderBy('created_at', 'desc')
  })
}

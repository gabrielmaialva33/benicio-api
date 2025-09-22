import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, scope, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class File extends BaseModel {
  static table = 'files'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare owner_id: number

  @column()
  declare client_name: string

  @column()
  declare file_name: string

  @column()
  declare file_size: number

  @column()
  declare file_type: string

  @column()
  declare file_category: string

  @column()
  declare url: string

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
    foreignKey: 'owner_id',
  })
  declare owner: BelongsTo<typeof User>

  /**
   * ------------------------------------------------------
   * Hooks
   * ------------------------------------------------------
   */

  /**
   * ------------------------------------------------------
   * Query Scopes
   * ------------------------------------------------------
   */
  static byOwner = scope((query, ownerId: number) => {
    query.where('owner_id', ownerId)
  })

  static byCategory = scope((query, category: string) => {
    query.where('file_category', category)
  })

  static byType = scope((query, type: string) => {
    query.where('file_type', type)
  })

  static recentFirst = scope((query) => {
    query.orderBy('created_at', 'desc')
  })

  /**
   * ------------------------------------------------------
   * Computed Properties
   * ------------------------------------------------------
   */
  public get sizeInMB(): number {
    return this.file_size / (1024 * 1024)
  }

  public get sizeFormatted(): string {
    const bytes = this.file_size
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / 1048576).toFixed(2)} MB`
  }
}

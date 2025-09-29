import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, scope, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Folder from '#models/folder'

export default class FolderType extends BaseModel {
  static table = 'folder_types'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare color: string

  @column()
  declare is_active: boolean

  @column()
  declare sort_order: number

  @column()
  declare workflow_config: Record<string, any> | null

  @column()
  declare required_fields: string[] | null

  @column()
  declare default_values: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @hasMany(() => Folder, {
    foreignKey: 'folder_type_id',
  })
  declare folders: HasMany<typeof Folder>

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
  static active = scope((query) => {
    query.where('is_active', true)
  })

  static sorted = scope((query) => {
    query.orderBy('sort_order').orderBy('name')
  })

  /**
   * ------------------------------------------------------
   * Computed Properties
   * ------------------------------------------------------
   */
  public get displayName(): string {
    return this.name
  }

  public get isConfigured(): boolean {
    return !!(this.workflow_config || this.required_fields || this.default_values)
  }
}

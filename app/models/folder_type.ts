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
  declare isActive: boolean

  @column()
  declare sortOrder: number

  @column()
  declare workflowConfig: Record<string, any> | null

  @column()
  declare requiredFields: string[] | null

  @column()
  declare defaultValues: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @hasMany(() => Folder, {
    foreignKey: 'folderTypeId',
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
    return !!(this.workflowConfig || this.requiredFields || this.defaultValues)
  }
}

import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
  hasMany,
  scope,
  SnakeCaseNamingStrategy,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Folder from '#models/folder'

export default class Court extends BaseModel {
  static table = 'courts'
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
  declare cnj_code: string

  @column()
  declare tribunal_code: string

  @column()
  declare court_type: 'federal' | 'state' | 'military' | 'electoral' | 'labor'

  @column()
  declare instance: 'first' | 'second' | 'superior'

  @column()
  declare jurisdiction: string | null

  @column()
  declare state_code: string | null

  @column()
  declare city: string | null

  @column()
  declare address: string | null

  @column()
  declare phone: string | null

  @column()
  declare email: string | null

  @column()
  declare website: string | null

  @column()
  declare is_active: boolean

  @column()
  declare electronic_processing: boolean

  @column()
  declare parent_court_id: number | null

  @column()
  declare path: string | null

  @column()
  declare level: number

  @column()
  declare business_hours: Record<string, any> | null

  @column()
  declare specialties: string[] | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => Court, {
    foreignKey: 'parent_court_id',
  })
  declare parent_court: BelongsTo<typeof Court>

  @hasMany(() => Court, {
    foreignKey: 'parent_court_id',
  })
  declare child_courts: HasMany<typeof Court>

  @hasMany(() => Folder, {
    foreignKey: 'court_id',
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

  static byType = scope((query, type: string) => {
    query.where('court_type', type)
  })

  static byInstance = scope((query, instance: string) => {
    query.where('instance', instance)
  })

  static byState = scope((query, stateCode: string) => {
    query.where('state_code', stateCode)
  })

  static withElectronicProcessing = scope((query) => {
    query.where('electronic_processing', true)
  })

  static topLevel = scope((query) => {
    query.whereNull('parent_court_id')
  })

  /**
   * ------------------------------------------------------
   * Computed Properties
   * ------------------------------------------------------
   */
  public get fullName(): string {
    const parts = [this.name]
    if (this.city) parts.push(this.city)
    if (this.state_code) parts.push(this.state_code)
    return parts.join(' - ')
  }

  public get displayCode(): string {
    return this.cnj_code || this.tribunal_code
  }

  public get isTopLevel(): boolean {
    return !this.parent_court_id
  }

  public get hasElectronicProcessing(): boolean {
    return this.electronic_processing
  }
}

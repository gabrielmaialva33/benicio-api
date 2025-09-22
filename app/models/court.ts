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
  declare cnjCode: string

  @column()
  declare tribunalCode: string

  @column()
  declare courtType: 'federal' | 'state' | 'military' | 'electoral' | 'labor'

  @column()
  declare instance: 'first' | 'second' | 'superior'

  @column()
  declare jurisdiction: string | null

  @column()
  declare stateCode: string | null

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
  declare isActive: boolean

  @column()
  declare electronicProcessing: boolean

  @column()
  declare parentCourtId: number | null

  @column()
  declare path: string | null

  @column()
  declare level: number

  @column()
  declare businessHours: Record<string, any> | null

  @column()
  declare specialties: string[] | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => Court, {
    foreignKey: 'parentCourtId',
  })
  declare parentCourt: BelongsTo<typeof Court>

  @hasMany(() => Court, {
    foreignKey: 'parentCourtId',
  })
  declare childCourts: HasMany<typeof Court>

  @hasMany(() => Folder, {
    foreignKey: 'courtId',
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
    if (this.stateCode) parts.push(this.stateCode)
    return parts.join(' - ')
  }

  public get displayCode(): string {
    return this.cnjCode || this.tribunalCode
  }

  public get isTopLevel(): boolean {
    return !this.parentCourtId
  }

  public get hasElectronicProcessing(): boolean {
    return this.electronicProcessing
  }
}

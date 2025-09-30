import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AiMessage from '#models/ai_message'

export default class AiCitation extends BaseModel {
  static table = 'ai_citations'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare message_id: number

  @column()
  declare source_type: string

  @column()
  declare source_url: string | null

  @column()
  declare source_title: string | null

  @column()
  declare excerpt: string | null

  @column()
  declare confidence_score: number | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => AiMessage, { foreignKey: 'message_id' })
  declare message: BelongsTo<typeof AiMessage>
}

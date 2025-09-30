import { DateTime } from 'luxon'
import { BaseModel, column, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'

export default class AiKnowledgeBase extends BaseModel {
  static table = 'ai_knowledge_base'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare content: string

  @column()
  declare embedding: number[] | null

  @column()
  declare source_type: string

  @column()
  declare source_id: string | null

  @column()
  declare source_url: string | null

  @column()
  declare title: string | null

  @column()
  declare metadata: Record<string, any> | null

  @column()
  declare tags: string[] | null

  @column()
  declare language: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}

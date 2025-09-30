import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import AiConversation from '#models/ai_conversation'
import AiAgent from '#models/ai_agent'
import AiCitation from '#models/ai_citation'

export default class AiMessage extends BaseModel {
  static table = 'ai_messages'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare conversation_id: number

  @column()
  declare role: string

  @column()
  declare content: string

  @column()
  declare agent_id: number | null

  @column()
  declare model_used: string | null

  @column()
  declare tool_calls: Record<string, any>[] | null

  @column()
  declare tool_results: Record<string, any>[] | null

  @column()
  declare tokens: number | null

  @column()
  declare finish_reason: string | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => AiConversation, { foreignKey: 'conversation_id' })
  declare conversation: BelongsTo<typeof AiConversation>

  @belongsTo(() => AiAgent, { foreignKey: 'agent_id' })
  declare agent: BelongsTo<typeof AiAgent>

  @hasMany(() => AiCitation, { foreignKey: 'message_id' })
  declare citations: HasMany<typeof AiCitation>
}

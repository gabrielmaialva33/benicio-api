import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import AiAgent from '#models/ai_agent'
import Folder from '#models/folder'
import AiMessage from '#models/ai_message'
import AiAgentExecution from '#models/ai_agent_execution'

export default class AiConversation extends BaseModel {
  static table = 'ai_conversations'
  static namingStrategy = new SnakeCaseNamingStrategy()

  /**
   * ------------------------------------------------------
   * Columns
   * ------------------------------------------------------
   */
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare agent_id: number | null

  @column()
  declare folder_id: number | null

  @column()
  declare title: string | null

  @column()
  declare mode: string

  @column()
  declare metadata: Record<string, any> | null

  @column()
  declare total_tokens: number

  @column()
  declare is_active: boolean

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => User, { foreignKey: 'user_id' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => AiAgent, { foreignKey: 'agent_id' })
  declare agent: BelongsTo<typeof AiAgent>

  @belongsTo(() => Folder, { foreignKey: 'folder_id' })
  declare folder: BelongsTo<typeof Folder>

  @hasMany(() => AiMessage, { foreignKey: 'conversation_id' })
  declare messages: HasMany<typeof AiMessage>

  @hasMany(() => AiAgentExecution, { foreignKey: 'conversation_id' })
  declare executions: HasMany<typeof AiAgentExecution>
}

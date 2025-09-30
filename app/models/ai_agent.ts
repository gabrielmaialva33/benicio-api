import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import AiConversation from '#models/ai_conversation'
import AiMessage from '#models/ai_message'
import AiAgentExecution from '#models/ai_agent_execution'

export default class AiAgent extends BaseModel {
  static table = 'ai_agents'
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
  declare model: string

  @column()
  declare capabilities: Record<string, any> | null

  @column()
  declare system_prompt: string

  @column()
  declare tools: Record<string, any>[] | null

  @column()
  declare config: Record<string, any> | null

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
  @hasMany(() => AiConversation, { foreignKey: 'agent_id' })
  declare conversations: HasMany<typeof AiConversation>

  @hasMany(() => AiMessage, { foreignKey: 'agent_id' })
  declare messages: HasMany<typeof AiMessage>

  @hasMany(() => AiAgentExecution, { foreignKey: 'agent_id' })
  declare executions: HasMany<typeof AiAgentExecution>
}

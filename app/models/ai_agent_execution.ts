import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AiConversation from '#models/ai_conversation'
import AiAgent from '#models/ai_agent'
import AiWorkflow from '#models/ai_workflow'

export default class AiAgentExecution extends BaseModel {
  static table = 'ai_agent_executions'
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
  declare agent_id: number

  @column()
  declare workflow_id: number | null

  @column()
  declare status: string

  @column()
  declare input: string

  @column()
  declare output: string | null

  @column()
  declare tool_calls: Record<string, any>[] | null

  @column()
  declare tokens_used: number | null

  @column()
  declare duration_ms: number | null

  @column()
  declare error_message: string | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime()
  declare started_at: DateTime

  @column.dateTime()
  declare completed_at: DateTime | null

  /**
   * ------------------------------------------------------
   * Relationships
   * ------------------------------------------------------
   */
  @belongsTo(() => AiConversation, { foreignKey: 'conversation_id' })
  declare conversation: BelongsTo<typeof AiConversation>

  @belongsTo(() => AiAgent, { foreignKey: 'agent_id' })
  declare agent: BelongsTo<typeof AiAgent>

  @belongsTo(() => AiWorkflow, { foreignKey: 'workflow_id' })
  declare workflow: BelongsTo<typeof AiWorkflow>
}

import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import AiAgentExecution from '#models/ai_agent_execution'

export default class AiWorkflow extends BaseModel {
  static table = 'ai_workflows'
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
  declare steps: Record<string, any>

  @column()
  declare agent_sequence: string[]

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
  @hasMany(() => AiAgentExecution, { foreignKey: 'workflow_id' })
  declare executions: HasMany<typeof AiAgentExecution>
}

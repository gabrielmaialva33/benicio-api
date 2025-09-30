import { DateTime } from 'luxon'
import { BaseModel, column, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'

export default class AiTool extends BaseModel {
  static table = 'ai_tools'
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
  declare function_name: string

  @column()
  declare parameters_schema: Record<string, any>

  @column()
  declare requires_auth: boolean

  @column()
  declare allowed_agents: string[] | null

  @column()
  declare config: Record<string, any> | null

  @column()
  declare is_active: boolean

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}

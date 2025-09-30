import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ai_tools'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 100).notNullable().unique()
      table.string('slug', 100).notNullable().unique()
      table.text('description').nullable()
      table.string('function_name', 100).notNullable()
      table.jsonb('parameters_schema').notNullable()
      table.boolean('requires_auth').defaultTo(false)
      table.specificType('allowed_agents', 'text[]').nullable()
      table.jsonb('config').nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      // Indexes
      table.index('slug', 'idx_ai_tools_slug')
      table.index('is_active', 'idx_ai_tools_is_active')
    })

    // Create array index
    this.schema.raw(
      'CREATE INDEX idx_ai_tools_allowed_agents ON ai_tools USING GIN(allowed_agents)'
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

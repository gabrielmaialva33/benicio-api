import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ai_workflows'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 100).notNullable().unique()
      table.string('slug', 100).notNullable().unique()
      table.text('description').nullable()
      table.jsonb('steps').notNullable()
      table.specificType('agent_sequence', 'text[]').notNullable()
      table.jsonb('config').nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      // Indexes
      table.index('slug', 'idx_ai_workflows_slug')
      table.index('is_active', 'idx_ai_workflows_is_active')
    })

    // Create array index
    this.schema.raw(
      'CREATE INDEX idx_ai_workflows_agent_sequence ON ai_workflows USING GIN(agent_sequence)'
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

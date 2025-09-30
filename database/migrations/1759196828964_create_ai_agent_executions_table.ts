import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ai_agent_executions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('conversation_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('ai_conversations')
        .onDelete('CASCADE')
      table
        .integer('agent_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('ai_agents')
        .onDelete('CASCADE')
      table
        .integer('workflow_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('ai_workflows')
        .onDelete('SET NULL')
      table.string('status', 50).notNullable()
      table.text('input').notNullable()
      table.text('output').nullable()
      table.jsonb('tool_calls').nullable()
      table.integer('tokens_used').nullable()
      table.integer('duration_ms').nullable()
      table.text('error_message').nullable()
      table.jsonb('metadata').nullable()
      table.timestamp('started_at', { useTz: true }).notNullable()
      table.timestamp('completed_at', { useTz: true }).nullable()

      // Indexes
      table.index('conversation_id', 'idx_ai_agent_executions_conversation_id')
      table.index('agent_id', 'idx_ai_agent_executions_agent_id')
      table.index('workflow_id', 'idx_ai_agent_executions_workflow_id')
      table.index('status', 'idx_ai_agent_executions_status')
      table.index('started_at', 'idx_ai_agent_executions_started_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

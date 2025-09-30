import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ai_messages'

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
      table.string('role', 20).notNullable()
      table.text('content').notNullable()
      table
        .integer('agent_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('ai_agents')
        .onDelete('SET NULL')
      table.string('model_used', 100).nullable()
      table.jsonb('tool_calls').nullable()
      table.jsonb('tool_results').nullable()
      table.integer('tokens').nullable()
      table.string('finish_reason', 50).nullable()
      table.jsonb('metadata').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()

      // Indexes
      table.index('conversation_id', 'idx_ai_messages_conversation_id')
      table.index('role', 'idx_ai_messages_role')
      table.index('created_at', 'idx_ai_messages_created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

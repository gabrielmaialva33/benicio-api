import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ai_conversations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('agent_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('ai_agents')
        .onDelete('SET NULL')
      table
        .integer('folder_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('folders')
        .onDelete('SET NULL')
      table.string('title', 255).nullable()
      table.string('mode', 50).defaultTo('single_agent')
      table.jsonb('metadata').nullable()
      table.integer('total_tokens').defaultTo(0)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      // Indexes
      table.index('user_id', 'idx_ai_conversations_user_id')
      table.index('agent_id', 'idx_ai_conversations_agent_id')
      table.index('folder_id', 'idx_ai_conversations_folder_id')
      table.index(['user_id', 'is_active'], 'idx_ai_conversations_user_active')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ai_citations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('message_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('ai_messages')
        .onDelete('CASCADE')
      table.string('source_type', 50).notNullable()
      table.text('source_url').nullable()
      table.text('source_title').nullable()
      table.text('excerpt').nullable()
      table.decimal('confidence_score', 3, 2).nullable()
      table.jsonb('metadata').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()

      // Indexes
      table.index('message_id', 'idx_ai_citations_message_id')
      table.index('source_type', 'idx_ai_citations_source_type')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

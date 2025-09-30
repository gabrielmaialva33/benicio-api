import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.string('title').notNullable()
      table.text('description').nullable()

      table
        .integer('folder_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('folders')
        .onDelete('SET NULL')

      table
        .integer('assigned_to_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table
        .integer('created_by_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.timestamp('due_date', { useTz: true }).notNullable()
      table.timestamp('completed_at', { useTz: true }).nullable()

      table
        .enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])
        .notNullable()
        .defaultTo('pending')

      table.enum('priority', ['low', 'medium', 'high', 'urgent']).notNullable().defaultTo('medium')

      table.json('tags').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      // Indexes
      table.index('assigned_to_id')
      table.index('created_by_id')
      table.index('folder_id')
      table.index('status')
      table.index('priority')
      table.index('due_date')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

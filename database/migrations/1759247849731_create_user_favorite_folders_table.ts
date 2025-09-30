import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_favorite_folders'

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
        .integer('folder_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('folders')
        .onDelete('CASCADE')

      table.timestamp('created_at', { useTz: true }).notNullable()

      // Constraints
      table.unique(['user_id', 'folder_id'])

      // Indexes
      table.index('user_id')
      table.index('folder_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

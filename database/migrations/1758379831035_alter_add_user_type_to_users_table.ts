import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('user_type', ['employee', 'manager', 'client'])
        .defaultTo('employee')
        .notNullable()
        .after('username')

      table.index(['user_type'], 'idx_users_user_type')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['user_type'], 'idx_users_user_type')
      table.dropColumn('user_type')
    })
  }
}

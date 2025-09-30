import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ai_agents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 100).notNullable().unique()
      table.string('slug', 100).notNullable().unique()
      table.text('description').nullable()
      table.string('model', 100).notNullable()
      table.jsonb('capabilities').nullable()
      table.text('system_prompt').notNullable()
      table.jsonb('tools').nullable()
      table.jsonb('config').nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      // Indexes
      table.index('slug', 'idx_ai_agents_slug')
      table.index('is_active', 'idx_ai_agents_is_active')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

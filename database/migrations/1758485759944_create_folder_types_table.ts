import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'folder_types'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name', 100).notNullable().unique()
      table.string('slug', 100).notNullable().unique()
      table.text('description').nullable()
      table.string('color', 7).defaultTo('#6366f1') // Hex color for UI
      table.boolean('is_active').defaultTo(true)
      table.integer('sort_order').defaultTo(0)

      // Business rules metadata
      table.json('workflow_config').nullable() // Workflow states for this type
      table.json('required_fields').nullable() // Required fields for this type
      table.json('default_values').nullable() // Default values when creating

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['is_active', 'sort_order'])
      table.index('slug')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

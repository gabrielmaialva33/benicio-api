import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'courts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name', 255).notNullable()
      table.string('cnj_code', 10).notNullable().unique() // CNJ court code
      table.string('tribunal_code', 4).notNullable() // TR code from CNJ
      table.string('court_type', 50).notNullable() // 'federal', 'state', 'military', 'electoral', 'labor'
      table.string('instance', 50).notNullable() // 'first', 'second', 'superior'
      table.string('jurisdiction', 100).nullable() // Geographic jurisdiction
      table.string('state_code', 2).nullable() // UF code (SP, RJ, etc.)
      table.string('city', 100).nullable()
      table.string('address', 500).nullable()
      table.string('phone', 20).nullable()
      table.string('email', 100).nullable()
      table.string('website', 255).nullable()
      table.boolean('is_active').defaultTo(true)
      table.boolean('electronic_processing').defaultTo(true) // PJe support

      // Hierarchical structure
      table.integer('parent_court_id').unsigned().nullable()
      table.text('path').nullable() // Materialized path for hierarchy
      table.integer('level').defaultTo(0)

      // Additional metadata
      table.json('business_hours').nullable() // Operating hours
      table.json('specialties').nullable() // Court specializations
      table.text('notes').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Foreign keys
      table.foreign('parent_court_id').references('courts.id').onDelete('SET NULL')

      // Indexes
      table.index('cnj_code')
      table.index('tribunal_code')
      table.index(['court_type', 'instance'])
      table.index(['state_code', 'city'])
      table.index('path')
      table.index(['is_active', 'electronic_processing'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'client_addresses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Relationship
      table.integer('client_id').unsigned().notNullable()
      table.foreign('client_id').references('id').inTable('clients').onDelete('CASCADE')

      // Branch/Subsidiary Information
      table.string('company_name').nullable()
      table.string('fantasy_name').nullable()
      table.string('document').nullable() // Branch CNPJ/CPF
      table.enum('person_type', ['individual', 'company']).nullable()

      // Address
      table.string('postal_code', 9).notNullable() // CEP format: 00000-000
      table.string('street').notNullable()
      table.string('number').notNullable()
      table.string('complement').nullable()
      table.string('neighborhood').notNullable()
      table.string('city').notNullable()
      table.string('state', 2).notNullable() // UF
      table.string('country').notNullable().defaultTo('Brasil')

      // Cost Center
      table.integer('cost_center_id').unsigned().nullable()
      table.foreign('cost_center_id').references('id').inTable('cost_centers')

      // Status
      table.boolean('is_primary').defaultTo(false) // Main address

      // Timestamps
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['client_id'], 'idx_client_addresses_client_id')
      table.index(['postal_code'], 'idx_client_addresses_postal_code')
      table.index(['is_primary'], 'idx_client_addresses_is_primary')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

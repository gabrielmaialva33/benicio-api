import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Add default values to clients table
    this.schema.alterTable('clients', (table) => {
      table.string('client_type').defaultTo('prospect').alter()
      table.boolean('is_active').defaultTo(true).alter()
      table.boolean('is_favorite').defaultTo(false).alter()
      table.boolean('ir_retention').defaultTo(false).alter()
      table.boolean('pcc_retention').defaultTo(false).alter()
    })

    // Add default values to client_addresses table
    this.schema.alterTable('client_addresses', (table) => {
      table.string('country').defaultTo('Brasil').alter()
      table.boolean('is_primary').defaultTo(false).alter()
    })

    // Add default values to client_contacts table
    this.schema.alterTable('client_contacts', (table) => {
      table.boolean('participates_mailing').defaultTo(false).alter()
      table.boolean('receives_billing').defaultTo(true).alter()
      table.boolean('is_blocked').defaultTo(false).alter()
    })
  }

  async down() {
    // Remove default values from clients table
    this.schema.alterTable('clients', (table) => {
      table.string('client_type').alter()
      table.boolean('is_active').alter()
      table.boolean('is_favorite').alter()
      table.boolean('ir_retention').alter()
      table.boolean('pcc_retention').alter()
    })

    // Remove default values from client_addresses table
    this.schema.alterTable('client_addresses', (table) => {
      table.string('country').alter()
      table.boolean('is_primary').alter()
    })

    // Remove default values from client_contacts table
    this.schema.alterTable('client_contacts', (table) => {
      table.boolean('participates_mailing').alter()
      table.boolean('receives_billing').alter()
      table.boolean('is_blocked').alter()
    })
  }
}

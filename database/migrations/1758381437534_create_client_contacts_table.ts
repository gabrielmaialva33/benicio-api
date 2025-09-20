import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'client_contacts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Relationships
      table.integer('client_id').unsigned().notNullable()
      table.foreign('client_id').references('id').inTable('clients').onDelete('CASCADE')

      table.integer('address_id').unsigned().notNullable()
      table.foreign('address_id').references('id').inTable('client_addresses').onDelete('CASCADE')

      // Contact Information
      table.string('name').notNullable()

      table.integer('work_area_id').unsigned().nullable()
      table.foreign('work_area_id').references('id').inTable('work_areas')

      table.integer('position_id').unsigned().nullable()
      table.foreign('position_id').references('id').inTable('positions')

      // Mailing and Billing
      table.boolean('participates_mailing').defaultTo(false)
      table.boolean('receives_billing').defaultTo(false)

      // Contact Details
      table.enum('contact_type', ['phone', 'email']).notNullable()
      table.string('contact_value').notNullable() // Phone number or email
      table.boolean('is_blocked').defaultTo(false) // Block sending/receiving

      // Timestamps
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['client_id'], 'idx_client_contacts_client_id')
      table.index(['address_id'], 'idx_client_contacts_address_id')
      table.index(['receives_billing'], 'idx_client_contacts_receives_billing')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

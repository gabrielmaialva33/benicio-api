import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'clients'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Basic Information
      table.enum('person_type', ['individual', 'company']).notNullable()
      table.string('fantasy_name').notNullable()
      table.string('company_name').nullable()
      table.string('document').notNullable().unique() // CPF/CNPJ
      table.enum('document_type', ['cpf', 'cnpj']).notNullable()

      // Client Type and Classification
      table
        .enum('client_type', [
          'prospect',
          'prospect_sic',
          'prospect_dbm',
          'client',
          'board_contact',
          'news_contact',
        ])
        .notNullable()
        .defaultTo('prospect')

      // Business Information
      table.integer('company_group_id').unsigned().nullable()
      table.foreign('company_group_id').references('id').inTable('company_groups')

      table.integer('business_sector_id').unsigned().nullable()
      table.foreign('business_sector_id').references('id').inTable('business_sectors')

      table.enum('revenue_range', ['small', 'medium', 'large', 'enterprise']).nullable()

      table.enum('employee_count_range', ['1-10', '11-50', '51-200', '201-500', '500+']).nullable()

      // Status and Financial
      table.boolean('is_active').defaultTo(true)
      table.boolean('is_favorite').defaultTo(false)
      table.boolean('ir_retention').defaultTo(false) // Retenção IR
      table.boolean('pcc_retention').defaultTo(false) // Retenção PCC

      // Accounting Information
      table.string('connection_code').nullable()
      table.string('accounting_account').nullable()
      table.decimal('monthly_sheet', 10, 2).nullable()

      // Notes
      table.text('notes').nullable()
      table.text('billing_notes').nullable()

      // Relationships
      table.integer('user_id').unsigned().nullable() // When client is also a user
      table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL')

      // Audit
      table.integer('created_by_id').unsigned().notNullable()
      table.foreign('created_by_id').references('id').inTable('users')

      table.integer('updated_by_id').unsigned().nullable()
      table.foreign('updated_by_id').references('id').inTable('users')

      // Timestamps
      table.timestamp('deleted_at').nullable() // Soft delete
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['document'], 'idx_clients_document')
      table.index(['person_type'], 'idx_clients_person_type')
      table.index(['client_type'], 'idx_clients_client_type')
      table.index(['is_active'], 'idx_clients_is_active')
      table.index(['deleted_at'], 'idx_clients_deleted_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'folder_parties'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Relationships
      table.integer('folder_id').unsigned().notNullable()
      table.integer('client_id').unsigned().nullable() // If party is an existing client

      // Party identification
      table.string('name', 255).notNullable()
      table.string('document', 20).nullable() // CPF/CNPJ
      table.string('document_type', 10).nullable() // 'cpf', 'cnpj', 'passport', 'other'
      table.string('person_type', 20).nullable() // 'individual', 'company'

      // Party role in the process
      table.string('party_type', 50).notNullable() // 'plaintiff', 'defendant', 'third_party', 'witness', 'expert', 'prosecutor', 'public_defender'
      table.string('party_subtype', 100).nullable() // More specific role if needed
      table.boolean('is_main_party').defaultTo(false) // Main plaintiff/defendant vs secondary
      table.integer('party_order').defaultTo(1) // Order in case of multiple parties of same type

      // Contact information
      table.string('email', 100).nullable()
      table.string('phone', 20).nullable()
      table.string('mobile', 20).nullable()

      // Address information
      table.string('address', 500).nullable()
      table.string('neighborhood', 100).nullable()
      table.string('city', 100).nullable()
      table.string('state', 2).nullable()
      table.string('postal_code', 10).nullable()
      table.string('country', 2).defaultTo('BR')

      // Legal representation
      table.string('lawyer_name', 255).nullable()
      table.string('lawyer_oab', 20).nullable() // OAB registration
      table.string('lawyer_phone', 20).nullable()
      table.string('lawyer_email', 100).nullable()
      table.boolean('has_legal_aid').defaultTo(false) // Defensoria Pública

      // Status and metadata
      table.boolean('is_active').defaultTo(true)
      table.string('status', 50).defaultTo('active') // 'active', 'settled', 'excluded', 'deceased'
      table.date('inclusion_date').nullable() // Date party was included in process
      table.date('exclusion_date').nullable() // Date party was excluded from process
      table.text('exclusion_reason').nullable()

      // Additional information
      table.string('occupation', 100).nullable()
      table.string('nationality', 50).nullable()
      table.string('marital_status', 30).nullable()
      table.date('birth_date').nullable()
      table.text('notes').nullable()
      table.json('metadata').nullable() // Additional flexible data

      // Audit trail
      table.integer('created_by_id').unsigned().notNullable()
      table.integer('updated_by_id').unsigned().nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Foreign key constraints
      table.foreign('folder_id').references('folders.id').onDelete('CASCADE')
      table.foreign('client_id').references('clients.id').onDelete('SET NULL')
      table.foreign('created_by_id').references('users.id').onDelete('RESTRICT')
      table.foreign('updated_by_id').references('users.id').onDelete('SET NULL')

      // Indexes for performance
      table.index(['folder_id', 'party_type'])
      table.index(['folder_id', 'is_main_party'])
      table.index(['document', 'document_type'])
      table.index(['name'])
      table.index(['client_id'])
      table.index(['party_type', 'is_active'])
      table.index(['lawyer_oab'])
      table.index(['status', 'is_active'])
      table.index(['inclusion_date', 'exclusion_date'])

      // Composite indexes for common queries
      table.index(['folder_id', 'party_type', 'is_main_party'])
      table.index(['party_type', 'is_active', 'party_order'])

      // Unique constraint to prevent duplicate main parties per type per folder
      table.unique(['folder_id', 'party_type', 'party_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

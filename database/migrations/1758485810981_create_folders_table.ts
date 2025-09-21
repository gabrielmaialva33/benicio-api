import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'folders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Core identification
      table.string('cnj_number', 25).nullable().unique() // Full CNJ number: NNNNNNN-DD.AAAA.J.TR.OOOO
      table.string('internal_client_code', 50).nullable() // Client's internal reference
      table.string('title', 255).notNullable()
      table.text('description').nullable()

      // Foreign key relationships
      table.integer('client_id').unsigned().notNullable()
      table.integer('folder_type_id').unsigned().notNullable()
      table.integer('court_id').unsigned().nullable()
      table.integer('responsible_lawyer_id').unsigned().nullable()

      // Hierarchical structure for related processes
      table.integer('parent_folder_id').unsigned().nullable()
      table.text('path').nullable() // Materialized path for hierarchy queries
      table.integer('level').defaultTo(0)

      // Process classification
      table.string('status', 50).defaultTo('pre_registration') // 'pre_registration', 'awaiting_info', 'info_updated', 'registered', 'active', 'suspended', 'archived', 'cancelled'
      table.string('instance', 50).defaultTo('first') // 'first', 'second', 'superior_courts'
      table.string('nature', 50).defaultTo('judicial') // 'judicial', 'administrative', 'arbitration'
      table.string('action_type', 100).nullable() // Type varies by court
      table.boolean('electronic').defaultTo(true) // Electronic processing
      table.string('phase', 50).defaultTo('knowledge') // 'knowledge', 'execution', 'appeal', 'sentence_compliance'
      table.string('prognosis', 100).nullable() // Case outlook

      // Geographic and administrative
      table.string('comarca', 100).nullable() // Court jurisdiction
      table.string('distribution_type', 50).nullable() // 'lottery', 'dependency', 'prevention'

      // Financial information
      table.decimal('case_value', 15, 2).nullable() // Valor da causa
      table.decimal('conviction_value', 15, 2).nullable() // Valor da condenação
      table.decimal('costs', 15, 2).nullable() // Custas
      table.decimal('fees', 15, 2).nullable() // Honorários

      // Automation and integration
      table.boolean('migrated').defaultTo(false)
      table.boolean('search_intimation').defaultTo(true) // Auto search for court notifications
      table.boolean('search_progress').defaultTo(false) // Auto search for case progress
      table.json('loy_integration_data').nullable() // External system integration data
      table.datetime('cover_information_updated_at').nullable()

      // Important dates
      table.date('distribution_date').nullable() // Data de distribuição
      table.date('citation_date').nullable() // Data de citação
      table.date('next_hearing_date').nullable() // Próxima audiência
      table.date('prescription_date').nullable() // Data de prescrição

      // Additional information
      table.text('observation').nullable() // General observations
      table.text('object_detail').nullable() // Detailed case object
      table.text('last_movement').nullable() // Last court movement
      table.text('billing_notes').nullable() // Billing specific notes

      // Control fields
      table.boolean('is_active').defaultTo(true)
      table.boolean('is_favorite').defaultTo(false)
      table.integer('priority').defaultTo(1) // 1-5 priority scale

      // Audit trail
      table.integer('created_by_id').unsigned().notNullable()
      table.integer('updated_by_id').unsigned().nullable()
      table.datetime('deleted_at').nullable() // Soft deletes

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Foreign key constraints
      table.foreign('client_id').references('clients.id').onDelete('CASCADE')
      table.foreign('folder_type_id').references('folder_types.id').onDelete('RESTRICT')
      table.foreign('court_id').references('courts.id').onDelete('SET NULL')
      table.foreign('responsible_lawyer_id').references('users.id').onDelete('SET NULL')
      table.foreign('parent_folder_id').references('folders.id').onDelete('SET NULL')
      table.foreign('created_by_id').references('users.id').onDelete('RESTRICT')
      table.foreign('updated_by_id').references('users.id').onDelete('SET NULL')

      // Indexes for performance
      table.index('cnj_number') // Unique constraint already creates index
      table.index(['client_id', 'status'])
      table.index(['responsible_lawyer_id', 'is_active'])
      table.index(['folder_type_id', 'is_active'])
      table.index(['court_id', 'status'])
      table.index(['status', 'priority'])
      table.index('path') // For hierarchical queries
      table.index(['distribution_date', 'status'])
      table.index(['next_hearing_date'])
      table.index(['is_active', 'deleted_at'])
      table.index(['search_intimation', 'search_progress'])
      table.index(['internal_client_code'])

      // Composite indexes for common queries
      table.index(['client_id', 'is_active', 'status'])
      table.index(['responsible_lawyer_id', 'status', 'priority'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

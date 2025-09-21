import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'folder_documents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Relationships
      table.integer('folder_id').unsigned().notNullable()
      table.integer('file_id').unsigned().nullable() // Link to existing files table

      // Document information
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.string('document_type', 100).notNullable() // 'petition', 'contract', 'power_of_attorney', 'decision', 'sentence', 'evidence', 'correspondence', 'other'
      table.string('file_name', 255).nullable()
      table.string('file_path', 500).nullable()
      table.string('file_key', 255).nullable() // Storage key
      table.bigInteger('file_size').nullable() // Size in bytes
      table.string('mime_type', 100).nullable()
      table.string('checksum', 64).nullable() // For integrity verification

      // Document classification
      table.string('confidentiality_level', 50).defaultTo('internal') // 'public', 'internal', 'confidential', 'restricted'
      table.string('document_category', 100).nullable() // Free-form category
      table.boolean('is_original').defaultTo(true) // Original vs copy
      table.integer('version_number').defaultTo(1)
      table.integer('parent_document_id').unsigned().nullable() // For document versioning

      // Legal specific
      table.date('document_date').nullable() // Date on the document
      table.date('received_date').nullable() // Date received by office
      table.string('court_protocol', 100).nullable() // Court filing protocol
      table.boolean('requires_signature').defaultTo(false)
      table.boolean('is_signed').defaultTo(false)
      table.datetime('signed_at').nullable()
      table.integer('signed_by_id').unsigned().nullable()

      // Tags and metadata
      table.json('tags').nullable() // Array of tags for categorization
      table.json('metadata').nullable() // Additional flexible metadata
      table.text('notes').nullable() // Internal notes

      // Control fields
      table.boolean('is_active').defaultTo(true)
      table.boolean('is_archived').defaultTo(false)
      table.integer('sort_order').defaultTo(0)

      // Audit trail
      table.integer('uploaded_by_id').unsigned().notNullable()
      table.integer('updated_by_id').unsigned().nullable()
      table.datetime('deleted_at').nullable() // Soft deletes

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Foreign key constraints
      table.foreign('folder_id').references('folders.id').onDelete('CASCADE')
      table.foreign('file_id').references('files.id').onDelete('SET NULL')
      table.foreign('parent_document_id').references('folder_documents.id').onDelete('SET NULL')
      table.foreign('uploaded_by_id').references('users.id').onDelete('RESTRICT')
      table.foreign('updated_by_id').references('users.id').onDelete('SET NULL')
      table.foreign('signed_by_id').references('users.id').onDelete('SET NULL')

      // Indexes for performance
      table.index(['folder_id', 'is_active'])
      table.index(['folder_id', 'document_type'])
      table.index(['document_type', 'confidentiality_level'])
      table.index(['uploaded_by_id', 'created_at'])
      table.index(['document_date'])
      table.index(['received_date'])
      table.index(['court_protocol'])
      table.index(['is_signed', 'requires_signature'])
      table.index(['parent_document_id', 'version_number'])
      table.index(['is_active', 'deleted_at'])

      // Composite indexes for common queries
      table.index(['folder_id', 'document_type', 'is_active'])
      table.index(['confidentiality_level', 'is_active', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

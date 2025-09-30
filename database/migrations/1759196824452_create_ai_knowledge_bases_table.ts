import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ai_knowledge_base'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.text('content').notNullable()
      table.specificType('embedding', 'vector(1536)').nullable()
      table.string('source_type', 50).notNullable()
      table.string('source_id', 255).nullable()
      table.text('source_url').nullable()
      table.string('title', 500).nullable()
      table.jsonb('metadata').nullable()
      table.specificType('tags', 'text[]').nullable()
      table.string('language', 5).defaultTo('pt-BR')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })

    // Create vector index (ivfflat for similarity search)
    this.schema.raw(`
      CREATE INDEX idx_ai_knowledge_base_embedding
      ON ai_knowledge_base USING ivfflat (embedding vector_cosine_ops)
    `)

    // Create other indexes
    this.schema.raw(
      'CREATE INDEX idx_ai_knowledge_base_source_type ON ai_knowledge_base(source_type)'
    )
    this.schema.raw('CREATE INDEX idx_ai_knowledge_base_tags ON ai_knowledge_base USING GIN(tags)')
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

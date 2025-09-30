import AiKnowledgeBase from '#models/ai_knowledge_base'
import LucidRepository from '#shared/lucid/lucid_repository'
import IAiKnowledgeBase from '#interfaces/ai_knowledge_base_interface'

export default class AiKnowledgeBaseRepository
  extends LucidRepository<typeof AiKnowledgeBase>
  implements IAiKnowledgeBase.Repository
{
  constructor() {
    super(AiKnowledgeBase)
  }

  /**
   * Vector similarity search using pgvector
   */
  async similaritySearch(embedding: number[], limit: number = 5): Promise<any[]> {
    const embeddingStr = `[${embedding.join(',')}]`

    const results = await this.model.query().client.rawQuery(
      `
      SELECT *,
        embedding <=> ?::vector as distance
      FROM ai_knowledge_base
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ?::vector
      LIMIT ?
    `,
      [embeddingStr, embeddingStr, limit]
    )

    return results.rows
  }

  /**
   * Find by source type and tags
   */
  async findBySourceAndTags(sourceType: string, tags: string[]): Promise<AiKnowledgeBase[]> {
    return this.model
      .query()
      .where('source_type', sourceType)
      .whereRaw('tags && ARRAY[?]', [tags])
      .orderBy('created_at', 'desc')
  }

  /**
   * Find by source reference
   */
  async findBySource(sourceType: string, sourceId: string): Promise<AiKnowledgeBase[]> {
    return this.model
      .query()
      .where('source_type', sourceType)
      .where('source_id', sourceId)
      .orderBy('created_at', 'desc')
  }

  /**
   * Get knowledge base statistics
   */
  async getStatistics(): Promise<{
    total: number
    bySourceType: Record<string, number>
    withEmbeddings: number
  }> {
    const total = await this.model.query().count('* as total').first()

    const byType = await this.model
      .query()
      .select('source_type')
      .count('* as count')
      .groupBy('source_type')

    const withEmbeddings = await this.model
      .query()
      .whereNotNull('embedding')
      .count('* as total')
      .first()

    const bySourceType: Record<string, number> = {}
    byType.forEach((item) => {
      bySourceType[item.source_type] = Number(item.$extras.count)
    })

    return {
      total: Number(total?.$extras.total || 0),
      bySourceType,
      withEmbeddings: Number(withEmbeddings?.$extras.total || 0),
    }
  }
}

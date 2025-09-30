import AiCitation from '#models/ai_citation'
import LucidRepository from '#shared/lucid/lucid_repository'
import IAiCitation from '#interfaces/ai_citation_interface'

export default class AiCitationRepository
  extends LucidRepository<typeof AiCitation>
  implements IAiCitation.Repository
{
  constructor() {
    super(AiCitation)
  }

  /**
   * Find citations by message
   */
  async findByMessage(messageId: number): Promise<AiCitation[]> {
    return this.model.query().where('message_id', messageId).orderBy('created_at', 'asc')
  }

  /**
   * Find citations by source type
   */
  async findBySourceType(sourceType: string, limit: number = 10): Promise<AiCitation[]> {
    return this.model
      .query()
      .where('source_type', sourceType)
      .orderBy('created_at', 'desc')
      .limit(limit)
  }

  /**
   * Get citation statistics
   */
  async getStatistics(): Promise<{
    total: number
    bySourceType: Record<string, number>
    avgConfidence: number
  }> {
    const total = await this.model.query().count('* as total').first()

    const byType = await this.model
      .query()
      .select('source_type')
      .count('* as count')
      .groupBy('source_type')

    const avgConf = await this.model
      .query()
      .whereNotNull('confidence_score')
      .avg('confidence_score as avg')
      .first()

    const bySourceType: Record<string, number> = {}
    byType.forEach((item) => {
      bySourceType[item.source_type] = Number(item.$extras.count)
    })

    return {
      total: Number(total?.$extras.total || 0),
      bySourceType,
      avgConfidence: Number(avgConf?.$extras.avg || 0),
    }
  }
}

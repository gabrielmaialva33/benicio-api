import AiAgent from '#models/ai_agent'
import LucidRepository from '#shared/lucid/lucid_repository'
import IAiAgent from '#interfaces/ai_agent_interface'

export default class AiAgentRepository
  extends LucidRepository<typeof AiAgent>
  implements IAiAgent.Repository
{
  constructor() {
    super(AiAgent)
  }

  /**
   * Find agent by slug
   */
  async findBySlug(slug: string): Promise<AiAgent | null> {
    return this.model.query().where('slug', slug).where('is_active', true).first()
  }

  /**
   * Find all active agents
   */
  async findAllActive(): Promise<AiAgent[]> {
    return this.model.query().where('is_active', true).orderBy('name', 'asc')
  }

  /**
   * Find agents by capability
   */
  async findByCapability(capability: string): Promise<AiAgent[]> {
    return this.model
      .query()
      .where('is_active', true)
      .whereRaw('capabilities ??& ARRAY[?]', [capability])
  }
}

import AiTool from '#models/ai_tool'
import LucidRepository from '#shared/lucid/lucid_repository'
import IAiTool from '#interfaces/ai_tool_interface'

export default class AiToolRepository
  extends LucidRepository<typeof AiTool>
  implements IAiTool.Repository
{
  constructor() {
    super(AiTool)
  }

  /**
   * Find tool by slug
   */
  async findBySlug(slug: string): Promise<AiTool | null> {
    return this.model.query().where('slug', slug).where('is_active', true).first()
  }

  /**
   * Find all active tools
   */
  async findAllActive(): Promise<AiTool[]> {
    return this.model.query().where('is_active', true).orderBy('name', 'asc')
  }

  /**
   * Find tools allowed for specific agent
   */
  async findByAgent(agentSlug: string): Promise<AiTool[]> {
    return this.model
      .query()
      .where('is_active', true)
      .whereRaw('allowed_agents IS NULL OR ? = ANY(allowed_agents)', [agentSlug])
      .orderBy('name', 'asc')
  }

  /**
   * Find tools that require authentication
   */
  async findRequiringAuth(): Promise<AiTool[]> {
    return this.model.query().where('is_active', true).where('requires_auth', true)
  }
}

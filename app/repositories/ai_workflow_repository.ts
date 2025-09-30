import AiWorkflow from '#models/ai_workflow'
import LucidRepository from '#shared/lucid/lucid_repository'
import IAiWorkflow from '#interfaces/ai_workflow_interface'

export default class AiWorkflowRepository
  extends LucidRepository<typeof AiWorkflow>
  implements IAiWorkflow.Repository
{
  constructor() {
    super(AiWorkflow)
  }

  /**
   * Find workflow by slug
   */
  async findBySlug(slug: string): Promise<AiWorkflow | null> {
    return this.model.query().where('slug', slug).where('is_active', true).first()
  }

  /**
   * Find all active workflows
   */
  async findAllActive(): Promise<AiWorkflow[]> {
    return this.model.query().where('is_active', true).orderBy('name', 'asc')
  }

  /**
   * Find workflows containing specific agent
   */
  async findByAgent(agentSlug: string): Promise<AiWorkflow[]> {
    return this.model
      .query()
      .where('is_active', true)
      .whereRaw('? = ANY(agent_sequence)', [agentSlug])
      .orderBy('name', 'asc')
  }
}

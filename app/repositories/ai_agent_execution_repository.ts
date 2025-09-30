import AiAgentExecution from '#models/ai_agent_execution'
import LucidRepository from '#shared/lucid/lucid_repository'
import IAiAgentExecution from '#interfaces/ai_agent_execution_interface'

export default class AiAgentExecutionRepository
  extends LucidRepository<typeof AiAgentExecution>
  implements IAiAgentExecution.Repository
{
  constructor() {
    super(AiAgentExecution)
  }

  /**
   * Find executions by conversation
   */
  async findByConversation(conversationId: number): Promise<AiAgentExecution[]> {
    return this.model
      .query()
      .where('conversation_id', conversationId)
      .preload('agent')
      .preload('workflow')
      .orderBy('started_at', 'desc')
  }

  /**
   * Find executions by agent
   */
  async findByAgent(agentId: number, limit: number = 50): Promise<AiAgentExecution[]> {
    return this.model
      .query()
      .where('agent_id', agentId)
      .preload('conversation')
      .orderBy('started_at', 'desc')
      .limit(limit)
  }

  /**
   * Get execution statistics
   */
  async getStatistics(agentId?: number): Promise<{
    total: number
    successful: number
    failed: number
    avgDuration: number
    totalTokens: number
  }> {
    let query = this.model.query()
    if (agentId) {
      query = query.where('agent_id', agentId)
    }

    const stats = await query
      .select([
        this.model.query().client.raw('COUNT(*) as total'),
        this.model
          .query()
          .client.raw("COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful"),
        this.model.query().client.raw("COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed"),
        this.model.query().client.raw('AVG(duration_ms) as avg_duration'),
        this.model.query().client.raw('SUM(tokens_used) as total_tokens'),
      ])
      .first()

    return {
      total: Number(stats?.$extras.total || 0),
      successful: Number(stats?.$extras.successful || 0),
      failed: Number(stats?.$extras.failed || 0),
      avgDuration: Number(stats?.$extras.avg_duration || 0),
      totalTokens: Number(stats?.$extras.total_tokens || 0),
    }
  }

  /**
   * Find failed executions for retry
   */
  async findFailedExecutions(limit: number = 10): Promise<AiAgentExecution[]> {
    return this.model
      .query()
      .where('status', 'failed')
      .whereNotNull('error_message')
      .orderBy('started_at', 'desc')
      .limit(limit)
  }
}

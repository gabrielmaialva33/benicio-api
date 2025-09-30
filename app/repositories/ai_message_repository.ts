import AiMessage from '#models/ai_message'
import LucidRepository from '#shared/lucid/lucid_repository'
import IAiMessage from '#interfaces/ai_message_interface'

export default class AiMessageRepository
  extends LucidRepository<typeof AiMessage>
  implements IAiMessage.Repository
{
  constructor() {
    super(AiMessage)
  }

  /**
   * Find messages by conversation with citations
   */
  async findByConversation(conversationId: number): Promise<AiMessage[]> {
    return this.model
      .query()
      .where('conversation_id', conversationId)
      .preload('citations')
      .preload('agent')
      .orderBy('created_at', 'asc')
  }

  /**
   * Get conversation token usage
   */
  async getTotalTokens(conversationId: number): Promise<number> {
    const result = await this.model
      .query()
      .where('conversation_id', conversationId)
      .sum('tokens as total')
      .first()

    return Number(result?.$extras.total || 0)
  }

  /**
   * Find messages with tool calls
   */
  async findWithToolCalls(conversationId: number): Promise<AiMessage[]> {
    return this.model
      .query()
      .where('conversation_id', conversationId)
      .whereNotNull('tool_calls')
      .orderBy('created_at', 'desc')
  }
}

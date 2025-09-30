import AiConversation from '#models/ai_conversation'
import LucidRepository from '#shared/lucid/lucid_repository'
import IAiConversation from '#interfaces/ai_conversation_interface'

export default class AiConversationRepository
  extends LucidRepository<typeof AiConversation>
  implements IAiConversation.Repository
{
  constructor() {
    super(AiConversation)
  }

  /**
   * Find active conversations for a user
   */
  async findActiveByUser(userId: number): Promise<AiConversation[]> {
    return this.model
      .query()
      .where('user_id', userId)
      .where('is_active', true)
      .orderBy('updated_at', 'desc')
  }

  /**
   * Find conversation with messages
   */
  async findWithMessages(id: number): Promise<AiConversation | null> {
    return this.model
      .query()
      .where('id', id)
      .preload('messages', (query) => {
        query.orderBy('created_at', 'asc').preload('citations')
      })
      .preload('agent')
      .first()
  }

  /**
   * Find conversations by folder
   */
  async findByFolder(folderId: number): Promise<AiConversation[]> {
    return this.model
      .query()
      .where('folder_id', folderId)
      .where('is_active', true)
      .orderBy('updated_at', 'desc')
  }
}

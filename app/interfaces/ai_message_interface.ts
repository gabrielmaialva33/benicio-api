import type AiMessage from '#models/ai_message'
import type LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'

namespace IAiMessage {
  export interface Repository extends LucidRepositoryInterface<typeof AiMessage> {
    findByConversation(conversationId: number): Promise<AiMessage[]>

    getTotalTokens(conversationId: number): Promise<number>

    findWithToolCalls(conversationId: number): Promise<AiMessage[]>
  }

  export interface CreatePayload {
    conversation_id: number
    role: 'user' | 'assistant' | 'system'
    content: string
    agent_id?: number
    model_used?: string
    tool_calls?: Record<string, any>[]
    tool_results?: Record<string, any>[]
    tokens?: number
    finish_reason?: string
    metadata?: Record<string, any>
  }

  export interface UpdatePayload {
    content?: string
    tool_results?: Record<string, any>[]
    tokens?: number
    finish_reason?: string
    metadata?: Record<string, any>
  }
}

export default IAiMessage

import type AiConversation from '#models/ai_conversation'
import type LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'

namespace IAiConversation {
  export interface Repository extends LucidRepositoryInterface<typeof AiConversation> {
    findActiveByUser(userId: number): Promise<AiConversation[]>
    findWithMessages(id: number): Promise<AiConversation | null>
    findByFolder(folderId: number): Promise<AiConversation[]>
  }

  export interface CreatePayload {
    user_id: number
    agent_id?: number
    folder_id?: number
    title?: string
    mode?: string
    metadata?: Record<string, any>
  }

  export interface UpdatePayload {
    title?: string
    mode?: string
    metadata?: Record<string, any>
    total_tokens?: number
    is_active?: boolean
  }

  export interface SendMessagePayload {
    conversation_id: number
    content: string
    role?: 'user' | 'assistant' | 'system'
  }

  export interface MessageResponse {
    message_id: number
    content: string
    role: string
    agent_id?: number
    tokens: number
    citations?: CitationData[]
    tool_calls?: ToolCallData[]
  }

  export interface CitationData {
    source_type: string
    source_url?: string
    source_title?: string
    excerpt?: string
    confidence_score?: number
  }

  export interface ToolCallData {
    tool_name: string
    parameters: Record<string, any>
    result: any
  }

  export interface ListOptions {
    user_id?: number
    folder_id?: number
    is_active?: boolean
    page?: number
    perPage?: number
  }
}

export default IAiConversation

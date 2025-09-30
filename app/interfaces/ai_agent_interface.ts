import type AiAgent from '#models/ai_agent'
import type LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'

namespace IAiAgent {
  export interface Repository extends LucidRepositoryInterface<typeof AiAgent> {
    findBySlug(slug: string): Promise<AiAgent | null>

    findAllActive(): Promise<AiAgent[]>

    findByCapability(capability: string): Promise<AiAgent[]>
  }

  export interface CreatePayload {
    name: string
    slug: string
    description?: string
    model: string
    capabilities?: Record<string, any>
    system_prompt: string
    tools?: Record<string, any>[]
    config?: Record<string, any>
    is_active?: boolean
  }

  export interface UpdatePayload {
    name?: string
    slug?: string
    description?: string
    model?: string
    capabilities?: Record<string, any>
    system_prompt?: string
    tools?: Record<string, any>[]
    config?: Record<string, any>
    is_active?: boolean
  }

  export interface ExecutePayload {
    agent_slug?: string
    user_id: number
    conversation_id?: number
    folder_id?: number
    input: string
    context?: Record<string, any>
  }

  export interface ExecuteResponse {
    output: string
    tokens_used: number
    tool_calls?: ToolCall[]
    citations?: Citation[]
    metadata?: Record<string, any>
    agent_slug?: string
    model_used?: string
    execution_time_ms?: number
    sources?: Citation[]
  }

  export interface ToolCall {
    tool_name: string
    parameters: Record<string, any>
    result?: any
  }

  export interface Citation {
    source_type: string
    source_url?: string
    source_title?: string
    excerpt?: string
    confidence_score?: number
  }
}

export default IAiAgent

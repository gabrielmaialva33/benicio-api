import type AiTool from '#models/ai_tool'
import type LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'

namespace IAiTool {
  export interface Repository extends LucidRepositoryInterface<typeof AiTool> {
    findBySlug(slug: string): Promise<AiTool | null>
    findAllActive(): Promise<AiTool[]>
    findByAgent(agentSlug: string): Promise<AiTool[]>
    findRequiringAuth(): Promise<AiTool[]>
  }

  export interface CreatePayload {
    name: string
    slug: string
    description?: string
    function_name: string
    parameters_schema: Record<string, any>
    requires_auth?: boolean
    allowed_agents?: string[]
    config?: Record<string, any>
    is_active?: boolean
  }

  export interface UpdatePayload {
    name?: string
    slug?: string
    description?: string
    function_name?: string
    parameters_schema?: Record<string, any>
    requires_auth?: boolean
    allowed_agents?: string[]
    config?: Record<string, any>
    is_active?: boolean
  }

  export interface ExecutePayload {
    tool_slug: string
    parameters: Record<string, any>
    user_id?: number
    conversation_id?: number
  }

  export interface ExecuteResponse {
    success: boolean
    result: any
    error?: string
  }
}

export default IAiTool

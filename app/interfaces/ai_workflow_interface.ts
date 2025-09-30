import type AiWorkflow from '#models/ai_workflow'
import type LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'

namespace IAiWorkflow {
  export interface Repository extends LucidRepositoryInterface<typeof AiWorkflow> {
    findBySlug(slug: string): Promise<AiWorkflow | null>

    findAllActive(): Promise<AiWorkflow[]>

    findByAgent(agentSlug: string): Promise<AiWorkflow[]>
  }

  export interface CreatePayload {
    name: string
    slug: string
    description?: string
    steps: Record<string, any>
    agent_sequence: string[]
    config?: Record<string, any>
    is_active?: boolean
  }

  export interface UpdatePayload {
    name?: string
    slug?: string
    description?: string
    steps?: Record<string, any>
    agent_sequence?: string[]
    config?: Record<string, any>
    is_active?: boolean
  }

  export interface ExecutePayload {
    workflow_slug: string
    user_id: number
    conversation_id?: number
    folder_id?: number
    input: string
    context?: Record<string, any>
  }

  export interface ExecuteResponse {
    output: string
    steps_completed: number
    total_tokens: number
    execution_ids: number[]
    metadata?: Record<string, any>
  }
}

export default IAiWorkflow

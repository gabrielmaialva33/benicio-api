import type AiAgentExecution from '#models/ai_agent_execution'
import type LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'

namespace IAiAgentExecution {
  export interface Repository extends LucidRepositoryInterface<typeof AiAgentExecution> {
    findByConversation(conversationId: number): Promise<AiAgentExecution[]>
    findByAgent(agentId: number, limit?: number): Promise<AiAgentExecution[]>
    getStatistics(agentId?: number): Promise<Statistics>
    findFailedExecutions(limit?: number): Promise<AiAgentExecution[]>
  }

  export interface CreatePayload {
    conversation_id: number
    agent_id: number
    workflow_id?: number
    status: 'pending' | 'running' | 'completed' | 'failed'
    input: string
    output?: string
    tool_calls?: Record<string, any>[]
    tokens_used?: number
    duration_ms?: number
    error_message?: string
    metadata?: Record<string, any>
    started_at: Date
    completed_at?: Date
  }

  export interface UpdatePayload {
    status?: 'pending' | 'running' | 'completed' | 'failed'
    output?: string
    tool_calls?: Record<string, any>[]
    tokens_used?: number
    duration_ms?: number
    error_message?: string
    metadata?: Record<string, any>
    completed_at?: Date
  }

  export interface Statistics {
    total: number
    successful: number
    failed: number
    avgDuration: number
    totalTokens: number
  }
}

export default IAiAgentExecution

import type AiCitation from '#models/ai_citation'
import type LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'

namespace IAiCitation {
  export interface Repository extends LucidRepositoryInterface<typeof AiCitation> {
    findByMessage(messageId: number): Promise<AiCitation[]>
    findBySourceType(sourceType: string, limit?: number): Promise<AiCitation[]>
    getStatistics(): Promise<Statistics>
  }

  export interface CreatePayload {
    message_id: number
    source_type: string
    source_url?: string
    source_title?: string
    excerpt?: string
    confidence_score?: number
    metadata?: Record<string, any>
  }

  export interface UpdatePayload {
    source_url?: string
    source_title?: string
    excerpt?: string
    confidence_score?: number
    metadata?: Record<string, any>
  }

  export interface Statistics {
    total: number
    bySourceType: Record<string, number>
    avgConfidence: number
  }
}

export default IAiCitation

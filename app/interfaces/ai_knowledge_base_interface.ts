import type AiKnowledgeBase from '#models/ai_knowledge_base'
import type LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'

namespace IAiKnowledgeBase {
  export interface Repository extends LucidRepositoryInterface<typeof AiKnowledgeBase> {
    similaritySearch(embedding: number[], limit?: number): Promise<any[]>

    findBySourceAndTags(sourceType: string, tags: string[]): Promise<AiKnowledgeBase[]>

    findBySource(sourceType: string, sourceId: string): Promise<AiKnowledgeBase[]>

    getStatistics(): Promise<Statistics>
  }

  export interface CreatePayload {
    content: string
    embedding?: number[]
    source_type: string
    source_id?: string
    source_url?: string
    title?: string
    metadata?: Record<string, any>
    tags?: string[]
    language?: string
  }

  export interface UpdatePayload {
    content?: string
    embedding?: number[]
    source_type?: string
    source_id?: string
    source_url?: string
    title?: string
    metadata?: Record<string, any>
    tags?: string[]
    language?: string
  }

  export interface SearchPayload {
    query: string
    source_type?: string
    tags?: string[]
    limit?: number
  }

  export interface SearchResult {
    id: number
    content: string
    source_type: string
    source_url?: string
    title?: string
    distance: number
    metadata?: Record<string, any>
  }

  export interface Statistics {
    total: number
    bySourceType: Record<string, number>
    withEmbeddings: number
  }

  export interface IngestPayload {
    source_type: 'legislation' | 'jurisprudence' | 'doctrine' | 'document' | 'web'
    source_url?: string
    source_id?: string
    content: string
    title?: string
    tags?: string[]
    metadata?: Record<string, any>
  }
}

export default IAiKnowledgeBase

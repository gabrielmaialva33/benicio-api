import { inject } from '@adonisjs/core'
import EmbeddingService from './embedding_service.js'
import AiCacheService from './ai_cache_service.js'
import AiKnowledgeBaseRepository from '#repositories/ai_knowledge_base_repository'
import IAiKnowledgeBase from '#interfaces/ai_knowledge_base_interface'
import logger from '@adonisjs/core/services/logger'
import aiConfig from '#config/ai'
import BadRequestException from '#exceptions/bad_request_exception'

/**
 * RAG (Retrieval Augmented Generation) Service
 * Handles context retrieval from knowledge base for AI responses
 */
@inject()
export default class RagService {
  constructor(
    private embeddingService: EmbeddingService,
    private cacheService: AiCacheService,
    private knowledgeBaseRepository: AiKnowledgeBaseRepository
  ) {}

  /**
   * Search knowledge base for relevant context
   */
  async search(
    query: string,
    options?: {
      sourceType?: string
      tags?: string[]
      limit?: number
      minConfidence?: number
    }
  ): Promise<IAiKnowledgeBase.SearchResult[]> {
    try {
      // Check cache first
      const cacheKey = { query, ...options }
      const cached = await this.cacheService.get<IAiKnowledgeBase.SearchResult[]>(
        'rag:search',
        cacheKey
      )
      if (cached) {
        logger.debug('RAG cache hit', { query })
        return cached
      }

      // Generate query embedding
      const queryEmbedding = await this.embeddingService.generateEmbedding(query)

      // Perform similarity search
      const limit = options?.limit || aiConfig.rag.topK
      const results = await this.knowledgeBaseRepository.similaritySearch(queryEmbedding, limit * 2)

      // Filter by source type and tags if specified
      let filteredResults = results

      if (options?.sourceType) {
        filteredResults = filteredResults.filter((r: any) => r.source_type === options.sourceType)
      }

      if (options?.tags && options.tags.length > 0) {
        filteredResults = filteredResults.filter(
          (r: any) => r.tags && options.tags!.some((tag) => r.tags.includes(tag))
        )
      }

      // Apply confidence threshold and limit
      const minConfidence = options?.minConfidence || aiConfig.rag.minConfidence
      const searchResults: IAiKnowledgeBase.SearchResult[] = filteredResults
        .filter((r: any) => 1 - r.distance >= minConfidence)
        .slice(0, limit)
        .map((r: any) => ({
          id: r.id,
          content: r.content,
          source_type: r.source_type,
          source_url: r.source_url,
          title: r.title,
          distance: r.distance,
          metadata: r.metadata,
        }))

      // Cache results for 5 minutes
      await this.cacheService.set('rag:search', cacheKey, searchResults, 300)

      logger.info('RAG search completed', {
        query: query.substring(0, 50),
        results: searchResults.length,
      })

      return searchResults
    } catch (error) {
      // Don't throw - just return empty results to allow graceful degradation
      logger.debug('RAG search skipped', {
        reason: error.message,
        query: query.substring(0, 50),
      })
      return []
    }
  }

  /**
   * Build context string from search results
   */
  buildContext(results: IAiKnowledgeBase.SearchResult[]): string {
    if (results.length === 0) {
      return ''
    }

    const contextParts = results.map((result, index) => {
      const source = result.title || result.source_url || `Fonte ${index + 1}`
      const confidence = ((1 - result.distance) * 100).toFixed(1)

      return `[${index + 1}] ${source} (${confidence}% relevância)\n${result.content}`
    })

    return `CONTEXTO RELEVANTE DA BASE DE CONHECIMENTO:\n\n${contextParts.join('\n\n---\n\n')}`
  }

  /**
   * Get context for a query with formatted string ready for AI
   */
  async getContext(
    query: string,
    options?: {
      sourceType?: string
      tags?: string[]
      limit?: number
    }
  ): Promise<{
    context: string
    sources: IAiKnowledgeBase.SearchResult[]
    hasContext: boolean
  }> {
    try {
      const results = await this.search(query, options)
      const context = this.buildContext(results)

      return {
        context,
        sources: results,
        hasContext: results.length > 0,
      }
    } catch (error) {
      // Only log as debug - RAG failure is expected when knowledge base is empty
      logger.debug('RAG context unavailable, proceeding without context', {
        query: query.substring(0, 50),
      })
      return {
        context: '',
        sources: [],
        hasContext: false,
      }
    }
  }

  /**
   * Get legislation context (Brazilian laws)
   */
  async getLegislationContext(
    query: string,
    limit?: number
  ): Promise<{
    context: string
    sources: IAiKnowledgeBase.SearchResult[]
  }> {
    const result = await this.getContext(query, {
      sourceType: 'legislation',
      tags: ['CF', 'CPC', 'CLT', 'CCB', 'Lei'],
      limit: limit || 3,
    })

    return {
      context: result.context,
      sources: result.sources,
    }
  }

  /**
   * Get jurisprudence context (court decisions)
   */
  async getJurisprudenceContext(
    query: string,
    limit?: number
  ): Promise<{
    context: string
    sources: IAiKnowledgeBase.SearchResult[]
  }> {
    const result = await this.getContext(query, {
      sourceType: 'jurisprudence',
      tags: ['STF', 'STJ', 'TST', 'Jurisprudência'],
      limit: limit || 3,
    })

    return {
      context: result.context,
      sources: result.sources,
    }
  }

  /**
   * Get case-related documents context
   */
  async getDocumentContext(
    query: string,
    folderId?: number,
    limit?: number
  ): Promise<{
    context: string
    sources: IAiKnowledgeBase.SearchResult[]
  }> {
    const tags = folderId ? [`folder:${folderId}`, 'document'] : ['document']

    const result = await this.getContext(query, {
      sourceType: 'document',
      tags,
      limit: limit || 5,
    })

    return {
      context: result.context,
      sources: result.sources,
    }
  }

  /**
   * Get comprehensive context (all sources)
   */
  async getComprehensiveContext(
    query: string,
    options?: {
      folderId?: number
      includeJurisprudence?: boolean
    }
  ): Promise<{
    context: string
    legislation: IAiKnowledgeBase.SearchResult[]
    jurisprudence: IAiKnowledgeBase.SearchResult[]
    documents: IAiKnowledgeBase.SearchResult[]
  }> {
    try {
      // Search all relevant sources in parallel
      const [legislation, jurisprudence, documents] = await Promise.all([
        this.getLegislationContext(query, 2),
        options?.includeJurisprudence
          ? this.getJurisprudenceContext(query, 2)
          : Promise.resolve({ context: '', sources: [] }),
        options?.folderId
          ? this.getDocumentContext(query, options.folderId, 3)
          : Promise.resolve({ context: '', sources: [] }),
      ])

      // Combine all contexts
      const contexts = [legislation.context, jurisprudence.context, documents.context].filter(
        (c) => c.length > 0
      )

      return {
        context: contexts.join('\n\n=== SEPARADOR DE CONTEXTO ===\n\n'),
        legislation: legislation.sources,
        jurisprudence: jurisprudence.sources,
        documents: documents.sources,
      }
    } catch (error) {
      logger.error('Comprehensive context retrieval failed', { error, query })
      throw new BadRequestException(`Failed to retrieve comprehensive context: ${error.message}`)
    }
  }
}

import { inject } from '@adonisjs/core'
import NvidiaNimClientService from './nvidia_nim_client_service.js'
import AiCacheService from './ai_cache_service.js'
import AiKnowledgeBaseRepository from '#repositories/ai_knowledge_base_repository'
import IAiKnowledgeBase from '#interfaces/ai_knowledge_base_interface'
import logger from '@adonisjs/core/services/logger'
import aiConfig from '#config/ai'
import BadRequestException from '#exceptions/bad_request_exception'

/**
 * Embedding Service
 * Generates and manages embeddings for RAG
 */
@inject()
export default class EmbeddingService {
  constructor(
    private nvidiaNimClient: NvidiaNimClientService,
    private cacheService: AiCacheService,
    private knowledgeBaseRepository: AiKnowledgeBaseRepository
  ) {}

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Check cache first
      const cached = await this.cacheService.get<number[]>('embedding', text)
      if (cached) {
        return cached
      }

      // Generate new embedding
      const embeddings = await this.nvidiaNimClient.embeddings(text)
      const embedding = embeddings[0]

      // Cache for 24 hours
      await this.cacheService.set('embedding', text, embedding, 86400)

      logger.debug('Generated embedding', { textLength: text.length, dimensions: embedding.length })

      return embedding
    } catch (error) {
      logger.error('Embedding generation failed', { error })
      throw new BadRequestException(`Failed to generate embedding: ${error.message}`)
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const embeddings = await this.nvidiaNimClient.embeddings(texts)

      logger.info('Generated batch embeddings', { count: texts.length })

      return embeddings
    } catch (error) {
      logger.error('Batch embedding generation failed', { error })
      throw new BadRequestException(`Failed to generate batch embeddings: ${error.message}`)
    }
  }

  /**
   * Ingest content into knowledge base with embedding
   */
  async ingest(payload: IAiKnowledgeBase.IngestPayload): Promise<void> {
    try {
      // Chunk content if too large
      const chunks = this.chunkText(
        payload.content,
        aiConfig.rag.chunkSize,
        aiConfig.rag.chunkOverlap
      )

      logger.info('Ingesting content into knowledge base', {
        sourceType: payload.source_type,
        chunks: chunks.length,
      })

      // Generate embeddings for all chunks
      const embeddings = await this.generateBatchEmbeddings(chunks)

      // Store in knowledge base
      const records = chunks.map((chunk, index) => ({
        content: chunk,
        embedding: embeddings[index],
        source_type: payload.source_type,
        source_url: payload.source_url,
        source_id: payload.source_id,
        title: payload.title,
        tags: payload.tags || [],
        metadata: {
          ...payload.metadata,
          chunk_index: index,
          total_chunks: chunks.length,
        },
        language: 'pt-BR',
      }))

      for (const record of records) {
        await this.knowledgeBaseRepository.create(record)
      }

      logger.info('Content ingested successfully', {
        sourceType: payload.source_type,
        chunks: chunks.length,
      })
    } catch (error) {
      logger.error('Content ingestion failed', { error, payload })
      throw new BadRequestException(`Failed to ingest content: ${error.message}`)
    }
  }

  /**
   * Chunk text into smaller pieces with overlap
   */
  private chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = []
    const words = text.split(/\s+/)

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ')
      if (chunk.trim()) {
        chunks.push(chunk)
      }
    }

    return chunks
  }

  /**
   * Update embedding for existing knowledge base entry
   */
  async updateEmbedding(id: number, content: string): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(content)

      await this.knowledgeBaseRepository.update('id', id, {
        content,
        embedding,
      })

      logger.info('Embedding updated', { id })
    } catch (error) {
      logger.error('Embedding update failed', { error, id })
      throw new BadRequestException(`Failed to update embedding: ${error.message}`)
    }
  }
}

import { Job } from '@rlanz/bull-queue'
import { inject } from '@adonisjs/core'
import EmbeddingService from '#services/ai/embedding_service'
import AiKnowledgeBaseRepository from '#repositories/ai_knowledge_base_repository'
import logger from '@adonisjs/core/services/logger'

interface ProcessEmbeddingsJobPayload {
  source_type: 'legislation' | 'jurisprudence' | 'document' | 'template'
  content: string
  title?: string
  source_url?: string
  metadata?: Record<string, any>
  tags?: string[]
  folder_id?: number
  document_id?: number
}

@inject()
export default class ProcessEmbeddingsJob extends Job {
  // This is the path to the file that is used to create the job
  static get $$filepath() {
    return import.meta.url
  }

  constructor(
    private embeddingService: EmbeddingService,
    private knowledgeBaseRepository: AiKnowledgeBaseRepository
  ) {
    super()
  }

  /**
   * Base Entry point
   * Generates embeddings for content and stores in knowledge base
   */
  async handle(payload: ProcessEmbeddingsJobPayload): Promise<void> {
    try {
      logger.info('Processing embeddings job started', {
        source_type: payload.source_type,
        title: payload.title,
        content_length: payload.content.length,
      })

      // Generate embedding for the content
      const embedding = await this.embeddingService.generateEmbedding(payload.content)

      // Prepare tags
      const tags = payload.tags || []
      if (payload.folder_id) {
        tags.push(`folder:${payload.folder_id}`)
      }
      if (payload.document_id) {
        tags.push(`document:${payload.document_id}`)
      }

      // Store in knowledge base
      await this.knowledgeBaseRepository.create({
        source_type: payload.source_type,
        content: payload.content,
        title: payload.title || 'Sem título',
        source_url: payload.source_url,
        embedding,
        metadata: payload.metadata || {},
        tags,
      })

      logger.info('Processing embeddings job completed', {
        source_type: payload.source_type,
        title: payload.title,
      })
    } catch (error) {
      logger.error('Processing embeddings job failed', {
        error: error.message,
        stack: error.stack,
        payload,
      })
      throw error
    }
  }

  /**
   * This is an optional method that gets called when the retries has exceeded and is marked failed.
   */
  async rescue(payload: ProcessEmbeddingsJobPayload, error: Error): Promise<void> {
    logger.error('ProcessEmbeddings job failed after all retries', {
      source_type: payload.source_type,
      title: payload.title,
      error: error.message,
    })
  }
}

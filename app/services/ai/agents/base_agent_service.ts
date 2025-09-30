import { inject } from '@adonisjs/core'
import NvidiaNimClientService from '../nvidia_nim_client_service.js'
import RagService from '../rag_service.js'
import AiCacheService from '../ai_cache_service.js'
import AiAgentRepository from '#repositories/ai_agent_repository'
import AiMessageRepository from '#repositories/ai_message_repository'
import AiCitationRepository from '#repositories/ai_citation_repository'
import AiAgentExecutionRepository from '#repositories/ai_agent_execution_repository'
import IAiAgent from '#interfaces/ai_agent_interface'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import NotFoundException from '#exceptions/not_found_exception'
import BadRequestException from '#exceptions/bad_request_exception'

/**
 * Base Agent Service
 * Classe base abstrata para todos os agentes especializados
 */
@inject()
export default abstract class BaseAgentService {
  protected agentSlug: string = ''
  protected systemPrompt: string = ''

  constructor(
    protected nvidiaNimClient: NvidiaNimClientService,
    protected ragService: RagService,
    protected cacheService: AiCacheService,
    protected agentRepository: AiAgentRepository,
    protected messageRepository: AiMessageRepository,
    protected citationRepository: AiCitationRepository,
    protected executionRepository: AiAgentExecutionRepository
  ) {}

  /**
   * Execute agent with input
   */
  async execute(payload: IAiAgent.ExecutePayload): Promise<IAiAgent.ExecuteResponse> {
    const startTime = DateTime.now()

    try {
      // Get agent configuration
      const agent = await this.agentRepository.findBySlug(this.agentSlug)
      if (!agent) {
        throw new NotFoundException(`Agent not found: ${this.agentSlug}`)
      }

      // Create execution record
      const execution = await this.executionRepository.create({
        conversation_id: payload.conversation_id!,
        agent_id: agent.id,
        status: 'running',
        input: payload.input,
        started_at: startTime,
      })

      try {
        // Get RAG context if applicable
        const context = await this.getContext(payload)

        // Build messages with system prompt and context
        const messages = this.buildMessages(payload, context.context)

        // Get available tools for this agent
        const tools = await this.getTools()

        // Call NVIDIA NIM API
        const response = await this.nvidiaNimClient.chat({
          model: agent.model,
          messages,
          tools: tools.length > 0 ? tools : undefined,
          temperature: agent.config?.temperature || 0.7,
          maxTokens: agent.config?.maxTokens || 4096,
        })

        // Process tool calls if any
        let finalOutput = response.content
        const allToolCalls: any[] = []

        if (response.toolCalls && response.toolCalls.length > 0) {
          const toolResults = await this.processToolCalls(response.toolCalls, payload)
          allToolCalls.push(...toolResults)

          // If tools were called, make another request with results
          const toolMessages = [
            ...messages,
            { role: 'assistant' as const, content: response.content },
            ...toolResults.map((t) => ({
              role: 'user' as const,
              content: `Tool ${t.tool_name} result: ${JSON.stringify(t.result)}`,
            })),
          ]

          const finalResponse = await this.nvidiaNimClient.chat({
            model: agent.model,
            messages: toolMessages,
            temperature: agent.config?.temperature || 0.7,
          })

          finalOutput = finalResponse.content
        }

        // Extract citations from sources
        const citations = this.extractCitations(context.sources)

        // Calculate duration
        const endTime = DateTime.now()
        const duration = endTime.diff(startTime).as('milliseconds')

        // Update execution record
        await this.executionRepository.update('id', execution.id, {
          status: 'completed',
          output: finalOutput,
          tool_calls: allToolCalls,
          tokens_used: response.tokens,
          duration_ms: Math.round(duration),
          completed_at: endTime,
        })

        logger.info('Agent execution completed', {
          agent: this.agentSlug,
          executionId: execution.id,
          tokens: response.tokens,
          duration: Math.round(duration),
        })

        return {
          output: finalOutput,
          tokens_used: response.tokens,
          tool_calls: allToolCalls,
          citations,
          metadata: {
            executionId: execution.id,
            agentId: agent.id,
            duration_ms: Math.round(duration),
            hasContext: context.sources.length > 0,
          },
        }
      } catch (error) {
        // Update execution with error
        await this.executionRepository.update('id', execution.id, {
          status: 'failed',
          error_message: error.message,
          completed_at: DateTime.now(),
        })

        throw error
      }
    } catch (error) {
      logger.error('Agent execution failed', {
        agent: this.agentSlug,
        error,
        payload,
      })
      throw new BadRequestException(`Agent execution failed: ${error.message}`)
    }
  }

  /**
   * Get RAG context for the query (override in subclasses)
   */
  protected async getContext(_payload: IAiAgent.ExecutePayload): Promise<{
    context: string
    sources: any[]
  }> {
    // Default implementation - can be overridden by specialized agents
    return {
      context: '',
      sources: [],
    }
  }

  /**
   * Build messages array for AI
   */
  protected buildMessages(
    payload: IAiAgent.ExecutePayload,
    context: string
  ): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = []

    // System prompt with context
    let systemMessage = this.systemPrompt
    if (context) {
      systemMessage += `\n\n${context}\n\nUse o contexto acima para fundamentar suas respostas com precisão.`
    }
    messages.push({ role: 'system', content: systemMessage })

    // Add conversation history if available
    if (payload.context?.history) {
      messages.push(...payload.context.history)
    }

    // User input
    messages.push({ role: 'user', content: payload.input })

    return messages
  }

  /**
   * Get available tools for this agent (override in subclasses)
   */
  protected async getTools(): Promise<any[]> {
    // Default: no tools
    return []
  }

  /**
   * Process tool calls (override in subclasses)
   */
  protected async processToolCalls(
    _toolCalls: any[],
    _payload: IAiAgent.ExecutePayload
  ): Promise<any[]> {
    // Default: return empty results
    return []
  }

  /**
   * Extract citations from RAG sources
   */
  protected extractCitations(sources: any[]): IAiAgent.Citation[] {
    return sources.map((source) => ({
      source_type: source.source_type,
      source_url: source.source_url,
      source_title: source.title,
      excerpt: source.content.substring(0, 200),
      confidence_score: 1 - source.distance,
    }))
  }
}

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
import type BaseTool from '../tools/base_tool.js'
import QueryClientsTool from '../tools/query_clients_tool.js'
import GetClientDetailsTool from '../tools/get_client_details_tool.js'
import QueryFoldersTool from '../tools/query_folders_tool.js'
import GetFolderDetailsTool from '../tools/get_folder_details_tool.js'
import QueryTasksTool from '../tools/query_tasks_tool.js'
import QueryFolderMovementsTool from '../tools/query_folder_movements_tool.js'
import QueryDocumentsTool from '../tools/query_documents_tool.js'

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
            // Only add assistant message if content is not empty
            ...(response.content
              ? [{ role: 'assistant' as const, content: response.content }]
              : []),
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
   * Base implementation provides data access tools to ALL agents
   */
  protected async getTools(): Promise<any[]> {
    // Data access tools available to all agents
    return [
      {
        type: 'function',
        function: {
          name: 'query_clients',
          description: 'Busca clientes no sistema por nome, documento ou tipo',
          parameters: {
            type: 'object',
            properties: {
              search: { type: 'string', description: 'Termo de busca (nome, documento)' },
              client_type: {
                type: 'string',
                enum: ['prospect', 'client', 'board_contact'],
                description: 'Tipo do cliente',
              },
              is_active: { type: 'boolean', description: 'Filtrar ativos/inativos' },
              limit: { type: 'number', description: 'Limite de resultados (max 50)' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_client_details',
          description: 'Obtém detalhes completos de um cliente pelo ID',
          parameters: {
            type: 'object',
            properties: {
              client_id: { type: 'number', description: 'ID do cliente' },
            },
            required: ['client_id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'query_folders',
          description: 'Busca processos/pastas por cliente, status, tipo',
          parameters: {
            type: 'object',
            properties: {
              search: { type: 'string', description: 'Termo de busca' },
              client_id: { type: 'number', description: 'ID do cliente' },
              folder_type_id: {
                type: 'number',
                description: 'Tipo: 1-Cível, 2-Trabalhista, 3-Criminal, 4-Tributário',
              },
              status: { type: 'string', enum: ['active', 'archived', 'suspended', 'concluded'] },
              limit: { type: 'number', description: 'Limite (max 50)' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_folder_details',
          description: 'Obtém detalhes completos de um processo/pasta pelo ID',
          parameters: {
            type: 'object',
            properties: {
              folder_id: { type: 'number', description: 'ID do processo' },
              include_recent_movements: {
                type: 'boolean',
                description: 'Incluir últimas 10 movimentações',
              },
              include_tasks: { type: 'boolean', description: 'Incluir tarefas' },
            },
            required: ['folder_id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'query_tasks',
          description: 'Busca tarefas por status, prioridade, pasta',
          parameters: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['pending', 'in_progress', 'completed', 'cancelled'],
              },
              priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
              folder_id: { type: 'number', description: 'ID da pasta' },
              overdue: { type: 'boolean', description: 'Apenas atrasadas' },
              upcoming_days: { type: 'number', description: 'Vencimento nos próximos X dias' },
              limit: { type: 'number', description: 'Limite (max 50)' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'query_folder_movements',
          description: 'Busca movimentações/andamentos de um processo',
          parameters: {
            type: 'object',
            properties: {
              folder_id: { type: 'number', description: 'ID do processo' },
              days: { type: 'number', description: 'Últimos X dias' },
              requires_action: { type: 'boolean', description: 'Requer ação' },
              is_deadline: { type: 'boolean', description: 'Tem prazo' },
              urgency_level: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
              limit: { type: 'number', description: 'Limite (max 100)' },
            },
            required: ['folder_id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'query_documents',
          description: 'Busca documentos anexados a um processo',
          parameters: {
            type: 'object',
            properties: {
              folder_id: { type: 'number', description: 'ID do processo' },
              document_type: { type: 'string', description: 'Tipo do documento' },
              limit: { type: 'number', description: 'Limite (max 100)' },
            },
            required: ['folder_id'],
          },
        },
      },
    ]
  }

  /**
   * Get tool instance by name
   */
  protected getToolInstance(toolName: string): BaseTool | null {
    switch (toolName) {
      case 'query_clients':
        return new QueryClientsTool()
      case 'get_client_details':
        return new GetClientDetailsTool()
      case 'query_folders':
        return new QueryFoldersTool()
      case 'get_folder_details':
        return new GetFolderDetailsTool()
      case 'query_tasks':
        return new QueryTasksTool()
      case 'query_folder_movements':
        return new QueryFolderMovementsTool()
      case 'query_documents':
        return new QueryDocumentsTool()
      default:
        return null
    }
  }

  /**
   * Process tool calls
   * SECURITY: Injects user_id from authenticated payload
   */
  protected async processToolCalls(
    toolCalls: any[],
    payload: IAiAgent.ExecutePayload
  ): Promise<any[]> {
    const results: any[] = []

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name
      const parameters = JSON.parse(toolCall.function.arguments)

      // SECURITY: Inject user_id from authenticated payload (never trust LLM)
      const toolParameters = {
        ...parameters,
        user_id: payload.user_id,
      }

      let result: any

      // Get tool instance and execute
      const tool = this.getToolInstance(toolName)
      if (tool) {
        try {
          result = await tool.execute(toolParameters)
        } catch (error) {
          result = { error: error.message }
        }
      } else {
        result = { error: 'Tool not found' }
      }

      results.push({
        tool_name: toolName,
        parameters,
        result,
      })
    }

    return results
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

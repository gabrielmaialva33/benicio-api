import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import AiAgent from '#models/ai_agent'
import AiConversation from '#models/ai_conversation'
import AiMessage from '#models/ai_message'
import IAiAgent from '#interfaces/ai_agent_interface'

// Import all agent services
import LegalResearchAgentService from './agents/legal_research_agent_service.js'
import DocumentAnalyzerAgentService from './agents/document_analyzer_agent_service.js'
import CaseStrategyAgentService from './agents/case_strategy_agent_service.js'
import DeadlineManagerAgentService from './agents/deadline_manager_agent_service.js'
import LegalWriterAgentService from './agents/legal_writer_agent_service.js'
import ClientCommunicatorAgentService from './agents/client_communicator_agent_service.js'

/**
 * OrchestratorService
 * Routes user requests to the appropriate AI agent(s) based on intent analysis
 */
@inject()
export default class OrchestratorService {
  constructor(
    private legalResearch: LegalResearchAgentService,
    private documentAnalyzer: DocumentAnalyzerAgentService,
    private caseStrategy: CaseStrategyAgentService,
    private deadlineManager: DeadlineManagerAgentService,
    private legalWriter: LegalWriterAgentService,
    private clientCommunicator: ClientCommunicatorAgentService
  ) {}

  /**
   * Main orchestration method - routes to appropriate agent
   */
  async execute(payload: {
    userId: number
    input: string
    conversationId?: number
    folderId?: number
    mode?: 'single' | 'multi' // single agent or multi-agent workflow
  }): Promise<IAiAgent.ExecuteResponse> {
    const { userId, input, conversationId, folderId, mode = 'single' } = payload

    // Get or create conversation
    const conversation = await this.getOrCreateConversation({
      userId,
      conversationId,
      folderId,
      input,
      mode,
    })

    // Detect intent and select appropriate agent(s)
    const selectedAgent = await this.selectAgent(input, mode)

    // Execute agent
    const agentService = this.getAgentService(selectedAgent.slug)
    const response = await agentService.execute({
      conversation_id: conversation.id,
      input,
      folder_id: folderId,
      user_id: userId,
    })

    // Update conversation stats
    await this.updateConversationStats(conversation, response)

    return response
  }

  /**
   * Stream execution (SSE)
   */
  async *executeStream(payload: {
    userId: number
    input: string
    conversationId?: number
    folderId?: number
    mode?: 'single' | 'multi'
  }): AsyncGenerator<string> {
    const { userId, input, conversationId, folderId, mode = 'single' } = payload

    // Get or create conversation
    const conversation = await this.getOrCreateConversation({
      userId,
      conversationId,
      folderId,
      input,
      mode,
    })

    // Detect intent and select agent
    const selectedAgent = await this.selectAgent(input, mode)

    // Save user message
    await AiMessage.create({
      conversation_id: conversation.id,
      agent_id: selectedAgent.id,
      role: 'user',
      content: input,
    })

    // Get agent service
    const agentService = this.getAgentService(selectedAgent.slug)

    // Execute normally and yield result (streaming will be implemented later)
    const response = await agentService.execute({
      conversation_id: conversation.id,
      input,
      folder_id: folderId,
      user_id: userId,
    })

    // Save assistant message
    await AiMessage.create({
      conversation_id: conversation.id,
      agent_id: selectedAgent.id,
      role: 'assistant',
      content: response.output,
    })

    yield JSON.stringify({
      type: 'content',
      content: response.output,
      conversation: {
        id: conversation.id,
        title: conversation.title,
      },
    })

    yield JSON.stringify({
      type: 'done',
      metadata: {
        tokens: response.tokens_used,
        citations: response.citations,
      },
    })
  }

  /**
   * Multi-agent workflow execution
   * Coordinates multiple agents working together
   */
  async executeWorkflow(payload: {
    userId: number
    input: string
    workflow: string // 'full-case-analysis' | 'contract-review' | 'litigation-strategy'
    folderId?: number
  }): Promise<{
    workflow: string
    results: IAiAgent.ExecuteResponse[]
    summary: string
  }> {
    const { userId, input, workflow, folderId } = payload

    logger.info(`[Workflow] Starting ${workflow} for user ${userId}`)

    // Create workflow conversation
    const conversation = await AiConversation.create({
      user_id: userId,
      agent_id: null, // Multi-agent workflow
      folder_id: folderId,
      title: `Workflow: ${workflow}`,
      mode: 'multi',
      metadata: { workflow },
    })

    const results: IAiAgent.ExecuteResponse[] = []

    // Execute workflow based on type
    switch (workflow) {
      case 'full-case-analysis':
        logger.info('[Workflow] Step 1/4: Document Analysis')
        // 1. Document Analysis
        results.push(
          await this.documentAnalyzer.execute({
            conversation_id: conversation.id,
            input: `Analise todos os documentos da pasta e identifique riscos, prazos e inconsistências.`,
            folder_id: folderId,
            user_id: userId,
          })
        )

        logger.info('[Workflow] Step 2/4: Legal Research')
        // 2. Legal Research
        results.push(
          await this.legalResearch.execute({
            conversation_id: conversation.id,
            input: `Pesquise legislação, jurisprudência e precedentes relevantes para: ${input}`,
            folder_id: folderId,
            user_id: userId,
          })
        )

        logger.info('[Workflow] Step 3/4: Strategy Analysis')
        // 3. Strategy Analysis
        results.push(
          await this.caseStrategy.execute({
            conversation_id: conversation.id,
            input: `Com base na análise documental e pesquisa jurídica, desenvolva estratégia processual e avalie chances de êxito.`,
            folder_id: folderId,
            user_id: userId,
          })
        )

        logger.info('[Workflow] Step 4/4: Client Communication')
        // 4. Client Communication
        results.push(
          await this.clientCommunicator.execute({
            conversation_id: conversation.id,
            input: `Traduza análise para linguagem executiva e apresente recomendações.`,
            folder_id: folderId,
            user_id: userId,
          })
        )
        break

      case 'contract-review':
        logger.info('[Workflow] Step 1/3: Document Analysis')
        // 1. Document Analysis
        results.push(
          await this.documentAnalyzer.execute({
            conversation_id: conversation.id,
            input: `Analise o contrato identificando cláusulas críticas, riscos e inconsistências.`,
            folder_id: folderId,
            user_id: userId,
          })
        )

        logger.info('[Workflow] Step 2/3: Legal Research')
        // 2. Legal Research
        results.push(
          await this.legalResearch.execute({
            conversation_id: conversation.id,
            input: `Verifique conformidade legal das cláusulas com legislação brasileira.`,
            folder_id: folderId,
            user_id: userId,
          })
        )

        logger.info('[Workflow] Step 3/3: Legal Writer')
        // 3. Legal Writer
        results.push(
          await this.legalWriter.execute({
            conversation_id: conversation.id,
            input: `Sugira melhorias e redação alternativa para cláusulas problemáticas.`,
            folder_id: folderId,
            user_id: userId,
          })
        )
        break

      case 'litigation-strategy':
        logger.info('[Workflow] Step 1/3: Legal Research')
        // 1. Legal Research
        results.push(
          await this.legalResearch.execute({
            conversation_id: conversation.id,
            input: `Pesquise jurisprudência e precedentes sobre: ${input}`,
            folder_id: folderId,
            user_id: userId,
          })
        )

        logger.info('[Workflow] Step 2/3: Strategy Development')
        // 2. Strategy
        results.push(
          await this.caseStrategy.execute({
            conversation_id: conversation.id,
            input: `Desenvolva estratégia processual baseada na pesquisa jurisprudencial.`,
            folder_id: folderId,
            user_id: userId,
          })
        )

        logger.info('[Workflow] Step 3/3: Deadline Management')
        // 3. Deadline Management
        results.push(
          await this.deadlineManager.execute({
            conversation_id: conversation.id,
            input: `Calcule prazos processuais e identifique urgências.`,
            folder_id: folderId,
            user_id: userId,
          })
        )
        break

      default:
        throw new Error(`Unknown workflow: ${workflow}`)
    }

    logger.info(`[Workflow] Completed ${workflow} with ${results.length} agents`)

    // Generate workflow summary
    const summary = this.generateWorkflowSummary(workflow, results)

    return {
      workflow,
      results,
      summary,
    }
  }

  /**
   * Get or create conversation
   */
  private async getOrCreateConversation(payload: {
    userId: number
    conversationId?: number
    folderId?: number
    input: string
    mode: 'single' | 'multi'
  }): Promise<AiConversation> {
    if (payload.conversationId) {
      const conversation = await AiConversation.findOrFail(payload.conversationId)
      // Verify ownership
      if (conversation.user_id !== payload.userId) {
        throw new Error('Unauthorized access to conversation')
      }
      return conversation
    }

    // Create new conversation
    const selectedAgent = await this.selectAgent(payload.input, payload.mode)

    return await AiConversation.create({
      user_id: payload.userId,
      agent_id: selectedAgent.id,
      folder_id: payload.folderId,
      title: this.generateConversationTitle(payload.input),
      mode: payload.mode,
    })
  }

  /**
   * Select appropriate agent based on user input
   */
  private async selectAgent(input: string, _mode: 'single' | 'multi'): Promise<AiAgent> {
    const inputLower = input.toLowerCase()

    // Agent selection rules based on keywords
    const agentRules: Array<{
      keywords: string[]
      slug: string
    }> = [
      {
        keywords: [
          'pesquisar',
          'jurisprudência',
          'precedente',
          'stf',
          'stj',
          'tst',
          'legislação',
          'lei',
          'código',
          'súmula',
          'doutrina',
        ],
        slug: 'legal-research',
      },
      {
        keywords: [
          'analisar contrato',
          'revisar contrato',
          'cláusula',
          'analisar documento',
          'analisar petição',
          'analisar decisão',
          'documento',
          'pdf',
        ],
        slug: 'document-analyzer',
      },
      {
        keywords: [
          'estratégia',
          'chance de êxito',
          'avaliar risco',
          'plano',
          'tática',
          'como proceder',
          'melhor caminho',
        ],
        slug: 'case-strategy',
      },
      {
        keywords: [
          'prazo',
          'vencimento',
          'calcular prazo',
          'urgência',
          'deadline',
          'feriado',
          'quando vence',
        ],
        slug: 'deadline-manager',
      },
      {
        keywords: [
          'redigir',
          'escrever',
          'elaborar petição',
          'elaborar contrato',
          'parecer',
          'minuta',
          'draft',
        ],
        slug: 'legal-writer',
      },
      {
        keywords: [
          'explicar para cliente',
          'relatório executivo',
          'resumo',
          'comunicar',
          'traduzir',
          'simplificar',
        ],
        slug: 'client-communicator',
      },
    ]

    // Find matching agent
    for (const rule of agentRules) {
      if (rule.keywords.some((keyword) => inputLower.includes(keyword))) {
        const agent = await AiAgent.findByOrFail('slug', rule.slug)
        return agent
      }
    }

    // Default: use legal-research for general queries
    return await AiAgent.findByOrFail('slug', 'legal-research')
  }

  /**
   * Get agent service instance by slug
   */
  private getAgentService(slug: string) {
    switch (slug) {
      case 'legal-research':
        return this.legalResearch
      case 'document-analyzer':
        return this.documentAnalyzer
      case 'case-strategy':
        return this.caseStrategy
      case 'deadline-manager':
        return this.deadlineManager
      case 'legal-writer':
        return this.legalWriter
      case 'client-communicator':
        return this.clientCommunicator
      default:
        throw new Error(`Unknown agent slug: ${slug}`)
    }
  }

  /**
   * Update conversation statistics after execution
   */
  private async updateConversationStats(
    conversation: AiConversation,
    response: IAiAgent.ExecuteResponse
  ): Promise<void> {
    const currentTokens = conversation.total_tokens || 0
    const newTokens = response.tokens_used || 0

    await conversation
      .merge({
        total_tokens: currentTokens + newTokens,
      })
      .save()
  }

  /**
   * Generate conversation title from first user input
   */
  private generateConversationTitle(input: string): string {
    // Take first 50 characters
    return input.length > 50 ? input.substring(0, 47) + '...' : input
  }

  /**
   * Generate workflow summary
   */
  private generateWorkflowSummary(workflow: string, results: IAiAgent.ExecuteResponse[]): string {
    const sections: string[] = []

    sections.push(`# Resumo do Workflow: ${workflow}\n`)
    sections.push(`Total de agentes executados: ${results.length}\n`)

    for (const result of results) {
      sections.push(`\n## Resultado`)
      sections.push(`- Tokens: ${result.tokens_used}`)
      sections.push(`- Citações: ${result.citations?.length || 0}`)
      sections.push(`- Tool calls: ${result.tool_calls?.length || 0}`)
    }

    return sections.join('\n')
  }

  /**
   * List available agents
   */
  async listAgents(): Promise<AiAgent[]> {
    return await AiAgent.query().where('is_active', true).orderBy('id')
  }

  /**
   * Get conversation history
   */
  async getConversation(
    conversationId: number,
    userId: number
  ): Promise<{
    conversation: AiConversation
    messages: AiMessage[]
  }> {
    const conversation = await AiConversation.query()
      .where('id', conversationId)
      .where('user_id', userId)
      .preload('agent')
      .firstOrFail()

    const messages = await AiMessage.query()
      .where('conversation_id', conversationId)
      .preload('agent')
      .preload('citations')
      .orderBy('created_at', 'asc')

    return {
      conversation,
      messages,
    }
  }

  /**
   * List user conversations
   */
  async listConversations(
    userId: number,
    params?: {
      page?: number
      limit?: number
      folderId?: number
    }
  ): Promise<{
    conversations: AiConversation[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const page = params?.page || 1
    const limit = params?.limit || 20

    const query = AiConversation.query()
      .where('user_id', userId)
      .preload('agent')
      .orderBy('updated_at', 'desc')

    if (params?.folderId) {
      query.where('folder_id', params.folderId)
    }

    const result = await query.paginate(page, limit)

    return {
      conversations: result.all(),
      meta: {
        total: result.total,
        page: result.currentPage,
        limit: result.perPage,
      },
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: number, userId: number): Promise<void> {
    const conversation = await AiConversation.query()
      .where('id', conversationId)
      .where('user_id', userId)
      .firstOrFail()

    // Delete related messages, executions, citations
    await AiMessage.query().where('conversation_id', conversationId).delete()

    await conversation.delete()
  }
}

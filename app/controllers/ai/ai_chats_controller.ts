import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import OrchestratorService from '#services/ai/orchestrator_service'

/**
 * AiChatsController
 * Handles AI chat requests, streaming, and conversation management
 */
@inject()
export default class AiChatsController {
  constructor(private orchestrator: OrchestratorService) {}

  /**
   * POST /api/v1/ai/chat
   * Send message to AI (synchronous)
   */
  async send({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const { message, conversationId, folderId, mode } = request.only([
      'message',
      'conversation_id',
      'folder_id',
      'mode',
    ])

    if (!message || typeof message !== 'string') {
      return response.badRequest({
        error: 'Message is required and must be a string',
      })
    }

    try {
      const result = await this.orchestrator.execute({
        userId: user.id,
        input: message,
        conversationId,
        folderId,
        mode: mode || 'single',
      })

      return response.ok({
        success: true,
        data: result,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error.message || 'Failed to process AI request',
      })
    }
  }

  /**
   * POST /api/v1/ai/chat/stream
   * Send message to AI (streaming via SSE)
   */
  async stream({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const { message, conversationId, folderId, mode } = request.only([
      'message',
      'conversation_id',
      'folder_id',
      'mode',
    ])

    if (!message || typeof message !== 'string') {
      return response.badRequest({
        error: 'Message is required and must be a string',
      })
    }

    // Set SSE headers
    response.response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    })

    try {
      const stream = this.orchestrator.executeStream({
        userId: user.id,
        input: message,
        conversationId,
        folderId,
        mode: mode || 'single',
      })

      for await (const chunk of stream) {
        // Send SSE formatted data
        response.response.write(`data: ${chunk}\n\n`)
      }

      // Send done event
      response.response.write('event: done\ndata: {}\n\n')
      response.response.end()
    } catch (error) {
      // Send error event
      response.response.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`)
      response.response.end()
    }
  }

  /**
   * POST /api/v1/ai/workflows
   * Execute multi-agent workflow
   */
  async executeWorkflow({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const { workflow, message, folderId } = request.only(['workflow', 'message', 'folder_id'])

    if (
      !workflow ||
      !['full-case-analysis', 'contract-review', 'litigation-strategy'].includes(workflow)
    ) {
      return response.badRequest({
        error:
          'Invalid workflow. Must be: full-case-analysis, contract-review, or litigation-strategy',
      })
    }

    try {
      const result = await this.orchestrator.executeWorkflow({
        userId: user.id,
        input: message || '',
        workflow,
        folderId,
      })

      return response.ok({
        success: true,
        data: result,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error.message || 'Failed to execute workflow',
      })
    }
  }

  /**
   * GET /api/v1/ai/agents
   * List available AI agents
   */
  async listAgents({ response }: HttpContext) {
    try {
      const agents = await this.orchestrator.listAgents()

      return response.ok({
        success: true,
        data: agents,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error.message || 'Failed to list agents',
      })
    }
  }

  /**
   * GET /api/v1/ai/conversations
   * List user conversations
   */
  async listConversations({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const { page, limit, folderId } = request.qs()

    try {
      const result = await this.orchestrator.listConversations(user.id, {
        page: page ? Number.parseInt(page) : undefined,
        limit: limit ? Number.parseInt(limit) : undefined,
        folderId: folderId ? Number.parseInt(folderId) : undefined,
      })

      return response.ok({
        success: true,
        data: result.conversations,
        meta: result.meta,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        error: error.message || 'Failed to list conversations',
      })
    }
  }

  /**
   * GET /api/v1/ai/conversations/:id
   * Get conversation details with messages
   */
  async getConversation({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const conversationId = Number.parseInt(params.id)

    if (!conversationId) {
      return response.badRequest({
        error: 'Invalid conversation ID',
      })
    }

    try {
      const result = await this.orchestrator.getConversation(conversationId, user.id)

      return response.ok({
        success: true,
        data: result,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({
          success: false,
          error: 'Conversation not found',
        })
      }

      return response.internalServerError({
        success: false,
        error: error.message || 'Failed to get conversation',
      })
    }
  }

  /**
   * DELETE /api/v1/ai/conversations/:id
   * Delete conversation
   */
  async deleteConversation({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const conversationId = Number.parseInt(params.id)

    if (!conversationId) {
      return response.badRequest({
        error: 'Invalid conversation ID',
      })
    }

    try {
      await this.orchestrator.deleteConversation(conversationId, user.id)

      return response.ok({
        success: true,
        message: 'Conversation deleted successfully',
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({
          success: false,
          error: 'Conversation not found',
        })
      }

      return response.internalServerError({
        success: false,
        error: error.message || 'Failed to delete conversation',
      })
    }
  }
}

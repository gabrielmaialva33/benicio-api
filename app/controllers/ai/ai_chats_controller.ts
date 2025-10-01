import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import OrchestratorService from '#services/ai/orchestrator_service'
import {
  conversationIdValidator,
  executeWorkflowValidator,
  listConversationsValidator,
  sendMessageValidator,
} from '#validators/ai/chat'

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

    // Validate request
    const payload = await request.validateUsing(sendMessageValidator)

    try {
      const result = await this.orchestrator.execute({
        userId: user.id,
        input: payload.message,
        conversationId: payload.conversation_id,
        folderId: payload.folder_id,
        mode: payload.mode || 'single',
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

    // Validate request
    const payload = await request.validateUsing(sendMessageValidator)

    // Set SSE headers
    response.response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
      'Access-Control-Allow-Origin': request.header('origin') || '*',
      'Access-Control-Allow-Credentials': 'true',
    })

    // Keep-alive heartbeat to prevent connection timeout
    const heartbeat = setInterval(() => {
      response.response.write(': heartbeat\n\n')
    }, 15000) // Every 15 seconds

    try {
      const stream = this.orchestrator.executeStream({
        userId: user.id,
        input: payload.message,
        conversationId: payload.conversation_id,
        folderId: payload.folder_id,
        mode: payload.mode || 'single',
      })

      for await (const chunk of stream) {
        try {
          // Send SSE formatted data
          response.response.write(`data: ${chunk}\n\n`)
        } catch (chunkError) {
          // Client may have disconnected
          console.error('Error writing chunk:', chunkError)
          break
        }
      }

      // Send done event
      response.response.write('event: done\ndata: {}\n\n')
      response.response.end()
    } catch (error) {
      // Send error event
      response.response.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`)
      response.response.end()
    } finally {
      // Clear heartbeat interval
      clearInterval(heartbeat)
    }
  }

  /**
   * POST /api/v1/ai/workflows
   * Execute multi-agent workflow
   * Timeout: 90 seconds (workflows can be slow due to multiple AI calls)
   */
  async executeWorkflow({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    // Validate request
    const payload = await request.validateUsing(executeWorkflowValidator)

    try {
      // Set timeout for long-running workflows (90 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Workflow execution timeout (90s)')), 90000)
      })

      const workflowPromise = this.orchestrator.executeWorkflow({
        userId: user.id,
        input: payload.message || '',
        workflow: payload.workflow,
        folderId: payload.folder_id,
      })

      // Race between workflow completion and timeout
      const result = await Promise.race([workflowPromise, timeoutPromise])

      return response.ok({
        success: true,
        data: result,
      })
    } catch (error) {
      // Check if it's a timeout error
      if (error.message && error.message.includes('timeout')) {
        return response.status(504).send({
          success: false,
          error:
            'Workflow execution timeout. Consider using smaller workflows or background jobs for complex tasks.',
        })
      }

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

    // Validate query params
    const payload = await request.validateUsing(listConversationsValidator)

    try {
      const result = await this.orchestrator.listConversations(user.id, {
        page: payload.page,
        limit: payload.per_page,
        folderId: payload.folder_id,
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
  async getConversation({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    // Validate params
    const payload = await request.validateUsing(conversationIdValidator)

    try {
      const result = await this.orchestrator.getConversation(payload.params.id, user.id)

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
  async deleteConversation({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    // Validate params
    const payload = await request.validateUsing(conversationIdValidator)

    try {
      await this.orchestrator.deleteConversation(payload.params.id, user.id)

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

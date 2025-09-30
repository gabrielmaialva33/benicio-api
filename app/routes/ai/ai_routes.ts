import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AiChatsController = () => import('#controllers/ai/ai_chats_controller')

/**
 * AI Chat Routes
 * All routes require JWT authentication
 */
router
  .group(() => {
    // Chat endpoints
    router.post('/ai/chat', [AiChatsController, 'send'])
    router.post('/ai/chat/stream', [AiChatsController, 'stream'])

    // Workflow endpoints
    router.post('/ai/workflows', [AiChatsController, 'executeWorkflow'])

    // Agents
    router.get('/ai/agents', [AiChatsController, 'listAgents'])

    // Conversations
    router.get('/ai/conversations', [AiChatsController, 'listConversations'])
    router.get('/ai/conversations/:id', [AiChatsController, 'getConversation'])
    router.delete('/ai/conversations/:id', [AiChatsController, 'deleteConversation'])
  })
  .prefix('/api/v1')
  .use(middleware.auth({ guards: ['jwt'] }))

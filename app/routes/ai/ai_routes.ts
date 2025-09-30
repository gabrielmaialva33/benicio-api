import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import IPermission from '#interfaces/permission_interface'

const AiChatsController = () => import('#controllers/ai/ai_chats_controller')

/**
 * AI Chat Routes
 * All routes require JWT authentication and AI permissions
 */
router
  .group(() => {
    // Chat endpoints
    router.post('/ai/chat', [AiChatsController, 'send']).use(
      middleware.permission({
        permissions: `${IPermission.Resources.AI}.${IPermission.Actions.CREATE}`,
      })
    )

    router.post('/ai/chat/stream', [AiChatsController, 'stream']).use(
      middleware.permission({
        permissions: `${IPermission.Resources.AI}.${IPermission.Actions.CREATE}`,
      })
    )

    // Workflow endpoints
    router.post('/ai/workflows', [AiChatsController, 'executeWorkflow']).use(
      middleware.permission({
        permissions: `${IPermission.Resources.AI}.${IPermission.Actions.CREATE}`,
      })
    )

    // Agents
    router.get('/ai/agents', [AiChatsController, 'listAgents']).use(
      middleware.permission({
        permissions: `${IPermission.Resources.AI}.${IPermission.Actions.LIST}`,
      })
    )

    // Conversations
    router.get('/ai/conversations', [AiChatsController, 'listConversations']).use(
      middleware.permission({
        permissions: `${IPermission.Resources.AI}.${IPermission.Actions.LIST}`,
      })
    )

    router.get('/ai/conversations/:id', [AiChatsController, 'getConversation']).use(
      middleware.permission({
        permissions: `${IPermission.Resources.AI}.${IPermission.Actions.READ}`,
      })
    )

    router.delete('/ai/conversations/:id', [AiChatsController, 'deleteConversation']).use(
      middleware.permission({
        permissions: `${IPermission.Resources.AI}.${IPermission.Actions.DELETE}`,
      })
    )
  })
  .prefix('/api/v1')
  .use(middleware.auth())

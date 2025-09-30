import vine from '@vinejs/vine'

/**
 * Validator for sending a chat message to AI
 */
export const sendMessageValidator = vine.compile(
  vine.object({
    message: vine.string().trim().minLength(1).maxLength(10000),

    conversation_id: vine
      .number()
      .positive()
      .exists({ table: 'ai_conversations', column: 'id' })
      .optional(),

    folder_id: vine.number().positive().exists({ table: 'folders', column: 'id' }).optional(),

    mode: vine.enum(['single', 'multi']).optional(),
  })
)

/**
 * Validator for executing a workflow
 */
export const executeWorkflowValidator = vine.compile(
  vine.object({
    workflow: vine.enum(['full-case-analysis', 'contract-review', 'litigation-strategy']),

    message: vine.string().trim().maxLength(10000).optional(),

    folder_id: vine.number().positive().exists({ table: 'folders', column: 'id' }).optional(),
  })
)

/**
 * Validator for listing conversations with pagination and filters
 */
export const listConversationsValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),

    per_page: vine.number().positive().min(1).max(100).optional(),

    folder_id: vine.number().positive().exists({ table: 'folders', column: 'id' }).optional(),
  })
)

/**
 * Validator for conversation ID parameter from URL
 */
export const conversationIdValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number().positive().exists({ table: 'ai_conversations', column: 'id' }),
    }),
  })
)

import vine from '@vinejs/vine'

export const createTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),

    description: vine.string().trim().maxLength(2000).optional(),

    folder_id: vine.number().positive().exists({ table: 'folders', column: 'id' }).optional(),

    assigned_to_id: vine.number().positive().exists({ table: 'users', column: 'id' }),

    due_date: vine.date({
      formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', 'ISO'],
    }),

    status: vine.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),

    priority: vine.enum(['low', 'medium', 'high', 'urgent']).optional(),

    tags: vine.array(vine.string().trim().maxLength(50)).maxLength(10).optional(),
  })
)

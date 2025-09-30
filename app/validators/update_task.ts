import vine from '@vinejs/vine'

export const updateTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),

    description: vine.string().trim().maxLength(2000).optional().nullable(),

    folder_id: vine
      .number()
      .positive()
      .exists({ table: 'folders', column: 'id' })
      .optional()
      .nullable(),

    assigned_to_id: vine.number().positive().exists({ table: 'users', column: 'id' }).optional(),

    due_date: vine
      .date({
        formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', 'ISO'],
      })
      .optional(),

    status: vine.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),

    priority: vine.enum(['low', 'medium', 'high', 'urgent']).optional(),

    tags: vine.array(vine.string().trim().maxLength(50)).maxLength(10).optional().nullable(),

    completed_at: vine
      .date({
        formats: ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', 'ISO'],
      })
      .optional()
      .nullable(),
  })
)

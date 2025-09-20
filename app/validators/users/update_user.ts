import vine from '@vinejs/vine'

export const updateUserValidator = vine.compile(
  vine.object({
    full_name: vine.string().trim().minLength(3).maxLength(255).optional(),
    email: vine.string().trim().email().normalizeEmail().optional(),
    username: vine.string().trim().minLength(3).maxLength(50).optional().nullable(),
    password: vine.string().minLength(8).maxLength(255).optional(),
    user_type: vine.enum(['employee', 'manager', 'client']).optional(),
  })
)

import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    full_name: vine.string().trim().minLength(3).maxLength(255),
    email: vine.string().trim().email().normalizeEmail(),
    username: vine.string().trim().minLength(3).maxLength(50).optional(),
    password: vine.string().minLength(8).maxLength(255),
    user_type: vine.enum(['employee', 'manager', 'client']),
  })
)

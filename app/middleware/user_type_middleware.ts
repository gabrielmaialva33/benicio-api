import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class UserTypeMiddleware {
  async handle(
    { auth, response }: HttpContext,
    next: NextFn,
    allowedTypes: ('employee' | 'manager' | 'client')[]
  ) {
    const user = auth.user!

    if (!allowedTypes.includes(user.user_type)) {
      return response.forbidden({
        message: `Access denied. This resource requires one of the following user types: ${allowedTypes.join(', ')}`,
      })
    }

    const output = await next()
    return output
  }
}

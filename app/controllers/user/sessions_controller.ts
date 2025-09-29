import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { createUserValidator, signInValidator } from '#validators/users/user'
import SignInService from '#services/users/sign_in_service'
import SignUpService from '#services/users/sign_up_service'
import JwtAuthTokensService from '#services/users/jwt_auth_tokens_service'
import JwtService from '#shared/jwt/jwt_service'
import env from '#start/env'

export default class SessionsController {
  async signIn(ctx: HttpContext) {
    const { request, response } = ctx
    const { uid, password } = await request.validateUsing(signInValidator)

    try {
      const service = await app.container.make(SignInService)
      const payload = await service.run({ uid, password, ctx })
      return response.json(payload)
    } catch (error) {
      return response.badRequest({
        errors: [
          {
            message: error.message,
          },
        ],
      })
    }
  }

  async signUp({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)

    const service = await app.container.make(SignUpService)
    const userWithAuth = await service.run(payload)

    return response.created(userWithAuth)
  }

  async logout({ auth, response }: HttpContext) {
    try {
      await auth.use('jwt').authenticate()

      // Note: JWT tokens are stateless and cannot be truly revoked without a blacklist
      // In a production environment, you would want to:
      // 1. Add the token to a Redis blacklist with TTL matching token expiry
      // 2. Check the blacklist in the auth middleware
      // For now, we'll return success and rely on client-side token removal

      return response.json({
        message: 'Logged out successfully',
      })
    } catch (error) {
      return response.unauthorized({
        errors: [
          {
            message: 'Authentication failed',
          },
        ],
      })
    }
  }

  async refresh({ request, response }: HttpContext) {
    try {
      const refreshToken = request.header('x-refresh-token') || request.input('refresh_token')

      if (!refreshToken) {
        return response.badRequest({
          errors: [
            {
              message: 'Refresh token is required',
            },
          ],
        })
      }

      // Verify the refresh token
      const jwtService = await app.container.make(JwtService)
      const decoded = await jwtService.verify(refreshToken, env.get('APP_KEY'))

      if (!decoded || !decoded.userId) {
        return response.unauthorized({
          errors: [
            {
              message: 'Invalid refresh token',
            },
          ],
        })
      }

      // Generate new tokens
      const jwtAuthTokensService = await app.container.make(JwtAuthTokensService)
      const auth = await jwtAuthTokensService.run({ userId: decoded.userId })

      return response.json({
        message: 'Token refreshed successfully',
        data: auth,
      })
    } catch (error) {
      return response.unauthorized({
        errors: [
          {
            message: error.message || 'Invalid or expired refresh token',
          },
        ],
      })
    }
  }
}

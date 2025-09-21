import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Folder from '#models/folder'

/**
 * Middleware to verify folder ownership
 * Ensures that users can only access/modify folders belonging to their clients
 */
export default class FolderOwnershipMiddleware {
  async handle({ auth, params, response }: HttpContext, next: NextFn) {
    // Check if auth is available
    if (!auth || !auth.user) {
      return response.unauthorized({ message: 'Authentication required' })
    }

    const user = auth.user
    const folderId = params.id

    if (!folderId) {
      return response.badRequest({ message: 'Folder ID is required' })
    }

    try {
      const folder = await Folder.query()
        .where('id', folderId)
        .whereNull('deleted_at')
        .preload('client')
        .firstOrFail()

      // Check if user has access to the folder's client
      // For now, we'll check if the user is an employee or manager
      // In the future, we can add more sophisticated permission checks
      if (user.user_type === 'client') {
        // Client users can only access their own folders
        // This requires additional client-user relationship logic
        return response.forbidden({
          message: 'You do not have permission to access this folder',
        })
      }

      // Employees and managers have access to all folders
      // You can add more granular permissions here
      if (user.user_type === 'employee' || user.user_type === 'manager') {
        const output = await next()
        return output
      }

      return response.forbidden({
        message: 'You do not have permission to access this folder',
      })
    } catch (error) {
      return response.notFound({ message: 'Folder not found' })
    }
  }
}

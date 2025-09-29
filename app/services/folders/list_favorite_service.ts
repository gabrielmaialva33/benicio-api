import Folder from '#models/folder'
import logger from '@adonisjs/core/services/logger'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

interface ListFavoritesOptions {
  page?: number
  perPage?: number
}

export default class ListFavoritesService {
  async execute(options: ListFavoritesOptions = {}): Promise<ModelPaginatorContract<Folder>> {
    try {
      const page = options.page || 1
      const perPage = options.perPage || 20

      // Build query for favorite folders
      const query = Folder.query()
        .where('is_favorite', true)
        .where('is_active', true)
        .whereNull('deleted_at')
        .preload('client')
        .preload('folder_type')
        .preload('court')
        .preload('responsible_lawyer')
        .orderBy('updated_at', 'desc')

      // Paginate results
      const favorites = await query.paginate(page, perPage)

      logger.info(
        `⭐ Listed ${favorites.length} favorite folders (page ${page}, perPage ${perPage})`
      )

      return favorites
    } catch (error) {
      logger.error(`💥 Error listing favorite folders: ${error.message}`)
      throw error
    }
  }
}

import { inject } from '@adonisjs/core'
import FolderRepository from '#repositories/folder_repository'
import IFolder from '#interfaces/folder_interface'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class ListFoldersService {
  constructor(private folderRepository: FolderRepository) {}

  async execute(options: IFolder.ListOptions) {
    try {
      const page = options.page || 1
      const perPage = options.perPage || 20
      const sortBy = options.sortBy || 'created_at'
      const sortOrder = options.direction || 'desc'

      // Build search query
      let query = this.folderRepository.search({
        search: options.filters?.search,
        status: options.filters?.status,
        folderTypeId: options.filters?.folderTypeId,
        clientId: options.filters?.clientId,
        courtId: options.filters?.courtId,
      })

      // Add sorting
      query = query.orderBy(sortBy, sortOrder)

      // Preload relationships
      query = query
        .preload('client')
        .preload('folderType')
        .preload('court')
        .preload('responsibleLawyer')

      // Paginate results
      const folders = await query.paginate(page, perPage)

      logger.info(
        `📁 Listed ${folders.length} folders with filters: ${JSON.stringify(options.filters)}`
      )

      return folders
    } catch (error) {
      logger.error(`💥 Error listing folders: ${error.message}`)
      throw error
    }
  }

  async getStatistics() {
    try {
      const stats = await this.folderRepository.getStatistics()
      logger.info('📊 Folder statistics retrieved successfully')
      return stats
    } catch (error) {
      logger.error(`💥 Error getting folder statistics: ${error.message}`)
      throw error
    }
  }
}

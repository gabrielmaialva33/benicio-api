import { inject } from '@adonisjs/core'
import Folder from '#models/folder'
import FolderRepository from '#repositories/folder_repository'
import logger from '@adonisjs/core/services/logger'
import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class ToggleFavoriteService {
  constructor(private folderRepository: FolderRepository) {}

  async execute(folderId: number): Promise<Folder> {
    try {
      // Find folder or fail with 404
      const folder = await this.folderRepository.findBy('id', folderId, {
        modifyQuery: (query) => query.whereNull('deleted_at'),
      })

      if (!folder) {
        throw new NotFoundException('Folder not found')
      }

      // Toggle the is_favorite field
      folder.is_favorite = !folder.is_favorite

      // Save changes (updated_at is automatically updated by Lucid)
      await folder.save()

      // Load relationships for response
      await folder.load('client')
      await folder.load('folder_type')
      if (folder.court_id) {
        await folder.load('court')
      }
      if (folder.responsible_lawyer_id) {
        await folder.load('responsible_lawyer')
      }

      logger.info(
        `${folder.is_favorite ? '⭐' : '☆'} Folder favorite toggled: ${folder.title} (ID: ${folder.id}) - is_favorite: ${folder.is_favorite}`
      )

      return folder
    } catch (error) {
      logger.error(`💥 Error toggling folder favorite: ${error.message}`)
      throw error
    }
  }
}

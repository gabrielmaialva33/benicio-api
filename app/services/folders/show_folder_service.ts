import { inject } from '@adonisjs/core'
import Folder from '#models/folder'
import FolderRepository from '#repositories/folder_repository'
import logger from '@adonisjs/core/services/logger'
import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class ShowFolderService {
  constructor(private folderRepository: FolderRepository) {}

  async execute(id: number): Promise<Folder> {
    try {
      const folder = await this.folderRepository.findWithRelations(id)

      if (!folder) {
        throw new NotFoundException('Folder not found')
      }

      logger.info(`👁️ Viewed folder: ${folder.title} (ID: ${folder.id})`)

      return folder
    } catch (error) {
      logger.error(`💥 Error showing folder: ${error.message}`)
      throw error
    }
  }
}
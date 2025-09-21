import { inject } from '@adonisjs/core'
import Folder from '#models/folder'
import FolderRepository from '#repositories/folder_repository'
import type User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class DeleteFolderService {
  constructor(private folderRepository: FolderRepository) {}

  async execute(id: number, user: User, permanent: boolean = false): Promise<void> {
    try {
      if (permanent) {
        // Hard delete
        const result = await this.folderRepository.destroy('id', id)
        if (!result) {
          throw new NotFoundException('Folder not found')
        }
        logger.info(`🗑️ Folder permanently deleted: ID ${id} by user ${user.id}`)
      } else {
        // Soft delete
        const folder = await this.folderRepository.softDelete(id, user.id)
        if (!folder) {
          throw new NotFoundException('Folder not found')
        }
        logger.info(`🗑️ Folder soft deleted: ${folder.title} (ID: ${folder.id}) by user ${user.id}`)
      }
    } catch (error) {
      logger.error(`💥 Error deleting folder: ${error.message}`)
      throw error
    }
  }

  async restore(id: number, user: User): Promise<Folder> {
    try {
      const folder = await this.folderRepository.restore(id, user.id)
      if (!folder) {
        throw new NotFoundException('Folder not found or not deleted')
      }

      // Load relationships for response
      await folder.load('folderType')
      await folder.load('client')
      if (folder.court_id) {
        await folder.load('court')
      }
      await folder.load('updatedBy')

      logger.info(`♻️ Folder restored: ${folder.title} (ID: ${folder.id}) by user ${user.id}`)

      return folder
    } catch (error) {
      logger.error(`💥 Error restoring folder: ${error.message}`)
      throw error
    }
  }
}

import { inject } from '@adonisjs/core'
import FolderType from '#models/folder_type'
import Client from '#models/client'
import Court from '#models/court'
import FolderRepository from '#repositories/folder_repository'
import logger from '@adonisjs/core/services/logger'
import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class FormDataService {
  constructor(private folderRepository: FolderRepository) {}

  async getCreateFormData() {
    try {
      const [folderTypes, clients, courts] = await Promise.all([
        FolderType.query().where('is_active', true).orderBy('sort_order'),
        Client.query().where('is_active', true).orderBy('name'),
        Court.query().where('is_active', true).orderBy('name'),
      ])

      logger.info('📋 Retrieved create form data for folders')

      return {
        folderTypes,
        clients,
        courts,
      }
    } catch (error) {
      logger.error(`💥 Error getting create form data: ${error.message}`)
      throw error
    }
  }

  async getEditFormData(id: number) {
    try {
      const [folder, folderTypes, clients, courts] = await Promise.all([
        this.folderRepository.findBy('id', id, {
          modifyQuery: (query) =>
            query
              .whereNull('deleted_at')
              .preload('client')
              .preload('folderType')
              .preload('court')
              .preload('responsibleLawyer'),
        }),
        FolderType.query().where('is_active', true).orderBy('sort_order'),
        Client.query().where('is_active', true).orderBy('name'),
        Court.query().where('is_active', true).orderBy('name'),
      ])

      if (!folder) {
        throw new NotFoundException('Folder not found')
      }

      logger.info(`📋 Retrieved edit form data for folder: ${folder.title} (ID: ${folder.id})`)

      return {
        folder,
        folderTypes,
        clients,
        courts,
      }
    } catch (error) {
      logger.error(`💥 Error getting edit form data: ${error.message}`)
      throw error
    }
  }
}

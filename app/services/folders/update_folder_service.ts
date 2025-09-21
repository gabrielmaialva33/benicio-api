import { inject } from '@adonisjs/core'
import Folder from '#models/folder'
import FolderRepository from '#repositories/folder_repository'
import IFolder from '#interfaces/folder_interface'
import CnjValidationService from './cnj_validation_service.js'
import { FolderPriorityValues } from '../../../contracts/folder_enums.js'
import type User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class UpdateFolderService {
  constructor(
    private folderRepository: FolderRepository,
    private cnjValidationService: CnjValidationService
  ) {}

  async execute(id: number, data: IFolder.UpdatePayload, user: User): Promise<Folder> {
    try {
      const folder = await this.folderRepository.findBy('id', id, {
        modifyQuery: (query) => query.whereNull('deleted_at'),
      })

      if (!folder) {
        throw new NotFoundException('Folder not found')
      }

      // Convert priority string enum to integer value if present
      const folderData: any = { ...data }
      if (data.priority) {
        folderData.priority = FolderPriorityValues[data.priority]
      }

      // Validate CNJ number if provided and different from current
      if (data.cnj_number && data.cnj_number !== folder.cnj_number) {
        const cnjValidation = await this.cnjValidationService.validate(data.cnj_number)
        if (!cnjValidation.isValid) {
          throw new Error(`Invalid CNJ number: ${cnjValidation.errors.join(', ')}`)
        }
        folderData.cnj_number = cnjValidation.formatted

        // Check if CNJ already exists (excluding current folder)
        const exists = await this.folderRepository.cnjExists(cnjValidation.formatted, id)
        if (exists) {
          throw new Error('CNJ number already exists')
        }
      }

      // Update folder with user tracking
      await folder
        .merge({
          ...folderData,
          updated_by_id: user.id,
        })
        .save()

      // Load relationships for response
      await folder.load('folderType')
      await folder.load('client')
      if (folder.court_id) {
        await folder.load('court')
      }
      await folder.load('updatedBy')

      logger.info(`📝 Folder updated: ${folder.title} (ID: ${folder.id}) by user ${user.id}`)

      return folder
    } catch (error) {
      logger.error(`💥 Error updating folder: ${error.message}`)
      throw error
    }
  }
}

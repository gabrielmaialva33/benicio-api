import { inject } from '@adonisjs/core'
import Folder from '#models/folder'
import FolderRepository from '#repositories/folder_repository'
import IFolder from '#interfaces/folder_interface'
import CnjValidationService from './cnj_validation_service.js'
import { FolderPriorityValues } from '../../../contracts/folder_enums.js'
import type User from '#models/user'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class CreateFolderService {
  constructor(
    private folderRepository: FolderRepository,
    private cnjValidationService: CnjValidationService
  ) {}

  async execute(data: IFolder.CreatePayload, user: User): Promise<Folder> {
    try {
      // Convert priority string enum to integer value if present
      const folderData: any = { ...data }
      if (data.priority) {
        folderData.priority = FolderPriorityValues[data.priority as keyof typeof FolderPriorityValues]
      }

      // Validate CNJ number if provided
      if (data.cnj_number) {
        const cnjValidation = await this.cnjValidationService.validate(data.cnj_number)
        if (!cnjValidation.isValid) {
          throw new Error(`Invalid CNJ number: ${cnjValidation.errors.join(', ')}`)
        }
        folderData.cnj_number = cnjValidation.formatted

        // Check if CNJ already exists
        const exists = await this.folderRepository.cnjExists(cnjValidation.formatted!)
        if (exists) {
          throw new Error('CNJ number already exists')
        }
      }

      // Create folder with user tracking
      const folder = await this.folderRepository.create({
        ...folderData,
        created_by_id: user.id,
        updated_by_id: user.id,
      })

      // Load relationships for response
      await folder.load('folder_type')
      await folder.load('client')
      if (folder.court_id) {
        await folder.load('court')
      }
      await folder.load('created_by')

      logger.info(`📁 Folder created: ${folder.title} (ID: ${folder.id}) by user ${user.id}`)

      return folder
    } catch (error) {
      logger.error(`💥 Error creating folder: ${error.message}`)
      throw error
    }
  }
}

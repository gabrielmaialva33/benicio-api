import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import CreateFolderService from '#services/folders/create_folder_service'
import UpdateFolderService from '#services/folders/update_folder_service'
import DeleteFolderService from '#services/folders/delete_folder_service'
import ListFoldersService from '#services/folders/list_folder_service'
import ShowFolderService from '#services/folders/show_folder_service'
import FormDataService from '#services/folders/form_data_service'
import CnjValidationService from '#services/folders/cnj_validation_service'
import { createFolderValidator } from '#validators/create_folder'
import { updateFolderValidator } from '#validators/update_folder'
import { validateCnjValidator } from '#validators/validate_cnj'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class FoldersController {
  constructor(
    private createFolderService: CreateFolderService,
    private updateFolderService: UpdateFolderService,
    private deleteFolderService: DeleteFolderService,
    private listFoldersService: ListFoldersService,
    private showFolderService: ShowFolderService,
    private formDataService: FormDataService,
    private cnjValidationService: CnjValidationService
  ) {}

  /**
   * Display a list of folders with pagination and filtering
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 20)
      const search = request.input('search')
      const status = request.input('status')
      const folderTypeId = request.input('folder_type_id')
      const clientId = request.input('client_id')
      const courtId = request.input('court_id')
      const sortBy = request.input('sort_by', 'created_at')
      const sortOrder = request.input('sort_order', 'desc')

      const folders = await this.listFoldersService.execute({
        page,
        perPage,
        sortBy,
        direction: sortOrder,
        filters: {
          search,
          status,
          folderTypeId,
          clientId,
          courtId,
        },
      })

      return response.ok({
        message: 'Folders retrieved successfully',
        data: folders,
      })
    } catch (error) {
      logger.error(`💥 Error listing folders: ${error.message}`)
      return response.internalServerError({
        message: 'Error retrieving folders',
      })
    }
  }

  /**
   * Return form data for creating a new folder
   */
  async create({ response }: HttpContext) {
    try {
      const data = await this.formDataService.getCreateFormData()

      return response.ok({
        message: 'Form data retrieved successfully',
        data,
      })
    } catch (error) {
      logger.error(`💥 Error getting create form data: ${error.message}`)
      return response.internalServerError({
        message: 'Error retrieving form data',
      })
    }
  }

  /**
   * Handle folder creation
   */
  async store({ request, response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const data = await request.validateUsing(createFolderValidator)

      const folder = await this.createFolderService.execute(data, user)

      return response.created({
        message: 'Folder created successfully',
        data: folder,
      })
    } catch (error) {
      // Handle validation errors
      if (error.status === 422) {
        return response.unprocessableEntity({
          message: 'Validation failure',
          errors: error.messages || [],
        })
      }
      // Handle CNJ validation errors
      if (error.message && error.message.includes('CNJ number')) {
        return response.badRequest({
          message: error.message,
        })
      }
      logger.error(`💥 Error creating folder: ${error.message}`)
      return response.internalServerError({
        message: 'Error creating folder',
      })
    }
  }

  /**
   * Show individual folder with all relationships
   */
  async show({ params, response }: HttpContext) {
    try {
      const folder = await this.showFolderService.execute(params.id)

      return response.ok({
        message: 'Folder retrieved successfully',
        data: folder,
      })
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.notFound({
          message: error.message,
        })
      }
      logger.error(`💥 Error showing folder: ${error.message}`)
      return response.internalServerError({
        message: 'Error retrieving folder',
      })
    }
  }

  /**
   * Return form data for editing folder
   */
  async edit({ params, response }: HttpContext) {
    try {
      const data = await this.formDataService.getEditFormData(params.id)

      return response.ok({
        message: 'Edit form data retrieved successfully',
        data,
      })
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.notFound({
          message: error.message,
        })
      }
      logger.error(`💥 Error getting edit form data: ${error.message}`)
      return response.internalServerError({
        message: 'Error retrieving form data',
      })
    }
  }

  /**
   * Handle folder update
   */
  async update({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const data = await request.validateUsing(updateFolderValidator, {
        meta: { folderId: params.id },
      })

      const folder = await this.updateFolderService.execute(params.id, data, user)

      return response.ok({
        message: 'Folder updated successfully',
        data: folder,
      })
    } catch (error) {
      // Handle validation errors
      if (error.status === 422) {
        return response.unprocessableEntity({
          message: 'Validation failure',
          errors: error.messages || [],
        })
      }
      if (error.name === 'NotFoundException') {
        return response.notFound({
          message: error.message,
        })
      }
      if (error.message && error.message.includes('CNJ number')) {
        return response.badRequest({
          message: error.message,
        })
      }
      logger.error(`💥 Error updating folder: ${error.message}`)
      return response.internalServerError({
        message: 'Error updating folder',
      })
    }
  }

  /**
   * Soft delete folder
   */
  async destroy({ params, response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      await this.deleteFolderService.execute(params.id, user, false)

      return response.ok({
        message: 'Folder deleted successfully',
      })
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.notFound({
          message: error.message,
        })
      }
      logger.error(`💥 Error deleting folder: ${error.message}`)
      return response.internalServerError({
        message: 'Error deleting folder',
      })
    }
  }

  /**
   * Restore soft deleted folder
   */
  async restore({ params, response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const folder = await this.deleteFolderService.restore(params.id, user)

      return response.ok({
        message: 'Folder restored successfully',
        data: folder,
      })
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return response.notFound({
          message: error.message,
        })
      }
      logger.error(`💥 Error restoring folder: ${error.message}`)
      return response.internalServerError({
        message: 'Error restoring folder',
      })
    }
  }

  /**
   * Validate CNJ number endpoint
   */
  async validateCnj({ request, response }: HttpContext) {
    try {
      const { cnj_number: cnj } = await request.validateUsing(validateCnjValidator)

      const validation = await this.cnjValidationService.validate(cnj)

      return response.ok({
        message: 'CNJ validation completed',
        data: validation,
      })
    } catch (error) {
      logger.error(`💥 Error validating CNJ: ${error.message}`)
      return response.internalServerError({
        message: 'Error validating CNJ number',
      })
    }
  }

  /**
   * Get folder statistics
   */
  async stats({ response }: HttpContext) {
    try {
      const stats = await this.listFoldersService.getStatistics()

      return response.ok({
        message: 'Folder statistics retrieved successfully',
        data: stats,
      })
    } catch (error) {
      logger.error(`💥 Error getting folder stats: ${error.message}`)
      return response.internalServerError({
        message: 'Error retrieving statistics',
      })
    }
  }
}

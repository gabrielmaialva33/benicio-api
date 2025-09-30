import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import GetActiveFoldersStatService from '#services/dashboard/get_active_folders_stat_service'
import GetAreaDivisionService from '#services/dashboard/get_area_division_service'
import GetFolderActivityService from '#services/dashboard/get_folder_activity_service'
import GetBirthdayService from '#services/dashboard/get_birthday_service'
import GetFavoriteFoldersService from '#services/dashboard/get_favorite_folder_service'
import GetRequestsStatsService from '#services/dashboard/get_requests_stat_service'
import GetHearingsStatsService from '#services/dashboard/get_hearings_stat_service'
import GetTasksService from '#services/tasks/get_tasks_service'

@inject()
export default class DashboardController {
  constructor(
    private getActiveFoldersStatService: GetActiveFoldersStatService,
    private getAreaDivisionService: GetAreaDivisionService,
    private getFolderActivityService: GetFolderActivityService,
    private getBirthdayService: GetBirthdayService,
    private getFavoriteFoldersService: GetFavoriteFoldersService,
    private getRequestsStatsService: GetRequestsStatsService,
    private getHearingsStatsService: GetHearingsStatsService,
    private getTasksService: GetTasksService
  ) {}

  /**
   * Get active folders statistics with history
   */
  async activeFolders({ response }: HttpContext) {
    try {
      const stats = await this.getActiveFoldersStatService.execute()
      return response.ok(stats)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to get active folders statistics' })
    }
  }

  /**
   * Get favorite folders list
   */
  async favoriteFolders({ auth, response }: HttpContext) {
    try {
      const folders = await this.getFavoriteFoldersService.execute(auth.user!.id)
      return response.ok(folders)
    } catch (error) {
      console.error('[FavoriteFoldersController] Error:', error)
      return response.internalServerError({
        message: 'Failed to get favorite folders',
        error: error.message,
      })
    }
  }

  /**
   * Add folder to favorites
   */
  async addFavorite({ auth, params, response }: HttpContext) {
    try {
      await auth.user!.related('favorite_folders').attach([params.folderId])
      return response.noContent()
    } catch (error) {
      return response.internalServerError({ message: 'Failed to add favorite' })
    }
  }

  /**
   * Remove folder from favorites
   */
  async removeFavorite({ auth, params, response }: HttpContext) {
    try {
      await auth.user!.related('favorite_folders').detach([params.folderId])
      return response.noContent()
    } catch (error) {
      return response.internalServerError({ message: 'Failed to remove favorite' })
    }
  }

  /**
   * Get folder distribution by area/type
   */
  async areaDivision({ response }: HttpContext) {
    try {
      const division = await this.getAreaDivisionService.execute()
      return response.ok(division)
    } catch (error) {
      console.error('[AreaDivisionController] Error:', error)
      return response.internalServerError({
        message: 'Failed to get area division',
        error: error.message,
      })
    }
  }

  /**
   * Get folder activity statistics
   */
  async folderActivity({ response }: HttpContext) {
    try {
      const activity = await this.getFolderActivityService.execute()
      return response.ok(activity)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to get folder activity' })
    }
  }

  /**
   * Get tasks list with filters and pagination
   */
  async tasks({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 10)
      const sortBy = request.input('sort_by', 'due_date')
      const direction = request.input('direction', 'asc')

      // Extract filters from query params
      const filters = {
        search: request.input('search'),
        status: request.input('status'),
        priority: request.input('priority'),
        assignedToId: request.input('assigned_to_id'),
        createdById: request.input('created_by_id'),
        folderId: request.input('folder_id'),
        overdue: request.input('overdue'),
        upcoming: request.input('upcoming'),
      }

      const tasks = await this.getTasksService.execute({
        filters,
        page,
        perPage,
        sortBy,
        direction,
      })

      return response.ok(tasks)
    } catch (error) {
      console.error('[TasksController] Error:', error)
      return response.internalServerError({ message: 'Failed to get tasks', error: error.message })
    }
  }

  /**
   * Get requests statistics
   */
  async requests({ response }: HttpContext) {
    try {
      const stats = await this.getRequestsStatsService.execute()
      return response.ok(stats)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to get requests' })
    }
  }

  /**
   * Get hearings and deadlines statistics
   */
  async hearings({ response }: HttpContext) {
    try {
      const stats = await this.getHearingsStatsService.execute()
      return response.ok(stats)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to get hearings' })
    }
  }

  /**
   * Get birthdays for current month
   */
  async birthdays({ response }: HttpContext) {
    try {
      const birthdays = await this.getBirthdayService.execute()
      return response.ok(birthdays)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to get birthdays' })
    }
  }
}

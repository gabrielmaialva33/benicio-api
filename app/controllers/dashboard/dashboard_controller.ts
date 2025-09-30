import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import GetActiveFoldersStatService from '#services/dashboard/get_active_folders_stat_service'
import GetAreaDivisionService from '#services/dashboard/get_area_division_service'
import GetFolderActivityService from '#services/dashboard/get_folder_activity_service'
import GetBirthdayService from '#services/dashboard/get_birthday_service'
import GetFavoriteFoldersService from '#services/dashboard/get_favorite_folder_service'

@inject()
export default class DashboardController {
  constructor(
    private getActiveFoldersStatService: GetActiveFoldersStatService,
    private getAreaDivisionService: GetAreaDivisionService,
    private getFolderActivityService: GetFolderActivityService,
    private getBirthdayService: GetBirthdayService,
    private getFavoriteFoldersService: GetFavoriteFoldersService
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
      return response.internalServerError({ message: 'Failed to get favorite folders' })
    }
  }

  /**
   * Add folder to favorites
   */
  async addFavorite({ auth, params, response }: HttpContext) {
    try {
      await auth.user!.related('favoriteFolders').attach([params.folderId])
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
      await auth.user!.related('favoriteFolders').detach([params.folderId])
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
      return response.internalServerError({ message: 'Failed to get area division' })
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
   * Get tasks list (mock data for now)
   */
  async tasks({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('per_page', 10)

      // Mock data until tasks model is implemented
      const mockTasks = [
        {
          id: 1,
          title: 'Revisar contrato de prestação de serviços',
          description: 'Análise completa do contrato com foco nas cláusulas de rescisão',
          due_date: DateTime.now().plus({ days: 2 }).toISO(),
          status: 'pending',
          priority: 'high',
          assigned_to: { id: 1, full_name: 'João Silva', email: 'joao@benicio.com.br' },
          created_by: { id: 2, full_name: 'Maria Santos', email: 'maria@benicio.com.br' },
          created_at: DateTime.now().minus({ days: 5 }).toISO(),
          updated_at: DateTime.now().minus({ days: 1 }).toISO(),
        },
        {
          id: 2,
          title: 'Preparar defesa administrativa',
          description: 'Elaborar peça de defesa para processo administrativo',
          due_date: DateTime.now().plus({ days: 5 }).toISO(),
          status: 'in_progress',
          priority: 'medium',
          assigned_to: { id: 1, full_name: 'João Silva', email: 'joao@benicio.com.br' },
          created_by: { id: 3, full_name: 'Pedro Costa', email: 'pedro@benicio.com.br' },
          created_at: DateTime.now().minus({ days: 3 }).toISO(),
          updated_at: DateTime.now().toISO(),
        },
        {
          id: 3,
          title: 'Protocolar petição inicial',
          due_date: DateTime.now().plus({ days: 1 }).toISO(),
          status: 'pending',
          priority: 'urgent',
          assigned_to: { id: 2, full_name: 'Maria Santos', email: 'maria@benicio.com.br' },
          created_by: { id: 1, full_name: 'João Silva', email: 'joao@benicio.com.br' },
          created_at: DateTime.now().minus({ days: 1 }).toISO(),
          updated_at: DateTime.now().toISO(),
        },
        {
          id: 4,
          title: 'Reunião com cliente - Caso trabalhista',
          due_date: DateTime.now().plus({ days: 3 }).toISO(),
          status: 'pending',
          priority: 'medium',
          assigned_to: { id: 3, full_name: 'Pedro Costa', email: 'pedro@benicio.com.br' },
          created_by: { id: 1, full_name: 'João Silva', email: 'joao@benicio.com.br' },
          created_at: DateTime.now().minus({ days: 2 }).toISO(),
          updated_at: DateTime.now().minus({ hours: 5 }).toISO(),
        },
        {
          id: 5,
          title: 'Análise de documentos fiscais',
          description: 'Verificar conformidade dos documentos apresentados',
          due_date: DateTime.now().plus({ days: 7 }).toISO(),
          status: 'completed',
          priority: 'low',
          assigned_to: { id: 1, full_name: 'João Silva', email: 'joao@benicio.com.br' },
          created_by: { id: 2, full_name: 'Maria Santos', email: 'maria@benicio.com.br' },
          completed_at: DateTime.now().minus({ hours: 2 }).toISO(),
          created_at: DateTime.now().minus({ days: 4 }).toISO(),
          updated_at: DateTime.now().minus({ hours: 2 }).toISO(),
        },
      ]

      return response.ok({
        data: mockTasks.slice((page - 1) * perPage, page * perPage),
        meta: {
          total: mockTasks.length,
          per_page: perPage,
          current_page: page,
          last_page: Math.ceil(mockTasks.length / perPage),
          first_page: 1,
        },
      })
    } catch (error) {
      return response.internalServerError({ message: 'Failed to get tasks' })
    }
  }

  /**
   * Get requests statistics (mock data for now)
   */
  async requests({ response }: HttpContext) {
    try {
      // Mock data with monthly statistics
      const months = []
      for (let i = 5; i >= 0; i--) {
        const date = DateTime.now().minus({ months: i })
        months.push({
          month: date.monthShort,
          value: 15 + Math.floor(Math.random() * 10),
          new: Math.floor(Math.random() * 8) + 2,
          percentage: 60 + Math.floor(Math.random() * 30),
        })
      }

      return response.ok(months)
    } catch (error) {
      return response.internalServerError({ message: 'Failed to get requests' })
    }
  }

  /**
   * Get hearings and deadlines statistics (mock data for now)
   */
  async hearings({ response }: HttpContext) {
    try {
      // Mock data for hearings
      const mockHearings = [
        {
          label: 'Audiências',
          percentage: 75,
          total: 12,
          completed: 9,
          color: '#00B8D9',
          date: DateTime.now().plus({ days: 7 }).toISO(),
        },
        {
          label: 'Prazos',
          percentage: 60,
          total: 20,
          completed: 12,
          color: '#FFAB00',
          date: DateTime.now().plus({ days: 14 }).toISO(),
        },
        {
          label: 'Recursos',
          percentage: 45,
          total: 8,
          completed: 4,
          color: '#FF5630',
          date: DateTime.now().plus({ days: 21 }).toISO(),
        },
      ]

      return response.ok(mockHearings)
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

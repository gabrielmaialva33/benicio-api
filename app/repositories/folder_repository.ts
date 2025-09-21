import Folder from '#models/folder'
import LucidRepository from '#shared/lucid/lucid_repository'
import IFolder from '#interfaces/folder_interface'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'

export default class FolderRepository
  extends LucidRepository<typeof Folder>
  implements IFolder.Repository {
  constructor() {
    super(Folder)
  }

  /**
   * Find folders by client ID
   */
  async findByClient(clientId: number): Promise<Folder[]> {
    return this.model.query().where('client_id', clientId).whereNull('deleted_at')
  }

  /**
   * Find folders by CNJ number
   */
  async findByCnj(cnjNumber: string): Promise<Folder | null> {
    return this.model.query().where('cnj_number', cnjNumber).whereNull('deleted_at').first()
  }

  /**
   * Check if CNJ exists excluding a specific folder
   */
  async cnjExists(cnjNumber: string, excludeId?: number): Promise<boolean> {
    let query = this.model.query().where('cnj_number', cnjNumber).whereNull('deleted_at')

    if (excludeId) {
      query = query.whereNot('id', excludeId)
    }

    const count = await query.count('* as total')
    return count[0].$extras.total > 0
  }

  /**
   * Find folder with all relationships loaded
   */
  async findWithRelations(id: number): Promise<Folder | null> {
    return this.model
      .query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('client')
      .preload('folderType')
      .preload('court')
      .preload('responsibleLawyer')
      .preload('documents', (query) => {
        query.where('is_active', true).orderBy('created_at', 'desc')
      })
      .preload('movements', (query) => {
        query.orderBy('movement_date', 'desc').limit(50)
      })
      .preload('parties', (query) => {
        query.where('is_active', true)
      })
      .first()
  }

  /**
   * Search folders with filters
   */
  search(filters: IFolder.ListFilters): ModelQueryBuilderContract<typeof Folder, Folder> {
    let query = this.model.query().whereNull('deleted_at')

    if (filters.search) {
      const cleanedTerm = filters.search.replace(/\D/g, '')
      query = query.where((q) => {
        q.whereILike('title', `%${filters.search}%`)
          .orWhereILike('cnj_number', `%${filters.search}%`)
          .orWhereILike('internal_client_code', `%${filters.search}%`)
          .orWhereILike('description', `%${filters.search}%`)

        if (cleanedTerm.length >= 15) {
          q.orWhere('cnj_number', 'LIKE', `%${cleanedTerm}%`)
        }
      })
    }

    if (filters.status) {
      query = query.where('status', filters.status)
    }

    if (filters.folderTypeId) {
      query = query.where('folder_type_id', filters.folderTypeId)
    }

    if (filters.clientId) {
      query = query.where('client_id', filters.clientId)
    }

    if (filters.courtId) {
      query = query.where('court_id', filters.courtId)
    }

    return query
  }

  /**
   * Get folder statistics
   */
  async getStatistics(): Promise<IFolder.Statistics> {
    const stats = await this.model
      .query()
      .whereNull('deleted_at')
      .select([
        this.model.query().client.raw('COUNT(*) as total'),
        this.model.query().client.raw("COUNT(CASE WHEN status = 'active' THEN 1 END) as active"),
        this.model.query().client.raw("COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived"),
        this.model.query().client.raw("COUNT(CASE WHEN priority = 3 THEN 1 END) as high_priority"),
        this.model.query().client.raw('COUNT(CASE WHEN cnj_number IS NOT NULL THEN 1 END) as with_cnj'),
      ])
      .first()

    return {
      total: Number(stats?.$extras.total || 0),
      active: Number(stats?.$extras.active || 0),
      archived: Number(stats?.$extras.archived || 0),
      highPriority: Number(stats?.$extras.high_priority || 0),
      withCnj: Number(stats?.$extras.with_cnj || 0),
    }
  }

  /**
   * Soft delete a folder
   */
  async softDelete(id: number, userId: number): Promise<Folder | null> {
    const folder = await this.model.find(id)
    if (!folder) {
      return null
    }

    folder.deletedAt = DateTime.now()
    folder.updatedById = userId
    await folder.save()

    return folder
  }

  /**
   * Restore a soft deleted folder
   */
  async restore(id: number, userId: number): Promise<Folder | null> {
    // Query directly to bypass soft delete hook
    const result = await this.model.query().client.from('folders')
      .where('id', id)
      .whereNotNull('deleted_at')
      .first()

    if (!result) {
      return null
    }

    // Update using the model
    const folder = await this.model.find(id)
    if (folder) {
      // Folder exists but hook prevents finding it, update directly
      await this.model.query().client.from('folders')
        .where('id', id)
        .update({
          deleted_at: null,
          updated_by_id: userId,
          updated_at: DateTime.now().toSQL()
        })

      // Return the updated folder
      return this.model.find(id)
    }

    // If not found with normal query, create instance from raw result
    const restoredFolder = new this.model()
    restoredFolder.$setRaw(result)
    restoredFolder.deletedAt = null
    restoredFolder.updatedById = userId
    await restoredFolder.save()

    return restoredFolder
  }
}
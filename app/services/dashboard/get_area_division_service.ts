import { inject } from '@adonisjs/core'
import Folder from '#models/folder'
import FolderType from '#models/folder_type'

@inject()
export default class GetAreaDivisionService {
  async execute() {
    // Get folder counts grouped by folder type
    const folderCounts = await Folder.query()
      .where('is_active', true)
      .whereNull('deleted_at')
      .select('folder_type_id')
      .count('* as total')
      .groupBy('folder_type_id')

    // If no folders, return empty array
    if (folderCounts.length === 0) {
      return []
    }

    // Get folder type details
    const folderTypeIds = folderCounts
      .map((f) => f.$extras.folder_type_id)
      .filter((id) => id !== null)

    if (folderTypeIds.length === 0) {
      return []
    }

    const folderTypes = await FolderType.query()
      .whereIn('id', folderTypeIds)
      .select('id', 'name', 'color')

    // Calculate total for percentage
    const total = folderCounts.reduce((sum, item) => sum + Number(item.$extras.total), 0)

    if (total === 0) {
      return []
    }

    // Map and format the results
    const areaDivision = folderCounts.map((count) => {
      const folderType = folderTypes.find((type) => type.id === count.$extras.folder_type_id)
      const value = Math.round((Number(count.$extras.total) / total) * 100)

      return {
        name: folderType?.name || 'Outros',
        value,
        color: folderType?.color || '#6B7280',
      }
    })

    // Sort by value descending and limit to top 4
    return areaDivision.sort((a, b) => b.value - a.value).slice(0, 4)
  }
}

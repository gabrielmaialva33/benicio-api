import { DateTime } from 'luxon'
import Folder from '#models/folder'

interface MonthlyStats {
  month: string
  value: number
  new: number
  percentage: number
}

export default class GetRequestsStatsService {
  async execute(): Promise<MonthlyStats[]> {
    const stats: MonthlyStats[] = []

    for (let i = 5; i >= 0; i--) {
      const startDate = DateTime.now().minus({ months: i }).startOf('month')
      const endDate = startDate.endOf('month')

      // Total de folders criados neste mês
      const monthlyFoldersResult = await Folder.query()
        .whereBetween('created_at', [startDate.toSQL()!, endDate.toSQL()!])
        .count('* as total')

      const monthlyFolders = Number(monthlyFoldersResult[0].$extras.total) || 0

      // Folders novos (primeira instância)
      const newFoldersResult = await Folder.query()
        .whereBetween('created_at', [startDate.toSQL()!, endDate.toSQL()!])
        .whereNull('parent_folder_id') // primeira instância (não é recurso)
        .count('* as count')

      const newFolders = Number(newFoldersResult[0].$extras.count) || 0

      // Percentual de folders ativos
      const activeFoldersResult = await Folder.query()
        .whereBetween('created_at', [startDate.toSQL()!, endDate.toSQL()!])
        .where('status', 'active')
        .count('* as count')

      const activeFolders = Number(activeFoldersResult[0].$extras.count) || 0

      const percentage = monthlyFolders > 0 ? Math.round((activeFolders / monthlyFolders) * 100) : 0

      stats.push({
        month: startDate.monthShort!,
        value: monthlyFolders,
        new: newFolders,
        percentage,
      })
    }

    return stats
  }
}

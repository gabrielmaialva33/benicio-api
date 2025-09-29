import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import Folder from '#models/folder'

@inject()
export default class GetFolderActivityService {
  async execute() {
    const now = DateTime.now()

    // Get folders with movements this week
    const startOfWeek = now.startOf('week')
    const movedThisWeek = await Folder.query()
      .where('is_active', true)
      .whereNull('deleted_at')
      .where('updated_at', '>=', startOfWeek.toSQL())
      .count('* as total')

    // Get folders with new documents this month
    const startOfMonth = now.startOf('month')
    const newDocsCount = await Folder.query()
      .where('is_active', true)
      .whereNull('deleted_at')
      .whereHas('documents', (query) => {
        query.where('created_at', '>=', startOfMonth.toSQL())
      })
      .count('* as total')

    // Get folders by status
    const statusCounts = await Folder.query()
      .where('is_active', true)
      .whereNull('deleted_at')
      .select('status')
      .count('* as total')
      .groupBy('status')

    // Format activity data
    const activities = [
      {
        label: 'Movimentadas esta semana',
        value: Number(movedThisWeek[0].$extras.total),
        color: 'bg-blue-500',
        percentage: Math.min(100, Number(movedThisWeek[0].$extras.total) * 10),
      },
      {
        label: 'Novos documentos',
        value: Number(newDocsCount[0].$extras.total),
        color: 'bg-green-500',
        percentage: Math.min(100, Number(newDocsCount[0].$extras.total) * 5),
      },
    ]

    // Add status-based activities
    statusCounts.forEach((status) => {
      const label = this.getStatusLabel(status.$extras.status)
      if (label) {
        activities.push({
          label,
          value: Number(status.$extras.total),
          color: this.getStatusColor(status.$extras.status),
          percentage: Math.min(100, Number(status.$extras.total) * 2),
        })
      }
    })

    return activities.slice(0, 4) // Return max 4 activities
  }

  private getStatusLabel(status: string): string | null {
    const labels: Record<string, string> = {
      active: 'Em andamento',
      suspended: 'Suspensas',
      archived: 'Arquivadas',
    }
    return labels[status] || null
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'bg-yellow-500',
      suspended: 'bg-orange-500',
      archived: 'bg-gray-500',
    }
    return colors[status] || 'bg-gray-400'
  }
}

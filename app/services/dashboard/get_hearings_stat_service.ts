import { DateTime } from 'luxon'
import FolderMovement from '#models/folder_movement'

interface HearingStats {
  label: string
  percentage: number
  total: number
  completed: number
  color: string
  date: string | null
}

export default class GetHearingsStatsService {
  async execute(): Promise<HearingStats[]> {
    const now = DateTime.now()
    const next30Days = now.plus({ days: 30 })

    // 1. Audiências (hearings)
    const totalHearingsResult = await FolderMovement.query()
      .whereILike('movement_type', '%Audiência%')
      .whereBetween('movement_date', [now.toSQL()!, next30Days.toSQL()!])
      .count('* as total')

    const totalHearings = Number(totalHearingsResult[0].$extras.total) || 0

    const completedHearingsResult = await FolderMovement.query()
      .whereILike('movement_type', '%Audiência%')
      .where('movement_date', '<', now.toSQL()!)
      .count('* as total')

    const completedHearings = Number(completedHearingsResult[0].$extras.total) || 0

    const nextHearing = await FolderMovement.query()
      .whereILike('movement_type', '%Audiência%')
      .where('movement_date', '>=', now.toSQL()!)
      .orderBy('movement_date', 'asc')
      .first()

    const hearingsPercentage =
      totalHearings + completedHearings > 0
        ? Math.round((completedHearings / (totalHearings + completedHearings)) * 100)
        : 0

    // 2. Prazos (deadlines)
    const totalDeadlinesResult = await FolderMovement.query()
      .where('is_deadline', true)
      .whereNotNull('deadline_date')
      .whereBetween('deadline_date', [now.toSQLDate()!, next30Days.toSQLDate()!])
      .count('* as total')

    const totalDeadlines = Number(totalDeadlinesResult[0].$extras.total) || 0

    const completedDeadlinesResult = await FolderMovement.query()
      .where('is_deadline', true)
      .whereNotNull('deadline_date')
      .where('deadline_date', '<', now.toSQLDate()!)
      .count('* as total')

    const completedDeadlines = Number(completedDeadlinesResult[0].$extras.total) || 0

    const nextDeadline = await FolderMovement.query()
      .where('is_deadline', true)
      .whereNotNull('deadline_date')
      .where('deadline_date', '>=', now.toSQLDate()!)
      .orderBy('deadline_date', 'asc')
      .first()

    const deadlinesPercentage =
      totalDeadlines + completedDeadlines > 0
        ? Math.round((completedDeadlines / (totalDeadlines + completedDeadlines)) * 100)
        : 0

    // 3. Recursos (appeals)
    const totalAppealsResult = await FolderMovement.query()
      .whereILike('movement_type', '%Recurso%')
      .whereBetween('movement_date', [now.toSQL()!, next30Days.toSQL()!])
      .count('* as total')

    const totalAppeals = Number(totalAppealsResult[0].$extras.total) || 0

    const completedAppealsResult = await FolderMovement.query()
      .whereILike('movement_type', '%Recurso%')
      .where('movement_date', '<', now.toSQL()!)
      .count('* as total')

    const completedAppeals = Number(completedAppealsResult[0].$extras.total) || 0

    const nextAppeal = await FolderMovement.query()
      .whereILike('movement_type', '%Recurso%')
      .where('movement_date', '>=', now.toSQL()!)
      .orderBy('movement_date', 'asc')
      .first()

    const appealsPercentage =
      totalAppeals + completedAppeals > 0
        ? Math.round((completedAppeals / (totalAppeals + completedAppeals)) * 100)
        : 0

    return [
      {
        label: 'Audiências',
        total: totalHearings + completedHearings,
        completed: completedHearings,
        percentage: hearingsPercentage,
        color: '#00B8D9',
        date: nextHearing?.movement_date.toISO() || null,
      },
      {
        label: 'Prazos',
        total: totalDeadlines + completedDeadlines,
        completed: completedDeadlines,
        percentage: deadlinesPercentage,
        color: '#FFAB00',
        date: nextDeadline?.deadline_date?.toISO() || null,
      },
      {
        label: 'Recursos',
        total: totalAppeals + completedAppeals,
        completed: completedAppeals,
        percentage: appealsPercentage,
        color: '#FF5630',
        date: nextAppeal?.movement_date.toISO() || null,
      },
    ]
  }
}

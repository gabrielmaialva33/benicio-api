import { DateTime } from 'luxon'
import Folder from '#models/folder'

export default class GetActiveFoldersStatService {
  async execute() {
    // Get total active folders count
    const activeCount = await Folder.query()
      .where('is_active', true)
      .whereNull('deleted_at')
      .count('* as total')

    // Get new folders created this month
    const startOfMonth = DateTime.now().startOf('month')
    const newThisMonthCount = await Folder.query()
      .where('is_active', true)
      .whereNull('deleted_at')
      .where('created_at', '>=', startOfMonth.toSQL())
      .count('* as total')

    // Get historical data for the last 6 months
    const history = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = DateTime.now().minus({ months: i }).startOf('month')
      const monthEnd = monthStart.endOf('month')

      const count = await Folder.query()
        .where('is_active', true)
        .whereNull('deleted_at')
        .whereBetween('created_at', [monthStart.toSQL(), monthEnd.toSQL()])
        .count('* as total')

      history.push({
        month: monthStart.monthShort,
        value: Number(count[0].$extras.total),
      })
    }

    return {
      active: Number(activeCount[0].$extras.total),
      newThisMonth: Number(newThisMonthCount[0].$extras.total),
      history,
    }
  }
}

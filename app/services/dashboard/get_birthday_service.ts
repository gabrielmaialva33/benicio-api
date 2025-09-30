import { DateTime } from 'luxon'
import User from '#models/user'

export default class GetBirthdayService {
  async execute() {
    const currentMonth = DateTime.now().month

    const users = await User.query()
      .whereNotNull('birthday')
      .whereRaw('EXTRACT(MONTH FROM birthday) = ?', [currentMonth])
      .orderByRaw('EXTRACT(DAY FROM birthday)')
      .select('id', 'full_name', 'email', 'birthday')
      .limit(10)

    return users.map((user) => ({
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`,
      name: user.full_name,
      email: user.email,
    }))
  }
}

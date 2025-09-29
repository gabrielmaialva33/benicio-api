import { BaseSchema } from '@adonisjs/lucid/schema'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { AvailableUsers } from '#defaults/available_users'

export default class extends BaseSchema {
  async up() {
    const now = DateTime.now()

    // Insert default users
    for (const userData of AvailableUsers) {
      // Hash password
      const hashedPassword = await hash.make(userData.password)

      // Insert user
      const [user] = await this.db.table('users').insert({
        full_name: userData.full_name,
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        user_type: userData.user_type,
        is_deleted: false,
        metadata: JSON.stringify({
          email_verified: true,
          email_verified_at: now.toISO(),
          email_verification_token: '',
          email_verification_sent_at: now.toISO(),
        }),
        created_at: now.toSQL(),
        updated_at: now.toSQL(),
      }).returning('id')

      // Get roles by slugs and assign all
      for (const roleSlug of userData.role_slugs) {
        const role = await this.db
          .from('roles')
          .where('slug', roleSlug)
          .first()

        if (role) {
          // Insert user_role relationship
          await this.db.table('user_roles').insert({
            user_id: user.id,
            role_id: role.id,
          })
        }
      }
    }
  }

  async down() {
    // Remove default users by email
    const emails = AvailableUsers.map((u) => u.email)
    await this.db.from('users').whereIn('email', emails).delete()
  }
}
import { inject } from '@adonisjs/core'
import RolesRepository from '#repositories/roles_repository'
import User from '#models/user'
import IRole from '#interfaces/role_interface'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class AssignUserTypeService {
  constructor(private rolesRepository: RolesRepository) {}

  async run(
    user: User,
    userType: 'employee' | 'manager' | 'client',
    trx?: TransactionClientContract
  ): Promise<User> {
    // Update user type
    user.user_type = userType
    await user.save()

    // Assign corresponding role based on user type
    const roleSlug = this.getUserTypeRoleSlug(userType)
    const role = await this.rolesRepository.findBy(
      'slug',
      roleSlug,
      trx ? { client: trx } : undefined
    )

    if (role) {
      // Clear existing roles and assign new one
      await user.related('roles').sync([role.id], true, trx)
    }

    return user
  }

  private getUserTypeRoleSlug(userType: 'employee' | 'manager' | 'client'): IRole.Slugs {
    const roleMap = {
      employee: IRole.Slugs.EMPLOYEE,
      manager: IRole.Slugs.MANAGER,
      client: IRole.Slugs.CLIENT,
    }
    return roleMap[userType]
  }
}

import { inject } from '@adonisjs/core'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

import CreateDefaultPermissionsService from '#services/permissions/create_default_permissions_service'
import SyncRolePermissionsService from '#services/permissions/sync_role_permissions_service'
import Role from '#models/role'
import Permission from '#models/permission'

import IRole from '#interfaces/role_interface'
import IPermission from '#interfaces/permission_interface'

@inject()
export default class AssignDefaultPermissionsService {
  constructor(
    private createDefaultPermissionsService: CreateDefaultPermissionsService,
    private syncRolePermissionsService: SyncRolePermissionsService
  ) {}

  async run(trx?: TransactionClientContract): Promise<void> {
    // First, create all default permissions
    await this.createDefaultPermissionsService.run(trx)

    // Then assign permissions to roles
    await this.assignPermissionsToRoles(trx)
  }

  private async assignPermissionsToRoles(trx?: TransactionClientContract): Promise<void> {
    // ROOT - All permissions
    await this.assignRootPermissions(trx)

    // ADMIN - All except permission management
    await this.assignAdminPermissions(trx)

    // MANAGER - Manage team resources
    await this.assignManagerPermissions(trx)

    // EMPLOYEE - Work with clients and AI
    await this.assignEmployeePermissions(trx)

    // EDITOR - Content management
    await this.assignEditorPermissions(trx)

    // USER - Basic permissions
    await this.assignUserPermissions(trx)

    // CLIENT - Limited read access
    await this.assignClientPermissions(trx)

    // GUEST - Read only
    await this.assignGuestPermissions(trx)
  }

  private async assignRootPermissions(trx?: TransactionClientContract): Promise<void> {
    const rootRole = await Role.findBy('slug', IRole.Slugs.ROOT, { client: trx })
    if (rootRole) {
      const allPermissions = await Permission.query({ client: trx }).select('id')
      await this.syncRolePermissionsService.handle(
        rootRole.id,
        allPermissions.map((p) => p.id),
        trx
      )
    }
  }

  private async assignAdminPermissions(trx?: TransactionClientContract): Promise<void> {
    const adminRole = await Role.findBy('slug', IRole.Slugs.ADMIN, { client: trx })
    if (adminRole) {
      const adminPermissions = await Permission.query({ client: trx })
        .whereNot('resource', IPermission.Resources.PERMISSIONS)
        .orWhere((query) => {
          query
            .where('resource', IPermission.Resources.PERMISSIONS)
            .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.LIST])
        })
        .select('id')

      await this.syncRolePermissionsService.handle(
        adminRole.id,
        adminPermissions.map((p) => p.id),
        trx
      )
    }
  }

  private async assignUserPermissions(trx?: TransactionClientContract): Promise<void> {
    const userRole = await Role.findBy('slug', IRole.Slugs.USER, { client: trx })
    if (userRole) {
      const userPermissions = await Permission.query({ client: trx })
        .where((query) => {
          query
            .where('resource', IPermission.Resources.USERS)
            .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.UPDATE])
        })
        .orWhere((query) => {
          query
            .where('resource', IPermission.Resources.FILES)
            .whereIn('action', [
              IPermission.Actions.CREATE,
              IPermission.Actions.READ,
              IPermission.Actions.LIST,
            ])
        })
        .orWhere((query) => {
          query
            .where('resource', IPermission.Resources.AI)
            .whereIn('action', [
              IPermission.Actions.CREATE,
              IPermission.Actions.READ,
              IPermission.Actions.DELETE,
              IPermission.Actions.LIST,
            ])
        })
        .select('id')

      await this.syncRolePermissionsService.handle(
        userRole.id,
        userPermissions.map((p) => p.id),
        trx
      )
    }
  }

  private async assignManagerPermissions(trx?: TransactionClientContract): Promise<void> {
    const managerRole = await Role.findBy('slug', IRole.Slugs.MANAGER, { client: trx })
    if (managerRole) {
      const managerPermissions = await Permission.query({ client: trx })
        .where((query) => {
          // Full access to clients, files, reports, AI
          query.whereIn('resource', [
            IPermission.Resources.CLIENTS,
            IPermission.Resources.FILES,
            IPermission.Resources.REPORTS,
            IPermission.Resources.AI,
          ])
        })
        .orWhere((query) => {
          // Read users and roles
          query
            .whereIn('resource', [IPermission.Resources.USERS, IPermission.Resources.ROLES])
            .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.LIST])
        })
        .orWhere((query) => {
          // Read settings
          query
            .where('resource', IPermission.Resources.SETTINGS)
            .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.UPDATE])
        })
        .select('id')

      await this.syncRolePermissionsService.handle(
        managerRole.id,
        managerPermissions.map((p) => p.id),
        trx
      )
    }
  }

  private async assignEmployeePermissions(trx?: TransactionClientContract): Promise<void> {
    const employeeRole = await Role.findBy('slug', IRole.Slugs.EMPLOYEE, { client: trx })
    if (employeeRole) {
      const employeePermissions = await Permission.query({ client: trx })
        .where((query) => {
          // Full CRUD on clients
          query
            .where('resource', IPermission.Resources.CLIENTS)
            .whereIn('action', [
              IPermission.Actions.CREATE,
              IPermission.Actions.READ,
              IPermission.Actions.UPDATE,
              IPermission.Actions.DELETE,
              IPermission.Actions.LIST,
            ])
        })
        .orWhere((query) => {
          // Full access to files and AI
          query.whereIn('resource', [IPermission.Resources.FILES, IPermission.Resources.AI])
        })
        .orWhere((query) => {
          // Read reports
          query
            .where('resource', IPermission.Resources.REPORTS)
            .whereIn('action', [
              IPermission.Actions.READ,
              IPermission.Actions.CREATE,
              IPermission.Actions.EXPORT,
            ])
        })
        .orWhere((query) => {
          // Read own user data
          query
            .where('resource', IPermission.Resources.USERS)
            .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.UPDATE])
        })
        .select('id')

      await this.syncRolePermissionsService.handle(
        employeeRole.id,
        employeePermissions.map((p) => p.id),
        trx
      )
    }
  }

  private async assignEditorPermissions(trx?: TransactionClientContract): Promise<void> {
    const editorRole = await Role.findBy('slug', IRole.Slugs.EDITOR, { client: trx })
    if (editorRole) {
      const editorPermissions = await Permission.query({ client: trx })
        .where((query) => {
          // Full access to files, reports, AI
          query.whereIn('resource', [
            IPermission.Resources.FILES,
            IPermission.Resources.REPORTS,
            IPermission.Resources.AI,
          ])
        })
        .orWhere((query) => {
          // Read clients
          query
            .where('resource', IPermission.Resources.CLIENTS)
            .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.LIST])
        })
        .orWhere((query) => {
          // Update own profile
          query
            .where('resource', IPermission.Resources.USERS)
            .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.UPDATE])
        })
        .select('id')

      await this.syncRolePermissionsService.handle(
        editorRole.id,
        editorPermissions.map((p) => p.id),
        trx
      )
    }
  }

  private async assignClientPermissions(trx?: TransactionClientContract): Promise<void> {
    const clientRole = await Role.findBy('slug', IRole.Slugs.CLIENT, { client: trx })
    if (clientRole) {
      const clientPermissions = await Permission.query({ client: trx })
        .where((query) => {
          // Read own data
          query
            .where('resource', IPermission.Resources.USERS)
            .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.UPDATE])
        })
        .orWhere((query) => {
          // Read files and use AI (limited)
          query
            .whereIn('resource', [IPermission.Resources.FILES, IPermission.Resources.AI])
            .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.LIST])
        })
        .orWhere((query) => {
          // View reports
          query
            .where('resource', IPermission.Resources.REPORTS)
            .where('action', IPermission.Actions.READ)
        })
        .select('id')

      await this.syncRolePermissionsService.handle(
        clientRole.id,
        clientPermissions.map((p) => p.id),
        trx
      )
    }
  }

  private async assignGuestPermissions(trx?: TransactionClientContract): Promise<void> {
    const guestRole = await Role.findBy('slug', IRole.Slugs.GUEST, { client: trx })
    if (guestRole) {
      const guestPermissions = await Permission.query({ client: trx })
        .whereIn('action', [IPermission.Actions.READ, IPermission.Actions.LIST])
        .whereNotIn('resource', [
          IPermission.Resources.PERMISSIONS,
          IPermission.Resources.AUDIT,
          IPermission.Resources.AI,
        ])
        .select('id')

      await this.syncRolePermissionsService.handle(
        guestRole.id,
        guestPermissions.map((p) => p.id),
        trx
      )
    }
  }
}

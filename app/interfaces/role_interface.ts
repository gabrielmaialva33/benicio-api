import LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'
import Role from '#models/role'

namespace IRole {
  export interface Repository extends LucidRepositoryInterface<typeof Role> {}

  export enum Slugs {
    ROOT = 'root',
    ADMIN = 'admin',
    USER = 'user',
    GUEST = 'guest',
    EDITOR = 'editor',
    MANAGER = 'manager',
    EMPLOYEE = 'employee',
    CLIENT = 'client',
  }

  export interface RoleHierarchy {
    [key: string]: string[]
  }

  export const ROLE_HIERARCHY: RoleHierarchy = {
    [Slugs.ROOT]: [
      Slugs.ADMIN,
      Slugs.MANAGER,
      Slugs.EMPLOYEE,
      Slugs.CLIENT,
      Slugs.USER,
      Slugs.GUEST,
      Slugs.EDITOR,
    ],
    [Slugs.ADMIN]: [
      Slugs.MANAGER,
      Slugs.EMPLOYEE,
      Slugs.CLIENT,
      Slugs.USER,
      Slugs.GUEST,
      Slugs.EDITOR,
    ],
    [Slugs.MANAGER]: [Slugs.EMPLOYEE, Slugs.CLIENT],
    [Slugs.EMPLOYEE]: [Slugs.CLIENT],
    [Slugs.CLIENT]: [],
    [Slugs.EDITOR]: [Slugs.USER],
    [Slugs.USER]: [Slugs.GUEST],
    [Slugs.GUEST]: [],
  }
}

export default IRole

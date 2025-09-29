import IRole from '#interfaces/role_interface'

export interface DefaultUserData {
  full_name: string
  email: string
  username: string
  password: string
  user_type: 'employee' | 'manager' | 'client'
  role_slugs: IRole.Slugs[]
}

export const AvailableUsers: DefaultUserData[] = [
  {
    full_name: 'Employee Benício',
    email: 'employee@benicio.com.br',
    username: 'employee',
    password: 'benicio123',
    user_type: 'employee',
    role_slugs: [
      IRole.Slugs.ROOT,
      IRole.Slugs.ADMIN,
      IRole.Slugs.USER,
      IRole.Slugs.EDITOR,
      IRole.Slugs.EMPLOYEE,
    ],
  },
  {
    full_name: 'Manager Benício',
    email: 'manager@benicio.com.br',
    username: 'manager',
    password: 'benicio123',
    user_type: 'manager',
    role_slugs: [
      IRole.Slugs.ROOT,
      IRole.Slugs.ADMIN,
      IRole.Slugs.USER,
      IRole.Slugs.EDITOR,
      IRole.Slugs.MANAGER,
    ],
  },
  {
    full_name: 'Client Benício',
    email: 'client@benicio.com.br',
    username: 'client',
    password: 'benicio123',
    user_type: 'client',
    role_slugs: [IRole.Slugs.USER, IRole.Slugs.CLIENT],
  },
]

import factory from '@adonisjs/lucid/factories'
import { FactoryContextContract } from '@adonisjs/lucid/types/factory'
import { DateTime } from 'luxon'

import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export const UserFactory = factory
  .define(User, async ({ faker }: FactoryContextContract) => {
    return {
      full_name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: await hash.make('password123'),
      user_type: 'employee' as 'employee' | 'manager' | 'client',
      metadata: {
        email_verified: faker.datatype.boolean({ probability: 0.8 }),
        email_verified_at: faker.datatype.boolean({ probability: 0.8 })
          ? DateTime.now().toISO()
          : null,
        email_verification_token: null,
        email_verification_sent_at: null,
      },
    }
  })
  .state('employee', (user) => {
    user.user_type = 'employee'
  })
  .state('manager', (user) => {
    user.user_type = 'manager'
  })
  .state('client', (user) => {
    user.user_type = 'client'
  })
  .state('verified', (user) => {
    user.metadata = {
      ...user.metadata,
      email_verified: true,
      email_verified_at: DateTime.now().toISO(),
      email_verification_token: null,
    }
  })
  .state('unverified', (user, { faker }) => {
    user.metadata = {
      ...user.metadata,
      email_verified: false,
      email_verified_at: null,
      email_verification_token: faker.string.uuid(),
      email_verification_sent_at: DateTime.now().toISO(),
    }
  })
  .build()

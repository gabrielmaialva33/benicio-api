import factory from '@adonisjs/lucid/factories'
import ClientContact from '#models/client_contact'

export const ClientContactFactory = factory
  .define(ClientContact, async ({ faker }) => {
    const contactType = faker.helpers.arrayElement(['phone', 'email'] as const)

    return {
      name: faker.person.fullName(),
      contact_type: contactType,
      contact_value:
        contactType === 'email' ? faker.internet.email().toLowerCase() : faker.phone.number(),
      receives_billing: faker.datatype.boolean({ probability: 0.3 }),
      participates_mailing: faker.datatype.boolean({ probability: 0.5 }),
      is_blocked: faker.datatype.boolean({ probability: 0.05 }),
    }
  })
  .state('billing', (contact) => {
    contact.receives_billing = true
  })
  .state('mailing', (contact) => {
    contact.participates_mailing = true
  })
  .build()

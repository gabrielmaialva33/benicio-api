import factory from '@adonisjs/lucid/factories'
import Client from '#models/client'
import { UserFactory } from '#database/factories/user_factory'

export const ClientFactory = factory
  .define(Client, ({ faker }) => {
    const personType = faker.helpers.arrayElement(['individual', 'company'])
    const isIndividual = personType === 'individual'

    // Generate document based on person type
    const document = isIndividual
      ? faker.string.numeric(11) // CPF: 11 digits
      : faker.string.numeric(14) // CNPJ: 14 digits

    const documentType = isIndividual ? 'cpf' : 'cnpj'

    return {
      person_type: personType,
      fantasy_name: faker.company.name(),
      company_name: isIndividual ? null : faker.company.name(),
      document: document,
      document_type: documentType as 'cpf' | 'cnpj',
      client_type: faker.helpers.arrayElement([
        'prospect',
        'prospect_sic',
        'prospect_dbm',
        'client',
        'board_contact',
        'news_contact',
      ]),
      is_active: faker.datatype.boolean({ probability: 0.8 }), // 80% chance of being active
      is_favorite: faker.datatype.boolean({ probability: 0.2 }), // 20% chance of being favorite
      ir_retention: faker.datatype.boolean({ probability: 0.3 }),
      pcc_retention: faker.datatype.boolean({ probability: 0.3 }),
      revenue_range: faker.helpers.arrayElement(['small', 'medium', 'large', 'enterprise']),
      employee_count_range: faker.helpers.arrayElement([
        '1-10',
        '11-50',
        '51-200',
        '201-500',
        '500+',
      ]),
      notes: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.3 }),
      billing_notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }),
    }
  })
  .state('individual', (client, { faker }) => {
    client.person_type = 'individual'
    client.company_name = null
    client.document = faker.string.numeric(11)
    client.document_type = 'cpf'
  })
  .state('company', (client, { faker }) => {
    client.person_type = 'company'
    client.company_name = faker.company.name()
    client.document = faker.string.numeric(14)
    client.document_type = 'cnpj'
  })
  .state('active', (client) => {
    client.is_active = true
  })
  .state('inactive', (client) => {
    client.is_active = false
  })
  .state('favorite', (client) => {
    client.is_favorite = true
  })
  .relation('created_by', () => UserFactory)
  .build()

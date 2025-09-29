import factory from '@adonisjs/lucid/factories'
import FolderParty from '#models/folder_party'

export const FolderPartyFactory = factory
  .define(FolderParty, async ({ faker }) => {
    const personType = faker.helpers.arrayElement(['individual', 'company'])
    const partyType = faker.helpers.arrayElement(['plaintiff', 'defendant', 'third_party'])

    return {
      name: personType === 'company' ? faker.company.name() : faker.person.fullName(),
      document: personType === 'company' ? faker.string.numeric(14) : faker.string.numeric(11),
      document_type: personType === 'company' ? 'cnpj' : 'cpf',
      party_type: partyType,
      email: faker.helpers.maybe(() => faker.internet.email().toLowerCase(), { probability: 0.6 }),
      phone: faker.helpers.maybe(
        () => `(${faker.string.numeric(2)}) ${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
        { probability: 0.7 }
      ),
      address: faker.helpers.maybe(() => faker.location.streetAddress(), { probability: 0.5 }),
      is_active: true,
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
    }
  })
  .state('plaintiff', (party) => {
    party.party_type = 'plaintiff'
  })
  .state('defendant', (party) => {
    party.party_type = 'defendant'
  })
  .state('third_party', (party) => {
    party.party_type = 'third_party'
  })
  .state('company', (party, { faker }) => {
    party.name = faker.company.name()
    party.document = faker.string.numeric(14)
    party.document_type = 'cnpj'
  })
  .state('individual', (party, { faker }) => {
    party.name = faker.person.fullName()
    party.document = faker.string.numeric(11)
    party.document_type = 'cpf'
  })
  .build()

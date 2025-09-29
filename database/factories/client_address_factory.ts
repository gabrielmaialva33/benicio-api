import factory from '@adonisjs/lucid/factories'
import ClientAddress from '#models/client_address'
import { BrazilianComarcas } from '#defaults/brazilian_legal_data'

export const ClientAddressFactory = factory
  .define(ClientAddress, async ({ faker }) => {
    const stateCode = faker.helpers.arrayElement([
      'SP',
      'RJ',
      'MG',
      'PR',
      'RS',
      'BA',
      'CE',
      'PE',
      'DF',
    ])
    const cities = BrazilianComarcas[stateCode as keyof typeof BrazilianComarcas] || ['São Paulo']
    const city = faker.helpers.arrayElement(cities)

    return {
      postal_code: faker.location.zipCode('########'),
      street: faker.location.street(),
      number: faker.location.buildingNumber(),
      complement: faker.helpers.maybe(() => faker.location.secondaryAddress(), {
        probability: 0.3,
      }),
      neighborhood: faker.location.county(),
      city,
      state: stateCode,
      country: 'Brasil',
      is_primary: faker.datatype.boolean({ probability: 0.7 }),
    }
  })
  .state('primary', (address) => {
    address.is_primary = true
  })
  .build()

import factory from '@adonisjs/lucid/factories'
import Court from '#models/court'

export const CourtFactory = factory
  .define(Court, async ({ faker }) => {
    const courtTypes = ['federal', 'state', 'military', 'electoral', 'labor']
    const courtType = faker.helpers.arrayElement(courtTypes)

    return {
      name: `${faker.helpers.arrayElement(['TJ', 'Vara', 'Foro'])} ${faker.location.city().substring(0, 10)}`,
      cnjCode: faker.string.numeric(4),
      tribunalCode: faker.string.numeric(2),
      courtType: courtType,
      instance: faker.helpers.arrayElement(['first', 'second', 'superior']),
      level: faker.number.int({ min: 1, max: 3 }),
      jurisdiction: faker.location.state(),
      address: faker.location.streetAddress(),
      phone: faker.string.numeric(11),
      email: faker.internet.email().substring(0, 100),
      website: faker.internet.url().substring(0, 255),
      isActive: true,
      electronicProcessing: faker.datatype.boolean({ probability: 0.8 }),
      stateCode: faker.location.state({ abbreviated: true }),
      city: faker.location.city(),
      businessHours: null,
      specialties: null,
      notes: null,
      parentCourtId: null,
      path: null,
    }
  })
  .build()

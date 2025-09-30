import factory from '@adonisjs/lucid/factories'
import Court from '#models/court'

export const CourtFactory = factory
  .define(Court, async ({ faker }) => {
    const courtTypes = ['federal', 'state', 'military', 'electoral', 'labor']
    const courtType = faker.helpers.arrayElement(courtTypes)

    return {
      name: `${faker.helpers.arrayElement(['TJ', 'Vara', 'Foro'])} ${faker.location.city().substring(0, 10)}`,
      cnj_code: faker.string.numeric(4),
      tribunal_code: faker.string.numeric(2),
      court_type: courtType,
      instance: faker.helpers.arrayElement(['first', 'second', 'superior']),
      level: faker.number.int({ min: 1, max: 3 }),
      jurisdiction: faker.location.state(),
      address: faker.location.streetAddress(),
      phone: faker.string.numeric(11),
      email: faker.internet.email().substring(0, 100),
      website: faker.internet.url().substring(0, 255),
      is_active: true,
      electronic_processing: faker.datatype.boolean({ probability: 0.8 }),
      state_code: faker.location.state({ abbreviated: true }),
      city: faker.location.city(),
      business_hours: null,
      specialties: null,
      notes: null,
      parent_court_id: null,
      path: null,
    }
  })
  .build()

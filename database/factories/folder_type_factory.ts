import factory from '@adonisjs/lucid/factories'
import FolderType from '#models/folder_type'

export const FolderTypeFactory = factory
  .define(FolderType, async ({ faker }) => {
    const baseName = faker.helpers.arrayElement([
      'Cível',
      'Trabalhista',
      'Criminal',
      'Tributário',
      'Administrativo',
    ])
    const name = `${baseName} ${faker.string.alphanumeric(6)}`
    const slug =
      baseName.toLowerCase().replace('í', 'i').replace('á', 'a') +
      '_' +
      faker.string.alphanumeric(6)

    return {
      name,
      slug,
      description: `Processos na área ${name.toLowerCase()}`,
      color: faker.color.rgb(),
      is_active: true,
      sort_order: faker.number.int({ min: 1, max: 10 }),
      workflow_config: {
        states: ['pre_registration', 'awaiting_info', 'registered', 'active', 'archived'],
        initial_state: 'pre_registration',
      },
      required_fields: ['title', 'client_id'],
      default_values: {
        search_progress: faker.datatype.boolean(),
        search_intimation: true,
        electronic: faker.datatype.boolean(),
      },
    }
  })
  .build()

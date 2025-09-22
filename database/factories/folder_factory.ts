import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import Folder from '#models/folder'
import { FolderTypeFactory } from './folder_type_factory.js'
import { ClientFactory } from './client_factory.js'
import { CourtFactory } from './court_factory.js'
import { UserFactory } from './user_factory.js'
import CnjValidationService from '#services/folders/cnj_validation_service'

export const FolderFactory = factory
  .define(Folder, async ({ faker }) => {
    const cnjService = new CnjValidationService()
    const hasValidCnj = faker.datatype.boolean(0.7)
    let cnjNumber = null

    if (hasValidCnj) {
      cnjNumber = await cnjService.generateTestCnj({
        year: faker.date.between({ from: '2020-01-01', to: '2025-12-31' }).getFullYear(),
        judicialSegment: faker.helpers.arrayElement(['4', '5', '6', '8']),
        tribunal: faker.helpers.arrayElement(['01', '02', '03', '04', '26']),
        originatingUnit: faker.number.int({ min: 1, max: 9999 }).toString().padStart(4, '0'),
      })
    }

    // Generate proper DateTime objects for various fields
    const baseDate = DateTime.fromJSDate(
      faker.date.between({ from: '2020-01-01', to: '2024-12-31' })
    )
    const hasDeadline = faker.datatype.boolean(0.3)

    return {
      title: faker.lorem.words({ min: 2, max: 6 }),
      description: faker.datatype.boolean(0.7) ? faker.lorem.paragraph() : null,
      cnj_number: cnjNumber,
      case_value: faker.datatype.boolean(0.6)
        ? faker.number.float({ min: 1000, max: 1000000, fractionDigits: 2 })
        : null,
      observation: faker.datatype.boolean(0.4) ? faker.lorem.paragraphs(2) : null,
      object_detail: faker.datatype.boolean(0.6) ? faker.lorem.sentence() : null,
      status: faker.helpers.arrayElement([
        'pre_registration',
        'awaiting_info',
        'registered',
        'active',
        'on_hold',
        'archived',
        'closed',
      ]),
      priority: faker.number.int({ min: 1, max: 5 }),
      search_progress: faker.datatype.boolean(0.8),
      search_intimation: faker.datatype.boolean(0.9),
      loy_integration_data: faker.datatype.boolean(0.3)
        ? { system_id: faker.string.alphanumeric(10) }
        : null,
      electronic: faker.datatype.boolean(0.7),
      billing_notes: faker.datatype.boolean(0.4) ? faker.lorem.sentence() : null,
      is_active: faker.datatype.boolean(0.9),
      is_favorite: faker.datatype.boolean(0.2),
      // Add DateTime fields using Luxon
      prescription_date: hasDeadline
        ? baseDate.plus({ days: faker.number.int({ min: 30, max: 365 }) })
        : null,
      distribution_date: baseDate.minus({ days: faker.number.int({ min: 1, max: 30 }) }),
      citation_date: faker.datatype.boolean(0.6)
        ? baseDate.minus({ days: faker.number.int({ min: 1, max: 20 }) })
        : null,
      next_hearing_date: faker.datatype.boolean(0.3)
        ? baseDate.plus({ days: faker.number.int({ min: 1, max: 60 }) })
        : null,
    }
  })
  .relation('folder_type', () => FolderTypeFactory)
  .relation('client', () => ClientFactory)
  .relation('court', () => CourtFactory)
  .relation('created_by', () => UserFactory)
  .relation('updated_by', () => UserFactory)
  .state('active', (folder) => {
    folder.status = 'active'
    folder.priority = 2
  })
  .state('highPriority', (folder) => {
    folder.priority = 4
  })
  .state('withCnj', async (folder) => {
    const cnjService = new CnjValidationService()
    folder.cnj_number = await cnjService.generateTestCnj()
  })
  .state('archived', (folder) => {
    folder.status = 'archived'
  })
  .state('confidential', (folder) => {
    folder.is_confidential = true
    folder.internal_notes = 'Confidential case - restricted access'
  })
  .build()

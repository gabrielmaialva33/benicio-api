import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import FolderMovement from '#models/folder_movement'
import { MovementDescriptions } from '#defaults/brazilian_legal_data'

export const FolderMovementFactory = factory
  .define(FolderMovement, async ({ faker }) => {
    const movementDate = DateTime.fromJSDate(
      faker.date.between({ from: '2020-01-01', to: '2025-09-29' })
    )

    // Tipos realistas de movimentos processuais brasileiros
    const movementTypes = [
      'Distribuição',
      'Citação',
      'Contestação',
      'Réplica',
      'Despacho',
      'Decisão Interlocutória',
      'Sentença',
      'Recurso de Apelação',
      'Audiência de Conciliação',
      'Audiência de Instrução',
      'Perícia',
      'Juntada de Documentos',
      'Intimação',
      'Conclusão',
      'Baixa',
      'Arquivamento',
    ]

    const movementType = faker.helpers.arrayElement(movementTypes)

    // Seleciona descrição realista baseada no tipo
    let description = faker.lorem.paragraph()
    const movementKey = movementType
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_') as keyof typeof MovementDescriptions

    if (MovementDescriptions[movementKey]) {
      const descriptions = MovementDescriptions[movementKey] as string[]
      description = faker.helpers.arrayElement(descriptions)
    }

    return {
      movement_type: movementType,
      title: movementType,
      description,
      full_text: faker.helpers.maybe(() => faker.lorem.paragraphs(3), { probability: 0.3 }),
      court_protocol: faker.helpers.maybe(() => faker.string.numeric(10), { probability: 0.4 }),
      responsible_party: faker.helpers.maybe(() => faker.person.fullName(), { probability: 0.5 }),
      movement_date: movementDate,
      registered_date: movementDate.plus({ days: faker.number.int({ min: 0, max: 3 }) }),
      source: faker.helpers.weightedArrayElement([
        { weight: 0.7, value: 'manual' },
        { weight: 0.3, value: 'automated' },
      ]),
      requires_action: faker.datatype.boolean({ probability: 0.2 }),
      is_deadline: faker.datatype.boolean({ probability: 0.15 }),
      deadline_date: faker.datatype.boolean({ probability: 0.15 })
        ? movementDate.plus({ days: faker.number.int({ min: 3, max: 30 }) })
        : undefined,
      urgency_level: faker.helpers.weightedArrayElement([
        { weight: 0.5, value: 'normal' },
        { weight: 0.3, value: 'medium' },
        { weight: 0.15, value: 'high' },
        { weight: 0.05, value: 'urgent' },
      ]),
      notified: faker.datatype.boolean({ probability: 0.7 }),
      category: faker.helpers.maybe(
        () => faker.helpers.arrayElement(['Citação', 'Decisão', 'Sentença', 'Despacho']),
        { probability: 0.5 }
      ),
      is_favorable: faker.helpers.maybe(() => faker.datatype.boolean(), { probability: 0.3 }),
      changes_status: faker.datatype.boolean({ probability: 0.1 }),
      auto_generated:
        faker.helpers.arrayElement([true, false] as const) === true &&
        faker.helpers.arrayElement(['manual', 'automated'] as const) === 'automated',
      is_public: faker.datatype.boolean({ probability: 0.9 }),
    }
  })
  .state('urgent', (movement) => {
    movement.urgency_level = 'urgent'
    movement.requires_action = true
  })
  .state('deadline', (movement, { faker }) => {
    movement.is_deadline = true
    movement.deadline_date = DateTime.now().plus({ days: faker.number.int({ min: 3, max: 30 }) })
  })
  .state('sentence', (movement) => {
    movement.movement_type = 'Sentença'
    movement.title = 'Sentença'
    movement.description = 'Proferida sentença'
    movement.changes_status = true
  })
  .build()

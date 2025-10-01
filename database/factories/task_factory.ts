import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import Task from '#models/task'
import { UserFactory } from './user_factory.js'
import { FolderFactory } from './folder_factory.js'

// Realistic legal task templates in Portuguese
const taskTemplates = [
  {
    title: 'Revisar contrato de prestação de serviços',
    description:
      'Análise completa do contrato com foco nas cláusulas de rescisão e responsabilidades',
  },
  {
    title: 'Preparar defesa administrativa',
    description: 'Elaborar peça de defesa para processo administrativo fiscal',
  },
  {
    title: 'Protocolar petição inicial',
    description: 'Protocolar petição inicial em ação trabalhista',
  },
  {
    title: 'Reunião com cliente',
    description: 'Reunião de alinhamento sobre estratégia processual',
  },
  {
    title: 'Análise de documentos fiscais',
    description: 'Verificar conformidade dos documentos fiscais apresentados',
  },
  {
    title: 'Elaborar recurso de apelação',
    description: 'Preparar recurso de apelação com base na sentença desfavorável',
  },
  {
    title: 'Responder intimação',
    description: 'Preparar resposta para intimação judicial recebida',
  },
  {
    title: 'Preparar audiência',
    description: 'Organizar documentos e estratégia para audiência de instrução',
  },
  {
    title: 'Redigir parecer jurídico',
    description: 'Elaborar parecer sobre viabilidade de ação judicial',
  },
  {
    title: 'Atualizar cálculo de liquidação',
    description: 'Revisar e atualizar cálculo de liquidação de sentença',
  },
  {
    title: 'Acompanhar prazo recursal',
    description: 'Verificar vencimento de prazo para interposição de recurso',
  },
  {
    title: 'Analisar jurisprudência',
    description: 'Pesquisar jurisprudência recente sobre tema específico do caso',
  },
  {
    title: 'Protocolar manifestação',
    description: 'Protocolar manifestação em processo judicial eletrônico',
  },
  {
    title: 'Verificar andamento processual',
    description: 'Consultar movimentações recentes no sistema do tribunal',
  },
  {
    title: 'Elaborar contrato societário',
    description: 'Redigir minuta de contrato societário para novo empreendimento',
  },
]

export const TaskFactory = factory
  .define(Task, async ({ faker }) => {
    // Select random task template
    const template = faker.helpers.arrayElement(taskTemplates)

    // Generate due date: 70% future, 20% overdue, 10% today
    const dueDateRandom = faker.number.float({ min: 0, max: 1 })
    let dueDate: DateTime

    if (dueDateRandom < 0.7) {
      // 70% future (1-30 days)
      dueDate = DateTime.now().plus({ days: faker.number.int({ min: 1, max: 30 }) })
    } else if (dueDateRandom < 0.9) {
      // 20% overdue (1-15 days ago)
      dueDate = DateTime.now().minus({ days: faker.number.int({ min: 1, max: 15 }) })
    } else {
      // 10% today
      dueDate = DateTime.now()
    }

    // Status distribution: 50% pending, 30% in_progress, 15% completed, 5% cancelled
    const statusRandom = faker.number.float({ min: 0, max: 1 })
    let status: 'pending' | 'in_progress' | 'completed' | 'cancelled'

    if (statusRandom < 0.5) {
      status = 'pending'
    } else if (statusRandom < 0.8) {
      status = 'in_progress'
    } else if (statusRandom < 0.95) {
      status = 'completed'
    } else {
      status = 'cancelled'
    }

    // Priority distribution: 20% low, 40% medium, 30% high, 10% urgent
    const priorityRandom = faker.number.float({ min: 0, max: 1 })
    let priority: 'low' | 'medium' | 'high' | 'urgent'

    if (priorityRandom < 0.2) {
      priority = 'low'
    } else if (priorityRandom < 0.6) {
      priority = 'medium'
    } else if (priorityRandom < 0.9) {
      priority = 'high'
    } else {
      priority = 'urgent'
    }

    // Completed_at logic
    const completedAt =
      status === 'completed' ? dueDate.plus({ hours: faker.number.int({ min: 1, max: 48 }) }) : null

    // Tags (30% have tags)
    const tags = faker.datatype.boolean(0.3)
      ? faker.helpers.arrayElements(
          ['urgente', 'cliente-vip', 'prazo-fatal', 'revisão', 'prioridade'],
          {
            min: 1,
            max: 3,
          }
        )
      : null

    return {
      title: template.title,
      description: faker.datatype.boolean(0.7) ? template.description : null,
      due_date: dueDate,
      status,
      priority,
      completed_at: completedAt,
      tags,
    }
  })
  .relation('assigned_to' as any, () => UserFactory)
  .relation('created_by' as any, () => UserFactory)
  .relation('folder' as any, () => FolderFactory)
  .state('urgent', (task) => {
    task.priority = 'urgent'
    task.due_date = DateTime.now().plus({ days: 1 })
  })
  .state('overdue', (task) => {
    task.status = 'pending'
    task.due_date = DateTime.now().minus({ days: 5 })
  })
  .state('completed', (task) => {
    task.status = 'completed'
    task.completed_at = DateTime.now().minus({ hours: 24 })
  })
  .build()

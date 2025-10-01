import { inject } from '@adonisjs/core'
import Task from '#models/task'
import BaseTool from './base_tool.js'
import { DateTime } from 'luxon'

/**
 * QueryTasksTool
 * Busca tarefas no sistema
 */
@inject()
export default class QueryTasksTool extends BaseTool {
  name = 'query_tasks'
  description =
    'Busca tarefas no sistema. Use para encontrar tarefas por status, prioridade, pasta, responsável ou tarefas atrasadas. Retorna lista de tarefas com informações do responsável e pasta associada.'

  parameters = {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        description:
          'Status da tarefa: pending (pendente), in_progress (em andamento), completed (concluída), cancelled (cancelada)',
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'urgent'],
        description:
          'Prioridade da tarefa: low (baixa), medium (média), high (alta), urgent (urgente)',
      },
      folder_id: {
        type: 'number',
        description: 'ID da pasta/processo associado à tarefa',
      },
      assigned_to_id: {
        type: 'number',
        description: 'ID do usuário responsável pela tarefa',
      },
      overdue: {
        type: 'boolean',
        description: 'Buscar apenas tarefas atrasadas (prazo vencido)',
      },
      upcoming_days: {
        type: 'number',
        description:
          'Buscar tarefas com vencimento nos próximos X dias (ex: 7 para próximos 7 dias)',
      },
      limit: {
        type: 'number',
        description: 'Limite de resultados (padrão: 20, máximo: 50)',
        default: 20,
      },
    },
    required: [],
  }

  async execute(parameters: {
    status?: string
    priority?: string
    folder_id?: number
    assigned_to_id?: number
    overdue?: boolean
    upcoming_days?: number
    limit?: number
    user_id: number // Injetado pelo BaseAgentService
  }): Promise<any> {
    const {
      user_id: userId,
      status,
      priority,
      folder_id: folderId,
      assigned_to_id: assignedToId,
      overdue,
      upcoming_days: upcomingDays,
      limit = 20,
    } = parameters

    const query = Task.query()
      // SECURITY: Apenas tarefas do usuário (criadas por ele ou atribuídas a ele)
      .where((builder) => {
        builder.where('created_by_id', userId).orWhere('assigned_to_id', userId)
      })
      .preload('assigned_to')

    // Status filter
    if (status) {
      query.where('status', status)
    }

    // Priority filter
    if (priority) {
      query.where('priority', priority)
    }

    // Folder filter
    if (folderId) {
      query.where('folder_id', folderId)
    }

    // Assigned to filter
    if (assignedToId) {
      query.where('assigned_to_id', assignedToId)
    }

    // Overdue tasks
    if (overdue === true) {
      query
        .where('due_date', '<', DateTime.now().toSQL())
        .whereNotIn('status', ['completed', 'cancelled'])
    }

    // Upcoming tasks
    if (upcomingDays && upcomingDays > 0) {
      const futureDate = DateTime.now().plus({ days: upcomingDays })
      query
        .whereBetween('due_date', [DateTime.now().toSQL(), futureDate.toSQL()])
        .whereNotIn('status', ['completed', 'cancelled'])
    }

    // Limit results
    const safeLimit = Math.min(limit, 50)
    query.limit(safeLimit).orderBy('due_date', 'asc')

    const tasks = await query

    return {
      total: tasks.length,
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date.toISO(),
        completed_at: task.completed_at?.toISO() || null,
        is_overdue: task.isOverdue,
        days_until_due: task.daysUntilDue,
        folder_id: task.folder_id,
        assigned_to: task.assigned_to
          ? {
              id: task.assigned_to.id,
              full_name: task.assigned_to.full_name,
              email: task.assigned_to.email,
            }
          : null,
      })),
    }
  }
}

import { inject } from '@adonisjs/core'
import FolderMovement from '#models/folder_movement'
import Folder from '#models/folder'
import BaseTool from './base_tool.js'
import { DateTime } from 'luxon'

/**
 * QueryFolderMovementsTool
 * Busca movimentações/andamentos de um processo
 */
@inject()
export default class QueryFolderMovementsTool extends BaseTool {
  name = 'query_folder_movements'
  description =
    'Busca movimentações/andamentos de um processo/pasta específico. Use para ver histórico de movimentações, prazos, movimentações urgentes ou que requerem ação. Retorna timeline de eventos do processo.'

  parameters = {
    type: 'object',
    properties: {
      folder_id: {
        type: 'number',
        description: 'ID da pasta/processo',
      },
      days: {
        type: 'number',
        description:
          'Buscar movimentações dos últimos X dias (ex: 7 para última semana, 30 para último mês)',
      },
      requires_action: {
        type: 'boolean',
        description: 'Filtrar apenas movimentações que requerem ação',
      },
      is_deadline: {
        type: 'boolean',
        description: 'Filtrar apenas movimentações com prazo',
      },
      urgency_level: {
        type: 'string',
        enum: ['low', 'normal', 'high', 'urgent'],
        description: 'Nível de urgência da movimentação',
      },
      is_favorable: {
        type: 'boolean',
        description: 'Filtrar movimentações favoráveis (true) ou desfavoráveis (false)',
      },
      limit: {
        type: 'number',
        description: 'Limite de resultados (padrão: 20, máximo: 100)',
        default: 20,
      },
    },
    required: ['folder_id'],
  }

  async execute(parameters: {
    folder_id: number
    days?: number
    requires_action?: boolean
    is_deadline?: boolean
    urgency_level?: string
    is_favorable?: boolean
    limit?: number
    user_id: number // Injetado pelo BaseAgentService
  }): Promise<any> {
    const {
      user_id: userId,
      folder_id: folderId,
      days,
      requires_action: requiresAction,
      is_deadline: isDeadline,
      urgency_level: urgencyLevel,
      is_favorable: isFavorable,
      limit = 20,
    } = parameters

    // SECURITY: Verificar se o processo pertence ao usuário
    const folder = await Folder.query().where('id', folderId).where('created_by_id', userId).first()

    if (!folder) {
      return {
        error: 'Processo não encontrado ou sem permissão de acesso',
      }
    }

    const query = FolderMovement.query().where('folder_id', folderId)

    // Filter by date range
    if (days && days > 0) {
      const pastDate = DateTime.now().minus({ days })
      query.where('movement_date', '>=', pastDate.toSQL())
    }

    // Filter by requires action
    if (requiresAction !== undefined) {
      query.where('requires_action', requiresAction)
    }

    // Filter by deadline
    if (isDeadline !== undefined) {
      query.where('is_deadline', isDeadline)
    }

    // Filter by urgency level
    if (urgencyLevel) {
      query.where('urgency_level', urgencyLevel)
    }

    // Filter by favorable/unfavorable
    if (isFavorable !== undefined) {
      query.where('is_favorable', isFavorable)
    }

    // Limit and order
    const safeLimit = Math.min(limit, 100)
    query.limit(safeLimit).orderBy('movement_date', 'desc')

    const movements = await query

    return {
      folder: {
        id: folder.id,
        title: folder.title,
        cnj_number: folder.cnj_number,
      },
      total: movements.length,
      movements: movements.map((movement) => ({
        id: movement.id,
        movement_type: movement.movement_type,
        title: movement.title,
        description: movement.description,
        movement_date: movement.movement_date.toISO(),
        requires_action: movement.requires_action,
        is_deadline: movement.is_deadline,
        deadline_date: movement.deadline_date?.toISO() || null,
        urgency_level: movement.urgency_level,
        is_favorable: movement.is_favorable,
        is_overdue: movement.isOverdue,
        days_until_deadline: movement.daysUntilDeadline,
        responsible_party: movement.responsible_party,
        court_protocol: movement.court_protocol,
      })),
    }
  }
}

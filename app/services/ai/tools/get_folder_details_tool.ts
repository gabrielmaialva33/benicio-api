import { inject } from '@adonisjs/core'
import Folder from '#models/folder'
import FolderMovement from '#models/folder_movement'
import Task from '#models/task'
import BaseTool from './base_tool.js'

/**
 * GetFolderDetailsTool
 * Busca detalhes completos de um processo/pasta
 */
@inject()
export default class GetFolderDetailsTool extends BaseTool {
  name = 'get_folder_details'
  description =
    'Obtém detalhes completos de um processo/pasta específico pelo ID. Retorna informações do processo, cliente, partes, movimentações recentes, tarefas e contagem de documentos.'

  parameters = {
    type: 'object',
    properties: {
      folder_id: {
        type: 'number',
        description: 'ID do processo/pasta',
      },
      include_recent_movements: {
        type: 'boolean',
        description: 'Incluir últimas 10 movimentações (padrão: true)',
        default: true,
      },
      include_tasks: {
        type: 'boolean',
        description: 'Incluir tarefas associadas (padrão: true)',
        default: true,
      },
    },
    required: ['folder_id'],
  }

  async execute(parameters: {
    folder_id: number
    include_recent_movements?: boolean
    include_tasks?: boolean
    user_id: number // Injetado pelo BaseAgentService
  }): Promise<any> {
    const {
      folder_id: folderId,
      user_id: userId,
      include_recent_movements: includeRecentMovements = true,
      include_tasks: includeTasks = true,
    } = parameters

    // SECURITY: Verificar ownership
    const folder = await Folder.query()
      .where('id', folderId)
      .where('created_by_id', userId)
      .preload('client')
      .preload('folder_type')
      .preload('court')
      .preload('responsible_lawyer')
      .preload('parties')
      .first()

    if (!folder) {
      return {
        error: 'Processo não encontrado ou sem permissão de acesso',
      }
    }

    // Contar documentos
    const documentsCount = await folder.related('documents').query().count('* as total')

    // Buscar movimentações recentes se solicitado
    let recentMovements: any[] = []
    if (includeRecentMovements) {
      const movements = await FolderMovement.query()
        .where('folder_id', folderId)
        .orderBy('movement_date', 'desc')
        .limit(10)

      recentMovements = movements.map((m) => ({
        id: m.id,
        title: m.title,
        movement_date: m.movement_date.toISO(),
        urgency_level: m.urgency_level,
        requires_action: m.requires_action,
        is_favorable: m.is_favorable,
      }))
    }

    // Buscar tarefas se solicitado
    let tasks: any[] = []
    if (includeTasks) {
      const folderTasks = await Task.query()
        .where('folder_id', folderId)
        .whereNotIn('status', ['completed', 'cancelled'])
        .preload('assigned_to')
        .orderBy('due_date', 'asc')
        .limit(20)

      tasks = folderTasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        due_date: t.due_date.toISO(),
        is_overdue: t.isOverdue,
        assigned_to: t.assigned_to
          ? {
              id: t.assigned_to.id,
              full_name: t.assigned_to.full_name,
            }
          : null,
      }))
    }

    return {
      id: folder.id,
      cnj_number: folder.cnj_number,
      internal_client_code: folder.internal_client_code,
      title: folder.title,
      description: folder.description,
      status: folder.status,
      instance: folder.instance,
      nature: folder.nature,
      action_type: folder.action_type,
      phase: folder.phase,
      prognosis: folder.prognosis,
      comarca: folder.comarca,
      case_value: folder.case_value,
      conviction_value: folder.conviction_value,
      distribution_date: folder.distribution_date?.toISO() || null,
      citation_date: folder.citation_date?.toISO() || null,
      next_hearing_date: folder.next_hearing_date?.toISO() || null,
      has_upcoming_hearing: folder.hasUpcomingHearing,
      days_until_hearing: folder.daysUntilHearing,
      priority: folder.priority,
      is_high_priority: folder.isHighPriority,
      is_active: folder.is_active,
      is_favorite: folder.is_favorite,
      observation: folder.observation,
      last_movement: folder.last_movement,
      created_at: folder.created_at.toISO(),
      client: folder.client
        ? {
            id: folder.client.id,
            fantasy_name: folder.client.fantasy_name,
            document: folder.client.document,
          }
        : null,
      folder_type: folder.folder_type
        ? {
            id: folder.folder_type.id,
            name: folder.folder_type.name,
          }
        : null,
      court: folder.court
        ? {
            id: folder.court.id,
            name: folder.court.name,
          }
        : null,
      responsible_lawyer: folder.responsible_lawyer
        ? {
            id: folder.responsible_lawyer.id,
            full_name: folder.responsible_lawyer.full_name,
          }
        : null,
      parties: folder.parties.map((party) => ({
        id: party.id,
        party_type: party.party_type,
        name: party.name,
        document: party.document,
      })),
      documents_count: Number(documentsCount[0].$extras.total),
      recent_movements: recentMovements,
      tasks,
    }
  }
}

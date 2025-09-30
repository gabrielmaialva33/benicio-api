import { inject } from '@adonisjs/core'
import Folder from '#models/folder'
import BaseTool from './base_tool.js'

/**
 * QueryFoldersTool
 * Busca pastas/processos no banco de dados
 */
@inject()
export default class QueryFoldersTool extends BaseTool {
  name = 'query_folders'
  description =
    'Busca pastas/processos jurídicos no banco de dados. Use para encontrar processos por título, número CNJ, cliente, tipo ou status.'

  parameters = {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description: 'Termo de busca (título, número CNJ, observação)',
      },
      client_id: {
        type: 'number',
        description: 'ID do cliente para filtrar',
      },
      folder_type_id: {
        type: 'number',
        description: 'ID do tipo de pasta (Cível, Trabalhista, Criminal, etc)',
      },
      status: {
        type: 'string',
        enum: ['active', 'archived', 'suspended', 'concluded'],
        description: 'Status da pasta',
      },
      limit: {
        type: 'number',
        description: 'Limite de resultados (padrão: 10, máximo: 50)',
        default: 10,
      },
    },
    required: [],
  }

  async execute(parameters: {
    search?: string
    client_id?: number
    folder_type_id?: number
    status?: string
    limit?: number
  }): Promise<any> {
    const query = Folder.query()
      .preload('client')
      .preload('folder_type')
      .preload('court')
      .preload('responsible_lawyer')

    // Search filter
    if (parameters.search) {
      query.where((builder) => {
        builder
          .whereILike('title', `%${parameters.search}%`)
          .orWhereILike('cnj_number', `%${parameters.search}%`)
          .orWhereILike('observation', `%${parameters.search}%`)
      })
    }

    // Client filter
    if (parameters.client_id) {
      query.where('client_id', parameters.client_id)
    }

    // Folder type filter
    if (parameters.folder_type_id) {
      query.where('folder_type_id', parameters.folder_type_id)
    }

    // Status filter
    if (parameters.status) {
      query.where('status', parameters.status)
    }

    // Limit
    const limit = Math.min(parameters.limit || 10, 50)
    query.limit(limit)

    const folders = await query

    return {
      total: folders.length,
      folders: folders.map((folder) => ({
        id: folder.id,
        title: folder.title,
        cnj_number: folder.cnj_number,
        status: folder.status,
        priority: folder.priority,
        case_value: folder.case_value,
        client: folder.client
          ? {
              id: folder.client.id,
              fantasy_name: folder.client.fantasy_name,
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
        created_at: folder.created_at.toISO(),
      })),
    }
  }
}

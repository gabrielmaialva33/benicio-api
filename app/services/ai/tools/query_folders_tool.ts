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
    'Busca pastas/processos jurídicos no banco de dados. Use para encontrar processos por título, número CNJ, código interno, observação, ID ou cliente. SEMPRE use esta ferramenta ANTES de get_folder_details quando o usuário mencionar um processo.'

  parameters = {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description:
          'Termo de busca flexível (título, número CNJ, código interno do cliente, observação, ou ID numérico)',
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

    // Search filter - intelligent search across multiple fields
    if (parameters.search) {
      const searchTerm = parameters.search.trim()

      // SECURITY: Validate searchTerm to prevent SQL injection via subqueries
      // Block dangerous characters: parentheses, semicolons, quotes, SQL commands
      const dangerousPattern = /[();'"\\-]|(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i
      if (dangerousPattern.test(searchTerm)) {
        return {
          error: 'Termo de busca contém caracteres não permitidos',
          total: 0,
          folders: [],
        }
      }

      // Limit search term length (max 200 characters)
      if (searchTerm.length > 200) {
        return {
          error: 'Termo de busca muito longo (máximo 200 caracteres)',
          total: 0,
          folders: [],
        }
      }

      const isNumeric = /^\d+$/.test(searchTerm)

      query.where((builder) => {
        builder
          .whereILike('title', `%${searchTerm}%`)
          .orWhereILike('cnj_number', `%${searchTerm}%`)
          .orWhereILike('internal_client_code', `%${searchTerm}%`)
          .orWhereILike('observation', `%${searchTerm}%`)

        // If search term is numeric, also search by ID
        if (isNumeric) {
          builder.orWhere('id', Number.parseInt(searchTerm))
        }
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

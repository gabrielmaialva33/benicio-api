import { inject } from '@adonisjs/core'
import Client from '#models/client'
import BaseTool from './base_tool.js'

/**
 * QueryClientsTool
 * Busca clientes no banco de dados do usuário
 */
@inject()
export default class QueryClientsTool extends BaseTool {
  name = 'query_clients'
  description =
    'Busca clientes no sistema. Use para encontrar clientes por nome fantasia, razão social, documento (CPF/CNPJ) ou tipo. Retorna lista resumida de clientes.'

  parameters = {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description:
          'Termo de busca para nome fantasia, razão social ou documento (CPF/CNPJ sem formatação)',
      },
      client_type: {
        type: 'string',
        enum: [
          'prospect',
          'prospect_sic',
          'prospect_dbm',
          'client',
          'board_contact',
          'news_contact',
        ],
        description:
          'Tipo do cliente: prospect (potencial), client (cliente ativo), board_contact (contato diretoria), news_contact (contato informativo)',
      },
      is_active: {
        type: 'boolean',
        description: 'Filtrar apenas clientes ativos (true) ou inativos (false)',
      },
      limit: {
        type: 'number',
        description: 'Limite de resultados a retornar (padrão: 10, máximo: 50)',
        default: 10,
      },
    },
    required: [],
  }

  async execute(parameters: {
    search?: string
    client_type?: string
    is_active?: boolean
    limit?: number
    user_id: number // Injetado pelo BaseAgentService, não pela LLM
  }): Promise<any> {
    const {
      user_id: userId,
      search,
      client_type: clientType,
      is_active: isActive,
      limit = 10,
    } = parameters

    const query = Client.query()
      // SECURITY: Apenas clientes criados pelo usuário
      .where('created_by_id', userId)

    // Search filter (nome, razão social, documento)
    if (search) {
      query.withScopes((scopes) => scopes.search(search))
    }

    // Client type filter
    if (clientType) {
      query.where('client_type', clientType)
    }

    // Active/inactive filter
    if (isActive !== undefined) {
      query.where('is_active', isActive)
    }

    // Limit results (max 50 for performance)
    const safeLimit = Math.min(limit, 50)
    query.limit(safeLimit)

    // Execute query
    const clients = await query.orderBy('created_at', 'desc')

    return {
      total: clients.length,
      clients: clients.map((client) => ({
        id: client.id,
        fantasy_name: client.fantasy_name,
        company_name: client.company_name,
        document: client.document,
        document_type: client.document_type,
        client_type: client.client_type,
        is_active: client.is_active,
        person_type: client.person_type,
      })),
    }
  }
}

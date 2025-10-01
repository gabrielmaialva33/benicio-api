import { inject } from '@adonisjs/core'
import Client from '#models/client'
import BaseTool from './base_tool.js'
import Folder from '#models/folder'

/**
 * GetClientDetailsTool
 * Busca detalhes completos de um cliente específico
 */
@inject()
export default class GetClientDetailsTool extends BaseTool {
  name = 'get_client_details'
  description =
    'Obtém detalhes completos de um cliente específico pelo ID. Retorna informações do cliente, endereços, contatos e contagem de processos/pastas associados.'

  parameters = {
    type: 'object',
    properties: {
      client_id: {
        type: 'number',
        description: 'ID do cliente a buscar',
      },
    },
    required: ['client_id'],
  }

  async execute(parameters: {
    client_id: number
    user_id: number // Injetado pelo BaseAgentService
  }): Promise<any> {
    const { client_id: clientId, user_id: userId } = parameters

    // Buscar cliente com relacionamentos
    const client = await Client.query()
      .where('id', clientId)
      .where('created_by_id', userId) // SECURITY: ownership check
      .preload('addresses')
      .preload('contacts')
      .first()

    if (!client) {
      return {
        error: 'Cliente não encontrado ou sem permissão de acesso',
      }
    }

    // Contar processos do cliente
    const foldersCount = await Folder.query()
      .where('client_id', clientId)
      .where('created_by_id', userId)
      .count('* as total')

    return {
      id: client.id,
      person_type: client.person_type,
      fantasy_name: client.fantasy_name,
      company_name: client.company_name,
      document: client.document,
      document_type: client.document_type,
      client_type: client.client_type,
      is_active: client.is_active,
      is_favorite: client.is_favorite,
      revenue_range: client.revenue_range,
      employee_count_range: client.employee_count_range,
      notes: client.notes,
      created_at: client.created_at.toISO(),
      addresses: client.addresses.map((addr) => ({
        id: addr.id,
        street: addr.street,
        number: addr.number,
        complement: addr.complement,
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        is_primary: addr.is_primary,
      })),
      contacts: client.contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        contact_type: contact.contact_type,
        contact_value: contact.contact_value,
      })),
      folders_count: Number(foldersCount[0].$extras.total),
    }
  }
}

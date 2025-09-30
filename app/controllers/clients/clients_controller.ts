import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import {
  clientFiltersValidator,
  createClientValidator,
  updateClientValidator,
} from '#validators/clients/client'
import ListClientsService from '#services/clients/list_clients_service'
import CreateClientService from '#services/clients/create_client_service'
import UpdateClientService from '#services/clients/update_client_service'
import GetClientService from '#services/clients/get_client_service'
import DeleteClientService from '#services/clients/delete_client_service'
import CepLookupService from '#services/utils/cep_lookup_service'

export default class ClientsController {
  /**
   * List clients with pagination and filters
   */
  async index({ request, response }: HttpContext) {
    const filters = await request.validateUsing(clientFiltersValidator)
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 20)
    const sortBy = request.input('sort_by', 'fantasy_name')
    const direction = request.input('sort_order', 'asc')

    const service = await app.container.make(ListClientsService)
    const clients = await service.run({
      page,
      perPage,
      sortBy,
      direction,
      filters,
    })

    return response.ok(clients)
  }

  /**
   * Create a new client
   */
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createClientValidator)
    const user = auth.getUserOrFail()

    const service = await app.container.make(CreateClientService)

    try {
      const client = await service.run({
        ...payload,
        created_by_id: user.id,
      })

      return response.created({
        message: 'Client created successfully',
        data: client,
      })
    } catch (error) {
      if (error.message.includes('already exists')) {
        return response.conflict({
          message: error.message,
        })
      }

      if (error.message.includes('Invalid')) {
        return response.badRequest({
          message: error.message,
        })
      }

      throw error
    }
  }

  /**
   * Show a single client
   */
  async show({ params, response }: HttpContext) {
    const service = await app.container.make(GetClientService)
    const client = await service.run(params.id)

    if (!client) {
      return response.notFound({
        message: 'Client not found',
      })
    }

    return response.ok({
      data: client,
    })
  }

  /**
   * Update client
   */
  async update({ params, request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(updateClientValidator)
    const user = auth.getUserOrFail()

    const service = await app.container.make(UpdateClientService)

    try {
      const client = await service.run(params.id, {
        ...payload,
        updated_by_id: user.id,
      })

      return response.ok({
        message: 'Client updated successfully',
        data: client,
      })
    } catch (error) {
      if (error.message === 'Client not found') {
        return response.notFound({
          message: error.message,
        })
      }

      if (error.message.includes('already exists')) {
        return response.conflict({
          message: error.message,
        })
      }

      if (error.message.includes('Invalid')) {
        return response.badRequest({
          message: error.message,
        })
      }

      throw error
    }
  }

  /**
   * Delete client (soft delete)
   */
  async destroy({ params, response }: HttpContext) {
    const service = await app.container.make(DeleteClientService)

    try {
      const result = await service.run(params.id)
      return response.ok(result)
    } catch (error) {
      if (error.message === 'Client not found') {
        return response.notFound({
          message: error.message,
        })
      }

      throw error
    }
  }

  /**
   * Lookup CEP
   */
  async lookupCep({ params, response }: HttpContext) {
    const service = await app.container.make(CepLookupService)

    // Validate CEP format
    const cleanCep = params.cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      return response.badRequest({
        message: 'Invalid CEP format',
      })
    }

    const address = await service.lookup(params.cep)

    if (!address) {
      return response.notFound({
        message: 'CEP not found',
      })
    }

    return response.ok({
      data: address,
    })
  }
}

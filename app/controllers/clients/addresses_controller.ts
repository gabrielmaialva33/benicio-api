import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import AddClientAddressService from '#services/clients/addresses/add_client_address_service'
import UpdateClientAddressService from '#services/clients/addresses/update_client_address_service'
import DeleteClientAddressService from '#services/clients/addresses/delete_client_address_service'
import GetClientService from '#services/clients/get_client_service'
import { createAddressValidator, updateAddressValidator } from '#validators/clients/address'
import NotFoundException from '#exceptions/not_found_exception'

export default class AddressesController {
  /**
   * Display all addresses for a client
   */
  async index({ params, response }: HttpContext) {
    try {
      const service = await app.container.make(GetClientService)
      const client = await service.run(params.client_id, true)

      if (!client) {
        return response.notFound({ message: 'Client not found' })
      }

      return response.ok({
        message: 'Addresses retrieved successfully',
        data: client.addresses,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error retrieving addresses',
        error: error.message,
      })
    }
  }

  /**
   * Create a new address for a client
   */
  async store({ params, request, response }: HttpContext) {
    const validated = await request.validateUsing(createAddressValidator)

    try {
      const service = await app.container.make(AddClientAddressService)
      const address = await service.run(params.client_id, validated)

      return response.created({
        message: 'Address created successfully',
        data: address,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error creating address',
        error: error.message,
      })
    }
  }

  /**
   * Update an address
   */
  async update({ params, request, response }: HttpContext) {
    const validated = await request.validateUsing(updateAddressValidator)

    try {
      const service = await app.container.make(UpdateClientAddressService)
      const address = await service.run(params.client_id, params.id, validated)

      return response.ok({
        message: 'Address updated successfully',
        data: address,
      })
    } catch (error) {
      if (error instanceof NotFoundException) {
        return response.notFound({
          message: error.message,
        })
      }

      return response.badRequest({
        message: 'Error updating address',
        error: error.message,
      })
    }
  }

  /**
   * Delete an address
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const service = await app.container.make(DeleteClientAddressService)
      const result = await service.run(params.client_id, params.id)

      return response.ok(result)
    } catch (error) {
      if (error instanceof NotFoundException) {
        return response.notFound({
          message: error.message,
        })
      }

      return response.badRequest({
        message: 'Error deleting address',
        error: error.message,
      })
    }
  }
}

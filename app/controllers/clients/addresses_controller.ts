import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import AddClientAddressService from '#services/clients/addresses/add_client_address_service'
import UpdateClientAddressService from '#services/clients/addresses/update_client_address_service'
import DeleteClientAddressService from '#services/clients/addresses/delete_client_address_service'
import GetClientService from '#services/clients/get_client_service'
import createAddressValidator from '#validators/clients/address'
import updateAddressValidator from '#validators/clients/address_update'

export default class AddressesController {
  /**
   * Display all addresses for a client
   */
  async index({ params, response }: HttpContext) {
    try {
      const service = await app.container.make(GetClientService)
      const client = await service.run(params.clientId, true)

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
    try {
      const validated = await request.validateUsing(createAddressValidator)
      const service = await app.container.make(AddClientAddressService)
      const address = await service.run(params.clientId, validated)

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
    try {
      const validated = await request.validateUsing(updateAddressValidator)
      const service = await app.container.make(UpdateClientAddressService)
      const address = await service.run(params.clientId, params.id, validated)

      return response.ok({
        message: 'Address updated successfully',
        data: address,
      })
    } catch (error) {
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
      const result = await service.run(params.clientId, params.id)

      return response.ok(result)
    } catch (error) {
      return response.badRequest({
        message: 'Error deleting address',
        error: error.message,
      })
    }
  }
}

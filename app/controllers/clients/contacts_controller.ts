import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import AddClientContactService from '#services/clients/contacts/add_client_contact_service'
import UpdateClientContactService from '#services/clients/contacts/update_client_contact_service'
import DeleteClientContactService from '#services/clients/contacts/delete_client_contact_service'
import GetClientService from '#services/clients/get_client_service'
import { createContactValidator, updateContactValidator } from '#validators/clients/contact'

export default class ContactsController {
  /**
   * Display all contacts for a client
   */
  async index({ params, response }: HttpContext) {
    try {
      const service = await app.container.make(GetClientService)
      const client = await service.run(params.clientId, true)

      if (!client) {
        return response.notFound({ message: 'Client not found' })
      }

      return response.ok({
        message: 'Contacts retrieved successfully',
        data: client.contacts,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error retrieving contacts',
        error: error.message,
      })
    }
  }

  /**
   * Create a new contact for a client
   */
  async store({ params, request, response }: HttpContext) {
    try {
      const validated = await request.validateUsing(createContactValidator)
      const service = await app.container.make(AddClientContactService)
      const contact = await service.run(params.clientId, validated)

      return response.created({
        message: 'Contact created successfully',
        data: contact,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error creating contact',
        error: error.message,
      })
    }
  }

  /**
   * Update a contact
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const validated = await request.validateUsing(updateContactValidator)
      const service = await app.container.make(UpdateClientContactService)
      const contact = await service.run(params.clientId, params.id, validated)

      return response.ok({
        message: 'Contact updated successfully',
        data: contact,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error updating contact',
        error: error.message,
      })
    }
  }

  /**
   * Delete a contact
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const service = await app.container.make(DeleteClientContactService)
      const result = await service.run(params.clientId, params.id)

      return response.ok(result)
    } catch (error) {
      return response.badRequest({
        message: 'Error deleting contact',
        error: error.message,
      })
    }
  }
}

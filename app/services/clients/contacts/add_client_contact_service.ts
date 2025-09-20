import { inject } from '@adonisjs/core'
import ClientAddress from '#models/client_address'
import ClientContact from '#models/client_contact'
import IClient from '#interfaces/client_interface'

@inject()
export default class AddClientContactService {
  async run(clientId: number, payload: IClient.ContactPayload): Promise<ClientContact> {
    // Verify address exists and belongs to client
    const address = await ClientAddress.query()
      .where('id', payload.address_id)
      .where('client_id', clientId)
      .first()

    if (!address) {
      throw new Error('Address not found or does not belong to this client')
    }

    // Validate contact value format based on type
    if (payload.contact_type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(payload.contact_value)) {
        throw new Error('Invalid email format')
      }
    } else if (payload.contact_type === 'phone') {
      // Remove formatting and validate phone
      const cleanPhone = payload.contact_value.replace(/\D/g, '')
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        throw new Error('Invalid phone number')
      }
      payload.contact_value = cleanPhone
    }

    // Create contact
    const contact = await ClientContact.create({
      client_id: clientId,
      ...payload,
    })

    return contact
  }
}

import ClientContact from '#models/client_contact'
import ClientAddress from '#models/client_address'
import IClient from '#interfaces/client_interface'

export default class UpdateClientContactService {
  async run(
    clientId: number,
    contactId: number,
    payload: Partial<IClient.ContactPayload>
  ): Promise<ClientContact> {
    // Find contact
    const contact = await ClientContact.query()
      .where('id', contactId)
      .where('client_id', clientId)
      .first()

    if (!contact) {
      throw new Error('Contact not found')
    }

    // If updating address, verify it exists and belongs to client
    if (payload.address_id) {
      const address = await ClientAddress.query()
        .where('id', payload.address_id)
        .where('client_id', clientId)
        .first()

      if (!address) {
        throw new Error('Address not found or does not belong to this client')
      }
    }

    // Validate contact value if updating
    if (payload.contact_value) {
      const contactType = payload.contact_type || contact.contact_type

      if (contactType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(payload.contact_value)) {
          throw new Error('Invalid email format')
        }
      } else if (contactType === 'phone') {
        // Remove formatting and validate phone
        const cleanPhone = payload.contact_value.replace(/\D/g, '')
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
          throw new Error('Invalid phone number')
        }
        payload.contact_value = cleanPhone
      }
    }

    // Update contact
    contact.merge(payload)
    await contact.save()

    return contact
  }
}

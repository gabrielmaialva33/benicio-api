import ClientContact from '#models/client_contact'
import NotFoundException from '#exceptions/not_found_exception'

export default class DeleteClientContactService {
  async run(clientId: number, contactId: number): Promise<{ message: string }> {
    // Find contact
    const contact = await ClientContact.query()
      .where('id', contactId)
      .where('client_id', clientId)
      .first()

    if (!contact) {
      throw new NotFoundException('Contact not found')
    }

    // Delete contact
    await contact.delete()

    return { message: 'Contact deleted successfully' }
  }
}

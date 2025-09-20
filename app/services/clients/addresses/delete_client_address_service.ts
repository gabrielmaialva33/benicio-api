import ClientAddress from '#models/client_address'

export default class DeleteClientAddressService {
  async run(clientId: number, addressId: number): Promise<{ message: string }> {
    // Find address
    const address = await ClientAddress.query()
      .where('id', addressId)
      .where('client_id', clientId)
      .first()

    if (!address) {
      throw new Error('Address not found')
    }

    // Check if it's the primary address
    if (address.is_primary) {
      throw new Error('Cannot delete primary address. Set another address as primary first.')
    }

    // Delete address
    await address.delete()

    return { message: 'Address deleted successfully' }
  }
}

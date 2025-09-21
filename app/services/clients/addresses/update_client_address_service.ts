import { inject } from '@adonisjs/core'
import ClientAddress from '#models/client_address'
import CepLookupService from '#services/utils/cep_lookup_service'
import IClient from '#interfaces/client_interface'
import NotFoundException from '#exceptions/not_found_exception'

@inject()
export default class UpdateClientAddressService {
  constructor(private cepLookup: CepLookupService) {}

  async run(
    clientId: number,
    addressId: number,
    payload: Partial<IClient.AddressPayload>
  ): Promise<ClientAddress> {
    // Find address
    const address = await ClientAddress.query()
      .where('id', addressId)
      .where('client_id', clientId)
      .first()

    if (!address) {
      throw new NotFoundException('Address not found')
    }

    // Lookup CEP data if updating postal code
    if (payload.postal_code && /^\d{8}$/.test(payload.postal_code.replace(/\D/g, ''))) {
      try {
        const cepData = await this.cepLookup.lookup(payload.postal_code)
        if (cepData) {
          // Update payload with CEP data but allow overrides
          payload.street = payload.street || cepData.street
          payload.neighborhood = payload.neighborhood || cepData.neighborhood
          payload.city = payload.city || cepData.city
          payload.state = payload.state || cepData.state
        }
      } catch (error) {
        // CEP lookup failure is not critical, continue with user data
        console.warn('CEP lookup failed:', error)
      }
    }

    // If setting as primary, unset other primary addresses
    if (payload.is_primary === true) {
      await ClientAddress.query()
        .where('client_id', clientId)
        .whereNot('id', addressId)
        .update({ is_primary: false })
    }

    // Update address
    address.merge(payload)
    await address.save()

    return address
  }
}

import { inject } from '@adonisjs/core'
import ClientsRepository from '#repositories/clients_repository'
import ClientAddress from '#models/client_address'
import CepLookupService from '#services/utils/cep_lookup_service'
import IClient from '#interfaces/client_interface'

@inject()
export default class AddClientAddressService {
  constructor(
    private clientsRepository: ClientsRepository,
    private cepLookup: CepLookupService
  ) {}

  async run(clientId: number, payload: IClient.AddressPayload): Promise<ClientAddress> {
    // Find client
    const client = await this.clientsRepository.findBy('id', clientId)

    if (!client) {
      throw new Error('Client not found')
    }

    // Lookup CEP data if Brazilian postal code
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
    if (payload.is_primary) {
      await ClientAddress.query().where('client_id', clientId).update({ is_primary: false })
    }

    // Create address
    const address = await ClientAddress.create({
      client_id: clientId,
      ...payload,
      country: payload.country || 'Brasil',
    })

    return address
  }
}

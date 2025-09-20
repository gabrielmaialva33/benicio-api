import { inject } from '@adonisjs/core'
import ClientAddress from '#models/client_address'
import IClientAddress from '#interfaces/client_address_interface'
import LucidRepository from '#shared/lucid/lucid_repository'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class ClientAddressesRepository
  extends LucidRepository<typeof ClientAddress>
  implements IClientAddress.Repository
{
  constructor() {
    super(ClientAddress)
  }

  async findByClientId(
    clientId: number,
    options?: { client?: TransactionClientContract }
  ): Promise<ClientAddress[]> {
    const query = this.buildQuery({ opts: options })
    return query.where('client_id', clientId).orderBy('is_primary', 'desc').orderBy('id', 'asc')
  }

  async findPrimaryByClientId(
    clientId: number,
    options?: { client?: TransactionClientContract }
  ): Promise<ClientAddress | null> {
    const query = this.buildQuery({ opts: options })
    return query.where('client_id', clientId).where('is_primary', true).first()
  }

  async setPrimaryAddress(
    addressId: number,
    clientId: number,
    options?: { client?: TransactionClientContract }
  ): Promise<void> {
    const query = this.buildQuery({ opts: options })

    // First, unset all primary addresses for this client
    await query.where('client_id', clientId).update({ is_primary: false })

    // Then set the new primary address
    await this.update('id', addressId, { is_primary: true })
  }

  async getByPostalCode(
    postalCode: string,
    options?: { client?: TransactionClientContract }
  ): Promise<ClientAddress[]> {
    const query = this.buildQuery({ opts: options })
    const cleanPostalCode = postalCode.replace(/\D/g, '')
    return query.where('postal_code', cleanPostalCode)
  }

  async getByCostCenter(
    costCenterId: number,
    options?: { client?: TransactionClientContract }
  ): Promise<ClientAddress[]> {
    const query = this.buildQuery({ opts: options })
    return query.where('cost_center_id', costCenterId)
  }
}

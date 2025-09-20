import LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'
import ClientAddress from '#models/client_address'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

namespace IClientAddress {
  export interface Repository extends LucidRepositoryInterface<typeof ClientAddress> {
    findByClientId(
      clientId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<ClientAddress[]>

    findPrimaryByClientId(
      clientId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<ClientAddress | null>

    setPrimaryAddress(
      addressId: number,
      clientId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<void>

    getByPostalCode(
      postalCode: string,
      options?: { client?: TransactionClientContract }
    ): Promise<ClientAddress[]>

    getByCostCenter(
      costCenterId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<ClientAddress[]>
  }

  export interface CreatePayload {
    client_id: number
    company_name?: string | null
    fantasy_name?: string | null
    document?: string | null
    person_type?: 'individual' | 'company' | null
    postal_code: string
    street: string
    number: string
    complement?: string | null
    neighborhood: string
    city: string
    state: string
    country?: string
    cost_center_id?: number | null
    is_primary?: boolean
  }

  export interface UpdatePayload {
    company_name?: string | null
    fantasy_name?: string | null
    document?: string | null
    person_type?: 'individual' | 'company' | null
    postal_code?: string
    street?: string
    number?: string
    complement?: string | null
    neighborhood?: string
    city?: string
    state?: string
    country?: string
    cost_center_id?: number | null
    is_primary?: boolean
  }
}

export default IClientAddress

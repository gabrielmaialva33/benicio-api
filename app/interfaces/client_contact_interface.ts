import LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'
import ClientContact from '#models/client_contact'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

namespace IClientContact {
  export interface Repository extends LucidRepositoryInterface<typeof ClientContact> {
    findByClientId(
      clientId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<ClientContact[]>

    findByAddressId(
      addressId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<ClientContact[]>

    findBillingContacts(
      clientId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<ClientContact[]>

    findMailingContacts(
      clientId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<ClientContact[]>

    findByType(
      clientId: number,
      contactType: 'phone' | 'email',
      options?: { client?: TransactionClientContract }
    ): Promise<ClientContact[]>

    findActiveContacts(
      clientId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<ClientContact[]>

    blockContact(
      contactId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<ClientContact | null>

    unblockContact(
      contactId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<ClientContact | null>
  }

  export interface CreatePayload {
    client_id: number
    address_id: number
    name: string
    work_area_id?: number | null
    position_id?: number | null
    participates_mailing?: boolean
    receives_billing?: boolean
    contact_type: 'phone' | 'email'
    contact_value: string
    is_blocked?: boolean
  }

  export interface UpdatePayload {
    address_id?: number
    name?: string
    work_area_id?: number | null
    position_id?: number | null
    participates_mailing?: boolean
    receives_billing?: boolean
    contact_type?: 'phone' | 'email'
    contact_value?: string
    is_blocked?: boolean
  }
}

export default IClientContact

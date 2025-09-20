import { inject } from '@adonisjs/core'
import ClientContact from '#models/client_contact'
import IClientContact from '#interfaces/client_contact_interface'
import LucidRepository from '#shared/lucid/lucid_repository'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class ClientContactsRepository
  extends LucidRepository<typeof ClientContact>
  implements IClientContact.Repository
{
  constructor() {
    super(ClientContact)
  }

  async findByClientId(
    clientId: number,
    options?: { client?: TransactionClientContract }
  ): Promise<ClientContact[]> {
    const query = this.buildQuery({ opts: options })
    return query.where('client_id', clientId).orderBy('id', 'asc')
  }

  async findByAddressId(
    addressId: number,
    options?: { client?: TransactionClientContract }
  ): Promise<ClientContact[]> {
    const query = this.buildQuery({ opts: options })
    return query.where('address_id', addressId).orderBy('name', 'asc')
  }

  async findBillingContacts(
    clientId: number,
    options?: { client?: TransactionClientContract }
  ): Promise<ClientContact[]> {
    const query = this.buildQuery({ opts: options })
    return query
      .where('client_id', clientId)
      .where('receives_billing', true)
      .where('is_blocked', false)
      .orderBy('name', 'asc')
  }

  async findMailingContacts(
    clientId: number,
    options?: { client?: TransactionClientContract }
  ): Promise<ClientContact[]> {
    const query = this.buildQuery({ opts: options })
    return query
      .where('client_id', clientId)
      .where('participates_mailing', true)
      .where('is_blocked', false)
      .orderBy('name', 'asc')
  }

  async findByType(
    clientId: number,
    contactType: 'phone' | 'email',
    options?: { client?: TransactionClientContract }
  ): Promise<ClientContact[]> {
    const query = this.buildQuery({ opts: options })
    return query
      .where('client_id', clientId)
      .where('contact_type', contactType)
      .orderBy('name', 'asc')
  }

  async findActiveContacts(
    clientId: number,
    options?: { client?: TransactionClientContract }
  ): Promise<ClientContact[]> {
    const query = this.buildQuery({ opts: options })
    return query.where('client_id', clientId).where('is_blocked', false).orderBy('name', 'asc')
  }

  async blockContact(
    contactId: number,
    _options?: { client?: TransactionClientContract }
  ): Promise<ClientContact | null> {
    return this.update('id', contactId, { is_blocked: true })
  }

  async unblockContact(
    contactId: number,
    _options?: { client?: TransactionClientContract }
  ): Promise<ClientContact | null> {
    return this.update('id', contactId, { is_blocked: false })
  }
}

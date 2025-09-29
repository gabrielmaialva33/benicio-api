import Client from '#models/client'
import LucidRepository from '#shared/lucid/lucid_repository'
import IClient from '#interfaces/client_interface'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import DocumentValidatorService from '#services/utils/document_validator_service'

export default class ClientsRepository
  extends LucidRepository<typeof Client>
  implements IClient.Repository
{
  constructor() {
    super(Client)
  }

  /**
   * Find client by document (CPF/CNPJ)
   */
  async findByDocument(
    document: string,
    options?: { client?: TransactionClientContract }
  ): Promise<Client | null> {
    const documentValidator = new DocumentValidatorService()
    const cleanDocument = documentValidator.clean(document)

    const query = this.model.query(options)
    return query.where('document', cleanDocument).first()
  }

  /**
   * Search clients by name or document
   */
  async search(
    searchTerm: string,
    options?: { client?: TransactionClientContract }
  ): Promise<Client[]> {
    const query = this.model.query(options)

    // Check if search term might be a document
    const cleanedTerm = searchTerm.replace(/\D/g, '')

    query.where((q) => {
      if (cleanedTerm.length === 11 || cleanedTerm.length === 14) {
        // Might be a document
        q.orWhere('document', cleanedTerm)
      }

      // Search by name
      q.orWhereRaw('fantasy_name ILIKE ?', [`%${searchTerm}%`]).orWhereRaw('company_name ILIKE ?', [
        `%${searchTerm}%`,
      ])
    })

    return query
  }

  /**
   * Get active clients
   */
  async getActive(options?: { client?: TransactionClientContract }): Promise<Client[]> {
    const query = this.model.query(options)
    return query.where('is_active', true).orderBy('fantasy_name', 'asc')
  }

  /**
   * Get favorite clients
   */
  async getFavorites(options?: { client?: TransactionClientContract }): Promise<Client[]> {
    const query = this.model.query(options)
    return query.where('is_favorite', true).orderBy('fantasy_name', 'asc')
  }

  /**
   * Get clients by type
   */
  async getByType(
    personType: 'individual' | 'company',
    options?: { client?: TransactionClientContract }
  ): Promise<Client[]> {
    const query = this.model.query(options)
    return query.where('person_type', personType).orderBy('fantasy_name', 'asc')
  }

  /**
   * Get clients with addresses
   */
  async getWithAddresses(
    clientId: number,
    options?: { client?: TransactionClientContract }
  ): Promise<Client | null> {
    const query = this.model.query(options)
    return query
      .where('id', clientId)
      .preload('addresses', (addressQuery) => {
        addressQuery.orderBy('is_primary', 'desc').orderBy('created_at', 'asc')
      })
      .first()
  }

  /**
   * Get clients with full relationships
   */
  async getWithFullRelationships(
    clientId: number,
    options?: { client?: TransactionClientContract }
  ): Promise<Client | null> {
    const query = this.model.query(options)
    return query
      .where('id', clientId)
      .preload('addresses', (addressQuery) => {
        addressQuery.orderBy('is_primary', 'desc').orderBy('created_at', 'asc').preload('contacts')
      })
      .preload('contacts')
      .preload('user')
      .preload('created_by')
      .preload('updated_by')
      .first()
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(
    clientId: number,
    options?: { client?: TransactionClientContract }
  ): Promise<Client> {
    const client = await this.model.findOrFail(clientId, options)
    client.is_favorite = !client.is_favorite
    await client.save()
    return client
  }

  /**
   * Get clients with billing contacts
   */
  async getWithBillingContacts(options?: {
    client?: TransactionClientContract
  }): Promise<Client[]> {
    const query = this.model.query(options)
    return query
      .where('is_active', true)
      .preload('contacts', (contactQuery) => {
        contactQuery.where('receives_billing', true)
      })
      .orderBy('fantasy_name', 'asc')
  }

  /**
   * Check if document exists (excluding a specific client)
   */
  async documentExists(
    document: string,
    excludeId?: number,
    options?: { client?: TransactionClientContract }
  ): Promise<boolean> {
    const documentValidator = new DocumentValidatorService()
    const cleanDocument = documentValidator.clean(document)

    const query = this.model.query(options)
    query.where('document', cleanDocument)

    if (excludeId) {
      query.whereNot('id', excludeId)
    }

    const result = await query.first()
    return !!result
  }

  /**
   * Get clients statistics
   */
  async getStatistics(options?: { client?: TransactionClientContract }) {
    const query = this.model.query(options)

    const total = await query.clone().count('* as total')
    const active = await query.clone().where('is_active', true).count('* as total')
    const inactive = await query.clone().where('is_active', false).count('* as total')
    const favorites = await query.clone().where('is_favorite', true).count('* as total')
    const individuals = await query.clone().where('person_type', 'individual').count('* as total')
    const companies = await query.clone().where('person_type', 'company').count('* as total')

    return {
      total: Number(total[0].$extras.total),
      active: Number(active[0].$extras.total),
      inactive: Number(inactive[0].$extras.total),
      favorites: Number(favorites[0].$extras.total),
      individuals: Number(individuals[0].$extras.total),
      companies: Number(companies[0].$extras.total),
    }
  }
}

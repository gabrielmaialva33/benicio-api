import LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'
import Client from '#models/client'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

namespace IClient {
  export interface Repository extends LucidRepositoryInterface<typeof Client> {
    findByDocument(
      document: string,
      options?: { client?: TransactionClientContract }
    ): Promise<Client | null>

    search(searchTerm: string, options?: { client?: TransactionClientContract }): Promise<Client[]>

    getActive(options?: { client?: TransactionClientContract }): Promise<Client[]>

    getFavorites(options?: { client?: TransactionClientContract }): Promise<Client[]>

    getByType(
      personType: 'individual' | 'company',
      options?: { client?: TransactionClientContract }
    ): Promise<Client[]>

    getWithAddresses(
      clientId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<Client | null>

    getWithFullRelationships(
      clientId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<Client | null>

    toggleFavorite(
      clientId: number,
      options?: { client?: TransactionClientContract }
    ): Promise<Client>

    getWithBillingContacts(options?: { client?: TransactionClientContract }): Promise<Client[]>

    documentExists(
      document: string,
      excludeId?: number,
      options?: { client?: TransactionClientContract }
    ): Promise<boolean>

    getStatistics(options?: { client?: TransactionClientContract }): Promise<{
      total: number
      active: number
      inactive: number
      favorites: number
      individuals: number
      companies: number
    }>
  }

  export interface CreatePayload {
    person_type: 'individual' | 'company'
    fantasy_name: string
    company_name?: string | null
    document: string
    document_type: 'cpf' | 'cnpj'
    client_type?:
      | 'prospect'
      | 'prospect_sic'
      | 'prospect_dbm'
      | 'client'
      | 'board_contact'
      | 'news_contact'
    company_group_id?: number | null
    business_sector_id?: number | null
    revenue_range?: 'small' | 'medium' | 'large' | 'enterprise' | null
    employee_count_range?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
    is_active?: boolean
    is_favorite?: boolean
    ir_retention?: boolean
    pcc_retention?: boolean
    connection_code?: string | null
    accounting_account?: string | null
    monthly_sheet?: number | null
    notes?: string | null
    billing_notes?: string | null
    user_id?: number | null
    created_by_id: number
    updated_by_id?: number | null
  }

  export interface UpdatePayload {
    person_type?: 'individual' | 'company'
    fantasy_name?: string
    company_name?: string | null
    document?: string
    document_type?: 'cpf' | 'cnpj'
    client_type?:
      | 'prospect'
      | 'prospect_sic'
      | 'prospect_dbm'
      | 'client'
      | 'board_contact'
      | 'news_contact'
    company_group_id?: number | null
    business_sector_id?: number | null
    revenue_range?: 'small' | 'medium' | 'large' | 'enterprise' | null
    employee_count_range?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
    is_active?: boolean
    is_favorite?: boolean
    ir_retention?: boolean
    pcc_retention?: boolean
    connection_code?: string | null
    accounting_account?: string | null
    monthly_sheet?: number | null
    notes?: string | null
    billing_notes?: string | null
    user_id?: number | null
    updated_by_id: number
  }

  export interface AddressPayload {
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

  export interface ContactPayload {
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
}

export default IClient

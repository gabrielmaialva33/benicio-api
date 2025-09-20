import { inject } from '@adonisjs/core'
import ClientsRepository from '#repositories/clients_repository'
import Client from '#models/client'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { PaginateOptions } from '#shared/lucid/lucid_repository_interface'

interface ListClientsFilters {
  search?: string
  person_type?: 'individual' | 'company'
  client_type?:
    | 'prospect'
    | 'prospect_sic'
    | 'prospect_dbm'
    | 'client'
    | 'board_contact'
    | 'news_contact'
  is_active?: boolean
  is_favorite?: boolean
  company_group_id?: number
  business_sector_id?: number
}

interface ListClientsOptions extends PaginateOptions<typeof Client> {
  filters?: ListClientsFilters
}

@inject()
export default class ListClientsService {
  constructor(private clientsRepository: ClientsRepository) {}

  async run(options: ListClientsOptions) {
    const { filters, ...paginateOptions } = options

    const modifyQuery = (query: ModelQueryBuilderContract<typeof Client>) => {
      // Apply scopes
      query.withScopes((scopes) => {
        // Search
        if (filters?.search) {
          scopes.search(filters.search)
        }

        // Person type
        if (filters?.person_type) {
          scopes.byType(filters.person_type)
        }

        // Client type
        if (filters?.client_type) {
          scopes.byClientType(filters.client_type)
        }

        // Company group
        if (filters?.company_group_id) {
          scopes.byCompanyGroup(filters.company_group_id)
        }

        // Business sector
        if (filters?.business_sector_id) {
          scopes.byBusinessSector(filters.business_sector_id)
        }

        // Always load relationships
        scopes.withRelationships()
      })

      // Active filter (not a scope, direct query)
      if (filters?.is_active !== undefined) {
        query.where('is_active', filters.is_active)
      }

      // Favorite filter
      if (filters?.is_favorite !== undefined) {
        query.where('is_favorite', filters.is_favorite)
      }
    }

    // Merge with existing modifyQuery if provided
    paginateOptions.modifyQuery = paginateOptions.modifyQuery
      ? (query) => {
          paginateOptions.modifyQuery!(query)
          modifyQuery(query)
        }
      : modifyQuery

    // Default sorting
    if (!paginateOptions.sortBy) {
      paginateOptions.sortBy = 'fantasy_name'
      paginateOptions.direction = 'asc'
    }

    return this.clientsRepository.paginate(paginateOptions)
  }
}

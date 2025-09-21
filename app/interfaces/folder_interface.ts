import type Folder from '#models/folder'
import type LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'

namespace IFolder {
  export interface Repository extends LucidRepositoryInterface<typeof Folder> {
    findByClient(clientId: number): Promise<Folder[]>
    findByCnj(cnjNumber: string): Promise<Folder | null>
    cnjExists(cnjNumber: string, excludeId?: number): Promise<boolean>
    findWithRelations(id: number): Promise<Folder | null>
    search(filters: ListFilters): any
    getStatistics(): Promise<Statistics>
    softDelete(id: number, userId: number): Promise<Folder | null>
    restore(id: number, userId: number): Promise<Folder | null>
  }

  export interface CreatePayload {
    title: string
    description?: string
    folder_type_id: number
    client_id: number
    court_id?: number
    cnj_number?: string
    case_value?: number
    observation?: string
    object_detail?: string
    status?: string
    priority?: string
    tags?: string[]
    search_progress?: boolean
    search_intimation?: boolean
    electronic?: boolean
    loy_system_number?: string
    internal_notes?: string
    is_confidential?: boolean
    opposing_party?: string
    opposing_lawyer?: string
    responsible_lawyer_id?: number
  }

  export interface UpdatePayload {
    title?: string
    description?: string
    folder_type_id?: number
    client_id?: number
    court_id?: number
    cnj_number?: string
    case_value?: number
    observation?: string
    object_detail?: string
    status?: string
    priority?: string
    tags?: string[]
    search_progress?: boolean
    search_intimation?: boolean
    electronic?: boolean
    loy_system_number?: string
    internal_notes?: string
    is_confidential?: boolean
    opposing_party?: string
    opposing_lawyer?: string
    responsible_lawyer_id?: number
  }

  export interface ListFilters {
    search?: string
    status?: string
    folderTypeId?: number
    clientId?: number
    courtId?: number
  }

  export interface ListOptions {
    filters?: ListFilters
    page?: number
    perPage?: number
    sortBy?: string
    direction?: 'asc' | 'desc'
  }

  export interface Statistics {
    total: number
    active: number
    archived: number
    highPriority: number
    withCnj: number
  }
}

export default IFolder
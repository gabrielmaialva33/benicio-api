import type Task from '#models/task'
import type LucidRepositoryInterface from '#shared/lucid/lucid_repository_interface'

namespace ITask {
  export interface Repository extends LucidRepositoryInterface<typeof Task> {
    findByAssignee(userId: number): Promise<Task[]>

    findByCreator(userId: number): Promise<Task[]>

    findOverdue(): Promise<Task[]>

    findUpcoming(days?: number): Promise<Task[]>

    findPending(): Promise<Task[]>

    search(filters: ListFilters): any

    getStatistics(userId?: number): Promise<Statistics>

    complete(id: number): Promise<Task | null>

    cancel(id: number): Promise<Task | null>
  }

  export interface CreatePayload {
    title: string
    description?: string
    folder_id?: number
    assigned_to_id: number
    created_by_id: number
    due_date: string
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    tags?: string[]
  }

  export interface UpdatePayload {
    title?: string
    description?: string
    folder_id?: number
    assigned_to_id?: number
    due_date?: string
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    tags?: string[]
    completed_at?: string
  }

  export interface ListFilters {
    search?: string
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    assignedToId?: number
    createdById?: number
    folderId?: number
    overdue?: boolean
    upcoming?: number
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
    pending: number
    inProgress: number
    completed: number
    cancelled: number
    overdue: number
    upcoming: number
    byPriority: {
      low: number
      medium: number
      high: number
      urgent: number
    }
  }
}

export default ITask

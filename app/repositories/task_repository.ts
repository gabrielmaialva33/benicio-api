import Task from '#models/task'
import LucidRepository from '#shared/lucid/lucid_repository'
import ITask from '#interfaces/task_interface'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'

export default class TaskRepository
  extends LucidRepository<typeof Task>
  implements ITask.Repository
{
  constructor() {
    super(Task)
  }

  /**
   * Find tasks by assignee ID
   */
  async findByAssignee(userId: number): Promise<Task[]> {
    return this.model.query().where('assigned_to_id', userId)
  }

  /**
   * Find tasks by creator ID
   */
  async findByCreator(userId: number): Promise<Task[]> {
    return this.model.query().where('created_by_id', userId)
  }

  /**
   * Find overdue tasks
   */
  async findOverdue(): Promise<Task[]> {
    return this.model
      .query()
      .where('due_date', '<', DateTime.now().toSQL()!)
      .whereNotIn('status', ['completed', 'cancelled'])
  }

  /**
   * Find upcoming tasks within specified days
   */
  async findUpcoming(days: number = 7): Promise<Task[]> {
    const futureDate = DateTime.now().plus({ days })
    return this.model
      .query()
      .whereBetween('due_date', [DateTime.now().toSQL()!, futureDate.toSQL()!])
      .whereNotIn('status', ['completed', 'cancelled'])
  }

  /**
   * Find pending tasks (pending or in_progress)
   */
  async findPending(): Promise<Task[]> {
    return this.model.query().whereIn('status', ['pending', 'in_progress'])
  }

  /**
   * Search tasks with filters
   */
  search(filters: ITask.ListFilters): ModelQueryBuilderContract<typeof Task, Task> {
    let query = this.model.query()

    if (filters.search) {
      query = query.where((q) => {
        q.whereRaw('title ILIKE ?', [`%${filters.search}%`]).orWhereRaw('description ILIKE ?', [
          `%${filters.search}%`,
        ])
      })
    }

    if (filters.status) {
      query = query.where('status', filters.status)
    }

    if (filters.priority) {
      query = query.where('priority', filters.priority)
    }

    if (filters.assignedToId) {
      query = query.where('assigned_to_id', filters.assignedToId)
    }

    if (filters.createdById) {
      query = query.where('created_by_id', filters.createdById)
    }

    if (filters.folderId) {
      query = query.where('folder_id', filters.folderId)
    }

    if (filters.overdue) {
      query = query
        .where('due_date', '<', DateTime.now().toSQL()!)
        .whereNotIn('status', ['completed', 'cancelled'])
    }

    if (filters.upcoming) {
      const futureDate = DateTime.now().plus({ days: filters.upcoming })
      query = query
        .whereBetween('due_date', [DateTime.now().toSQL()!, futureDate.toSQL()!])
        .whereNotIn('status', ['completed', 'cancelled'])
    }

    return query
  }

  /**
   * Get task statistics
   */
  async getStatistics(userId?: number): Promise<ITask.Statistics> {
    let query = this.model.query()

    if (userId) {
      query = query.where('assigned_to_id', userId)
    }

    const stats = await query
      .select([
        this.model.query().client.raw('COUNT(*) as total'),
        this.model.query().client.raw("COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending"),
        this.model
          .query()
          .client.raw("COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress"),
        this.model
          .query()
          .client.raw("COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed"),
        this.model
          .query()
          .client.raw("COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled"),
        this.model
          .query()
          .client.raw(
            `COUNT(CASE WHEN due_date < '${DateTime.now().toSQL()}' AND status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue`
          ),
        this.model
          .query()
          .client.raw(
            `COUNT(CASE WHEN due_date BETWEEN '${DateTime.now().toSQL()}' AND '${DateTime.now().plus({ days: 7 }).toSQL()}' AND status NOT IN ('completed', 'cancelled') THEN 1 END) as upcoming`
          ),
        this.model.query().client.raw("COUNT(CASE WHEN priority = 'low' THEN 1 END) as low"),
        this.model.query().client.raw("COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium"),
        this.model.query().client.raw("COUNT(CASE WHEN priority = 'high' THEN 1 END) as high"),
        this.model.query().client.raw("COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent"),
      ])
      .first()

    return {
      total: Number(stats?.$extras.total || 0),
      pending: Number(stats?.$extras.pending || 0),
      inProgress: Number(stats?.$extras.in_progress || 0),
      completed: Number(stats?.$extras.completed || 0),
      cancelled: Number(stats?.$extras.cancelled || 0),
      overdue: Number(stats?.$extras.overdue || 0),
      upcoming: Number(stats?.$extras.upcoming || 0),
      byPriority: {
        low: Number(stats?.$extras.low || 0),
        medium: Number(stats?.$extras.medium || 0),
        high: Number(stats?.$extras.high || 0),
        urgent: Number(stats?.$extras.urgent || 0),
      },
    }
  }

  /**
   * Mark task as completed
   */
  async complete(id: number): Promise<Task | null> {
    const task = await this.model.find(id)
    if (!task) {
      return null
    }

    task.status = 'completed'
    task.completed_at = DateTime.now()
    await task.save()

    return task
  }

  /**
   * Mark task as cancelled
   */
  async cancel(id: number): Promise<Task | null> {
    const task = await this.model.find(id)
    if (!task) {
      return null
    }

    task.status = 'cancelled'
    await task.save()

    return task
  }
}

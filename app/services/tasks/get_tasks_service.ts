import { inject } from '@adonisjs/core'
import TaskRepository from '#repositories/task_repository'
import ITask from '#interfaces/task_interface'

@inject()
export default class GetTasksService {
  constructor(private taskRepository: TaskRepository) {}

  async execute(options: ITask.ListOptions = {}) {
    const { filters = {}, page = 1, perPage = 10, sortBy = 'due_date', direction = 'asc' } = options

    const query = this.taskRepository
      .search(filters)
      .preload('assignedTo', (q) => q.select(['id', 'full_name', 'email']))
      .preload('createdBy', (q) => q.select(['id', 'full_name', 'email']))
      .preload('folder', (q) => q.select(['id', 'title', 'cnj_number']))
      .orderBy(sortBy, direction)

    const tasks = await query.paginate(page, perPage)

    return tasks.serialize({
      fields: {
        pick: [
          'id',
          'title',
          'description',
          'due_date',
          'completed_at',
          'status',
          'priority',
          'tags',
          'created_at',
          'updated_at',
        ],
      },
      relations: {
        assignedTo: {
          fields: {
            pick: ['id', 'full_name', 'email'],
          },
        },
        createdBy: {
          fields: {
            pick: ['id', 'full_name', 'email'],
          },
        },
        folder: {
          fields: {
            pick: ['id', 'title', 'cnj_number'],
          },
        },
      },
    })
  }
}

import { inject } from '@adonisjs/core'
import TaskRepository from '#repositories/task_repository'
import ITask from '#interfaces/task_interface'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

@inject()
export default class CreateTaskService {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: ITask.CreatePayload, trx?: TransactionClientContract) {
    const transaction = trx || (await db.transaction())

    try {
      // Parse due_date string to DateTime if needed
      const parsedPayload = {
        ...payload,
        due_date:
          typeof payload.due_date === 'string'
            ? DateTime.fromISO(payload.due_date)
            : payload.due_date,
      }

      // Create task
      const task = await this.taskRepository.create(parsedPayload, { client: transaction })

      // Commit if we created the transaction
      if (!trx) {
        await transaction.commit()
      }

      // Load relationships
      await task.load('assigned_to' as any)
      await task.load('created_by' as any)
      if (task.folder_id) {
        await task.load('folder' as any)
      }

      return task
    } catch (error) {
      // Rollback if we created the transaction
      if (!trx) {
        await transaction.rollback()
      }
      throw error
    }
  }
}

import { inject } from '@adonisjs/core'
import TaskRepository from '#repositories/task_repository'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class DeleteTaskService {
  constructor(private taskRepository: TaskRepository) {}

  async execute(taskId: number, trx?: TransactionClientContract): Promise<boolean> {
    const transaction = trx || (await db.transaction())

    try {
      // Find task
      const task = await this.taskRepository.findBy('id', taskId)

      if (!task) {
        if (!trx) await transaction.rollback()
        throw new Error('Task not found')
      }

      // Delete task (hard delete)
      await task.delete()

      // Commit if we created the transaction
      if (!trx) {
        await transaction.commit()
      }

      return true
    } catch (error) {
      // Rollback if we created the transaction
      if (!trx) {
        await transaction.rollback()
      }
      throw error
    }
  }
}

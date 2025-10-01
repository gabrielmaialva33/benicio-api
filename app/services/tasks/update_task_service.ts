import { inject } from '@adonisjs/core'
import TaskRepository from '#repositories/task_repository'
import ITask from '#interfaces/task_interface'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

@inject()
export default class UpdateTaskService {
  constructor(private taskRepository: TaskRepository) {}

  async execute(taskId: number, payload: ITask.UpdatePayload, trx?: TransactionClientContract) {
    const transaction = trx || (await db.transaction())

    try {
      // Find task
      const task = await this.taskRepository.findBy('id', taskId)

      if (!task) {
        if (!trx) await transaction.rollback()
        throw new Error('Task not found')
      }

      // Parse date strings to DateTime if needed
      const parsedPayload: any = { ...payload }

      if (payload.due_date && typeof payload.due_date === 'string') {
        parsedPayload.due_date = DateTime.fromISO(payload.due_date)
      }

      if (payload.completed_at && typeof payload.completed_at === 'string') {
        parsedPayload.completed_at = DateTime.fromISO(payload.completed_at)
      }

      // Auto-set completed_at when status changes to completed
      if (payload.status === 'completed' && !task.completed_at && !payload.completed_at) {
        parsedPayload.completed_at = DateTime.now()
      }

      // Clear completed_at if status changes from completed to something else
      if (payload.status && payload.status !== 'completed' && task.status === 'completed') {
        parsedPayload.completed_at = null
      }

      // Update task
      task.merge(parsedPayload)
      await task.save()

      // Commit if we created the transaction
      if (!trx) {
        await transaction.commit()
      }

      // Reload task with relationships
      const updatedTask = await this.taskRepository.findBy('id', taskId)
      await updatedTask?.load('assigned_to' as any)
      await updatedTask?.load('created_by' as any)
      if (updatedTask?.folder_id) {
        await updatedTask.load('folder' as any)
      }

      return updatedTask
    } catch (error) {
      // Rollback if we created the transaction
      if (!trx) {
        await transaction.rollback()
      }
      throw error
    }
  }
}

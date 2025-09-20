import { inject } from '@adonisjs/core'
import ClientsRepository from '#repositories/clients_repository'
import { DateTime } from 'luxon'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class DeleteClientService {
  constructor(private clientsRepository: ClientsRepository) {}

  async run(clientId: number, trx?: TransactionClientContract) {
    const client = await this.clientsRepository.findBy(
      'id',
      clientId,
      trx ? { client: trx } : undefined
    )

    if (!client) {
      throw new Error('Client not found')
    }

    // Soft delete
    client.deleted_at = DateTime.now()
    await client.save()

    return { message: 'Client deleted successfully' }
  }
}

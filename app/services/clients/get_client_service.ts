import { inject } from '@adonisjs/core'
import ClientsRepository from '#repositories/clients_repository'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class GetClientService {
  constructor(private clientsRepository: ClientsRepository) {}

  async run(clientId: number, withRelationships = true, trx?: TransactionClientContract) {
    if (withRelationships) {
      return this.clientsRepository.getWithFullRelationships(
        clientId,
        trx ? { client: trx } : undefined
      )
    }

    return this.clientsRepository.findBy('id', clientId, trx ? { client: trx } : undefined)
  }
}

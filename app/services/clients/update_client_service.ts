import { inject } from '@adonisjs/core'
import ClientsRepository from '#repositories/clients_repository'
import DocumentValidatorService from '#services/utils/document_validator_service'
import IClient from '#interfaces/client_interface'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class UpdateClientService {
  constructor(
    private clientsRepository: ClientsRepository,
    private documentValidator: DocumentValidatorService
  ) {}

  async run(clientId: number, payload: IClient.UpdatePayload, trx?: TransactionClientContract) {
    // Find client
    const client = await this.clientsRepository.findBy(
      'id',
      clientId,
      trx ? { client: trx } : undefined
    )

    if (!client) {
      throw new Error('Client not found')
    }

    // If updating document, validate it
    if (payload.document) {
      const cleanDocument = this.documentValidator.clean(payload.document)
      const documentType = this.documentValidator.getType(cleanDocument)

      if (!this.documentValidator.validate(cleanDocument)) {
        throw new Error(`Invalid ${documentType ? documentType.toUpperCase() : 'document'} format`)
      }

      // Check if document already exists (excluding current client)
      const exists = await this.clientsRepository.documentExists(
        cleanDocument,
        clientId,
        trx ? { client: trx } : undefined
      )

      if (exists) {
        throw new Error('Client with this document already exists')
      }

      payload.document = cleanDocument
      payload.document_type = documentType || undefined
    }

    // Update client
    const updatedClient = await this.clientsRepository.update('id', clientId, payload)

    // Load relationships
    if (updatedClient) {
      await updatedClient.load('addresses')
      await updatedClient.load('contacts')
    }

    return updatedClient
  }
}

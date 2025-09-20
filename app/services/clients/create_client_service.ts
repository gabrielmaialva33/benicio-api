import { inject } from '@adonisjs/core'
import ClientsRepository from '#repositories/clients_repository'
import DocumentValidatorService from '#services/utils/document_validator_service'
import IClient from '#interfaces/client_interface'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class CreateClientService {
  constructor(
    private clientsRepository: ClientsRepository,
    private documentValidator: DocumentValidatorService
  ) {}

  async run(payload: IClient.CreatePayload, trx?: TransactionClientContract) {
    const transaction = trx || (await db.transaction())

    try {
      // Clean and validate document
      const cleanDocument = this.documentValidator.clean(payload.document)
      const documentType = this.documentValidator.getType(cleanDocument)

      if (!this.documentValidator.validate(cleanDocument)) {
        if (!trx) await transaction.rollback()
        throw new Error(`Invalid ${documentType ? documentType.toUpperCase() : 'document'} format`)
      }

      // Check if document already exists
      const exists = await this.clientsRepository.documentExists(cleanDocument, undefined, {
        client: transaction,
      })

      if (exists) {
        if (!trx) await transaction.rollback()
        throw new Error('Client with this document already exists')
      }

      // Create client with cleaned document
      const client = await this.clientsRepository.create(
        {
          ...payload,
          document: cleanDocument,
          document_type: documentType || 'cpf',
        },
        { client: transaction }
      )

      // Commit if we created the transaction
      if (!trx) {
        await transaction.commit()
      }

      // Load relationships
      await client.load('addresses')
      await client.load('contacts')

      return client
    } catch (error) {
      // Rollback if we created the transaction
      if (!trx) {
        await transaction.rollback()
      }
      throw error
    }
  }
}

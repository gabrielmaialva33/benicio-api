import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import logger from '@adonisjs/core/services/logger'
import Client from '#models/client'
import ClientAddress from '#models/client_address'
import ClientContact from '#models/client_contact'

export default class PopulateClientDefaultService {
  async run(trx?: TransactionClientContract) {
    logger.info('🏗️ Populating client default values...')

    try {
      // Update clients with missing default values
      await this.updateClientDefaults(trx)

      // Update client addresses with missing default values
      await this.updateClientAddressDefaults(trx)

      // Update client contacts with missing default values
      await this.updateClientContactDefaults(trx)

      logger.info('🎉 Client default values populated successfully!')
    } catch (error) {
      logger.error(`❌ Error populating client defaults: ${error.message}`)
      throw error
    }
  }

  private async updateClientDefaults(trx?: TransactionClientContract) {
    try {
      const query = Client.query({ client: trx })

      // Update client_type for clients where it's null
      const clientTypeUpdated = await query
        .clone()
        .whereNull('client_type')
        .update({ client_type: 'prospect' })

      // Update is_active for clients where it's null
      const isActiveUpdated = await query.clone().whereNull('is_active').update({ is_active: true })

      // Update is_favorite for clients where it's null
      const isFavoriteUpdated = await query
        .clone()
        .whereNull('is_favorite')
        .update({ is_favorite: false })

      // Update ir_retention for clients where it's null
      const irRetentionUpdated = await query
        .clone()
        .whereNull('ir_retention')
        .update({ ir_retention: false })

      // Update pcc_retention for clients where it's null
      const pccRetentionUpdated = await query
        .clone()
        .whereNull('pcc_retention')
        .update({ pcc_retention: false })

      const totalUpdated =
        clientTypeUpdated.length +
        isActiveUpdated.length +
        isFavoriteUpdated.length +
        irRetentionUpdated.length +
        pccRetentionUpdated.length

      logger.info(`✅ Client defaults updated (${totalUpdated} fields updated)`)
    } catch (error) {
      logger.error(`❌ Error updating client defaults: ${error.message}`)
      throw error
    }
  }

  private async updateClientAddressDefaults(trx?: TransactionClientContract) {
    try {
      const query = ClientAddress.query({ client: trx })

      // Update country for addresses where it's null
      const countryUpdated = await query.clone().whereNull('country').update({ country: 'Brasil' })

      // Update is_primary for addresses where it's null
      // For each client, set the first address as primary if none is set
      const clientsWithoutPrimary = await query
        .clone()
        .select('client_id')
        .groupBy('client_id')
        .havingRaw('SUM(CASE WHEN is_primary = true THEN 1 ELSE 0 END) = 0')

      let primaryAddressesUpdated = 0

      for (const client of clientsWithoutPrimary) {
        const firstAddress = await ClientAddress.query({ client: trx })
          .where('client_id', client.client_id)
          .orderBy('created_at', 'asc')
          .first()

        if (firstAddress) {
          await firstAddress.merge({ is_primary: true }).save()
          primaryAddressesUpdated++
        }
      }

      logger.info(
        `✅ Client address defaults updated (${countryUpdated} countries, ${primaryAddressesUpdated} primary addresses)`
      )
    } catch (error) {
      logger.error(`❌ Error updating client address defaults: ${error.message}`)
      throw error
    }
  }

  private async updateClientContactDefaults(trx?: TransactionClientContract) {
    try {
      const query = ClientContact.query({ client: trx })

      // Update participates_mailing for contacts where it's null
      const mailingUpdated = await query
        .clone()
        .whereNull('participates_mailing')
        .update({ participates_mailing: false })

      // Update receives_billing for contacts where it's null
      const billingUpdated = await query
        .clone()
        .whereNull('receives_billing')
        .update({ receives_billing: true })

      // Update is_blocked for contacts where it's null
      const blockedUpdated = await query
        .clone()
        .whereNull('is_blocked')
        .update({ is_blocked: false })

      const totalUpdated = mailingUpdated + billingUpdated + blockedUpdated

      logger.info(`✅ Client contact defaults updated (${totalUpdated} fields updated)`)
    } catch (error) {
      logger.error(`❌ Error updating client contact defaults: ${error.message}`)
      throw error
    }
  }
}

import type { Transaction } from '@adonisjs/lucid/types/database'
import Client from '#models/client'
import ClientAddress from '#models/client_address'
import ClientContact from '#models/client_contact'

export default class PopulateClientDefaultService {
  async run(trx?: Transaction) {
    console.log('Populating client default values...')

    // Update clients with missing default values
    await this.updateClientDefaults(trx)

    // Update client addresses with missing default values
    await this.updateClientAddressDefaults(trx)

    // Update client contacts with missing default values
    await this.updateClientContactDefaults(trx)

    console.log('Client default values populated successfully!')
  }

  private async updateClientDefaults(trx?: Transaction) {
    const query = Client.query({ client: trx })

    // Update client_type for clients where it's null
    await query.clone().whereNull('client_type').update({ client_type: 'prospect' })

    // Update is_active for clients where it's null
    await query.clone().whereNull('is_active').update({ is_active: true })

    // Update is_favorite for clients where it's null
    await query.clone().whereNull('is_favorite').update({ is_favorite: false })

    // Update ir_retention for clients where it's null
    await query.clone().whereNull('ir_retention').update({ ir_retention: false })

    // Update pcc_retention for clients where it's null
    await query.clone().whereNull('pcc_retention').update({ pcc_retention: false })

    console.log('✓ Client defaults updated')
  }

  private async updateClientAddressDefaults(trx?: Transaction) {
    const query = ClientAddress.query({ client: trx })

    // Update country for addresses where it's null
    await query.clone().whereNull('country').update({ country: 'Brasil' })

    // Update is_primary for addresses where it's null
    // For each client, set the first address as primary if none is set
    const clientsWithoutPrimary = await query
      .clone()
      .select('client_id')
      .groupBy('client_id')
      .havingRaw('SUM(CASE WHEN is_primary = true THEN 1 ELSE 0 END) = 0')

    for (const client of clientsWithoutPrimary) {
      const firstAddress = await ClientAddress.query({ client: trx })
        .where('client_id', client.client_id)
        .orderBy('created_at', 'asc')
        .first()

      if (firstAddress) {
        await firstAddress.merge({ is_primary: true }).save()
      }
    }

    console.log('✓ Client address defaults updated')
  }

  private async updateClientContactDefaults(trx?: Transaction) {
    const query = ClientContact.query({ client: trx })

    // Update participates_mailing for contacts where it's null
    await query.clone().whereNull('participates_mailing').update({ participates_mailing: false })

    // Update receives_billing for contacts where it's null
    await query.clone().whereNull('receives_billing').update({ receives_billing: true })

    // Update is_blocked for contacts where it's null
    await query.clone().whereNull('is_blocked').update({ is_blocked: false })

    console.log('✓ Client contact defaults updated')
  }
}

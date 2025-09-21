import { BaseSchema } from '@adonisjs/lucid/schema'
import app from '@adonisjs/core/services/app'

import PopulateClientDefaultService from '#services/clients/populate_client_default_service'

export default class extends BaseSchema {
  async up() {
    const service = await app.container.make(PopulateClientDefaultService)
    const trx = await this.db.transaction()
    await service.run(trx)
    await trx.commit()
  }

  async down() {
    // No rollback needed as this only populates existing data
  }
}

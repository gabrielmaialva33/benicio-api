import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ClientsController = () => import('#controllers/clients/clients_controller')
const AddressesController = () => import('#controllers/clients/addresses_controller')
const ContactsController = () => import('#controllers/clients/contacts_controller')

router
  .group(() => {
    // List clients with filters and pagination
    router.get('/', [ClientsController, 'index'])

    // Create new client
    router.post('/', [ClientsController, 'store'])

    // Get single client
    router.get('/:id', [ClientsController, 'show'])

    // Update client
    router.put('/:id', [ClientsController, 'update'])

    // Delete client (soft delete)
    router.delete('/:id', [ClientsController, 'destroy'])

    // CEP lookup utility
    router.get('/utils/cep/:cep', [ClientsController, 'lookupCep'])

    // Client addresses
    router
      .group(() => {
        router.get('/', [ClientAddressesController, 'index'])
        router.post('/', [ClientAddressesController, 'store'])
        router.put('/:id', [ClientAddressesController, 'update'])
        router.delete('/:id', [ClientAddressesController, 'destroy'])
      })
      .prefix('/:client_id/addresses')

    // Client contacts
    router
      .group(() => {
        router.get('/', [ClientContactsController, 'index'])
        router.post('/', [ClientContactsController, 'store'])
        router.put('/:id', [ClientContactsController, 'update'])
        router.delete('/:id', [ClientContactsController, 'destroy'])
      })
      .prefix('/:client_id/contacts')
  })
  .prefix('/api/v1/clients')
  .use([middleware.auth(), middleware.userType(['employee', 'manager'])])

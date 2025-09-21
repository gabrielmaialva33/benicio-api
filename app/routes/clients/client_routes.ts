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

    // CEP lookup utility (moved before :id to avoid conflicts)
    router.get('/cep/:cep', [ClientsController, 'lookupCep'])

    // Get single client
    router.get('/:id', [ClientsController, 'show'])

    // Update client
    router.put('/:id', [ClientsController, 'update'])

    // Delete client (soft delete)
    router.delete('/:id', [ClientsController, 'destroy'])

    // Client addresses
    router
      .group(() => {
        router.get('/', [AddressesController, 'index'])
        router.post('/', [AddressesController, 'store'])
        router.put('/:id', [AddressesController, 'update'])
        router.delete('/:id', [AddressesController, 'destroy'])
      })
      .prefix('/:client_id/addresses')

    // Client contacts
    router
      .group(() => {
        router.get('/', [ContactsController, 'index'])
        router.post('/', [ContactsController, 'store'])
        router.put('/:id', [ContactsController, 'update'])
        router.delete('/:id', [ContactsController, 'destroy'])
      })
      .prefix('/:client_id/contacts')
  })
  .prefix('/api/v1/clients')
  .use([middleware.auth(), middleware.userType(['employee', 'manager'])])

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import IPermission from '#interfaces/permission_interface'

const ClientsController = () => import('#controllers/clients/clients_controller')
const AddressesController = () => import('#controllers/clients/addresses_controller')
const ContactsController = () => import('#controllers/clients/contacts_controller')

router
  .group(() => {
    // List clients with filters and pagination
    router
      .get('/', [ClientsController, 'index'])
      .use(
        middleware.permission({
          permissions: `${IPermission.Resources.CLIENTS}.${IPermission.Actions.READ}`,
        })
      )

    // Create new client
    router
      .post('/', [ClientsController, 'store'])
      .use(
        middleware.permission({
          permissions: `${IPermission.Resources.CLIENTS}.${IPermission.Actions.CREATE}`,
        })
      )

    // CEP lookup utility (moved before :id to avoid conflicts)
    router.get('/cep/:cep', [ClientsController, 'lookupCep'])

    // Get single client
    router
      .get('/:id', [ClientsController, 'show'])
      .use(
        middleware.permission({
          permissions: `${IPermission.Resources.CLIENTS}.${IPermission.Actions.READ}`,
        })
      )

    // Update client
    router
      .put('/:id', [ClientsController, 'update'])
      .use(
        middleware.permission({
          permissions: `${IPermission.Resources.CLIENTS}.${IPermission.Actions.UPDATE}`,
        })
      )

    // Delete client (soft delete)
    router
      .delete('/:id', [ClientsController, 'destroy'])
      .use(
        middleware.permission({
          permissions: `${IPermission.Resources.CLIENTS}.${IPermission.Actions.DELETE}`,
        })
      )

    // Client addresses
    router
      .group(() => {
        router
          .get('/', [AddressesController, 'index'])
          .use(
            middleware.permission({
              permissions: `${IPermission.Resources.CLIENTS}.${IPermission.Actions.READ}`,
            })
          )
        router
          .post('/', [AddressesController, 'store'])
          .use(
            middleware.permission({
              permissions: `${IPermission.Resources.CLIENTS}.${IPermission.Actions.CREATE}`,
            })
          )
        router
          .put('/:id', [AddressesController, 'update'])
          .use(
            middleware.permission({
              permissions: `${IPermission.Resources.CLIENTS}.${IPermission.Actions.UPDATE}`,
            })
          )
        router
          .delete('/:id', [AddressesController, 'destroy'])
          .use(
            middleware.permission({
              permissions: `${IPermission.Resources.CLIENTS}.${IPermission.Actions.DELETE}`,
            })
          )
      })
      .prefix('/:client_id/addresses')

    // Client contacts
    router
      .group(() => {
        router
          .get('/', [ContactsController, 'index'])
          .use(
            middleware.permission({
              permissions: `${IPermission.Resources.CLIENTS}.${IPermission.Actions.READ}`,
            })
          )
        router
          .post('/', [ContactsController, 'store'])
          .use(
            middleware.permission({
              permissions: `${IPermission.Resources.CLIENTS}.${IPermission.Actions.CREATE}`,
            })
          )
        router
          .put('/:id', [ContactsController, 'update'])
          .use(
            middleware.permission({
              permissions: `${IPermission.Resources.CLIENTS}.${IPermission.Actions.UPDATE}`,
            })
          )
        router
          .delete('/:id', [ContactsController, 'destroy'])
          .use(
            middleware.permission({
              permissions: `${IPermission.Resources.CLIENTS}.${IPermission.Actions.DELETE}`,
            })
          )
      })
      .prefix('/:client_id/contacts')
  })
  .prefix('/api/v1/clients')
  .use([middleware.auth(), middleware.userType(['employee', 'manager'])])

import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'

import Permission from '#models/permission'
import Role from '#models/role'
import User from '#models/user'
import Client from '#models/client'
import { ClientFactory } from '#database/factories/client_factory'
import { UserFactory } from '#database/factories/user_factory'

import IPermission from '#interfaces/permission_interface'
import IRole from '#interfaces/role_interface'

test.group('Clients CRUD', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // Helper function to create and assign permissions to a role
  async function assignPermissions(role: Role, actions: string[]) {
    const permissions = await Promise.all(
      actions.map((action) =>
        Permission.firstOrCreate(
          {
            resource: IPermission.Resources.CLIENTS,
            action: action,
          },
          {
            name: `clients.${action}`,
            resource: IPermission.Resources.CLIENTS,
            action: action,
          }
        )
      )
    )
    await role.related('permissions').sync(permissions.map((p) => p.id))
  }

  async function createAuthenticatedUser(permissions: string[] = []) {
    const userRole = await Role.firstOrCreate(
      { slug: IRole.Slugs.USER },
      {
        name: 'User',
        slug: IRole.Slugs.USER,
        description: 'Regular user role',
      }
    )

    const authUser = await User.create({
      full_name: 'Auth User',
      email: 'auth@example.com',
      username: 'authuser',
      password: 'password123',
    })

    await db.table('user_roles').insert({
      user_id: authUser.id,
      role_id: userRole.id,
    })

    if (permissions.length > 0) {
      await assignPermissions(userRole, permissions)
    }

    return authUser
  }

  test('should list clients with pagination', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.READ])

    // Create some test clients using the basic factory
    const createdByUser = await UserFactory.create()

    await ClientFactory.merge({
      fantasy_name: 'Client One',
      person_type: 'individual',
      document_type: 'cpf',
      created_by_id: createdByUser.id
    }).create()
    await ClientFactory.merge({
      fantasy_name: 'Client Two',
      person_type: 'individual',
      document_type: 'cpf',
      created_by_id: createdByUser.id
    }).create()
    await ClientFactory.merge({
      fantasy_name: 'Client Three',
      person_type: 'company',
      document_type: 'cnpj',
      created_by_id: createdByUser.id
    }).create()

    const response = await client.get('/api/v1/clients?page=1&per_page=2').loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Clients retrieved successfully',
    })
    response.assertJsonStructure({
      message: {},
      meta: {
        total: {},
        per_page: {},
        current_page: {},
      },
      data: [
        {
          id: {},
          fantasy_name: {},
          document: {},
          person_type: {},
        },
      ],
    })
  })

  test('should filter clients by search', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.READ])

    const createdByUser = await UserFactory.create()

    await ClientFactory.merge({
      fantasy_name: 'Acme Corporation',
      person_type: 'individual',
      document_type: 'cpf',
      created_by_id: createdByUser.id
    }).create()
    await ClientFactory.merge({
      fantasy_name: 'Beta Inc',
      person_type: 'individual',
      document_type: 'cpf',
      created_by_id: createdByUser.id
    }).create()
    await ClientFactory.merge({
      fantasy_name: 'Acme Solutions',
      person_type: 'individual',
      document_type: 'cpf',
      created_by_id: createdByUser.id
    }).create()

    const response = await client.get('/api/v1/clients?search=Acme').loginAs(authUser)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.data.length, 2)
    assert.isTrue(body.data.every((c: any) => c.fantasy_name.includes('Acme')))
  })

  test('should get client by id', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.READ])
    const createdByUser = await UserFactory.create()

    const targetClient = await Client.create({
      fantasy_name: 'Target Client',
      company_name: 'Target Company Ltd',
      document: '12345678901234',
      document_type: 'cnpj',
      person_type: 'company',
      client_type: 'client',
      revenue_range: 'medium',
      employee_count_range: '51-200',
      is_active: true,
      notes: 'Important client',
      created_by_id: createdByUser.id,
    })

    const response = await client.get(`/api/v1/clients/${targetClient.id}`).loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Client retrieved successfully',
      data: {
        id: targetClient.id,
        fantasy_name: targetClient.fantasy_name,
        company_name: targetClient.company_name,
        document: targetClient.document,
        person_type: targetClient.person_type,
        client_type: targetClient.client_type,
      },
    })
  })

  test('should return 404 for non-existent client', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.READ])

    const response = await client.get('/api/v1/clients/999999').loginAs(authUser)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Client not found',
    })
  })

  test('should create new client with basic data', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.CREATE])

    const newClientData = {
      fantasy_name: 'New Client',
      document: '12345678901',
      person_type: 'individual',
      client_type: 'prospect',
    }

    const response = await client.post('/api/v1/clients').json(newClientData).loginAs(authUser)

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'Client created successfully',
      data: {
        fantasy_name: newClientData.fantasy_name,
        document: newClientData.document,
        person_type: newClientData.person_type,
        client_type: newClientData.client_type,
      },
    })

    const createdClient = await Client.findBy('document', newClientData.document)
    assert.isNotNull(createdClient)
    assert.equal(createdClient!.fantasy_name, newClientData.fantasy_name)
  })

  test('should create company client with full data', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.CREATE])

    // Skip company group and business sector for now as models don't exist yet

    const newClientData = {
      fantasy_name: 'Tech Corp',
      company_name: 'Technology Corporation Ltd',
      document: '12345678901234',
      person_type: 'company',
      client_type: 'client',
      // company_group_id: 1,
      // business_sector_id: 1,
      revenue_range: 'large',
      employee_count_range: '201-500',
      is_active: true,
      is_favorite: true,
      ir_retention: true,
      pcc_retention: false,
      connection_code: 'TECH001',
      accounting_account: 'ACC-001',
      monthly_sheet: 100,
      notes: 'Important tech client',
      billing_notes: 'Bill monthly',
    }

    const response = await client.post('/api/v1/clients').json(newClientData).loginAs(authUser)

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'Client created successfully',
    })

    const createdClient = await Client.findBy('document', newClientData.document)
    assert.isNotNull(createdClient)
    assert.equal(createdClient!.company_name, newClientData.company_name)
    assert.equal(createdClient!.revenue_range, newClientData.revenue_range)
    // assert.equal(createdClient!.company_group_id, 1)
  })

  test('should validate client creation data', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.CREATE])

    const response = await client
      .post('/api/v1/clients')
      .json({
        fantasy_name: 'A', // too short
        document: '123', // invalid CPF/CNPJ
        person_type: 'invalid', // invalid enum
      })
      .loginAs(authUser)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'fantasy_name',
          rule: 'minLength',
        },
        {
          field: 'document',
          rule: 'document',
        },
        {
          field: 'person_type',
          rule: 'enum',
        },
      ],
    })
  })

  test('should not allow duplicate document', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.CREATE])
    const createdByUser = await UserFactory.create()

    const existingClient = await Client.create({
      fantasy_name: 'Existing Client',
      document: '11111111111',
      document_type: 'cpf',
      person_type: 'individual',
      created_by_id: createdByUser.id,
    })

    const response = await client
      .post('/api/v1/clients')
      .json({
        fantasy_name: 'New Client',
        document: existingClient.document,
        person_type: 'individual',
      })
      .loginAs(authUser)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'document',
          rule: 'database.unique',
        },
      ],
    })
  })

  test('should update client', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.UPDATE])
    const createdByUser = await UserFactory.create()

    const targetClient = await Client.create({
      fantasy_name: 'Old Name',
      document: '12345678901',
      document_type: 'cpf',
      person_type: 'individual',
      client_type: 'prospect',
      is_active: false,
      created_by_id: createdByUser.id,
    })

    const updateData = {
      fantasy_name: 'Updated Name',
      client_type: 'client',
      is_active: true,
      notes: 'Updated notes',
    }

    const response = await client
      .put(`/api/v1/clients/${targetClient.id}`)
      .json(updateData)
      .loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Client updated successfully',
      data: {
        id: targetClient.id,
        fantasy_name: updateData.fantasy_name,
        client_type: updateData.client_type,
        is_active: updateData.is_active,
      },
    })

    await targetClient.refresh()
    assert.equal(targetClient.fantasy_name, updateData.fantasy_name)
    assert.equal(targetClient.client_type, updateData.client_type)
    assert.isTrue(targetClient.is_active)
  })

  test('should not update document when updating client', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.UPDATE])
    const createdByUser = await UserFactory.create()

    const originalDocument = '12345678901'
    const targetClient = await Client.create({
      fantasy_name: 'Client Name',
      document: originalDocument,
      document_type: 'cpf',
      person_type: 'individual',
      created_by_id: createdByUser.id,
    })

    const response = await client
      .put(`/api/v1/clients/${targetClient.id}`)
      .json({
        document: '98765432109', // Try to change document
        fantasy_name: 'Updated Name',
      })
      .loginAs(authUser)

    response.assertStatus(200)

    await targetClient.refresh()
    assert.equal(targetClient.document, originalDocument) // Document should not change
    assert.equal(targetClient.fantasy_name, 'Updated Name')
  })

  test('should delete client', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.DELETE])
    const createdByUser = await UserFactory.create()

    const targetClient = await Client.create({
      fantasy_name: 'Delete Me',
      document: '12345678901',
      document_type: 'cpf',
      person_type: 'individual',
      created_by_id: createdByUser.id,
    })

    const response = await client.delete(`/api/v1/clients/${targetClient.id}`).loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Client deleted successfully',
    })

    const deletedClient = await Client.find(targetClient.id)
    assert.isNull(deletedClient)
  })

  test('should lookup CEP', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.READ])

    const response = await client.get('/api/v1/clients/cep/01310100').loginAs(authUser)

    // This test will depend on the external API, so we just check the response structure
    response.assertStatus(200)
    if (response.body().data) {
      response.assertJsonStructure({
        data: {
          cep: {},
          logradouro: {},
          bairro: {},
          localidade: {},
          uf: {},
        },
      })
    }
  })

  test('should return 404 for invalid CEP', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.READ])

    const response = await client.get('/api/v1/clients/cep/00000000').loginAs(authUser)

    response.assertStatus(404)
  })

  test('should require authentication for all operations', async ({ client }) => {
    const responses = await Promise.all([
      client.get('/api/v1/clients'),
      client.get('/api/v1/clients/1'),
      client.post('/api/v1/clients').json({}),
      client.put('/api/v1/clients/1').json({}),
      client.delete('/api/v1/clients/1'),
      client.get('/api/v1/clients/cep/01310100'),
    ])

    responses.forEach((response) => {
      response.assertStatus(401)
    })
  })

  test('should check permissions for operations', async ({ client }) => {
    const authUser = await createAuthenticatedUser([]) // No permissions
    const createdByUser = await UserFactory.create()

    const testClient = await Client.create({
      fantasy_name: 'Test Client',
      document: '12345678901',
      document_type: 'cpf',
      person_type: 'individual',
      created_by_id: createdByUser.id,
    })

    const responses = await Promise.all([
      client.get('/api/v1/clients').loginAs(authUser),
      client.get(`/api/v1/clients/${testClient.id}`).loginAs(authUser),
      client.post('/api/v1/clients').json({}).loginAs(authUser),
      client.put(`/api/v1/clients/${testClient.id}`).json({}).loginAs(authUser),
      client.delete(`/api/v1/clients/${testClient.id}`).loginAs(authUser),
    ])

    responses.forEach((response) => {
      response.assertStatus(403)
      response.assertBodyContains({
        message: 'Insufficient permissions',
      })
    })
  })
})

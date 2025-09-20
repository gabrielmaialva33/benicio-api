import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'

import Permission from '#models/permission'
import Role from '#models/role'
import User from '#models/user'
import Client from '#models/client'
import ClientAddress from '#models/client_address'

import IPermission from '#interfaces/permission_interface'
import IRole from '#interfaces/role_interface'

test.group('Client Addresses', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

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
      email: `auth${Date.now()}@example.com`,
      username: `authuser${Date.now()}`,
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

  async function createTestClient() {
    return await Client.create({
      fantasy_name: 'Test Client',
      document: `${Date.now()}`.padStart(11, '0'),
      person_type: 'individual',
    })
  }

  test('should list all addresses for a client', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.READ])
    const testClient = await createTestClient()

    // Create some addresses for the client
    await ClientAddress.createMany([
      {
        client_id: testClient.id,
        postal_code: '01310-100',
        street: 'Avenida Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        is_primary: true,
      },
      {
        client_id: testClient.id,
        postal_code: '20040-020',
        street: 'Avenida Rio Branco',
        number: '156',
        neighborhood: 'Centro',
        city: 'Rio de Janeiro',
        state: 'RJ',
        is_primary: false,
      },
    ])

    const response = await client
      .get(`/api/v1/clients/${testClient.id}/addresses`)
      .loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Addresses retrieved successfully',
    })
    response.assertJsonStructure({
      message: {},
      data: [
        {
          id: {},
          postal_code: {},
          street: {},
          number: {},
          neighborhood: {},
          city: {},
          state: {},
          is_primary: {},
        },
      ],
    })
  })

  test('should create a new address for a client', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.CREATE])
    const testClient = await createTestClient()

    const addressData = {
      postal_code: '01310-100',
      street: 'Avenida Paulista',
      number: '1578',
      complement: 'Sala 1001',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      is_primary: true,
    }

    const response = await client
      .post(`/api/v1/clients/${testClient.id}/addresses`)
      .json(addressData)
      .loginAs(authUser)

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'Address created successfully',
      data: {
        postal_code: addressData.postal_code,
        street: addressData.street,
        number: addressData.number,
        complement: addressData.complement,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state,
      },
    })

    const createdAddress = await ClientAddress.findBy('client_id', testClient.id)
    assert.isNotNull(createdAddress)
    assert.equal(createdAddress!.street, addressData.street)
    assert.equal(createdAddress!.is_primary, true)
  })

  test('should create address with company info', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.CREATE])
    const testClient = await createTestClient()

    // TODO: Add cost center when model is implemented
    // const costCenter = await CostCenter.create({
    //   name: 'Cost Center 1',
    //   code: 'CC001',
    // })

    const addressData = {
      company_name: 'Branch Office Ltd',
      fantasy_name: 'Branch Office',
      document: '12345678901234',
      person_type: 'company',
      postal_code: '01310-100',
      street: 'Avenida Paulista',
      number: '2000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      // cost_center_id: costCenter.id,
    }

    const response = await client
      .post(`/api/v1/clients/${testClient.id}/addresses`)
      .json(addressData)
      .loginAs(authUser)

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'Address created successfully',
      data: {
        company_name: addressData.company_name,
        fantasy_name: addressData.fantasy_name,
        document: addressData.document,
        person_type: addressData.person_type,
      },
    })

    const createdAddress = await ClientAddress.findBy('client_id', testClient.id)
    assert.isNotNull(createdAddress)
    assert.equal(createdAddress!.company_name, addressData.company_name)
    // assert.equal(createdAddress!.cost_center_id, costCenter.id)
  })

  test('should update an address', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.UPDATE])
    const testClient = await createTestClient()

    const existingAddress = await ClientAddress.create({
      client_id: testClient.id,
      postal_code: '01310-100',
      street: 'Old Street',
      number: '100',
      neighborhood: 'Old Neighborhood',
      city: 'Old City',
      state: 'SP',
    })

    const updateData = {
      street: 'New Street',
      number: '200',
      complement: 'Apt 101',
      neighborhood: 'New Neighborhood',
      city: 'New City',
    }

    const response = await client
      .put(`/api/v1/clients/${testClient.id}/addresses/${existingAddress.id}`)
      .json(updateData)
      .loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Address updated successfully',
      data: {
        id: existingAddress.id,
        street: updateData.street,
        number: updateData.number,
        complement: updateData.complement,
        neighborhood: updateData.neighborhood,
        city: updateData.city,
      },
    })

    await existingAddress.refresh()
    assert.equal(existingAddress.street, updateData.street)
    assert.equal(existingAddress.number, updateData.number)
    assert.equal(existingAddress.complement, updateData.complement)
  })

  test('should set primary address and unset others', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.UPDATE])
    const testClient = await createTestClient()

    // Create two addresses, first one is primary
    const primaryAddress = await ClientAddress.create({
      client_id: testClient.id,
      postal_code: '01310-100',
      street: 'Street 1',
      number: '100',
      neighborhood: 'Neighborhood 1',
      city: 'City 1',
      state: 'SP',
      is_primary: true,
    })

    const secondaryAddress = await ClientAddress.create({
      client_id: testClient.id,
      postal_code: '20040-020',
      street: 'Street 2',
      number: '200',
      neighborhood: 'Neighborhood 2',
      city: 'City 2',
      state: 'RJ',
      is_primary: false,
    })

    // Update secondary to be primary
    const response = await client
      .put(`/api/v1/clients/${testClient.id}/addresses/${secondaryAddress.id}`)
      .json({ is_primary: true })
      .loginAs(authUser)

    response.assertStatus(200)

    await primaryAddress.refresh()
    await secondaryAddress.refresh()

    assert.isFalse(primaryAddress.is_primary)
    assert.isTrue(secondaryAddress.is_primary)
  })

  test('should delete an address', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.DELETE])
    const testClient = await createTestClient()

    const addressToDelete = await ClientAddress.create({
      client_id: testClient.id,
      postal_code: '01310-100',
      street: 'Delete Me',
      number: '999',
      neighborhood: 'Delete Neighborhood',
      city: 'Delete City',
      state: 'SP',
    })

    const response = await client
      .delete(`/api/v1/clients/${testClient.id}/addresses/${addressToDelete.id}`)
      .loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Address deleted successfully',
    })

    const deletedAddress = await ClientAddress.find(addressToDelete.id)
    assert.isNull(deletedAddress)
  })

  test('should validate address creation', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.CREATE])
    const testClient = await createTestClient()

    const response = await client
      .post(`/api/v1/clients/${testClient.id}/addresses`)
      .json({
        postal_code: '123', // invalid format
        street: '', // empty
        number: '', // empty
        neighborhood: '', // empty
        city: '', // empty
        state: 'ABC', // too long
      })
      .loginAs(authUser)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'street',
          rule: 'required',
        },
        {
          field: 'number',
          rule: 'required',
        },
        {
          field: 'neighborhood',
          rule: 'required',
        },
        {
          field: 'city',
          rule: 'required',
        },
        {
          field: 'state',
          rule: 'maxLength',
        },
      ],
    })
  })

  test('should not allow updating address from another client', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.UPDATE])
    const client1 = await createTestClient()
    const client2 = await createTestClient()

    const addressFromClient1 = await ClientAddress.create({
      client_id: client1.id,
      postal_code: '01310-100',
      street: 'Street 1',
      number: '100',
      neighborhood: 'Neighborhood 1',
      city: 'City 1',
      state: 'SP',
    })

    // Try to update client1's address using client2's ID
    const response = await client
      .put(`/api/v1/clients/${client2.id}/addresses/${addressFromClient1.id}`)
      .json({ street: 'Updated Street' })
      .loginAs(authUser)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Address not found',
    })
  })

  test('should require authentication for address operations', async ({ client }) => {
    const testClient = await createTestClient()

    const responses = await Promise.all([
      client.get(`/api/v1/clients/${testClient.id}/addresses`),
      client.post(`/api/v1/clients/${testClient.id}/addresses`).json({}),
      client.put(`/api/v1/clients/${testClient.id}/addresses/1`).json({}),
      client.delete(`/api/v1/clients/${testClient.id}/addresses/1`),
    ])

    responses.forEach((response) => {
      response.assertStatus(401)
    })
  })

  test('should check permissions for address operations', async ({ client }) => {
    const authUser = await createAuthenticatedUser([]) // No permissions
    const testClient = await createTestClient()

    const testAddress = await ClientAddress.create({
      client_id: testClient.id,
      postal_code: '01310-100',
      street: 'Test Street',
      number: '100',
      neighborhood: 'Test Neighborhood',
      city: 'Test City',
      state: 'SP',
    })

    const responses = await Promise.all([
      client.get(`/api/v1/clients/${testClient.id}/addresses`).loginAs(authUser),
      client.post(`/api/v1/clients/${testClient.id}/addresses`).json({}).loginAs(authUser),
      client
        .put(`/api/v1/clients/${testClient.id}/addresses/${testAddress.id}`)
        .json({})
        .loginAs(authUser),
      client
        .delete(`/api/v1/clients/${testClient.id}/addresses/${testAddress.id}`)
        .loginAs(authUser),
    ])

    responses.forEach((response) => {
      response.assertStatus(403)
      response.assertBodyContains({
        message: 'Insufficient permissions',
      })
    })
  })
})
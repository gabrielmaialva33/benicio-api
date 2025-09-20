import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'

import Permission from '#models/permission'
import Role from '#models/role'
import User from '#models/user'
import Client from '#models/client'
import ClientAddress from '#models/client_address'
import ClientContact from '#models/client_contact'

import IPermission from '#interfaces/permission_interface'
import IRole from '#interfaces/role_interface'

test.group('Client Contacts', (group) => {
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

  async function createTestClientWithAddress() {
    const client = await Client.create({
      fantasy_name: 'Test Client',
      document: `${Date.now()}`.padStart(11, '0'),
      person_type: 'individual',
    })

    const address = await ClientAddress.create({
      client_id: client.id,
      postal_code: '01310-100',
      street: 'Test Street',
      number: '100',
      neighborhood: 'Test Neighborhood',
      city: 'Test City',
      state: 'SP',
    })

    return { client, address }
  }

  test('should list all contacts for a client', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.READ])
    const { client: testClient, address } = await createTestClientWithAddress()

    // Create some contacts for the client
    await ClientContact.createMany([
      {
        client_id: testClient.id,
        address_id: address.id,
        name: 'John Doe',
        contact_type: 'email',
        contact_value: 'john@example.com',
        receives_billing: true,
      },
      {
        client_id: testClient.id,
        address_id: address.id,
        name: 'Jane Smith',
        contact_type: 'phone',
        contact_value: '(11) 99999-9999',
        participates_mailing: true,
      },
    ])

    const response = await client.get(`/api/v1/clients/${testClient.id}/contacts`).loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Contacts retrieved successfully',
    })
    response.assertJsonStructure({
      message: {},
      data: [
        {
          id: {},
          name: {},
          contact_type: {},
          contact_value: {},
          address_id: {},
        },
      ],
    })
  })

  test('should create a new contact for a client', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.CREATE])
    const { client: testClient, address } = await createTestClientWithAddress()

    const contactData = {
      address_id: address.id,
      name: 'New Contact',
      contact_type: 'email',
      contact_value: 'newcontact@example.com',
      participates_mailing: true,
      receives_billing: false,
    }

    const response = await client
      .post(`/api/v1/clients/${testClient.id}/contacts`)
      .json(contactData)
      .loginAs(authUser)

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'Contact created successfully',
      data: {
        name: contactData.name,
        contact_type: contactData.contact_type,
        contact_value: contactData.contact_value,
        participates_mailing: contactData.participates_mailing,
        receives_billing: contactData.receives_billing,
      },
    })

    const createdContact = await ClientContact.findBy('contact_value', contactData.contact_value)
    assert.isNotNull(createdContact)
    assert.equal(createdContact!.name, contactData.name)
  })

  test('should create contact with work area and position', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.CREATE])
    const { client: testClient, address } = await createTestClientWithAddress()

    // TODO: Add work area and position when models are implemented
    // const workArea = await WorkArea.create({
    //   name: 'IT Department',
    // })

    // const position = await Position.create({
    //   name: 'Software Engineer',
    // })

    const contactData = {
      address_id: address.id,
      name: 'Tech Contact',
      // work_area_id: workArea.id,
      // position_id: position.id,
      contact_type: 'email',
      contact_value: 'tech@example.com',
    }

    const response = await client
      .post(`/api/v1/clients/${testClient.id}/contacts`)
      .json(contactData)
      .loginAs(authUser)

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'Contact created successfully',
      data: {
        name: contactData.name,
        // work_area_id: workArea.id,
        // position_id: position.id,
      },
    })

    const createdContact = await ClientContact.findBy('contact_value', contactData.contact_value)
    assert.isNotNull(createdContact)
    // assert.equal(createdContact!.work_area_id, workArea.id)
    // assert.equal(createdContact!.position_id, position.id)
  })

  test('should update a contact', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.UPDATE])
    const { client: testClient, address } = await createTestClientWithAddress()

    const existingContact = await ClientContact.create({
      client_id: testClient.id,
      address_id: address.id,
      name: 'Old Name',
      contact_type: 'email',
      contact_value: 'old@example.com',
      participates_mailing: false,
      receives_billing: false,
    })

    const updateData = {
      name: 'Updated Name',
      contact_value: 'updated@example.com',
      participates_mailing: true,
      receives_billing: true,
    }

    const response = await client
      .put(`/api/v1/clients/${testClient.id}/contacts/${existingContact.id}`)
      .json(updateData)
      .loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Contact updated successfully',
      data: {
        id: existingContact.id,
        name: updateData.name,
        contact_value: updateData.contact_value,
        participates_mailing: updateData.participates_mailing,
        receives_billing: updateData.receives_billing,
      },
    })

    await existingContact.refresh()
    assert.equal(existingContact.name, updateData.name)
    assert.equal(existingContact.contact_value, updateData.contact_value)
    assert.isTrue(existingContact.participates_mailing)
    assert.isTrue(existingContact.receives_billing)
  })

  test('should block/unblock a contact', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.UPDATE])
    const { client: testClient, address } = await createTestClientWithAddress()

    const contact = await ClientContact.create({
      client_id: testClient.id,
      address_id: address.id,
      name: 'Contact to Block',
      contact_type: 'email',
      contact_value: 'block@example.com',
      is_blocked: false,
    })

    // Block the contact
    const blockResponse = await client
      .put(`/api/v1/clients/${testClient.id}/contacts/${contact.id}`)
      .json({ is_blocked: true })
      .loginAs(authUser)

    blockResponse.assertStatus(200)

    await contact.refresh()
    assert.isTrue(contact.is_blocked)

    // Unblock the contact
    const unblockResponse = await client
      .put(`/api/v1/clients/${testClient.id}/contacts/${contact.id}`)
      .json({ is_blocked: false })
      .loginAs(authUser)

    unblockResponse.assertStatus(200)

    await contact.refresh()
    assert.isFalse(contact.is_blocked)
  })

  test('should delete a contact', async ({ client, assert }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.DELETE])
    const { client: testClient, address } = await createTestClientWithAddress()

    const contactToDelete = await ClientContact.create({
      client_id: testClient.id,
      address_id: address.id,
      name: 'Delete Me',
      contact_type: 'phone',
      contact_value: '(11) 11111-1111',
    })

    const response = await client
      .delete(`/api/v1/clients/${testClient.id}/contacts/${contactToDelete.id}`)
      .loginAs(authUser)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Contact deleted successfully',
    })

    const deletedContact = await ClientContact.find(contactToDelete.id)
    assert.isNull(deletedContact)
  })

  test('should validate contact creation', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.CREATE])
    const { client: testClient } = await createTestClientWithAddress()

    const response = await client
      .post(`/api/v1/clients/${testClient.id}/contacts`)
      .json({
        address_id: 'invalid', // not a number
        name: '', // empty
        contact_type: 'invalid', // invalid enum
        contact_value: '', // empty
      })
      .loginAs(authUser)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'address_id',
          rule: 'number',
        },
        {
          field: 'name',
          rule: 'required',
        },
        {
          field: 'contact_type',
          rule: 'enum',
        },
        {
          field: 'contact_value',
          rule: 'required',
        },
      ],
    })
  })

  test('should validate contact type enum values', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.CREATE])
    const { client: testClient, address } = await createTestClientWithAddress()

    // Test valid phone type
    const phoneResponse = await client
      .post(`/api/v1/clients/${testClient.id}/contacts`)
      .json({
        address_id: address.id,
        name: 'Phone Contact',
        contact_type: 'phone',
        contact_value: '(11) 99999-9999',
      })
      .loginAs(authUser)

    phoneResponse.assertStatus(201)

    // Test valid email type
    const emailResponse = await client
      .post(`/api/v1/clients/${testClient.id}/contacts`)
      .json({
        address_id: address.id,
        name: 'Email Contact',
        contact_type: 'email',
        contact_value: 'email@example.com',
      })
      .loginAs(authUser)

    emailResponse.assertStatus(201)

    // Test invalid type
    const invalidResponse = await client
      .post(`/api/v1/clients/${testClient.id}/contacts`)
      .json({
        address_id: address.id,
        name: 'Invalid Contact',
        contact_type: 'fax', // Invalid type
        contact_value: 'some value',
      })
      .loginAs(authUser)

    invalidResponse.assertStatus(422)
    invalidResponse.assertBodyContains({
      errors: [
        {
          field: 'contact_type',
          rule: 'enum',
        },
      ],
    })
  })

  test('should not allow updating contact from another client', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.UPDATE])

    const { client: client1, address: address1 } = await createTestClientWithAddress()
    const { client: client2 } = await createTestClientWithAddress()

    const contactFromClient1 = await ClientContact.create({
      client_id: client1.id,
      address_id: address1.id,
      name: 'Client 1 Contact',
      contact_type: 'email',
      contact_value: 'client1@example.com',
    })

    // Try to update client1's contact using client2's ID
    const response = await client
      .put(`/api/v1/clients/${client2.id}/contacts/${contactFromClient1.id}`)
      .json({ name: 'Hacked Name' })
      .loginAs(authUser)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Contact not found',
    })
  })

  test('should validate address belongs to client when creating contact', async ({ client }) => {
    const authUser = await createAuthenticatedUser([IPermission.Actions.CREATE])

    const { client: client1 } = await createTestClientWithAddress()
    const { address: addressFromClient2 } = await createTestClientWithAddress()

    // Try to create a contact for client1 using an address from client2
    const response = await client
      .post(`/api/v1/clients/${client1.id}/contacts`)
      .json({
        address_id: addressFromClient2.id,
        name: 'Invalid Contact',
        contact_type: 'email',
        contact_value: 'invalid@example.com',
      })
      .loginAs(authUser)

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Address does not belong to this client',
    })
  })

  test('should require authentication for contact operations', async ({ client }) => {
    const { client: testClient } = await createTestClientWithAddress()

    const responses = await Promise.all([
      client.get(`/api/v1/clients/${testClient.id}/contacts`),
      client.post(`/api/v1/clients/${testClient.id}/contacts`).json({}),
      client.put(`/api/v1/clients/${testClient.id}/contacts/1`).json({}),
      client.delete(`/api/v1/clients/${testClient.id}/contacts/1`),
    ])

    responses.forEach((response) => {
      response.assertStatus(401)
    })
  })

  test('should check permissions for contact operations', async ({ client }) => {
    const authUser = await createAuthenticatedUser([]) // No permissions
    const { client: testClient, address } = await createTestClientWithAddress()

    const testContact = await ClientContact.create({
      client_id: testClient.id,
      address_id: address.id,
      name: 'Test Contact',
      contact_type: 'email',
      contact_value: 'test@example.com',
    })

    const responses = await Promise.all([
      client.get(`/api/v1/clients/${testClient.id}/contacts`).loginAs(authUser),
      client.post(`/api/v1/clients/${testClient.id}/contacts`).json({}).loginAs(authUser),
      client
        .put(`/api/v1/clients/${testClient.id}/contacts/${testContact.id}`)
        .json({})
        .loginAs(authUser),
      client
        .delete(`/api/v1/clients/${testClient.id}/contacts/${testContact.id}`)
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

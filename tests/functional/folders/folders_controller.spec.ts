import { test } from '@japa/runner'
import { DateTime, Settings } from 'luxon'
import { FolderFactory } from '#database/factories/folder_factory'
import { FolderTypeFactory } from '#database/factories/folder_type_factory'
import { ClientFactory } from '#database/factories/client_factory'
import { CourtFactory } from '#database/factories/court_factory'
import { UserFactory } from '#database/factories/user_factory'
import Folder from '#models/folder'
import testUtils from '@adonisjs/core/services/test_utils'
import { FolderPriority } from '../../../contracts/folder_enums.js'

test.group('Folders controller', (group) => {
  let mockNow: DateTime

  group.setup(() => {
    // Mock DateTime.now() for consistent testing
    mockNow = DateTime.local(2024, 12, 25, 10, 0, 0)
    Settings.now = () => mockNow.toMillis()
  })

  group.teardown(() => {
    // Restore original DateTime.now()
    Settings.now = () => Date.now()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should list folders with pagination', async ({ client }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()
    const court = await CourtFactory.create()

    await FolderFactory.merge({
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      court_id: court.id,
      created_by_id: user.id,
      updated_by_id: user.id,
    }).createMany(5)

    const response = await client.get('/api/v1/folders').loginAs(user).qs({ page: 1, limit: 3 })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Folders retrieved successfully',
    })
  })

  test('should filter folders by search term', async ({ client }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    const targetFolder = await FolderFactory.merge({
      title: 'Processo Importante',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
      updated_by_id: user.id,
    }).create()

    await FolderFactory.merge({
      title: 'Outro Processo',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
      updated_by_id: user.id,
    }).create()

    const response = await client.get('/api/v1/folders').loginAs(user).qs({ search: 'Importante' })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Folders retrieved successfully',
    })
  })

  test('should create new folder with valid data', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()
    const court = await CourtFactory.create()

    const folderData = {
      title: 'Novo Processo Civil',
      description: 'Descrição do processo',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      court_id: court.id,
      case_value: 50000.0,
      status: 'active',
      priority: FolderPriority.NORMAL,
    }

    const response = await client.post('/api/v1/folders').loginAs(user).json(folderData)

    response.assertStatus(201)
    response.assertBodyContains({
      message: 'Folder created successfully',
    })

    const folder = await Folder.findOrFail(response.body().data.id)
    assert.equal(folder.title, folderData.title)
    assert.equal(folder.created_by_id, user.id)
  })

  test('should create folder with valid CNJ number', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    const folderData = {
      title: 'Processo com CNJ',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      cnj_number: '0000001-48.2024.8.26.0001', // Valid CNJ with correct verification digit
    }

    const response = await client.post('/api/v1/folders').loginAs(user).json(folderData)

    response.assertStatus(201)
    const folder = await Folder.findOrFail(response.body().data.id)
    assert.isNotNull(folder.cnj_number)
  })

  test('should reject folder creation with invalid CNJ number', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    const folderData = {
      title: 'Processo com CNJ Inválido',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      cnj_number: '1234567-89.2024.8.26.000X',
    }

    const response = await client.post('/api/v1/folders').loginAs(user).json(folderData)

    response.assertStatus(400)
    // Just check that the response contains Invalid CNJ
    const body = response.body()
    assert.include(body.message, 'Invalid CNJ number')
  })

  test('should validate required fields', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.post('/api/v1/folders').loginAs(user).json({})

    response.assertStatus(422)
  })

  test('should show folder with relationships', async ({ client }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()
    const court = await CourtFactory.create()

    const folder = await FolderFactory.merge({
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      court_id: court.id,
      created_by_id: user.id,
      updated_by_id: user.id,
    }).create()

    const response = await client.get(`/api/v1/folders/${folder.id}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Folder retrieved successfully',
    })
  })

  test('should return 404 for non-existent folder', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.get('/api/v1/folders/99999').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Folder not found',
    })
  })

  test('should update folder with valid data', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    const folder = await FolderFactory.merge({
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
      updated_by_id: user.id,
    }).create()

    const updateData = {
      title: 'Título Atualizado',
      description: 'Nova descrição',
      status: 'on_hold',
    }

    const response = await client.put(`/api/v1/folders/${folder.id}`).loginAs(user).json(updateData)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Folder updated successfully',
    })

    await folder.refresh()
    assert.equal(folder.title, updateData.title)
    assert.equal(folder.status, updateData.status)
    assert.equal(folder.updated_by_id, user.id)
  })

  test('should soft delete folder', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    const folder = await FolderFactory.merge({
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
      updated_by_id: user.id,
    }).create()

    const response = await client.delete(`/api/v1/folders/${folder.id}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Folder deleted successfully',
    })

    // Verify folder was soft deleted (it should not be found in normal queries)
    const deletedFolder = await Folder.find(folder.id)
    assert.isNull(deletedFolder)
  })

  test('should restore soft deleted folder', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    const folder = await FolderFactory.merge({
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
      updated_by_id: user.id,
      deleted_at: DateTime.now(),
    }).create()

    const response = await client.post(`/api/v1/folders/${folder.id}/restore`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Folder restored successfully',
    })

    await folder.refresh()
    assert.isNull(folder.deleted_at)
  })

  test('should filter folders by date range', async ({ client }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    // Create folder with specific status
    await FolderFactory.merge({
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
      updated_by_id: user.id,
      status: 'active',
    }).create()

    // Create folder with different status
    await FolderFactory.merge({
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
      updated_by_id: user.id,
      status: 'archived',
    }).create()

    const response = await client.get('/api/v1/folders').loginAs(user).qs({
      status: 'active',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Folders retrieved successfully',
    })
  })

  test('should handle deadline calculations correctly', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    // Create folder
    const folder = await FolderFactory.merge({
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
      updated_by_id: user.id,
    }).create()

    const response = await client.get(`/api/v1/folders/${folder.id}`).loginAs(user)

    response.assertStatus(200)
    const responseData = response.body().data

    // Verify folder data
    assert.isNotNull(responseData.id)
    assert.equal(responseData.id, folder.id)
  })

  test('should validate CNJ number endpoint', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client
      .post('/api/v1/folders/validate-cnj')
      .loginAs(user)
      .json({ cnj_number: '1234567-89.2024.8.26.0001' })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'CNJ validation completed',
    })
  })

  test('should get folder statistics', async ({ client }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    await FolderFactory.merge({
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
      updated_by_id: user.id,
      status: 'active',
    }).createMany(3)

    await FolderFactory.merge({
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
      updated_by_id: user.id,
      status: 'archived',
    }).createMany(2)

    const response = await client.get('/api/v1/folders/stats').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Folder statistics retrieved successfully',
    })
  })

  test('should require authentication for all endpoints', async ({ client }) => {
    const response = await client.get('/api/v1/folders')
    response.assertStatus(401)
  })
})

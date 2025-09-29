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

test.group('Folder Basic Tests (Validation)', (group) => {
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

  test('should create folder with basic data and validate relationships', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()
    const court = await CourtFactory.create()

    const folderData = {
      title: 'Teste Básico de Pasta',
      description: 'Descrição do teste básico',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      court_id: court.id,
      case_value: 50000.0,
      priority: FolderPriority.NORMAL,
    }

    const createResponse = await client.post('/api/v1/folders').loginAs(user).json(folderData)

    createResponse.assertStatus(201)
    const createdFolder = createResponse.body().data

    assert.equal(createdFolder.title, folderData.title)
    assert.equal(createdFolder.client_id, clientRecord.id)
    assert.equal(createdFolder.created_by_id, user.id)

    // Test folder detail with relationships
    const detailResponse = await client.get(`/api/v1/folders/${createdFolder.id}`).loginAs(user)

    detailResponse.assertStatus(200)
    const folderDetail = detailResponse.body().data

    assert.property(folderDetail, 'client')
    assert.property(folderDetail, 'folder_type')
    assert.property(folderDetail, 'court')
    assert.property(folderDetail, 'created_by')

    assert.equal(folderDetail.client.id, clientRecord.id)
    assert.equal(folderDetail.folder_type.id, folderType.id)
    assert.equal(folderDetail.court.id, court.id)
    assert.equal(folderDetail.created_by.id, user.id)
  })

  test('should validate folder ownership and basic access control', async ({ client, assert }) => {
    const ownerUser = await UserFactory.create()
    const otherUser = await UserFactory.create()

    const folderType = await FolderTypeFactory.create()
    const ownerClient = await ClientFactory.merge({ created_by_id: ownerUser.id }).create()

    // Owner creates folder
    const folder = await FolderFactory.merge({
      title: 'Pasta do Proprietário',
      folder_type_id: folderType.id,
      client_id: ownerClient.id,
      created_by_id: ownerUser.id,
    }).create()

    // Owner should access their folder
    const ownerAccessResponse = await client.get(`/api/v1/folders/${folder.id}`).loginAs(ownerUser)

    ownerAccessResponse.assertStatus(200)
    assert.equal(ownerAccessResponse.body().data.created_by.id, ownerUser.id)

    // Other user should NOT access (assuming basic ownership rules)
    const otherUserAccessResponse = await client
      .get(`/api/v1/folders/${folder.id}`)
      .loginAs(otherUser)

    // This might be 403 (Forbidden) or 404 (Not Found) depending on implementation
    assert.oneOf(otherUserAccessResponse.status, [403, 404])
  })

  test('should validate folder query scopes work correctly', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    // Create folders with different characteristics
    await FolderFactory.merge({
      title: 'Pasta Ativa',
      status: 'active',
      is_active: true,
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
    }).create()

    await FolderFactory.merge({
      title: 'Pasta Arquivada',
      status: 'archived',
      is_active: false,
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
    }).create()

    // Test listing all folders (should respect user access)
    const listResponse = await client.get('/api/v1/folders').loginAs(user)

    listResponse.assertStatus(200)
    const folders = listResponse.body().data.data

    assert.isArray(folders)
    assert.isAtLeast(folders.length, 1)

    // Test filtering by status
    const activeResponse = await client
      .get('/api/v1/folders')
      .loginAs(user)
      .qs({ status: 'active' })

    activeResponse.assertStatus(200)
    const activeFolders = activeResponse.body().data.data

    // All returned folders should have active status
    for (const folder of activeFolders) {
      assert.equal(folder.status, 'active')
    }
  })

  test('should validate folder search functionality', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    // Create folder with searchable content
    await FolderFactory.merge({
      title: 'Processo de Cobrança Importante',
      description: 'Ação de cobrança de valores comerciais',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
    }).create()

    await FolderFactory.merge({
      title: 'Processo Trabalhista',
      description: 'Reclamação trabalhista por horas extras',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
    }).create()

    // Test search by title
    const searchResponse = await client
      .get('/api/v1/folders')
      .loginAs(user)
      .qs({ search: 'Cobrança' })

    searchResponse.assertStatus(200)
    const searchResults = searchResponse.body().data.data

    assert.isAtLeast(searchResults.length, 1)

    const foundFolder = searchResults.find((f) => f.title.includes('Cobrança'))
    assert.isNotNull(foundFolder)
  })

  test('should validate folder update and status transitions', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    const folder = await FolderFactory.merge({
      title: 'Pasta para Atualização',
      status: 'pre_registration',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
    }).create()

    // Test basic update
    const updateResponse = await client.put(`/api/v1/folders/${folder.id}`).loginAs(user).json({
      title: 'Pasta Atualizada',
      description: 'Descrição atualizada',
    })

    updateResponse.assertStatus(200)
    assert.equal(updateResponse.body().data.title, 'Pasta Atualizada')

    // Test status transition
    const statusResponse = await client.put(`/api/v1/folders/${folder.id}`).loginAs(user).json({
      status: 'active',
    })

    statusResponse.assertStatus(200)
    assert.equal(statusResponse.body().data.status, 'active')

    // Verify in database
    await folder.refresh()
    assert.equal(folder.title, 'Pasta Atualizada')
    assert.equal(folder.status, 'active')
    assert.equal(folder.updated_by_id, user.id)
  })

  test('should validate folder soft delete and restore', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    const folder = await FolderFactory.merge({
      title: 'Pasta para Exclusão',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
    }).create()

    // Test soft delete
    const deleteResponse = await client.delete(`/api/v1/folders/${folder.id}`).loginAs(user)

    deleteResponse.assertStatus(200)

    // Verify folder is soft deleted (should not appear in normal queries)
    const afterDeleteResponse = await client.get(`/api/v1/folders/${folder.id}`).loginAs(user)

    afterDeleteResponse.assertStatus(404)

    // Test restore
    const restoreResponse = await client.post(`/api/v1/folders/${folder.id}/restore`).loginAs(user)

    restoreResponse.assertStatus(200)

    // Verify folder is restored
    const restoredResponse = await client.get(`/api/v1/folders/${folder.id}`).loginAs(user)

    restoredResponse.assertStatus(200)
    assert.equal(restoredResponse.body().data.title, 'Pasta para Exclusão')
  })

  test('should validate authentication requirement', async ({ client }) => {
    // Test all endpoints require authentication
    const endpoints = [
      { method: 'get', url: '/api/v1/folders' },
      { method: 'post', url: '/api/v1/folders' },
      { method: 'get', url: '/api/v1/folders/1' },
      { method: 'put', url: '/api/v1/folders/1' },
      { method: 'delete', url: '/api/v1/folders/1' },
    ]

    for (const endpoint of endpoints) {
      const response = await client[endpoint.method](endpoint.url)
      response.assertStatus(401)
    }
  })

  test('should validate folder statistics endpoint', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    // Create folders with different statuses
    await FolderFactory.merge({
      status: 'active',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
    }).createMany(3)

    await FolderFactory.merge({
      status: 'archived',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
    }).createMany(2)

    // Test statistics endpoint
    const statsResponse = await client.get('/api/v1/folders/stats').loginAs(user)

    statsResponse.assertStatus(200)
    const stats = statsResponse.body().data

    assert.property(stats, 'total')
    assert.property(stats, 'active')
    assert.property(stats, 'archived')

    assert.isAtLeast(stats.total, 5)
    assert.isAtLeast(stats.active, 3)
    assert.isAtLeast(stats.archived, 2)
  })
})

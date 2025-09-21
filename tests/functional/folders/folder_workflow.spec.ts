import { test } from '@japa/runner'
import { DateTime, Settings } from 'luxon'
import { FolderFactory } from '#database/factories/folder_factory'
import { FolderTypeFactory } from '#database/factories/folder_type_factory'
import { ClientFactory } from '#database/factories/client_factory'
import { CourtFactory } from '#database/factories/court_factory'
import { UserFactory } from '#database/factories/user_factory'
import Folder from '#models/folder'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Folder Workflow E2E', (group) => {
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

  test('complete folder lifecycle: create → update → add documents → close → archive', async ({
    client,
    assert,
  }) => {
    // Setup test data
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()
    const court = await CourtFactory.create()

    // Step 1: Create a new folder (pre_registration state)
    const createData = {
      title: 'Processo de Ação Civil',
      description: 'Ação civil por danos morais',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      court_id: court.id,
      case_value: 100000.0,
      opposing_party: 'João Silva',
      status: 'pre_registration',
      priority: 'normal',
      deadline_date: DateTime.now().plus({ days: 60 }).toISO(),
    }

    const createResponse = await client.post('/api/v1/folders').loginAs(user).json(createData)

    createResponse.assertStatus(201)
    const folderId = createResponse.body().data.id

    // Verify folder was created with correct status
    const folder = await Folder.findOrFail(folderId)
    assert.equal(folder.status, 'pre_registration')
    assert.equal(folder.created_by_id, user.id)

    // Step 2: Update folder status to awaiting_info
    const updateResponse = await client.put(`/folders/${folderId}`).loginAs(user).json({
      status: 'awaiting_info',
      internal_notes: 'Aguardando documentos do cliente',
    })

    updateResponse.assertStatus(200)

    await folder.refresh()
    assert.equal(folder.status, 'awaiting_info')
    assert.isNotNull(folder.internal_notes)

    // Step 3: Progress to registered status
    const registerResponse = await client.put(`/folders/${folderId}`).loginAs(user).json({
      status: 'registered',
      cnj_number: '1234567-89.2024.8.26.0001',
      opened_at: DateTime.now().toISO(),
    })

    registerResponse.assertStatus(200)

    await folder.refresh()
    assert.equal(folder.status, 'registered')
    assert.isNotNull(folder.cnj_number)

    // Step 4: Activate the folder
    const activateResponse = await client
      .put(`/folders/${folderId}`)
      .loginAs(user)
      .json({ status: 'active' })

    activateResponse.assertStatus(200)

    await folder.refresh()
    assert.equal(folder.status, 'active')

    // Step 5: Put folder on hold temporarily
    const holdResponse = await client.put(`/folders/${folderId}`).loginAs(user).json({
      status: 'on_hold',
      internal_notes: 'Aguardando decisão judicial',
    })

    holdResponse.assertStatus(200)

    await folder.refresh()
    assert.equal(folder.status, 'on_hold')

    // Step 6: Reactivate and then close the folder
    await client.put(`/folders/${folderId}`).loginAs(user).json({ status: 'active' })

    const closeResponse = await client.put(`/folders/${folderId}`).loginAs(user).json({
      status: 'closed',
      closed_at: DateTime.now().toISO(),
      internal_notes: 'Processo finalizado com acordo',
    })

    closeResponse.assertStatus(200)

    await folder.refresh()
    assert.equal(folder.status, 'closed')
    assert.isNotNull(folder.closed_at)

    // Step 7: Archive the closed folder
    const archiveResponse = await client
      .put(`/folders/${folderId}`)
      .loginAs(user)
      .json({ status: 'archived' })

    archiveResponse.assertStatus(200)

    await folder.refresh()
    assert.equal(folder.status, 'archived')

    // Step 8: Verify the complete workflow by checking statistics
    const statsResponse = await client.get('/folders/stats').loginAs(user)

    statsResponse.assertStatus(200)
    const stats = statsResponse.body().data
    assert.equal(stats.archived, 1)
  })

  test('folder deadline tracking and overdue detection', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    // Create folder with deadline in the past (overdue)
    const overdueDeadline = DateTime.now().minus({ days: 5 })
    const overdueFolder = await FolderFactory.merge({
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
      updated_by_id: user.id,
      deadline_date: overdueDeadline,
      status: 'active',
    }).create()

    // Create folder with deadline in the future
    const futureDeadline = DateTime.now().plus({ days: 15 })
    const futureFolder = await FolderFactory.merge({
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      created_by_id: user.id,
      updated_by_id: user.id,
      deadline_date: futureDeadline,
      status: 'active',
    }).create()

    // Test filtering by overdue folders
    const overdueResponse = await client.get('/api/v1/folders').loginAs(user).qs({
      status: 'active',
      overdue: 'true',
    })

    overdueResponse.assertStatus(200)

    // Test filtering by upcoming deadlines (next 30 days)
    const upcomingResponse = await client.get('/api/v1/folders').loginAs(user).qs({
      status: 'active',
      deadline_in_days: '30',
    })

    upcomingResponse.assertStatus(200)

    // Verify individual folder deadline calculations
    const folderResponse = await client.get(`/folders/${futureFolder.id}`).loginAs(user)

    folderResponse.assertStatus(200)
    const folderData = folderResponse.body().data
    assert.isNotNull(folderData.deadline_date)
  })

  test('CNJ number validation in folder workflow', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const folderType = await FolderTypeFactory.create()
    const clientRecord = await ClientFactory.merge({ created_by_id: user.id }).create()

    // Test CNJ validation endpoint first
    const validCnjResponse = await client
      .post('/folders/validate-cnj')
      .loginAs(user)
      .json({ cnj_number: '5005618-74.2013.4.03.6109' })

    validCnjResponse.assertStatus(200)
    assert.isTrue(validCnjResponse.body().data.isValid)

    // Test invalid CNJ
    const invalidCnjResponse = await client
      .post('/folders/validate-cnj')
      .loginAs(user)
      .json({ cnj_number: '1234567-99.2024.8.26.0001' })

    invalidCnjResponse.assertStatus(200)
    assert.isFalse(invalidCnjResponse.body().data.isValid)

    // Test folder creation with valid CNJ
    const createWithValidCnjResponse = await client.post('/api/v1/folders').loginAs(user).json({
      title: 'Processo com CNJ Válido',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      cnj_number: '5005618-74.2013.4.03.6109',
    })

    createWithValidCnjResponse.assertStatus(201)

    // Test folder creation with invalid CNJ
    const createWithInvalidCnjResponse = await client.post('/api/v1/folders').loginAs(user).json({
      title: 'Processo com CNJ Inválido',
      folder_type_id: folderType.id,
      client_id: clientRecord.id,
      cnj_number: '1234567-99.2024.8.26.0001',
    })

    createWithInvalidCnjResponse.assertStatus(400)
  })
})

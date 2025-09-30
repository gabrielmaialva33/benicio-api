import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import { UserFactory } from '#database/factories/user_factory'
import { ClientFactory } from '#database/factories/client_factory'
import { CourtFactory } from '#database/factories/court_factory'
import { FolderFactory } from '#database/factories/folder_factory'
import { FolderMovementFactory } from '#database/factories/folder_movement_factory'
import { FolderPartyFactory } from '#database/factories/folder_party_factory'
import { FolderDocumentFactory } from '#database/factories/folder_document_factory'
import { ClientAddressFactory } from '#database/factories/client_address_factory'
import { ClientContactFactory } from '#database/factories/client_contact_factory'
import { RealisticCnjGeneratorService } from '#services/seeders/realistic_cnj_generator_service'
import {
  BrazilianCompanies,
  BrazilianCourts,
  type CourtData,
  LegalActionTypes,
} from '#defaults/brazilian_legal_data'

/**
 * Main Seeder - Popula o banco de dados com dados realistas do sistema jurídico brasileiro
 *
 * Volumes gerados:
 * - 13 usuários (3 managers + 10 employees)
 * - 20 tribunais brasileiros
 * - 60 clientes (30 empresas + 30 pessoas físicas)
 * - ~150 processos jurídicos
 * - ~1500 movimentos processuais
 * - ~450 partes do processo
 * - ~900 documentos
 */
export default class MainSeeder extends BaseSeeder {
  static environment = ['development', 'testing']

  private cnjService = new RealisticCnjGeneratorService()
  private sequentialCnjNumber = 1

  async run() {
    logger.info('🌱 Starting Brazilian Legal Data Seeding...\n')

    // 1. Criar usuários (managers e employees)
    logger.info('👥 Creating users...')
    const { managers, employees } = await this.createUsers()
    logger.info(`   ✅ Created ${managers.length} managers and ${employees.length} employees\n`)

    // 2. Criar tribunais brasileiros
    logger.info('⚖️  Creating Brazilian courts...')
    const courts = await this.createCourts()
    logger.info(`   ✅ Created ${courts.length} courts\n`)

    // 3. Criar empresas brasileiras como clientes
    logger.info('🏢 Creating company clients...')
    const companies = await this.createCompanyClients(managers)
    logger.info(`   ✅ Created ${companies.length} companies\n`)

    // 4. Criar pessoas físicas como clientes
    logger.info('👤 Creating individual clients...')
    const individuals = await this.createIndividualClients(managers)
    logger.info(`   ✅ Created ${individuals.length} individuals\n`)

    // 5. Criar processos jurídicos com CNJ numbers válidos
    logger.info('📁 Creating legal cases (folders) with realistic data...')
    const allClients = [...companies, ...individuals]
    const foldersCount = await this.createFolders({
      clients: allClients,
      courts,
      employees,
      managers,
    })
    logger.info(`   ✅ Created ${foldersCount} folders with movements, parties, and documents\n`)

    logger.info('🎉 Seeding completed successfully!\n')
    logger.info('📊 Summary:')
    logger.info(`   - Users: ${managers.length + employees.length}`)
    logger.info(`   - Courts: ${courts.length}`)
    logger.info(`   - Clients: ${allClients.length}`)
    logger.info(`   - Folders: ${foldersCount}`)
    logger.info(`   - Estimated movements: ~${foldersCount * 10}`)
    logger.info(`   - Estimated documents: ~${foldersCount * 6}`)
    logger.info(`   - Estimated parties: ~${foldersCount * 3}`)
  }

  /**
   * Cria usuários do sistema (managers e employees)
   */
  private async createUsers() {
    // 3 managers
    const managers = await UserFactory.apply('manager').apply('verified').createMany(3)

    // 10 employees/lawyers
    const employees = await UserFactory.apply('employee').apply('verified').createMany(10)

    return { managers, employees }
  }

  /**
   * Cria tribunais brasileiros reais (ou retorna os existentes)
   */
  private async createCourts() {
    const courtModule = await import('#models/court')
    const Court = courtModule.default

    // Verifica se os tribunais já existem
    const existingCourts = await Court.query().select('*')

    if (existingCourts.length > 0) {
      logger.info(`   ℹ️  Using ${existingCourts.length} existing courts`)
      return existingCourts
    }

    // Se não existem, cria novos
    const courts = []
    for (const courtData of BrazilianCourts) {
      const court = await CourtFactory.merge({
        name: courtData.name,
        cnj_code: courtData.cnjCode,
        tribunal_code: courtData.tribunalCode,
        court_type: courtData.courtType,
        instance: courtData.instance as 'first' | 'second' | 'superior',
        state_code: courtData.stateCode,
        jurisdiction: courtData.jurisdiction,
        is_active: true,
        electronic_processing: true,
      }).create()

      courts.push(court)
    }

    return courts
  }

  /**
   * Cria empresas brasileiras como clientes
   */
  private async createCompanyClients(managers: any[]) {
    const companies = []

    // Pega 30 empresas reais
    for (const companyData of BrazilianCompanies.slice(0, 30)) {
      const client = await ClientFactory.apply('company')
        .apply('active')
        .merge({
          fantasy_name: companyData.name,
          company_name: companyData.name,
          document: companyData.cnpj,
          document_type: 'cnpj',
          person_type: 'company',
          client_type: this.randomClientType(),
          revenue_range: companyData.revenueRange,
          created_by_id: this.randomElement(managers).id,
        })
        .create()

      // Criar endereço principal
      await ClientAddressFactory.apply('primary').merge({ client_id: client.id }).create()

      // Criar 2-4 contatos
      const contactCount = this.randomInt(2, 4)
      for (let i = 0; i < contactCount; i++) {
        const address = await client.related('addresses').query().first()
        await ClientContactFactory.merge({
          client_id: client.id,
          address_id: address!.id,
        }).create()
      }

      companies.push(client)
    }

    return companies
  }

  /**
   * Cria pessoas físicas como clientes
   */
  private async createIndividualClients(managers: any[]) {
    const individuals = []

    for (let i = 0; i < 30; i++) {
      const client = await ClientFactory.apply('individual')
        .apply('active')
        .merge({
          client_type: this.randomClientType(),
          created_by_id: this.randomElement(managers).id,
        })
        .create()

      // Criar endereço principal
      await ClientAddressFactory.apply('primary').merge({ client_id: client.id }).create()

      // Criar 1-2 contatos
      const contactCount = this.randomInt(1, 2)
      for (let j = 0; j < contactCount; j++) {
        const address = await client.related('addresses').query().first()
        await ClientContactFactory.merge({
          client_id: client.id,
          address_id: address!.id,
        }).create()
      }

      individuals.push(client)
    }

    return individuals
  }

  /**
   * Cria processos jurídicos realistas com CNJ numbers válidos
   */
  private async createFolders(params: {
    clients: any[]
    courts: any[]
    employees: any[]
    managers: any[]
  }) {
    const { clients, courts, employees, managers } = params
    let foldersCreated = 0

    for (const client of clients) {
      // Cada cliente tem 1-3 processos
      const folderCount = this.randomInt(1, 3)

      for (let i = 0; i < folderCount; i++) {
        const court = this.randomElement(courts)
        const courtData = this.findCourtData(court)

        if (!courtData) continue

        // Mapeamento de áreas jurídicas para folder_type_id
        // 1=Cível, 2=Trabalhista, 3=Criminal, 4=Tributário, 5=Administrativo
        const areaToFolderType: Record<string, number> = {
          civil_litigation: 1,
          labor: 2,
          criminal: 3,
          tax: 4,
          administrative: 5,
          consumer: 1, // Consumidor mapeia para Cível
        }

        // Seleciona área jurídica e tipo de ação
        const areas = ['civil_litigation', 'labor', 'tax', 'criminal', 'consumer', 'administrative']
        const area = this.randomElement(areas)
        const folderTypeId = areaToFolderType[area]
        const actionTypes = LegalActionTypes[area as keyof typeof LegalActionTypes] || []
        const actionType = this.randomElement(actionTypes)

        // Gera ano e CNJ number válido
        const year = this.randomInt(2020, 2025)
        const cnjNumber = this.cnjService.generate({
          year,
          court: courtData,
          sequentialNumber: this.sequentialCnjNumber++,
        })

        // Define status e datas
        const distributionDate = DateTime.local(year, this.randomInt(1, 12), this.randomInt(1, 28))

        const folder = await FolderFactory.merge({
          cnj_number: cnjNumber,
          client_id: client.id,
          folder_type_id: folderTypeId,
          court_id: court.id,
          responsible_lawyer_id: this.randomElement(employees).id,
          created_by_id: this.randomElement(managers).id,
          title: `${actionType} - ${client.fantasy_name}`,
          action_type: actionType,
          status: this.randomElement(['active', 'pending', 'completed'] as const),
          distribution_date: distributionDate,
          distribution_type: this.randomElement(['Sorteio', 'Dependência', 'Prevenção']),
        }).create()

        // Criar andamentos processuais (8-15 por processo)
        const movementCount = this.randomInt(8, 15)
        for (let j = 0; j < movementCount; j++) {
          await FolderMovementFactory.merge({
            folder_id: folder.id,
            created_by_id: this.randomElement(managers).id,
          }).create()
        }

        // Create case parties (plaintiff + defendant + possible third party)
        await FolderPartyFactory.apply('plaintiff')
          .merge({
            folder_id: folder.id,
            client_id: client.id,
            name: client.fantasy_name,
            document: client.document,
            document_type: client.document_type,
            created_by_id: this.randomElement(managers).id,
          })
          .create()

        await FolderPartyFactory.apply('defendant')
          .merge({
            folder_id: folder.id,
            created_by_id: this.randomElement(managers).id,
          })
          .create()

        // 30% de chance de ter terceiro
        if (Math.random() < 0.3) {
          await FolderPartyFactory.apply('third_party')
            .merge({
              folder_id: folder.id,
              created_by_id: this.randomElement(managers).id,
            })
            .create()
        }

        // Criar documentos (4-10 por processo)
        const docCount = this.randomInt(4, 10)
        for (let j = 0; j < docCount; j++) {
          await FolderDocumentFactory.merge({
            folder_id: folder.id,
            uploaded_by_id: this.randomElement(employees).id,
          }).create()
        }

        foldersCreated++
      }
    }

    return foldersCreated
  }

  /**
   * Helper: Encontra dados do tribunal na lista de tribunais brasileiros
   */
  private findCourtData(court: any): CourtData | undefined {
    return BrazilianCourts.find(
      (c) => c.cnjCode === court.cnjCode && c.tribunalCode === court.tribunalCode
    )
  }

  /**
   * Helper: Retorna tipo de cliente aleatório
   */
  private randomClientType(): 'prospect' | 'client' | 'prospect_sic' | 'prospect_dbm' {
    const types = ['prospect', 'client', 'prospect_sic', 'prospect_dbm']
    return this.randomElement(types) as 'prospect' | 'client' | 'prospect_sic' | 'prospect_dbm'
  }

  /**
   * Helper: Elemento aleatório de um array
   */
  private randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  /**
   * Helper: Número inteiro aleatório entre min e max (inclusivo)
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}

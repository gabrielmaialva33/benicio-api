import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
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
  BenicioFirmData,
  BenicioLawyers,
  BenicioTypicalClients,
  BenicioActionTypes,
  BenicioTypicalCaseValues,
  BenicioMovementDescriptions,
  type BenicioClientData,
} from '#defaults/benicio_legal_data'
import { BrazilianCourts, type CourtData } from '#defaults/brazilian_legal_data'

/**
 * Benicio Seeder - Populates the database with realistic data based on Benicio Advogados Associados
 *
 * Creates:
 * - Benicio law firm as a client
 * - 20-30 internal lawyers (partners, associates, juniors)
 * - 50-100 corporate clients from typical sectors
 * - 200-400 legal cases distributed by practice area
 * - Realistic movements, documents, and parties
 */
export default class BenicioSeeder extends BaseSeeder {
  static environment = ['development', 'testing']

  private cnjService = new RealisticCnjGeneratorService()
  private sequentialCnjNumber = 1

  async run() {
    console.log('🏛️  Starting Benicio Advogados Seeding...\n')

    // 1. Create Benicio lawyers (partners, associates, juniors)
    console.log('👥 Creating Benicio lawyers...')
    const { partners, associates, juniors } = await this.createBenicioLawyers()
    console.log(
      `   ✅ Created ${partners.length} partners, ${associates.length} associates, ${juniors.length} juniors\n`
    )

    // 2. Create courts (use existing if available)
    console.log('⚖️  Creating Brazilian courts...')
    const courts = await this.getOrCreateCourts()
    console.log(`   ✅ Using ${courts.length} courts\n`)

    // 3. Create Benicio as a client
    console.log('🏢 Creating Benicio Advogados as client...')
    const benicioClient = await this.createBenicioAsClient(partners[0])
    console.log(`   ✅ Created Benicio with addresses and contacts\n`)

    // 4. Create corporate clients
    console.log('💼 Creating corporate clients...')
    const clients = await this.createCorporateClients(partners)
    console.log(`   ✅ Created ${clients.length} corporate clients\n`)

    // 5. Create legal cases by practice area
    console.log('📁 Creating legal cases by practice area...')
    const foldersCount = await this.createLegalCases({
      clients,
      courts,
      lawyers: [...partners, ...associates],
      juniors,
      managers: partners,
    })
    console.log(
      `   ✅ Created ${foldersCount} folders with movements, parties, and documents\n`
    )

    console.log('🎉 Benicio Seeding completed successfully!\n')
    console.log('📊 Summary:')
    console.log(`   - Lawyers: ${partners.length + associates.length + juniors.length}`)
    console.log(`   - Courts: ${courts.length}`)
    console.log(`   - Clients: ${clients.length + 1} (including Benicio)`)
    console.log(`   - Folders: ${foldersCount}`)
    console.log(`   - Estimated movements: ~${foldersCount * 15}`)
    console.log(`   - Estimated documents: ~${foldersCount * 6}`)
    console.log(`   - Estimated parties: ~${foldersCount * 3}`)
  }

  /**
   * Create Benicio lawyers with realistic roles and specializations
   */
  private async createBenicioLawyers() {
    // 3-5 Partners (sócios)
    const partners = []
    for (let i = 0; i < 5; i++) {
      const lawyer = BenicioLawyers[i] || {
        name: this.generateLawyerName(),
        role: 'Partner',
        specialization: this.randomElement([
          'Tax Law',
          'Corporate Law',
          'Labor Law',
          'Regulatory',
        ]),
        seniority: 'partner',
      }

      const user = await UserFactory.apply('manager')
        .apply('verified')
        .merge({
          full_name: lawyer.name,
          email: this.generateEmail(lawyer.name),
          username: this.generateUsername(lawyer.name),
        })
        .create()

      partners.push(user)
    }

    // 5-8 Associates (advogados sêniores)
    const associates = []
    for (let i = 0; i < 7; i++) {
      const user = await UserFactory.apply('employee')
        .apply('verified')
        .merge({
          full_name: this.generateLawyerName(),
          email: this.generateEmail(),
        })
        .create()

      associates.push(user)
    }

    // 10-15 Junior lawyers
    const juniors = []
    for (let i = 0; i < 12; i++) {
      const user = await UserFactory.apply('employee')
        .apply('verified')
        .merge({
          full_name: this.generateLawyerName(),
          email: this.generateEmail(),
        })
        .create()

      juniors.push(user)
    }

    return { partners, associates, juniors }
  }

  /**
   * Get existing courts or create them
   */
  private async getOrCreateCourts() {
    const courtModule = await import('#models/court')
    const Court = courtModule.default

    const existingCourts = await Court.query().select('*')

    if (existingCourts.length > 0) {
      console.log(`   ℹ️  Using ${existingCourts.length} existing courts`)
      return existingCourts
    }

    // Create courts if none exist
    const courts = []
    for (const courtData of BrazilianCourts) {
      const court = await CourtFactory.merge({
        name: courtData.name,
        cnjCode: courtData.cnjCode,
        tribunalCode: courtData.tribunalCode,
        courtType: courtData.courtType,
        instance: courtData.instance,
        stateCode: courtData.stateCode,
        jurisdiction: courtData.jurisdiction,
        isActive: true,
        electronicProcessing: true,
      }).create()

      courts.push(court)
    }

    return courts
  }

  /**
   * Create Benicio Advogados Associados as a client
   */
  private async createBenicioAsClient(createdBy: any) {
    const client = await ClientFactory.apply('company')
      .apply('active')
      .merge({
        fantasy_name: BenicioFirmData.name,
        company_name: BenicioFirmData.name,
        document: BenicioFirmData.cnpj,
        document_type: 'cnpj',
        person_type: 'company',
        client_type: 'client',
        revenue_range: 'large',
        created_by_id: createdBy.id,
      })
      .create()

    // Create headquarters address
    await ClientAddressFactory.apply('primary')
      .merge({
        client_id: client.id,
        street: BenicioFirmData.address.street,
        number: BenicioFirmData.address.number,
        complement: BenicioFirmData.address.complement,
        neighborhood: BenicioFirmData.address.neighborhood,
        city: BenicioFirmData.address.city,
        state: BenicioFirmData.address.state,
        postal_code: BenicioFirmData.address.postalCode,
        country: 'Brasil',
      })
      .create()

    // Create 3-5 contacts
    const contactCount = this.randomInt(3, 5)
    for (let i = 0; i < contactCount; i++) {
      const address = await client.related('addresses').query().first()
      await ClientContactFactory.merge({
        client_id: client.id,
        address_id: address!.id,
      }).create()
    }

    return client
  }

  /**
   * Create corporate clients based on Benicio's typical client profile
   */
  private async createCorporateClients(managers: any[]) {
    const clients = []

    // Use Benicio's typical clients
    const clientsToCreate = BenicioTypicalClients.slice(0, 20)

    for (const clientData of clientsToCreate) {
      const client = await this.createCorporateClient(clientData, managers)
      clients.push(client)
    }

    // Add more generic corporate clients to reach 50-100
    const additionalCount = this.randomInt(30, 80)
    for (let i = 0; i < additionalCount; i++) {
      const genericClient: BenicioClientData = {
        name: this.generateCompanyName(),
        cnpj: this.generateCNPJ(),
        sector: this.randomElement([
          'Serviços',
          'Comércio',
          'Indústria',
          'Tecnologia',
          'Consultoria',
        ]),
        revenueRange: this.randomElement<'medium' | 'large' | 'enterprise'>([
          'medium',
          'large',
          'enterprise',
        ]),
      }

      const client = await this.createCorporateClient(genericClient, managers)
      clients.push(client)
    }

    return clients
  }

  /**
   * Helper to create a single corporate client
   */
  private async createCorporateClient(clientData: BenicioClientData, managers: any[]) {
    const client = await ClientFactory.apply('company')
      .apply('active')
      .merge({
        fantasy_name: clientData.name,
        company_name: clientData.name,
        document: clientData.cnpj,
        document_type: 'cnpj',
        person_type: 'company',
        client_type: 'client',
        revenue_range: clientData.revenueRange,
        created_by_id: this.randomElement(managers).id,
      })
      .create()

    // Create primary address
    await ClientAddressFactory.apply('primary').merge({ client_id: client.id }).create()

    // Create 1-3 contacts
    const contactCount = this.randomInt(1, 3)
    for (let i = 0; i < contactCount; i++) {
      const address = await client.related('addresses').query().first()
      await ClientContactFactory.merge({
        client_id: client.id,
        address_id: address!.id,
      }).create()
    }

    return client
  }

  /**
   * Create legal cases distributed by Benicio's practice areas
   */
  private async createLegalCases(params: {
    clients: any[]
    courts: any[]
    lawyers: any[]
    juniors: any[]
    managers: any[]
  }) {
    const { clients, courts, lawyers, juniors, managers } = params
    let foldersCreated = 0

    // Practice area distribution (matching Benicio's focus)
    const practiceAreas = [
      { area: 'tax', percentage: 0.35, folderTypeId: 4 }, // 35% Tax
      { area: 'labor', percentage: 0.25, folderTypeId: 2 }, // 25% Labor
      { area: 'corporate', percentage: 0.2, folderTypeId: 1 }, // 20% Corporate (Cível)
      { area: 'collection', percentage: 0.1, folderTypeId: 1 }, // 10% Collection (Cível)
      { area: 'regulatory', percentage: 0.05, folderTypeId: 5 }, // 5% Regulatory (Administrativo)
      { area: 'family', percentage: 0.05, folderTypeId: 1 }, // 5% Family (Cível)
    ]

    const totalFolders = this.randomInt(200, 400)

    for (const practiceArea of practiceAreas) {
      const foldersForArea = Math.floor(totalFolders * practiceArea.percentage)

      for (let i = 0; i < foldersForArea; i++) {
        const client = this.randomElement(clients)
        const court = this.randomElement(courts)
        const courtData = this.findCourtData(court)

        if (!courtData) continue

        // Get practice-specific action type
        const actionTypes =
          BenicioActionTypes[practiceArea.area as keyof typeof BenicioActionTypes] || []
        const actionType = this.randomElement(actionTypes)

        // Generate CNJ number
        const year = this.randomInt(2020, 2025)
        const cnjNumber = this.cnjService.generate({
          year,
          court: courtData,
          sequentialNumber: this.sequentialCnjNumber++,
        })

        // Set realistic case value based on practice area
        const valueRange =
          BenicioTypicalCaseValues[practiceArea.area as keyof typeof BenicioTypicalCaseValues]
        const caseValue = valueRange
          ? this.randomInt(valueRange.min, valueRange.max)
          : this.randomInt(100000, 1000000)

        const distributionDate = DateTime.local(year, this.randomInt(1, 12), this.randomInt(1, 28))

        const folder = await FolderFactory.merge({
          cnj_number: cnjNumber,
          client_id: client.id,
          folder_type_id: practiceArea.folderTypeId,
          court_id: court.id,
          responsible_lawyer_id: this.randomElement(lawyers).id,
          created_by_id: this.randomElement(managers).id,
          title: `${actionType} - ${client.fantasy_name}`,
          action_type: actionType,
          status: this.randomElement(['active', 'pending', 'completed'] as const),
          distribution_date: distributionDate,
          distribution_type: this.randomElement(['Sorteio', 'Dependência', 'Prevenção']),
          case_value: caseValue,
        }).create()

        // Create more movements for complex cases (15-30)
        const movementCount = this.randomInt(15, 30)
        for (let j = 0; j < movementCount; j++) {
          await FolderMovementFactory.merge({
            folder_id: folder.id,
            created_by_id: this.randomElement([...managers, ...juniors]).id,
          }).create()
        }

        // Create case parties
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

        // 30% chance of third party
        if (Math.random() < 0.3) {
          await FolderPartyFactory.apply('third_party')
            .merge({
              folder_id: folder.id,
              created_by_id: this.randomElement(managers).id,
            })
            .create()
        }

        // Create documents (6-12 per case)
        const docCount = this.randomInt(6, 12)
        for (let j = 0; j < docCount; j++) {
          await FolderDocumentFactory.merge({
            folder_id: folder.id,
            uploaded_by_id: this.randomElement([...lawyers, ...juniors]).id,
          }).create()
        }

        foldersCreated++
      }
    }

    return foldersCreated
  }

  /**
   * Helper: Find court data
   */
  private findCourtData(court: any): CourtData | undefined {
    return BrazilianCourts.find(
      (c) => c.cnjCode === court.cnjCode && c.tribunalCode === court.tribunalCode
    )
  }

  /**
   * Helper: Generate realistic Brazilian lawyer name
   */
  private generateLawyerName(): string {
    const firstNames = [
      'Rodrigo',
      'Fernanda',
      'Carlos',
      'Juliana',
      'Marcelo',
      'Patricia',
      'Leonardo',
      'Mariana',
      'Rafael',
      'Camila',
      'Bruno',
      'Beatriz',
      'Guilherme',
      'Ana Paula',
      'Ricardo',
      'Larissa',
    ]
    const lastNames = [
      'Silva',
      'Santos',
      'Oliveira',
      'Souza',
      'Costa',
      'Ferreira',
      'Rodrigues',
      'Almeida',
      'Nascimento',
      'Lima',
      'Araújo',
      'Fernandes',
      'Carvalho',
      'Gomes',
      'Martins',
      'Rocha',
    ]

    return `${this.randomElement(firstNames)} ${this.randomElement(lastNames)} ${this.randomElement(lastNames)}`
  }

  /**
   * Helper: Generate email from name
   */
  private generateEmail(name?: string): string {
    if (!name) {
      return `advogado${this.randomInt(1, 999)}@benicio.com.br`
    }

    const cleaned = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '.')

    return `${cleaned}@benicio.com.br`
  }

  /**
   * Helper: Generate username from name
   */
  private generateUsername(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
  }

  /**
   * Helper: Generate company name
   */
  private generateCompanyName(): string {
    const prefixes = ['Grupo', 'Indústria', 'Comércio', 'Distribuidora', 'Empresa']
    const names = [
      'Nacional',
      'Brasileira',
      'Paulista',
      'Comercial',
      'Industrial',
      'Serviços',
    ]
    const suffixes = ['S.A.', 'Ltda', 'S/A', 'Ltda.']

    return `${this.randomElement(prefixes)} ${this.randomElement(names)} ${this.randomInt(1, 999)} ${this.randomElement(suffixes)}`
  }

  /**
   * Helper: Generate CNPJ
   */
  private generateCNPJ(): string {
    return `${this.randomInt(10, 99)}${this.randomInt(100, 999)}${this.randomInt(100, 999)}${this.randomInt(1000, 9999)}${this.randomInt(10, 99)}`
  }

  /**
   * Helper: Random element from array
   */
  private randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  /**
   * Helper: Random integer between min and max (inclusive)
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import FolderDocument from '#models/folder_document'

export const FolderDocumentFactory = factory
  .define(FolderDocument, async ({ faker }) => {
    const docTypes = [
      'Petição Inicial',
      'Contestação',
      'Réplica',
      'Procuração',
      'Contrato',
      'Decisão',
      'Sentença',
      'Recurso de Apelação',
      'Laudo Pericial',
      'Certidão',
      'Ata de Audiência',
      'Documento Pessoal',
      'Comprovante',
      'Nota Fiscal',
      'Recibo',
    ]

    const docType = faker.helpers.arrayElement(docTypes)
    const fileName = `${docType.toLowerCase().replace(/\s+/g, '_')}_${faker.string.alphanumeric(8)}.pdf`

    return {
      title: docType,
      description: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }),
      document_type: docType,
      file_name: fileName,
      file_path: `/documents/${faker.string.uuid()}`,
      file_key: faker.string.uuid(),
      file_size: faker.number.int({ min: 50000, max: 5000000 }),
      mime_type: 'application/pdf',
      checksum: faker.string.alphanumeric(64),
      confidentiality_level: faker.helpers.weightedArrayElement([
        { weight: 0.7, value: 'internal' },
        { weight: 0.2, value: 'confidential' },
        { weight: 0.1, value: 'public' },
      ]),
      document_category: faker.helpers.maybe(
        () => faker.helpers.arrayElement(['Processual', 'Administrativo', 'Contratual', 'Pessoal']),
        { probability: 0.6 }
      ),
      is_original: faker.datatype.boolean({ probability: 0.8 }),
      version_number: 1,
      document_date: faker.helpers.maybe(
        () => DateTime.fromJSDate(faker.date.recent({ days: 365 })),
        { probability: 0.7 }
      ),
      received_date: faker.helpers.maybe(
        () => DateTime.fromJSDate(faker.date.recent({ days: 180 })),
        { probability: 0.5 }
      ),
      court_protocol: faker.helpers.maybe(() => faker.string.numeric(10), { probability: 0.3 }),
      requires_signature: faker.datatype.boolean({ probability: 0.4 }),
      is_signed: faker.datatype.boolean({ probability: 0.3 }),
      signed_at: undefined,
      is_active: true,
      is_archived: faker.datatype.boolean({ probability: 0.1 }),
      sort_order: faker.number.int({ min: 0, max: 100 }),
    }
  })
  .state('signed', (doc) => {
    doc.requires_signature = true
    doc.is_signed = true
    doc.signed_at = DateTime.now()
  })
  .state('confidential', (doc) => {
    doc.confidentiality_level = 'confidential'
  })
  .state('public', (doc) => {
    doc.confidentiality_level = 'public'
  })
  .build()

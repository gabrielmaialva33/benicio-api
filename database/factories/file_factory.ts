import factory from '@adonisjs/lucid/factories'
import File from '#models/file'

export const FileFactory = factory
  .define(File, async ({ faker }) => {
    const categories = ['contract', 'invoice', 'report', 'correspondence', 'evidence', 'other']
    const extensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png']
    const extension = faker.helpers.arrayElement(extensions)
    const fileName = `${faker.system.fileName({ extensionCount: 0 })}.${extension}`

    return {
      client_name: faker.person.fullName(),
      file_name: fileName,
      file_size: faker.number.int({ min: 10000, max: 10000000 }),
      file_type: faker.system.mimeType(),
      file_category: faker.helpers.arrayElement(categories),
      url: `/uploads/${faker.string.uuid()}/${fileName}`,
    }
  })
  .build()

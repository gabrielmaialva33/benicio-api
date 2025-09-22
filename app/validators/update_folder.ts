import vine from '@vinejs/vine'
import { FolderStatus, FolderPriority } from '../../contracts/folder_enums.js'

export const updateFolderValidator = vine.withMetaData<{ folderId: number }>().compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),

    description: vine.string().trim().maxLength(1000).optional(),

    folder_type_id: vine
      .number()
      .positive()
      .exists({ table: 'folder_types', column: 'id' })
      .optional(),

    client_id: vine.number().positive().exists({ table: 'clients', column: 'id' }).optional(),

    court_id: vine.number().positive().exists({ table: 'courts', column: 'id' }).optional(),

    cnj_number: vine
      .string()
      .trim()
      .regex(/^[0-9\-\.]+$/)
      .maxLength(25)
      .unique(async (db, value, field) => {
        const row = await db
          .from('folders')
          .whereNot('id', field.meta.folderId)
          .where('cnj_number', value)
          .first()
        return !row
      })
      .optional()
      .optional(),

    case_value: vine.number().positive().decimal([0, 2]).optional(),

    opposing_party: vine.string().trim().maxLength(255).optional(),

    opposing_lawyer: vine.string().trim().maxLength(255).optional(),

    responsible_lawyer_id: vine
      .number()
      .positive()
      .exists({ table: 'users', column: 'id' })
      .optional()
      .optional(),

    status: vine.enum(Object.values(FolderStatus)).optional(),

    priority: vine.enum(Object.values(FolderPriority)).optional(),

    tags: vine.array(vine.string().trim().maxLength(50)).maxLength(10).optional(),

    search_progress: vine.boolean().optional(),

    search_intimation: vine.boolean().optional(),

    electronic: vine.boolean().optional(),

    loy_system_number: vine.string().trim().maxLength(50).optional(),

    internal_notes: vine.string().trim().maxLength(2000).optional(),

    is_confidential: vine.boolean().optional(),
  })
)

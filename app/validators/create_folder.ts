import vine from '@vinejs/vine'
import { FolderPriority, FolderStatus } from '../../contracts/folder_enums.js'

export const createFolderValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),

    description: vine.string().trim().maxLength(1000).optional(),

    folder_type_id: vine.number().positive().exists({ table: 'folder_types', column: 'id' }),

    client_id: vine.number().positive().exists({ table: 'clients', column: 'id' }),

    court_id: vine.number().positive().exists({ table: 'courts', column: 'id' }).optional(),

    cnj_number: vine
      .string()
      .trim()
      .maxLength(25)
      .unique({ table: 'folders', column: 'cnj_number' })
      .optional(),

    case_value: vine.number().positive().decimal([0, 2]).optional(),

    observation: vine.string().trim().maxLength(1000).optional(),

    object_detail: vine.string().trim().maxLength(500).optional(),

    opposing_party: vine.string().trim().maxLength(255).optional(),

    opposing_lawyer: vine.string().trim().maxLength(255).optional(),

    responsible_lawyer_id: vine
      .number()
      .positive()
      .exists({ table: 'users', column: 'id' })
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

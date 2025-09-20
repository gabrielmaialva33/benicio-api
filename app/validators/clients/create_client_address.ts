import vine from '@vinejs/vine'
import { document } from '#validators/rules/document'

export const createClientAddressValidator = vine.compile(
  vine.object({
    // Branch/Subsidiary Information
    company_name: vine.string().trim().maxLength(255).optional(),
    fantasy_name: vine.string().trim().maxLength(255).optional(),
    document: vine.string().trim().use(document()).optional(),
    person_type: vine.enum(['individual', 'company']).optional(),

    // Address fields (required)
    postal_code: vine
      .string()
      .trim()
      .regex(/^\d{5}-?\d{3}$/), // CEP format
    street: vine.string().trim().minLength(2).maxLength(255),
    number: vine.string().trim().minLength(1).maxLength(20),
    complement: vine.string().trim().maxLength(255).optional(),
    neighborhood: vine.string().trim().minLength(2).maxLength(255),
    city: vine.string().trim().minLength(2).maxLength(255),
    state: vine.string().trim().minLength(2).maxLength(2), // UF
    country: vine.string().trim().maxLength(100).optional(),

    // Cost Center
    cost_center_id: vine.number().positive().optional(),

    // Status
    is_primary: vine.boolean().optional(),
  })
)

export const updateClientAddressValidator = vine.compile(
  vine.object({
    // Branch/Subsidiary Information
    company_name: vine.string().trim().maxLength(255).optional().nullable(),
    fantasy_name: vine.string().trim().maxLength(255).optional().nullable(),
    document: vine.string().trim().use(document()).optional().nullable(),
    person_type: vine.enum(['individual', 'company']).optional().nullable(),

    // Address fields (optional for update)
    postal_code: vine
      .string()
      .trim()
      .regex(/^\d{5}-?\d{3}$/)
      .optional(),
    street: vine.string().trim().minLength(2).maxLength(255).optional(),
    number: vine.string().trim().minLength(1).maxLength(20).optional(),
    complement: vine.string().trim().maxLength(255).optional().nullable(),
    neighborhood: vine.string().trim().minLength(2).maxLength(255).optional(),
    city: vine.string().trim().minLength(2).maxLength(255).optional(),
    state: vine.string().trim().minLength(2).maxLength(2).optional(),
    country: vine.string().trim().maxLength(100).optional().nullable(),

    // Cost Center
    cost_center_id: vine.number().positive().optional().nullable(),

    // Status
    is_primary: vine.boolean().optional(),
  })
)

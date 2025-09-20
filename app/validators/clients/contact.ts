import vine from '@vinejs/vine'

/**
 * Validator for creating a client contact
 */
export const createContactValidator = vine.compile(
  vine.object({
    address_id: vine.number(),
    name: vine.string().trim().maxLength(255),
    work_area_id: vine.number().optional().nullable(),
    position_id: vine.number().optional().nullable(),
    participates_mailing: vine.boolean().optional(),
    receives_billing: vine.boolean().optional(),
    contact_type: vine.enum(['phone', 'email']),
    contact_value: vine.string().trim().maxLength(255),
    is_blocked: vine.boolean().optional(),
  })
)

/**
 * Validator for updating a client contact
 */
export const updateContactValidator = vine.compile(
  vine.object({
    address_id: vine.number().optional(),
    name: vine.string().trim().maxLength(255).optional(),
    work_area_id: vine.number().optional().nullable(),
    position_id: vine.number().optional().nullable(),
    participates_mailing: vine.boolean().optional(),
    receives_billing: vine.boolean().optional(),
    contact_type: vine.enum(['phone', 'email']).optional(),
    contact_value: vine.string().trim().maxLength(255).optional(),
    is_blocked: vine.boolean().optional(),
  })
)

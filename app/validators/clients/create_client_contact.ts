import vine from '@vinejs/vine'

export const createClientContactValidator = vine.compile(
  vine.object({
    // Address relationship (required)
    address_id: vine.number().positive(),

    // Contact Information (required)
    name: vine.string().trim().minLength(2).maxLength(255),

    // Professional Information
    work_area_id: vine.number().positive().optional(),
    position_id: vine.number().positive().optional(),

    // Mailing and Billing
    participates_mailing: vine.boolean().optional(),
    receives_billing: vine.boolean().optional(),

    // Contact Details (required)
    contact_type: vine.enum(['phone', 'email']),
    contact_value: vine.string().trim().maxLength(255),

    // Status
    is_blocked: vine.boolean().optional(),
  })
)

export const updateClientContactValidator = vine.compile(
  vine.object({
    // Address relationship (optional for update)
    address_id: vine.number().positive().optional(),

    // Contact Information
    name: vine.string().trim().minLength(2).maxLength(255).optional(),

    // Professional Information
    work_area_id: vine.number().positive().optional().nullable(),
    position_id: vine.number().positive().optional().nullable(),

    // Mailing and Billing
    participates_mailing: vine.boolean().optional(),
    receives_billing: vine.boolean().optional(),

    // Contact Details
    contact_type: vine.enum(['phone', 'email']).optional(),
    contact_value: vine.string().trim().maxLength(255).optional(),

    // Status
    is_blocked: vine.boolean().optional(),
  })
)

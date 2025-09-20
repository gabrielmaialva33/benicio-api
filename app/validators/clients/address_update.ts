import vine from '@vinejs/vine'

const updateAddressValidator = vine.compile(
  vine.object({
    company_name: vine.string().trim().optional().nullable(),
    fantasy_name: vine.string().trim().optional().nullable(),
    document: vine.string().trim().optional().nullable(),
    person_type: vine.enum(['individual', 'company']).optional().nullable(),
    postal_code: vine.string().trim().maxLength(10).optional(),
    street: vine.string().trim().maxLength(255).optional(),
    number: vine.string().trim().maxLength(20).optional(),
    complement: vine.string().trim().maxLength(255).optional().nullable(),
    neighborhood: vine.string().trim().maxLength(100).optional(),
    city: vine.string().trim().maxLength(100).optional(),
    state: vine.string().trim().maxLength(2).optional(),
    country: vine.string().trim().maxLength(100).optional(),
    cost_center_id: vine.number().optional().nullable(),
    is_primary: vine.boolean().optional(),
  })
)

export default updateAddressValidator

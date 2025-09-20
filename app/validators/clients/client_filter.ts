import vine from '@vinejs/vine'

export const clientFiltersValidator = vine.compile(
  vine.object({
    // Search filters
    search: vine.string().trim().optional(),
    code: vine.number().positive().optional(), // Client ID
    document: vine.string().trim().optional(), // CPF/CNPJ
    name: vine.string().trim().optional(), // Fantasy name search
    email: vine.string().trim().optional(), // Contact email

    // Type filters
    person_type: vine.enum(['individual', 'company']).optional(),
    client_type: vine
      .enum(['prospect', 'prospect_sic', 'prospect_dbm', 'client', 'board_contact', 'news_contact'])
      .optional(),

    // Business filters
    company_group_id: vine.number().positive().optional(),
    business_sector_id: vine.number().positive().optional(),
    revenue_range: vine.enum(['small', 'medium', 'large', 'enterprise']).optional(),
    employee_count_range: vine.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),

    // Status filters
    is_active: vine.boolean().optional(),
    is_favorite: vine.boolean().optional(),
    ir_retention: vine.boolean().optional(),
    pcc_retention: vine.boolean().optional(),

    // Contact filters
    contact_name: vine.string().trim().optional(),
    contact_email: vine.string().trim().email().optional(),
    receives_billing: vine.boolean().optional(),

    // Date filters
    created_from: vine.date().optional(),
    created_to: vine.date().optional(),
    updated_from: vine.date().optional(),
    updated_to: vine.date().optional(),

    // Pagination
    page: vine.number().positive().optional(),
    per_page: vine.number().positive().max(100).optional(),

    // Sorting
    sort_by: vine
      .enum([
        'id',
        'fantasy_name',
        'company_name',
        'document',
        'client_type',
        'is_active',
        'created_at',
        'updated_at',
      ])
      .optional(),
    sort_order: vine.enum(['asc', 'desc']).optional(),
  })
)

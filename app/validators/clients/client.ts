import vine from '@vinejs/vine'
import { document } from '#validators/rules/document'

/**
 * Validator for creating a client
 */
export const createClientValidator = vine.compile(
  vine.object({
    // Basic Information
    person_type: vine.enum(['individual', 'company']),
    fantasy_name: vine.string().trim().minLength(2).maxLength(255),
    company_name: vine.string().trim().minLength(2).maxLength(255).optional(),
    document: vine.string().trim().use(document()),

    // Client Type and Classification
    client_type: vine
      .enum(['prospect', 'prospect_sic', 'prospect_dbm', 'client', 'board_contact', 'news_contact'])
      .optional(),

    // Business Information
    company_group_id: vine.number().positive().optional(),
    business_sector_id: vine.number().positive().optional(),
    revenue_range: vine.enum(['small', 'medium', 'large', 'enterprise']).optional(),
    employee_count_range: vine.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),

    // Status and Financial
    is_active: vine.boolean().optional(),
    is_favorite: vine.boolean().optional(),
    ir_retention: vine.boolean().optional(),
    pcc_retention: vine.boolean().optional(),

    // Accounting Information
    connection_code: vine.string().trim().maxLength(50).optional(),
    accounting_account: vine.string().trim().maxLength(50).optional(),
    monthly_sheet: vine.number().positive().optional(),

    // Notes
    notes: vine.string().trim().maxLength(1000).optional(),
    billing_notes: vine.string().trim().maxLength(1000).optional(),

    // Optional user association
    user_id: vine.number().positive().optional(),

    // Optional initial address
    address: vine
      .object({
        company_name: vine.string().trim().maxLength(255).optional(),
        fantasy_name: vine.string().trim().maxLength(255).optional(),
        document: vine.string().trim().optional(),
        person_type: vine.enum(['individual', 'company']).optional(),
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
        cost_center_id: vine.number().positive().optional(),
        is_primary: vine.boolean().optional(),
      })
      .optional(),

    // Optional initial contact
    contact: vine
      .object({
        name: vine.string().trim().minLength(2).maxLength(255),
        work_area_id: vine.number().positive().optional(),
        position_id: vine.number().positive().optional(),
        participates_mailing: vine.boolean().optional(),
        receives_billing: vine.boolean().optional(),
        contact_type: vine.enum(['phone', 'email']),
        contact_value: vine.string().trim().maxLength(255),
        is_blocked: vine.boolean().optional(),
      })
      .optional(),
  })
)

/**
 * Validator for updating a client
 */
export const updateClientValidator = vine.compile(
  vine.object({
    // Basic Information
    person_type: vine.enum(['individual', 'company']).optional(),
    fantasy_name: vine.string().trim().minLength(2).maxLength(255).optional(),
    company_name: vine.string().trim().minLength(2).maxLength(255).optional().nullable(),
    document: vine.string().trim().use(document()).optional(),

    // Client Type and Classification
    client_type: vine
      .enum(['prospect', 'prospect_sic', 'prospect_dbm', 'client', 'board_contact', 'news_contact'])
      .optional(),

    // Business Information
    company_group_id: vine.number().positive().optional().nullable(),
    business_sector_id: vine.number().positive().optional().nullable(),
    revenue_range: vine.enum(['small', 'medium', 'large', 'enterprise']).optional().nullable(),
    employee_count_range: vine
      .enum(['1-10', '11-50', '51-200', '201-500', '500+'])
      .optional()
      .nullable(),

    // Status and Financial
    is_active: vine.boolean().optional(),
    is_favorite: vine.boolean().optional(),
    ir_retention: vine.boolean().optional(),
    pcc_retention: vine.boolean().optional(),

    // Accounting Information
    connection_code: vine.string().trim().maxLength(50).optional().nullable(),
    accounting_account: vine.string().trim().maxLength(50).optional().nullable(),
    monthly_sheet: vine.number().positive().optional().nullable(),

    // Notes
    notes: vine.string().trim().maxLength(1000).optional().nullable(),
    billing_notes: vine.string().trim().maxLength(1000).optional().nullable(),

    // Optional user association
    user_id: vine.number().positive().optional().nullable(),
  })
)

/**
 * Validator for client filters
 */
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
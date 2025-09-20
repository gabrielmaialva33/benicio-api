import vine from '@vinejs/vine'
import { document } from '#validators/rules/document'

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

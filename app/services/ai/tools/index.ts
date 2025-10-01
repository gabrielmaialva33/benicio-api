/**
 * AI Tools Registry
 * Centralized export of all available tools for AI agents
 */

export { default as BaseTool } from './base_tool.js'

// Data Access Tools - acesso aos dados do sistema
export { default as QueryClientsTool } from './query_clients_tool.js'
export { default as GetClientDetailsTool } from './get_client_details_tool.js'
export { default as QueryFoldersTool } from './query_folders_tool.js'
export { default as GetFolderDetailsTool } from './get_folder_details_tool.js'
export { default as QueryTasksTool } from './query_tasks_tool.js'
export { default as QueryFolderMovementsTool } from './query_folder_movements_tool.js'
export { default as QueryDocumentsTool } from './query_documents_tool.js'

// Specialized Tools - ferramentas especializadas
export { default as CalculateDeadlineTool } from './calculate_deadline_tool.js'
export { default as SearchLegislationTool } from './search_legislation_tool.js'
export { default as SearchJurisprudenceTool } from './search_jurisprudence_tool.js'
export { default as ParsePdfTool } from './parse_pdf_tool.js'

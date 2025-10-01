import { inject } from '@adonisjs/core'
import FolderDocument from '#models/folder_document'
import Folder from '#models/folder'
import BaseTool from './base_tool.js'

/**
 * QueryDocumentsTool
 * Busca documentos anexos de um processo
 */
@inject()
export default class QueryDocumentsTool extends BaseTool {
  name = 'query_documents'
  description =
    'Busca documentos anexados a um processo/pasta específico. Use para listar documentos, petições, contratos e outros arquivos anexos ao processo.'

  parameters = {
    type: 'object',
    properties: {
      folder_id: {
        type: 'number',
        description: 'ID do processo/pasta',
      },
      document_type: {
        type: 'string',
        description:
          'Tipo do documento (ex: petition, contract, evidence, judgment, power_of_attorney)',
      },
      limit: {
        type: 'number',
        description: 'Limite de resultados (padrão: 20, máximo: 100)',
        default: 20,
      },
    },
    required: ['folder_id'],
  }

  async execute(parameters: {
    folder_id: number
    document_type?: string
    limit?: number
    user_id: number // Injetado pelo BaseAgentService
  }): Promise<any> {
    const {
      folder_id: folderId,
      user_id: userId,
      document_type: documentType,
      limit = 20,
    } = parameters

    // SECURITY: Verificar se o processo pertence ao usuário
    const folder = await Folder.query().where('id', folderId).where('created_by_id', userId).first()

    if (!folder) {
      return {
        error: 'Processo não encontrado ou sem permissão de acesso',
      }
    }

    const query = FolderDocument.query().where('folder_id', folderId)

    // Filter by document type
    if (documentType) {
      query.where('document_type', documentType)
    }

    // Limit and order
    const safeLimit = Math.min(limit, 100)
    query.limit(safeLimit).orderBy('created_at', 'desc')

    const documents = await query

    return {
      folder: {
        id: folder.id,
        title: folder.title,
        cnj_number: folder.cnj_number,
      },
      total: documents.length,
      documents: documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        document_type: doc.document_type,
        description: doc.description,
        version_number: doc.version_number,
        is_active: doc.is_active,
        file_name: doc.file_name,
        file_size: doc.file_size,
        mime_type: doc.mime_type,
        created_at: doc.created_at.toISO(),
      })),
    }
  }
}

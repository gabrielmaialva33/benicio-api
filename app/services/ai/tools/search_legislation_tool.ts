import { inject } from '@adonisjs/core'
import RagService from '#services/ai/rag_service'
import BaseTool from './base_tool.js'

/**
 * SearchLegislationTool
 * Busca legislação brasileira usando RAG (Retrieval Augmented Generation)
 */
@inject()
export default class SearchLegislationTool extends BaseTool {
  constructor(private ragService: RagService) {
    super()
  }

  name = 'search_legislation'
  description =
    'Busca legislação brasileira (Constituição Federal, CPC, CLT, CCB, leis específicas). Use para encontrar artigos de lei relevantes.'

  parameters = {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Consulta sobre legislação (ex: "prescrição trabalhista", "prazo para recurso CPC", "direitos do trabalhador CLT")',
      },
      top_k: {
        type: 'number',
        description: 'Quantidade de resultados (padrão: 5, máximo: 10)',
        default: 5,
      },
    },
    required: ['query'],
  }

  async execute(parameters: { query: string; top_k?: number }): Promise<any> {
    const topK = Math.min(parameters.top_k || 5, 10)

    const result = await this.ragService.getLegislationContext(parameters.query, topK)

    return {
      query: parameters.query,
      total_results: result.sources.length,
      legislation: result.sources.map((item: any) => ({
        source: item.source_type,
        title: item.title,
        content: item.content,
        confidence: (1 - item.distance) * 100,
        url: item.source_url,
      })),
      context_summary: result.context,
    }
  }
}

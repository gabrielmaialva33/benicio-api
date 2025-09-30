import { inject } from '@adonisjs/core'
import RagService from '#services/ai/rag_service'
import BaseTool from './base_tool.js'

/**
 * SearchJurisprudenceTool
 * Busca jurisprud�ncia dos tribunais brasileiros usando RAG
 */
@inject()
export default class SearchJurisprudenceTool extends BaseTool {
  constructor(private ragService: RagService) {
    super()
  }

  name = 'search_jurisprudence'
  description =
    'Busca jurisprud�ncia dos tribunais superiores (STF, STJ, TST, TRFs, TJs). Use para encontrar precedentes e decis�es relevantes.'

  parameters = {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Consulta sobre jurisprud�ncia (ex: "dano moral acidente trabalho", "rescis�o indireta", "honor�rios sucumbenciais")',
      },
      court_level: {
        type: 'string',
        enum: ['STF', 'STJ', 'TST', 'TRF', 'TJ', 'TRT', 'all'],
        description: 'N�vel do tribunal para busca (padr�o: all)',
        default: 'all',
      },
      top_k: {
        type: 'number',
        description: 'Quantidade de resultados (padr�o: 5, m�ximo: 10)',
        default: 5,
      },
    },
    required: ['query'],
  }

  async execute(parameters: { query: string; court_level?: string; top_k?: number }): Promise<any> {
    const topK = Math.min(parameters.top_k || 5, 10)

    const result = await this.ragService.getJurisprudenceContext(parameters.query, topK)

    // Filter by court level if specified
    let jurisprudence = result.sources

    if (parameters.court_level && parameters.court_level !== 'all') {
      jurisprudence = jurisprudence.filter((item: any) =>
        item.title?.includes(parameters.court_level!)
      )
    }

    return {
      query: parameters.query,
      court_level: parameters.court_level || 'all',
      total_results: jurisprudence.length,
      jurisprudence: jurisprudence.map((item: any) => ({
        tribunal: this.extractTribunal(item.title),
        title: item.title,
        ementa: item.content,
        confidence: (1 - item.distance) * 100,
        url: item.source_url,
        process_number: this.extractProcessNumber(item.content),
      })),
      context_summary: result.context,
    }
  }

  /**
   * Extract tribunal name from title
   */
  private extractTribunal(title: string): string {
    const tribunals = ['STF', 'STJ', 'TST', 'TRF', 'TJ', 'TRT']
    for (const tribunal of tribunals) {
      if (title?.includes(tribunal)) {
        return tribunal
      }
    }
    return 'N�o identificado'
  }

  /**
   * Extract process number from content (CNJ format)
   */
  private extractProcessNumber(content: string): string | null {
    const cnjRegex = /\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}/
    const match = content?.match(cnjRegex)
    return match ? match[0] : null
  }
}

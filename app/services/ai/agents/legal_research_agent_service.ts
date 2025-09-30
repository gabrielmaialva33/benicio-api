import { inject } from '@adonisjs/core'
import BaseAgentService from './base_agent_service.js'
import IAiAgent from '#interfaces/ai_agent_interface'

/**
 * Agente 1: Pesquisa Jurídica
 * Especializado em pesquisar legislação brasileira, jurisprudência (STF, STJ, TST)
 * e doutrina para fundamentar casos legais
 */
@inject()
export default class LegalResearchAgentService extends BaseAgentService {
  protected agentSlug = 'legal-research'
  protected systemPrompt = `Você é um assistente especializado em pesquisa jurídica brasileira.

SUA MISSÃO:
- Pesquisar e analisar legislação brasileira (CF, CPC, CLT, CCB, leis específicas)
- Buscar jurisprudência relevante dos tribunais superiores (STF, STJ, TST, TRFs, TJs)
- Encontrar precedentes e súmulas aplicáveis
- Analisar doutrina jurídica quando necessário

REGRAS OBRIGATÓRIAS:
1. SEMPRE cite a fonte exata de cada informação (artigo de lei, número do processo, etc)
2. NUNCA invente jurisprudência ou legislação
3. Se não encontrar informação no contexto fornecido, diga claramente "Não encontrei informação específica sobre isso na base de dados"
4. Indique o grau de relevância e aplicabilidade de cada resultado
5. Destaque conflitos entre diferentes fontes quando existirem

FORMATO DE RESPOSTA:
- Organize por tipo de fonte (Legislação → Jurisprudência → Doutrina)
- Cite sempre: fonte, artigo/processo, data, ementa/trecho relevante
- Explique a aplicabilidade ao caso em linguagem clara

IMPORTANTE: Você trabalha para o escritório Benicio Advogados Associados. Seja preciso, técnico e confiável.`

  /**
   * Get comprehensive legal context
   */
  protected async getContext(payload: IAiAgent.ExecutePayload): Promise<{
    context: string
    sources: any[]
  }> {
    const result = await this.ragService.getComprehensiveContext(payload.input, {
      folderId: payload.folder_id,
      includeJurisprudence: true,
    })

    return {
      context: result.context,
      sources: [...result.legislation, ...result.jurisprudence, ...result.documents],
    }
  }

  /**
   * Available tools for legal research
   */
  protected async getTools(): Promise<any[]> {
    return [
      {
        type: 'function',
        function: {
          name: 'search_stf',
          description: 'Busca jurisprudência no STF (Supremo Tribunal Federal)',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Termo de busca (ex: "habeas corpus", "direito fundamental")',
              },
            },
            required: ['query'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'search_stj',
          description: 'Busca jurisprudência no STJ (Superior Tribunal de Justiça)',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Termo de busca',
              },
            },
            required: ['query'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'search_legislation',
          description: 'Busca em legislação brasileira (CF, códigos, leis)',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Termo de busca ou número da lei/artigo',
              },
              legislation_type: {
                type: 'string',
                enum: ['CF', 'CPC', 'CLT', 'CCB', 'Lei'],
                description: 'Tipo de legislação',
              },
            },
            required: ['query'],
          },
        },
      },
    ]
  }

  /**
   * Process tool calls for legal research
   */
  protected async processToolCalls(
    toolCalls: any[],
    _payload: IAiAgent.ExecutePayload
  ): Promise<any[]> {
    const results: any[] = []

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name
      const parameters = JSON.parse(toolCall.function.arguments)

      let result: any

      switch (toolName) {
        case 'search_stf':
        case 'search_stj':
          result = await this.ragService.getJurisprudenceContext(parameters.query, 5)
          break

        case 'search_legislation':
          result = await this.ragService.getLegislationContext(parameters.query, 5)
          break

        default:
          result = { error: 'Tool not implemented' }
      }

      results.push({
        tool_name: toolName,
        parameters,
        result,
      })
    }

    return results
  }
}

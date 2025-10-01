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
  protected systemPrompt = `Você é um assistente especializado em pesquisa jurídica do escritório Benicio Advogados Associados.

DADOS DISPONÍVEIS:
Você tem acesso COMPLETO aos dados do escritório através de ferramentas:
- query_clients: Buscar clientes por nome, documento, tipo
- get_client_details: Ver detalhes completos de um cliente (endereços, contatos, processos)
- query_folders: Buscar processos/pastas por cliente, status, tipo (1-Cível, 2-Trabalhista, 3-Criminal, 4-Tributário)
- get_folder_details: Ver detalhes completos de um processo (partes, movimentações, tarefas, documentos)
- query_tasks: Buscar tarefas por status, prioridade, responsável, prazo
- query_folder_movements: Ver movimentações/andamentos de um processo
- query_documents: Buscar documentos anexados a um processo

QUANDO USAR AS FERRAMENTAS DE DADOS:
- Perguntas sobre clientes → query_clients primeiro, depois get_client_details se necessário
- Perguntas sobre processos → query_folders, depois get_folder_details para detalhes
- "O que aconteceu no processo X?" → query_folder_movements
- "Quais tarefas estão atrasadas?" → query_tasks com overdue=true
- Você pode COMBINAR múltiplas ferramentas em sequência

⚠️ REGRA CRÍTICA - BUSCA INTELIGENTE DE PROCESSOS:

NUNCA assuma que números mencionados pelo usuário são IDs (folder_id) diretos!

Quando o usuário mencionar "processo 489", "pasta 123", "processo X", etc:
1. ✅ SEMPRE use query_folders(search="489") PRIMEIRO
   - O número pode ser: parte do CNJ, código interno, ID, ou parte do título
   - A ferramenta query_folders busca em TODOS esses campos automaticamente
2. ✅ Se encontrar 1 resultado → extraia o folder.id REAL → chame get_folder_details(folder_id=id_real)
3. ✅ Se encontrar múltiplos → liste as opções para o usuário escolher
4. ✅ Se não encontrar nada → só então diga "não encontrei"

❌ NUNCA faça: get_folder_details(folder_id=489) diretamente
✅ SEMPRE faça: query_folders(search="489") → depois get_folder_details(folder_id=<id_encontrado>)

Exemplo correto:
Usuário: "qual status do processo 489?"
→ query_folders(search="489")
→ Resultado: [{id: 1523, internal_client_code: "489", title: "..."}]
→ get_folder_details(folder_id=1523)

EXEMPLOS MULTI-STEP:
1. "Quais processos o cliente Acme Corp tem?"
   → query_clients(search="Acme Corp") → obtém client_id
   → query_folders(client_id=...) → lista processos

2. "Mostre movimentações recentes do processo 123"
   → query_folder_movements(folder_id=123, days=30)

SUA MISSÃO JURÍDICA:
- Pesquisar e analisar legislação brasileira (CF, CPC, CLT, CCB, leis específicas)
- Buscar jurisprudência relevante dos tribunais superiores (STF, STJ, TST, TRFs, TJs)
- Encontrar precedentes e súmulas aplicáveis
- Analisar doutrina jurídica quando necessário

REGRAS OBRIGATÓRIAS:
1. SEMPRE use as ferramentas de dados para buscar informações REAIS do sistema
2. SEMPRE cite a fonte exata de cada informação jurídica (artigo de lei, número do processo, etc)
3. NUNCA invente jurisprudência, legislação ou dados de clientes/processos
4. Se não encontrar informação, diga claramente
5. Destaque conflitos entre diferentes fontes quando existirem

FORMATO DE RESPOSTA:
- Organize por tipo de fonte (Legislação → Jurisprudência → Doutrina)
- Cite sempre: fonte, artigo/processo, data, ementa/trecho relevante
- Explique a aplicabilidade ao caso em linguagem clara

IMPORTANTE: Seja preciso, técnico e confiável. Use os dados reais do sistema.`

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
   * Combines base data tools + legal-specific tools
   */
  protected async getTools(): Promise<any[]> {
    // Get base data access tools
    const baseTools = await super.getTools()

    // Add legal-specific tools
    const legalTools = [
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

    // Combine all tools
    return [...baseTools, ...legalTools]
  }

  /**
   * Process tool calls for legal research
   * Delegates data tools to parent, handles legal tools here
   */
  protected async processToolCalls(
    toolCalls: any[],
    payload: IAiAgent.ExecutePayload
  ): Promise<any[]> {
    const results: any[] = []

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name
      const parameters = JSON.parse(toolCall.function.arguments)

      let result: any

      // Data tools - delegate to parent
      const dataTools = [
        'query_clients',
        'get_client_details',
        'query_folders',
        'get_folder_details',
        'query_tasks',
        'query_folder_movements',
        'query_documents',
      ]
      if (dataTools.includes(toolName)) {
        // Delegate to BaseAgentService
        const parentResults = await super.processToolCalls([toolCall], payload)
        results.push(...parentResults)
        continue
      }

      // Legal-specific tools
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

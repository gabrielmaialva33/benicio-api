import { inject } from '@adonisjs/core'
import BaseAgentService from './base_agent_service.js'
import IAiAgent from '#interfaces/ai_agent_interface'

/**
 * Agente 3: Estrategista Processual
 * Desenvolve estratégias processuais, analisa chances de êxito e sugere melhores caminhos
 */
@inject()
export default class CaseStrategyAgentService extends BaseAgentService {
  protected agentSlug = 'case-strategy'
  protected systemPrompt = `Você é um estrategista jurídico sênior do Benicio Advogados Associados com 30+ anos de experiência.

SUA MISSÃO:
- Desenvolver estratégias processuais vencedoras
- Avaliar chances de êxito (porcentagem e fundamentação)
- Analisar riscos processuais e contratuais
- Sugerir teses jurídicas inovadoras
- Planejar timeline processual completo

REGRAS OBRIGATÓRIAS:
1. Base análise em jurisprudência REAL dos tribunais superiores
2. Apresente prós e contras de cada estratégia
3. Quantifique riscos e chances quando possível (ex: "60% de chance de êxito")
4. Considere custos processuais e tempo estimado
5. Ofereça plano B para cada estratégia principal

FORMATO DE RESPOSTA:
- **Análise da Situação Atual** (contexto e posição processual)
- **Estratégias Possíveis:**
  - Estratégia Principal (com chances de êxito %)
  - Estratégias Alternativas (planos B e C)
- **Avaliação de Chances** (fundamentação técnica)
- **Timeline Estimado** (fases e prazos)
- **Alertas de Risco** (🔴 crítico, 🟡 atenção, 🟢 gerenciável)

IMPORTANTE: Seja realista nas estimativas. Clientes corporativos valorizam honestidade sobre otimismo infundado.`

  /**
   * Get comprehensive context for strategy analysis
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
   * Available tools for strategy analysis
   */
  protected async getTools(): Promise<any[]> {
    return [
      {
        type: 'function',
        function: {
          name: 'analyze_precedents',
          description: 'Analisa precedentes similares e suas decisões',
          parameters: {
            type: 'object',
            properties: {
              case_type: {
                type: 'string',
                description: 'Tipo de caso (ex: tributário, trabalhista, cível)',
              },
              keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'Palavras-chave para busca de precedentes',
              },
            },
            required: ['case_type', 'keywords'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'calculate_chances',
          description: 'Calcula estatisticamente chances de êxito baseado em histórico',
          parameters: {
            type: 'object',
            properties: {
              case_type: {
                type: 'string',
                description: 'Tipo de caso',
              },
              court: {
                type: 'string',
                description: 'Tribunal (ex: STF, STJ, TJ-SP)',
              },
              thesis: {
                type: 'string',
                description: 'Tese jurídica a ser defendida',
              },
            },
            required: ['case_type', 'thesis'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'estimate_timeline',
          description: 'Estima duração do processo por fase',
          parameters: {
            type: 'object',
            properties: {
              case_type: {
                type: 'string',
                description: 'Tipo de processo',
              },
              court: {
                type: 'string',
                description: 'Tribunal',
              },
              complexity: {
                type: 'string',
                enum: ['simples', 'média', 'alta'],
                description: 'Complexidade do caso',
              },
            },
            required: ['case_type', 'complexity'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'assess_risk',
          description: 'Avalia riscos financeiros e jurídicos do caso',
          parameters: {
            type: 'object',
            properties: {
              case_value: {
                type: 'number',
                description: 'Valor da causa em reais',
              },
              strategy: {
                type: 'string',
                description: 'Estratégia proposta',
              },
            },
            required: ['strategy'],
          },
        },
      },
    ]
  }

  /**
   * Process tool calls for strategy analysis
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
        case 'analyze_precedents':
          result = await this.ragService.getJurisprudenceContext(parameters.keywords.join(' '), 10)
          break

        case 'calculate_chances':
          // Simulated statistical calculation
          result = {
            success_rate: 0.65,
            total_cases_analyzed: 150,
            favorable_decisions: 98,
            confidence_level: 'high',
            similar_cases: [
              { process_number: '0001234-56.2023.8.26.0100', outcome: 'procedente' },
              { process_number: '0002345-67.2023.8.26.0100', outcome: 'procedente' },
            ],
          }
          break

        case 'estimate_timeline':
          // Simulated timeline estimation
          result = {
            total_months: 18,
            phases: [
              { phase: 'Petição inicial', duration_days: 1 },
              { phase: 'Citação', duration_days: 30 },
              { phase: 'Contestação', duration_days: 15 },
              { phase: 'Instrução probatória', duration_months: 6 },
              { phase: 'Sentença', duration_months: 4 },
              { phase: 'Recursos (se houver)', duration_months: 8 },
            ],
          }
          break

        case 'assess_risk':
          // Simulated risk assessment
          result = {
            financial_risk: 'médio',
            legal_risk: 'baixo',
            estimated_costs: {
              court_fees: 5000,
              expert_fees: 15000,
              attorney_hours: 120,
              total_estimated: 20000,
            },
            risk_factors: [
              'Possibilidade de condenação em honorários sucumbenciais',
              'Risco de bloqueio judicial em caso de execução provisória',
            ],
          }
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

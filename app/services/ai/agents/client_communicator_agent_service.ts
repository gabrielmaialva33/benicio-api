import { inject } from '@adonisjs/core'
import BaseAgentService from './base_agent_service.js'
import IAiAgent from '#interfaces/ai_agent_interface'

/**
 * Agente 6: Comunicador com Cliente
 * Traduz questões jurídicas complexas para linguagem acessível ao cliente corporativo
 */
@inject()
export default class ClientCommunicatorAgentService extends BaseAgentService {
  protected agentSlug = 'client-communicator'
  protected systemPrompt = `Você é um consultor jurídico do Benicio Advogados Associados especializado em comunicação com clientes corporativos.

SUA MISSÃO:
- Traduzir conceitos jurídicos complexos para linguagem empresarial clara
- Fornecer atualizações de status de processos de forma objetiva
- Explicar riscos e oportunidades de forma compreensível para executivos
- Aconselhar sobre decisões estratégicas com foco em impacto de negócio
- Priorizar informações críticas para tomada de decisão

REGRAS OBRIGATÓRIAS:
1. Evite jargão jurídico excessivo - use analogias e exemplos empresariais
2. Seja direto e honesto sobre riscos e chances de sucesso (use porcentagens quando possível)
3. Forneça recomendações práticas com impacto quantificado
4. Mantenha tom profissional mas acessível
5. Destaque SEMPRE impactos financeiros e operacionais
6. Organize informações por prioridade (crítico → importante → informativo)

FORMATO DE RESPOSTA:
- **Resumo Executivo:** 3-5 linhas com o essencial para decisão rápida
- **Situação Atual:** Explicação clara sem termos técnicos complexos
- **Riscos e Oportunidades:**
  - 🔴 Crítico (ação imediata necessária)
  - 🟡 Importante (requer atenção)
  - 🟢 Gerenciável (monitorar)
- **Impacto Financeiro:** Valores estimados (custos, economia, exposição)
- **Próximos Passos:** Ações recomendadas com prazos
- **Timeline:** Duração estimada de cada fase
- **Custos Estimados:** Honorários, custas, perícias

PÚBLICO-ALVO: CEOs, CFOs, Diretores Jurídicos de empresas de médio e grande porte que precisam tomar decisões baseadas em informação jurídica clara.

IMPORTANTE: Cliente corporativo valoriza pragmatismo, transparência e informação acionável. Evite otimismo infundado.`

  /**
   * Get context for client communication
   */
  protected async getContext(payload: IAiAgent.ExecutePayload): Promise<{
    context: string
    sources: any[]
  }> {
    if (!payload.folder_id) {
      return { context: '', sources: [] }
    }

    const result = await this.ragService.getComprehensiveContext(payload.input, {
      folderId: payload.folder_id,
      includeJurisprudence: false, // Clients don't need jurisprudence details
    })

    return {
      context: result.context,
      sources: result.documents, // Only documents, no legal sources for client
    }
  }

  /**
   * Available tools for client communication
   */
  protected async getTools(): Promise<any[]> {
    return [
      {
        type: 'function',
        function: {
          name: 'simplify_legal',
          description: 'Simplifica conceito jurídico para linguagem empresarial',
          parameters: {
            type: 'object',
            properties: {
              legal_concept: {
                type: 'string',
                description: 'Conceito jurídico a simplificar (ex: "prescrição intercorrente")',
              },
              context: {
                type: 'string',
                description: 'Contexto do caso para melhor explicação',
              },
            },
            required: ['legal_concept'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'estimate_impact',
          description: 'Estima impacto financeiro e operacional de decisão jurídica',
          parameters: {
            type: 'object',
            properties: {
              scenario: {
                type: 'string',
                description: 'Cenário jurídico (ex: "ganhar processo", "perder em 1ª instância")',
              },
              case_value: {
                type: 'number',
                description: 'Valor da causa em reais',
              },
              probability: {
                type: 'number',
                description: 'Probabilidade do cenário (0-1)',
              },
            },
            required: ['scenario'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'generate_report',
          description: 'Gera relatório executivo para cliente',
          parameters: {
            type: 'object',
            properties: {
              report_type: {
                type: 'string',
                enum: ['status', 'risk_assessment', 'quarterly', 'urgent_alert'],
                description: 'Tipo de relatório',
              },
              folder_id: {
                type: 'number',
                description: 'ID da pasta/processo',
              },
              include_financials: {
                type: 'boolean',
                description: 'Incluir análise financeira detalhada',
                default: true,
              },
            },
            required: ['report_type', 'folder_id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'suggest_action',
          description: 'Sugere ação estratégica para o cliente',
          parameters: {
            type: 'object',
            properties: {
              situation: {
                type: 'string',
                description: 'Situação atual resumida',
              },
              business_goal: {
                type: 'string',
                description: 'Objetivo de negócio do cliente (ex: "minimizar exposição")',
              },
              urgency: {
                type: 'string',
                enum: ['critical', 'high', 'medium', 'low'],
                description: 'Nível de urgência',
              },
            },
            required: ['situation', 'business_goal'],
          },
        },
      },
    ]
  }

  /**
   * Process tool calls for client communication
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
        case 'simplify_legal':
          // Simulated legal concept simplification
          result = {
            simplified_explanation:
              'Em termos empresariais, isso significa que após um período sem movimentação no processo, o direito de cobrar expira automaticamente.',
            business_analogy:
              'É como um prazo de validade de um contrato - passado o tempo sem uso, perde efeito.',
            key_takeaway:
              'Para sua empresa: Se o processo ficar parado por muito tempo, pode não conseguir executar a decisão.',
            recommended_action: 'Manter monitoramento ativo do andamento processual',
          }
          break

        case 'estimate_impact':
          // Simulated financial impact estimation
          const caseValue = parameters.case_value || 1000000
          const probability = parameters.probability || 0.6

          result = {
            scenario: parameters.scenario,
            financial_impact: {
              best_case: {
                amount: caseValue * 1.2, // Com juros
                probability: probability,
                description: 'Ganho com juros e correção',
              },
              worst_case: {
                amount: caseValue * 0.3, // Honorários + custas
                probability: 1 - probability,
                description: 'Condenação em honorários sucumbenciais',
              },
              expected_value: caseValue * probability - caseValue * 0.3 * (1 - probability),
            },
            operational_impact: {
              time_investment: '6-18 meses até decisão final',
              management_hours: '40-60 horas de equipe jurídica',
              business_disruption: 'baixo',
            },
            risk_level: probability > 0.7 ? 'baixo' : probability > 0.4 ? 'médio' : 'alto',
          }
          break

        case 'generate_report':
          // Simulated executive report
          result = {
            report_type: parameters.report_type,
            executive_summary: {
              critical_points: [
                'Prazo para recurso vence em 5 dias úteis',
                'Decisão desfavorável pode gerar passivo de R$ 2.5M',
                'Chance de êxito no recurso: 65%',
              ],
              recommended_decision: 'Interpor recurso com reforço de argumentação econômica',
            },
            financial_overview: {
              total_exposure: 2500000,
              legal_costs_ytd: 150000,
              estimated_additional_costs: 80000,
              potential_recovery: 3200000,
            },
            timeline: {
              current_phase: 'Sentença proferida',
              next_milestone: 'Prazo recursal',
              estimated_conclusion: '18-24 meses',
            },
            risk_dashboard: {
              overall_risk: 'médio',
              financial_risk: 'alto',
              reputational_risk: 'baixo',
              operational_risk: 'baixo',
            },
          }
          break

        case 'suggest_action':
          // Simulated strategic action suggestion
          result = {
            recommended_strategy: 'Acordo estratégico com redução de passivo',
            rationale: [
              'Custo-benefício favorável: economia de 40% em custos processuais',
              'Redução de risco: elimina incerteza de decisão judicial',
              'Timing: permite encerramento antes do fechamento trimestral',
            ],
            action_steps: [
              {
                step: 1,
                action: 'Autorizar escritório a iniciar negociações',
                deadline: '2 dias úteis',
                responsible: 'Diretor Jurídico',
              },
              {
                step: 2,
                action: 'Definir valor máximo aceitável para acordo',
                deadline: '3 dias úteis',
                responsible: 'CFO + Jurídico',
              },
              {
                step: 3,
                action: 'Conduzir rodadas de negociação',
                deadline: '15 dias úteis',
                responsible: 'Benicio Advogados',
              },
            ],
            financial_comparison: {
              continue_litigation: {
                cost: 450000,
                time: '18-24 meses',
                risk: 'médio-alto',
              },
              settlement: {
                cost: 280000,
                time: '30-45 dias',
                risk: 'baixo',
              },
              savings: 170000,
            },
            urgency_level: parameters.urgency || 'medium',
            approval_needed: 'Diretoria Executiva',
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
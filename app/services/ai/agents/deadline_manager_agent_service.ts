import { inject } from '@adonisjs/core'
import BaseAgentService from './base_agent_service.js'
import IAiAgent from '#interfaces/ai_agent_interface'

/**
 * Agente 4: Gestor de Prazos
 * Monitora prazos processuais, calcula vencimentos e alerta sobre urgências
 */
@inject()
export default class DeadlineManagerAgentService extends BaseAgentService {
  protected agentSlug = 'deadline-manager'
  protected systemPrompt = `Você é um especialista em prazos processuais e gestão de calendário forense do Benicio Advogados Associados.

SUA MISSÃO:
- Calcular prazos processuais conforme CPC/CLT/legislação aplicável
- Considerar feriados forenses e suspensões
- Alertar sobre urgências (prazos < 5 dias úteis)
- Monitorar andamentos processuais
- Sugerir agendamento de tarefas

REGRAS OBRIGATÓRIAS:
1. SEMPRE considere feriados forenses nacionais e locais (SP principalmente)
2. Aplique regra de contagem correta (dias corridos/úteis conforme tipo de prazo)
3. Alerte prazos fatais com antecedência mínima de 3 dias úteis
4. Identifique prazos em dobro (litisconsortes com procuradores diferentes, Fazenda Pública)
5. Indique expressamente se prazo já venceu ou está em curso

FORMATO DE RESPOSTA:
- **Prazo Calculado:** DD/MM/YYYY
- **Tipo de Contagem:** Dias corridos/úteis
- **Feriados Considerados:** Lista de feriados no período
- **Dias Restantes:** X dias
- **Nível de Urgência:**
  - 🔴 URGENTE (< 3 dias) - AÇÃO IMEDIATA
  - 🟡 ATENÇÃO (3-7 dias) - Priorizar
  - 🟢 REGULAR (> 7 dias) - No prazo
- **Observações:** Particularidades do prazo

IMPORTANTE: Prazos vencidos devem ser sinalizados de forma clara e imediata.`

  /**
   * Get process context for deadline calculation
   */
  protected async getContext(payload: IAiAgent.ExecutePayload): Promise<{
    context: string
    sources: any[]
  }> {
    if (!payload.folder_id) {
      return { context: '', sources: [] }
    }

    const result = await this.ragService.getDocumentContext(
      'movimentações processuais prazos',
      payload.folder_id,
      5
    )

    return {
      context: result.context,
      sources: result.sources,
    }
  }

  /**
   * Available tools for deadline management
   */
  protected async getTools(): Promise<any[]> {
    return [
      {
        type: 'function',
        function: {
          name: 'calculate_deadline',
          description: 'Calcula vencimento de prazo processual',
          parameters: {
            type: 'object',
            properties: {
              start_date: {
                type: 'string',
                description: 'Data de início do prazo (YYYY-MM-DD)',
              },
              days: {
                type: 'number',
                description: 'Quantidade de dias do prazo',
              },
              count_type: {
                type: 'string',
                enum: ['corridos', 'úteis'],
                description: 'Tipo de contagem',
              },
              doubled: {
                type: 'boolean',
                description: 'Prazo em dobro (litisconsortes, Fazenda)',
              },
            },
            required: ['start_date', 'days', 'count_type'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'check_holidays',
          description: 'Verifica feriados forenses no período',
          parameters: {
            type: 'object',
            properties: {
              start_date: {
                type: 'string',
                description: 'Data inicial (YYYY-MM-DD)',
              },
              end_date: {
                type: 'string',
                description: 'Data final (YYYY-MM-DD)',
              },
              court_type: {
                type: 'string',
                enum: ['federal', 'estadual', 'trabalhista', 'eleitoral'],
                description: 'Tipo de justiça (cada uma tem feriados específicos)',
              },
            },
            required: ['start_date', 'end_date'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'list_urgencies',
          description: 'Lista todos os prazos urgentes de um processo',
          parameters: {
            type: 'object',
            properties: {
              folder_id: {
                type: 'number',
                description: 'ID da pasta/processo',
              },
              days_threshold: {
                type: 'number',
                description: 'Considerar urgente se faltar menos que X dias',
                default: 5,
              },
            },
            required: ['folder_id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'track_process',
          description: 'Consulta andamentos recentes do processo',
          parameters: {
            type: 'object',
            properties: {
              cnj_number: {
                type: 'string',
                description: 'Número CNJ do processo',
              },
            },
            required: ['cnj_number'],
          },
        },
      },
    ]
  }

  /**
   * Process tool calls for deadline management
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
        case 'calculate_deadline':
          // Simulated deadline calculation
          result = {
            deadline_date: '2025-10-20',
            days_remaining: 15,
            count_type: parameters.count_type,
            holidays_in_period: ['2025-10-12 - Dia de Nossa Senhora Aparecida'],
            doubled: parameters.doubled || false,
            urgency: 'normal',
            total_days: parameters.doubled ? parameters.days * 2 : parameters.days,
          }
          break

        case 'check_holidays':
          // Simulated holiday check
          result = {
            holidays: [
              {
                date: '2025-10-12',
                name: 'Nossa Senhora Aparecida - Padroeira do Brasil',
                type: 'nacional',
              },
              {
                date: '2025-10-28',
                name: 'Dia do Servidor Público',
                type: 'municipal',
                scope: 'São Paulo',
              },
            ],
            total_non_working_days: 2,
          }
          break

        case 'list_urgencies':
          // Simulated urgency list
          result = {
            urgent_deadlines: [
              {
                description: 'Prazo para contestação',
                deadline: '2025-10-08',
                days_remaining: 2,
                urgency: 'critical',
                folder_id: parameters.folder_id,
              },
              {
                description: 'Apresentação de documentos',
                deadline: '2025-10-12',
                days_remaining: 6,
                urgency: 'attention',
                folder_id: parameters.folder_id,
              },
            ],
          }
          break

        case 'track_process':
          // Simulated process tracking
          result = {
            last_movements: [
              {
                date: '2025-09-28',
                description: 'Juntada de petição',
                generates_deadline: true,
                deadline_days: 15,
                deadline_type: 'úteis',
              },
              {
                date: '2025-09-25',
                description: 'Intimação via DJE',
                generates_deadline: false,
              },
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

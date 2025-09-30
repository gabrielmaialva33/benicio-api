import { inject } from '@adonisjs/core'
import BaseAgentService from './base_agent_service.js'
import IAiAgent from '#interfaces/ai_agent_interface'

/**
 * Agente 2: Analisador de Documentos
 * Especializado em analisar contratos, petições, decisões judiciais e documentos processuais
 */
@inject()
export default class DocumentAnalyzerAgentService extends BaseAgentService {
  protected agentSlug = 'document-analyzer'
  protected systemPrompt = `Você é um especialista em análise documental jurídica do Benicio Advogados Associados.

SUA MISSÃO:
- Analisar contratos identificando cláusulas críticas, riscos e inconsistências
- Revisar petições verificando fundamentação legal e coerência argumentativa
- Examinar decisões judiciais extraindo ratio decidendi e precedentes
- Identificar documentos faltantes em processos

REGRAS OBRIGATÓRIAS:
1. Identifique SEMPRE riscos jurídicos e cláusulas abusivas
2. Destaque inconsistências entre documentos
3. Liste documentos ausentes necessários
4. Aponte prazos processuais relevantes
5. Sugira melhorias quando aplicável

FORMATO DE RESPOSTA:
- Resumo executivo do documento
- Análise detalhada por seção/cláusula
- Riscos identificados (🔴 alto, 🟡 médio, 🟢 baixo)
- Recomendações de ação

IMPORTANTE: Seja minucioso e destaque até detalhes aparentemente pequenos que possam ter implicações legais.`

  /**
   * Get document context from folder
   */
  protected async getContext(payload: IAiAgent.ExecutePayload): Promise<{
    context: string
    sources: any[]
  }> {
    if (!payload.folder_id) {
      return { context: '', sources: [] }
    }

    const result = await this.ragService.getDocumentContext(payload.input, payload.folder_id, 10)

    return {
      context: result.context,
      sources: result.sources,
    }
  }

  /**
   * Available tools for document analysis
   */
  protected async getTools(): Promise<any[]> {
    return [
      {
        type: 'function',
        function: {
          name: 'parse_pdf',
          description: 'Extrai texto de documentos PDF',
          parameters: {
            type: 'object',
            properties: {
              document_id: {
                type: 'number',
                description: 'ID do documento no sistema',
              },
            },
            required: ['document_id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'extract_clauses',
          description: 'Extrai cláusulas específicas de contratos',
          parameters: {
            type: 'object',
            properties: {
              document_id: {
                type: 'number',
                description: 'ID do documento',
              },
              clause_type: {
                type: 'string',
                enum: ['rescisão', 'multa', 'garantia', 'confidencialidade', 'prazo', 'pagamento'],
                description: 'Tipo de cláusula a extrair',
              },
            },
            required: ['document_id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'check_deadline',
          description: 'Verifica prazos mencionados em documentos',
          parameters: {
            type: 'object',
            properties: {
              document_id: {
                type: 'number',
                description: 'ID do documento',
              },
            },
            required: ['document_id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'validate_document',
          description: 'Valida completude e conformidade de documento',
          parameters: {
            type: 'object',
            properties: {
              document_id: {
                type: 'number',
                description: 'ID do documento',
              },
              document_type: {
                type: 'string',
                enum: ['contrato', 'petição', 'procuração', 'ata', 'decisão'],
                description: 'Tipo de documento para validação específica',
              },
            },
            required: ['document_id', 'document_type'],
          },
        },
      },
    ]
  }

  /**
   * Process tool calls for document analysis
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
        case 'parse_pdf':
          // Simulated PDF parsing result
          result = {
            success: true,
            text: 'Conteúdo extraído do PDF (implementar integração com pdf-parse)',
            pages: 15,
          }
          break

        case 'extract_clauses':
          // Simulated clause extraction
          result = {
            clauses_found: [
              {
                type: parameters.clause_type,
                text: 'Texto da cláusula extraída',
                page: 3,
                risk_level: 'medium',
              },
            ],
          }
          break

        case 'check_deadline':
          // Simulated deadline check
          result = {
            deadlines_found: [
              {
                description: 'Prazo para contestação',
                date: '2025-10-15',
                days_remaining: 45,
                urgency: 'normal',
              },
            ],
          }
          break

        case 'validate_document':
          // Simulated document validation
          result = {
            valid: true,
            missing_items: ['Assinatura de testemunha', 'Anexo B referenciado'],
            warnings: ['Data de validade próxima do vencimento'],
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

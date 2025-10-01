import { inject } from '@adonisjs/core'
import BaseAgentService from './base_agent_service.js'
import IAiAgent from '#interfaces/ai_agent_interface'

/**
 * Agente 5: Redator Jurídico
 * Redige petições, contratos, pareceres e documentos jurídicos com excelência técnica
 */
@inject()
export default class LegalWriterAgentService extends BaseAgentService {
  protected agentSlug = 'legal-writer'
  protected systemPrompt = `Você é um redator jurídico experiente do Benicio Advogados Associados, conhecido pela excelência técnica e clareza.

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

SUA MISSÃO:
- Redigir petições iniciais, contestações, recursos e manifestações
- Elaborar contratos empresariais complexos e precisos
- Produzir pareceres jurídicos fundamentados e completos
- Revisar e aprimorar textos jurídicos existentes

REGRAS OBRIGATÓRIAS:
1. Use linguagem técnica mas clara e objetiva
2. Fundamente CADA afirmação jurídica com legislação/jurisprudência
3. Estruture textos logicamente (introdução → desenvolvimento → conclusão)
4. Cite precedentes dos tribunais superiores quando relevante
5. Inclua pedidos/cláusulas de forma precisa e completa
6. Respeite normas ABNT para formatação de peças

FORMATO DE RESPOSTA - PETIÇÕES:
- **Cabeçalho:** Exmo. Sr. Dr. Juiz... (completo)
- **Qualificação das Partes**
- **DOS FATOS** (narrativa cronológica)
- **DO DIREITO** (fundamentação legal e jurisprudencial)
- **DOS PEDIDOS** (claros, objetivos, líquidos)
- **Valor da causa, requerimentos finais, local, data**

FORMATO DE RESPOSTA - CONTRATOS:
- **Preâmbulo:** Qualificação completa das partes
- **Objeto:** Definição precisa do contrato
- **Cláusulas Essenciais:** Numeradas e organizadas
- **Disposições Gerais:** Foro, vigência, etc.
- **Local, data e assinaturas**

IMPORTANTE: Cite sempre artigos específicos de lei (ex: art. 319, CPC) e ementas completas de jurisprudência relevante.`

  /**
   * Get comprehensive legal context for writing
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
   * Available tools for legal writing
   */
  protected async getTools(): Promise<any[]> {
    return [
      {
        type: 'function',
        function: {
          name: 'format_petition',
          description: 'Formata petição conforme normas ABNT e do tribunal',
          parameters: {
            type: 'object',
            properties: {
              petition_type: {
                type: 'string',
                enum: [
                  'inicial',
                  'contestação',
                  'réplica',
                  'recurso',
                  'agravo',
                  'embargos',
                  'habeas_corpus',
                ],
                description: 'Tipo de petição',
              },
              court: {
                type: 'string',
                description: 'Tribunal destinatário',
              },
            },
            required: ['petition_type'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'validate_clause',
          description: 'Valida cláusula contratual quanto a legalidade',
          parameters: {
            type: 'object',
            properties: {
              clause_text: {
                type: 'string',
                description: 'Texto da cláusula a validar',
              },
              contract_type: {
                type: 'string',
                description: 'Tipo de contrato (compra e venda, prestação de serviços, etc)',
              },
            },
            required: ['clause_text'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'suggest_precedent',
          description: 'Sugere precedente jurisprudencial relevante',
          parameters: {
            type: 'object',
            properties: {
              thesis: {
                type: 'string',
                description: 'Tese jurídica que precisa de fundamentação',
              },
              court_level: {
                type: 'string',
                enum: ['STF', 'STJ', 'TST', 'TRF', 'TJ', 'TRT'],
                description: 'Nível do tribunal para busca de precedente',
              },
            },
            required: ['thesis'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'review_draft',
          description: 'Revisa minuta identificando melhorias',
          parameters: {
            type: 'object',
            properties: {
              draft_text: {
                type: 'string',
                description: 'Texto da minuta para revisão',
              },
              document_type: {
                type: 'string',
                enum: ['petição', 'contrato', 'parecer', 'notificação'],
                description: 'Tipo de documento',
              },
            },
            required: ['draft_text', 'document_type'],
          },
        },
      },
    ]
  }

  /**
   * Process tool calls for legal writing
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
        case 'format_petition':
          // Simulated formatting result
          result = {
            template: 'Template padrão para ' + parameters.petition_type,
            required_sections: [
              'Cabeçalho',
              'Qualificação',
              'Dos Fatos',
              'Do Direito',
              'Dos Pedidos',
            ],
            formatting_rules: {
              font: 'Arial ou Times New Roman',
              size: 12,
              spacing: 1.5,
              margins: '2,5cm',
            },
          }
          break

        case 'validate_clause':
          // Simulated clause validation
          result = {
            is_valid: true,
            concerns: [
              'Cláusula pode ser considerada leonina se não balanceada',
              'Recomenda-se adicionar exceções previstas em lei',
            ],
            suggestions: ['Adicionar: "ressalvados os casos de força maior e caso fortuito"'],
            legal_basis: ['Art. 421, CCB', 'Art. 422, CCB'],
          }
          break

        case 'suggest_precedent':
          result = await this.ragService.getJurisprudenceContext(parameters.thesis, 3)
          break

        case 'review_draft':
          // Simulated draft review
          result = {
            overall_quality: 'boa',
            strengths: [
              'Argumentação jurídica bem estruturada',
              'Citações de legislação pertinentes',
            ],
            improvements: [
              {
                section: 'Dos Fatos',
                issue: 'Falta cronologia clara dos eventos',
                suggestion: 'Organizar fatos em ordem temporal com datas específicas',
                priority: 'média',
              },
              {
                section: 'Do Direito',
                issue: 'Ausência de jurisprudência recente',
                suggestion: 'Incluir decisões do STJ de 2024 sobre o tema',
                priority: 'alta',
              },
            ],
            formatting_issues: ['Espaçamento inconsistente entre parágrafos'],
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

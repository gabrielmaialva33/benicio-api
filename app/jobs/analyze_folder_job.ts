import { Job } from '@rlanz/bull-queue'
import { inject } from '@adonisjs/core'
import Folder from '#models/folder'
import OrchestratorService from '#services/ai/orchestrator_service'
import logger from '@adonisjs/core/services/logger'

interface AnalyzeFolderJobPayload {
  folder_id: number
  user_id: number
  analysis_type: 'full' | 'summary' | 'risks' | 'deadlines' | 'strategy'
  conversation_id?: number
}

@inject()
export default class AnalyzeFolderJob extends Job {
  // This is the path to the file that is used to create the job
  static get $$filepath() {
    return import.meta.url
  }

  constructor(private orchestrator: OrchestratorService) {
    super()
  }

  /**
   * Base Entry point
   * Analyzes a folder/case and generates AI insights
   */
  async handle(payload: AnalyzeFolderJobPayload): Promise<void> {
    try {
      logger.info('Analyzing folder job started', {
        folder_id: payload.folder_id,
        analysis_type: payload.analysis_type,
        user_id: payload.user_id,
      })

      // Load folder with all relationships
      const folder = await Folder.query()
        .where('id', payload.folder_id)
        .preload('client')
        .preload('folder_type')
        .preload('court')
        .preload('responsible_lawyer')
        .preload('documents', (query) => {
          query.preload('file').limit(20)
        })
        .preload('movements', (query) => {
          query.orderBy('movement_date', 'desc').limit(10)
        })
        .preload('parties')
        .firstOrFail()

      // Build analysis prompt based on type
      const prompt = this.buildAnalysisPrompt(folder, payload.analysis_type)

      // Execute AI analysis using orchestrator
      const result = await this.orchestrator.execute({
        userId: payload.user_id,
        input: prompt,
        folderId: payload.folder_id,
        conversationId: payload.conversation_id,
        mode: 'multi',
      })

      logger.info('Analyzing folder job completed', {
        folder_id: payload.folder_id,
        analysis_type: payload.analysis_type,
        output_length: result.output.length,
        tokens_used: result.tokens_used,
      })
    } catch (error) {
      logger.error('Analyzing folder job failed', {
        error: error.message,
        stack: error.stack,
        payload,
      })
      throw error
    }
  }

  /**
   * Build analysis prompt based on analysis type
   */
  private buildAnalysisPrompt(folder: Folder, analysisType: string): string {
    const baseInfo = `
Analise o processo jurídico abaixo:

INFORMAÇÕES DO PROCESSO:
- Título: ${folder.title}
- Número CNJ: ${folder.cnj_number || 'Não informado'}
- Tipo: ${folder.folder_type?.name || 'Não especificado'}
- Cliente: ${folder.client?.fantasy_name || 'Não informado'}
- Tribunal: ${folder.court?.name || 'Não informado'}
- Status: ${folder.status}
- Prioridade: ${folder.priority}
- Valor da causa: ${folder.case_value ? `R$ ${Number(folder.case_value).toLocaleString('pt-BR')}` : 'Não informado'}
- Advogado responsável: ${folder.responsible_lawyer?.full_name || 'Não atribuído'}
- Tipo de ação: ${folder.action_type || 'Não especificado'}

PARTES DO PROCESSO:
${folder.parties?.map((p: any) => `- ${p.party_type}: ${p.name}`).join('\n') || 'Nenhuma parte cadastrada'}

ÚLTIMAS MOVIMENTAÇÕES:
${folder.movements?.map((m: any) => `- ${m.movement_date}: ${m.description}`).join('\n') || 'Nenhuma movimentação cadastrada'}

DOCUMENTOS:
${folder.documents?.map((d: any) => `- ${d.description || d.file?.file_name}`).join('\n') || 'Nenhum documento anexado'}
`

    switch (analysisType) {
      case 'full':
        return `${baseInfo}

Faça uma análise completa e detalhada do processo, incluindo:
1. Resumo do caso
2. Análise jurídica (leis aplicáveis, jurisprudência relevante)
3. Identificação de riscos e oportunidades
4. Prazos críticos e próximas ações
5. Estratégia processual recomendada
6. Documentação pendente ou recomendada`

      case 'summary':
        return `${baseInfo}

Forneça um resumo executivo do processo em até 3 parágrafos.`

      case 'risks':
        return `${baseInfo}

Identifique e analise todos os riscos jurídicos deste processo, classificando-os por gravidade (alta, média, baixa).`

      case 'deadlines':
        return `${baseInfo}

Liste todos os prazos processuais relevantes, incluindo:
- Prazos vencidos (se houver)
- Prazos próximos ao vencimento
- Próximos prazos esperados
Considere prazos em dobro se aplicável e feriados forenses.`

      case 'strategy':
        return `${baseInfo}

Desenvolva uma estratégia processual completa, incluindo:
1. Teses jurídicas aplicáveis
2. Linha argumentativa recomendada
3. Jurisprudência favorável
4. Próximas ações processuais
5. Alternativas (acordos, recursos, etc.)`

      default:
        return `${baseInfo}

Analise este processo e forneça insights relevantes.`
    }
  }

  /**
   * This is an optional method that gets called when the retries has exceeded and is marked failed.
   */
  async rescue(payload: AnalyzeFolderJobPayload, error: Error): Promise<void> {
    logger.error('AnalyzeFolder job failed after all retries', {
      folder_id: payload.folder_id,
      analysis_type: payload.analysis_type,
      error: error.message,
    })
  }
}

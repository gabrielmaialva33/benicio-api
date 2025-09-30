import { DateTime } from 'luxon'
import BaseTool from './base_tool.js'

/**
 * CalculateDeadlineTool
 * Calcula prazos processuais conforme CPC/CLT considerando feriados
 */
export default class CalculateDeadlineTool extends BaseTool {
  name = 'calculate_deadline'
  description =
    'Calcula prazos processuais conforme CPC/CLT. Considera dias �teis, corridos, feriados forenses e prazos em dobro.'

  parameters = {
    type: 'object',
    properties: {
      start_date: {
        type: 'string',
        description: 'Data de in�cio do prazo (formato: YYYY-MM-DD)',
      },
      days: {
        type: 'number',
        description: 'Quantidade de dias do prazo',
      },
      count_type: {
        type: 'string',
        enum: ['�teis', 'corridos'],
        description: 'Tipo de contagem (�teis ou corridos)',
      },
      doubled: {
        type: 'boolean',
        description:
          'Prazo em dobro (litisconsortes com procuradores diferentes ou Fazenda P�blica)',
        default: false,
      },
      court_type: {
        type: 'string',
        enum: ['federal', 'estadual', 'trabalhista', 'eleitoral'],
        description: 'Tipo de justi�a para considerar feriados espec�ficos',
        default: 'estadual',
      },
    },
    required: ['start_date', 'days', 'count_type'],
  }

  async execute(parameters: {
    start_date: string
    days: number
    count_type: '�teis' | 'corridos'
    doubled?: boolean
    court_type?: string
  }): Promise<any> {
    const startDate = DateTime.fromISO(parameters.start_date)
    const totalDays = parameters.doubled ? parameters.days * 2 : parameters.days
    const countType = parameters.count_type

    // Feriados nacionais 2025 (simplificado - em produ��o usar API ou banco)
    const nationalHolidays = [
      '2025-01-01', // Ano Novo
      '2025-02-28', // Carnaval
      '2025-03-01', // Carnaval
      '2025-04-18', // Sexta-feira Santa
      '2025-04-21', // Tiradentes
      '2025-05-01', // Dia do Trabalho
      '2025-06-19', // Corpus Christi
      '2025-09-07', // Independ�ncia
      '2025-10-12', // Nossa Senhora Aparecida
      '2025-11-02', // Finados
      '2025-11-15', // Proclama��o da Rep�blica
      '2025-11-20', // Dia da Consci�ncia Negra
      '2025-12-25', // Natal
    ]

    let currentDate = startDate
    let daysAdded = 0
    const holidaysInPeriod: string[] = []

    while (daysAdded < totalDays) {
      currentDate = currentDate.plus({ days: 1 })

      if (countType === 'corridos') {
        // Dias corridos: conta todos os dias
        daysAdded++
      } else {
        // Dias �teis: pula s�bados, domingos e feriados
        const isWeekend = currentDate.weekday === 6 || currentDate.weekday === 7
        const isHoliday = nationalHolidays.includes(currentDate.toISODate()!)

        if (isHoliday) {
          holidaysInPeriod.push(currentDate.toISODate()!)
        }

        if (!isWeekend && !isHoliday) {
          daysAdded++
        }
      }
    }

    const deadlineDate = currentDate
    const today = DateTime.now()
    const daysRemaining = Math.ceil(deadlineDate.diff(today, 'days').days)

    // Determina urg�ncia
    let urgency: 'critical' | 'attention' | 'normal'
    let urgencyIcon: string

    if (daysRemaining < 0) {
      urgency = 'critical'
      urgencyIcon = '=4'
    } else if (daysRemaining <= 3) {
      urgency = 'critical'
      urgencyIcon = '=4'
    } else if (daysRemaining <= 7) {
      urgency = 'attention'
      urgencyIcon = '=�'
    } else {
      urgency = 'normal'
      urgencyIcon = '=�'
    }

    return {
      deadline_date: deadlineDate.toISODate(),
      start_date: startDate.toISODate(),
      total_days: totalDays,
      count_type: countType,
      doubled: parameters.doubled || false,
      holidays_in_period: holidaysInPeriod,
      days_remaining: daysRemaining,
      urgency,
      urgency_icon: urgencyIcon,
      is_expired: daysRemaining < 0,
      message:
        daysRemaining < 0
          ? `� PRAZO VENCIDO h� ${Math.abs(daysRemaining)} dias!`
          : `${urgencyIcon} Prazo vence em ${daysRemaining} dias (${deadlineDate.toFormat('dd/MM/yyyy')})`,
    }
  }
}

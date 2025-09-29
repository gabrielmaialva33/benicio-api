import { CourtData } from '#defaults/brazilian_legal_data'

/**
 * Serviço para gerar números CNJ válidos e realistas
 *
 * Formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
 * - NNNNNNN: Número sequencial do processo (7 dígitos)
 * - DD: Dígitos verificadores (2 dígitos) - calculados por módulo 97
 * - AAAA: Ano de ajuizamento (4 dígitos)
 * - J: Segmento do poder judiciário (1 dígito)
 * - TR: Tribunal (2 dígitos)
 * - OOOO: Vara/unidade de origem (4 dígitos)
 *
 * Baseado na Resolução 65/2008 do CNJ
 */
export class RealisticCnjGeneratorService {
  /**
   * Gera um número CNJ válido baseado em dados reais
   */
  public generate(params: {
    year: number
    court: CourtData
    sequentialNumber: number
    originatingUnit?: number
  }): string {
    const { year, court, sequentialNumber, originatingUnit = 1 } = params

    // Formata número sequencial (7 dígitos)
    const seq = sequentialNumber.toString().padStart(7, '0')

    // Obtém o segmento judiciário baseado no tipo de tribunal
    const segment = this.getSegmentCode(court.courtType)

    // Formata a unidade de origem (4 dígitos)
    const origin = originatingUnit.toString().padStart(4, '0')

    // Calcula os dígitos verificadores
    const checkDigits = this.calculateCheckDigits(seq, year, segment, court.tribunalCode, origin)

    // Monta o número CNJ completo
    return `${seq}-${checkDigits}.${year}.${segment}.${court.tribunalCode}.${origin}`
  }

  /**
   * Mapeia tipo de tribunal para código de segmento judiciário
   * Baseado na Resolução 65/2008 do CNJ
   */
  private getSegmentCode(courtType: string): string {
    const segmentMap: Record<string, string> = {
      'supreme': '1', // STF
      'council': '2', // CNJ
      'superior': '3', // STJ
      'federal': '4', // Justiça Federal
      'labor': '5', // Justiça do Trabalho
      'electoral': '6', // Justiça Eleitoral
      'military': '7', // Justiça Militar da União
      'state': '8', // Justiça Estadual
      'military-state': '9', // Justiça Militar Estadual
    }

    return segmentMap[courtType] || '8'
  }

  /**
   * Calcula os dígitos verificadores usando o algoritmo módulo 97
   * Conforme especificação do CNJ (Resolução 65/2008)
   *
   * Fórmula: 98 - (resto da divisão do número completo por 97)
   */
  private calculateCheckDigits(
    sequentialNumber: string,
    year: number,
    segment: string,
    tribunal: string,
    origin: string
  ): string {
    // Concatena: sequencial + ano + segmento + tribunal + origem
    const fullNumber = `${sequentialNumber}${year}${segment}${tribunal}${origin}`

    // Converte para BigInt para lidar com números grandes
    const numberBigInt = BigInt(fullNumber)

    // Calcula o resto da divisão por 97
    const remainder = numberBigInt % 97n

    // Calcula o dígito verificador
    const checkDigit = 98n - remainder

    // Retorna com 2 dígitos (padding com zero à esquerda se necessário)
    return checkDigit.toString().padStart(2, '0')
  }

  /**
   * Valida se um número CNJ é válido
   * Útil para testes e validações
   */
  public validate(cnjNumber: string): boolean {
    // Remove formatação
    const cleaned = cnjNumber.replace(/[.-]/g, '')

    // Verifica se tem 20 dígitos
    if (cleaned.length !== 20) {
      return false
    }

    // Extrai as partes
    const seq = cleaned.substring(0, 7)
    const checkDigits = cleaned.substring(7, 9)
    const year = cleaned.substring(9, 13)
    const segment = cleaned.substring(13, 14)
    const tribunal = cleaned.substring(14, 16)
    const origin = cleaned.substring(16, 20)

    // Recalcula os dígitos verificadores
    const calculatedCheckDigits = this.calculateCheckDigits(
      seq,
      Number.parseInt(year, 10),
      segment,
      tribunal,
      origin
    )

    // Compara com os dígitos verificadores fornecidos
    return checkDigits === calculatedCheckDigits
  }

  /**
   * Formata um número CNJ para exibição
   * Entrada: 00000015920011000001
   * Saída: 0000001-59.2001.1.00.0001
   */
  public format(cnjNumber: string): string {
    const cleaned = cnjNumber.replace(/[.-]/g, '')

    if (cleaned.length !== 20) {
      throw new Error('CNJ number must have exactly 20 digits')
    }

    const seq = cleaned.substring(0, 7)
    const check = cleaned.substring(7, 9)
    const year = cleaned.substring(9, 13)
    const segment = cleaned.substring(13, 14)
    const tribunal = cleaned.substring(14, 16)
    const origin = cleaned.substring(16, 20)

    return `${seq}-${check}.${year}.${segment}.${tribunal}.${origin}`
  }

  /**
   * Remove a formatação de um número CNJ
   * Entrada: 0000001-59.2001.1.00.0001
   * Saída: 00000015920011000001
   */
  public unformat(cnjNumber: string): string {
    return cnjNumber.replace(/[.-]/g, '')
  }
}

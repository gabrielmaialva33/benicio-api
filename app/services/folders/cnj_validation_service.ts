import logger from '@adonisjs/core/services/logger'

export interface CnjValidationResult {
  isValid: boolean
  formatted: string | null
  errors: string[]
  metadata: {
    sequentialNumber: string | null
    verificationDigit: string | null
    year: string | null
    judicialSegment: string | null
    tribunal: string | null
    originatingUnit: string | null
  }
}

export default class CnjValidationService {
  /**
   * Validates and formats a CNJ number according to Brazilian standards
   * CNJ Format: NNNNNNN-DD.AAAA.J.TR.OOOO
   * Where:
   * - NNNNNNN: Sequential number (7 digits)
   * - DD: Verification digit (2 digits)
   * - AAAA: Year (4 digits)
   * - J: Judicial segment (1 digit)
   * - TR: Tribunal (2 digits)
   * - OOOO: Originating unit (4 digits)
   */
  async validate(cnjNumber: string): Promise<CnjValidationResult> {
    logger.debug(`🔍 Validating CNJ number: ${cnjNumber}`)

    const result: CnjValidationResult = {
      isValid: false,
      formatted: null,
      errors: [],
      metadata: {
        sequentialNumber: null,
        verificationDigit: null,
        year: null,
        judicialSegment: null,
        tribunal: null,
        originatingUnit: null,
      },
    }

    try {
      const cleanNumber = this.cleanCnjNumber(cnjNumber)

      if (!this.validateLength(cleanNumber)) {
        result.errors.push('CNJ number must have exactly 20 digits')
        logger.warn(`❌ Invalid CNJ length: ${cleanNumber.length} digits`)
        return result
      }

      const parts = this.extractCnjParts(cleanNumber)
      result.metadata = parts

      if (!this.validateSequentialNumber(parts.sequentialNumber!)) {
        result.errors.push('Sequential number must be between 0000001 and 9999999')
      }

      if (!this.validateYear(parts.year!)) {
        result.errors.push('Year must be between 1998 and current year + 1')
      }

      if (!this.validateJudicialSegment(parts.judicialSegment!)) {
        result.errors.push('Invalid judicial segment')
      }

      if (!this.validateTribunal(parts.tribunal!)) {
        result.errors.push('Invalid tribunal code')
      }

      if (!this.validateOriginatingUnit(parts.originatingUnit!)) {
        result.errors.push('Invalid originating unit')
      }

      const calculatedDigit = this.calculateVerificationDigit(cleanNumber)
      if (parts.verificationDigit !== calculatedDigit) {
        result.errors.push('Invalid verification digit')
        logger.warn(
          `❌ CNJ verification digit mismatch. Expected: ${calculatedDigit}, Got: ${parts.verificationDigit}`
        )
      }

      if (result.errors.length === 0) {
        result.isValid = true
        result.formatted = this.formatCnjNumber(cleanNumber)
        logger.info(`✅ CNJ number validated successfully: ${result.formatted}`)
      } else {
        logger.warn(`❌ CNJ validation failed: ${result.errors.join(', ')}`)
      }

      return result
    } catch (error) {
      logger.error(`💥 Error validating CNJ number: ${error.message}`)
      result.errors.push('Internal validation error')
      return result
    }
  }

  /**
   * Formats a valid CNJ number
   */
  formatCnjNumber(cleanNumber: string): string {
    if (cleanNumber.length !== 20) {
      throw new Error('Invalid CNJ number length for formatting')
    }

    const sequential = cleanNumber.substring(0, 7)
    const digit = cleanNumber.substring(7, 9)
    const year = cleanNumber.substring(9, 13)
    const segment = cleanNumber.substring(13, 14)
    const tribunal = cleanNumber.substring(14, 16)
    const unit = cleanNumber.substring(16, 20)

    return `${sequential}-${digit}.${year}.${segment}.${tribunal}.${unit}`
  }

  /**
   * Removes all non-numeric characters
   */
  private cleanCnjNumber(cnjNumber: string): string {
    return cnjNumber.replace(/\D/g, '')
  }

  /**
   * Validates CNJ number length (must be 20 digits)
   */
  private validateLength(cleanNumber: string): boolean {
    return cleanNumber.length === 20
  }

  /**
   * Extracts CNJ parts from clean number
   */
  private extractCnjParts(cleanNumber: string) {
    return {
      sequentialNumber: cleanNumber.substring(0, 7),
      verificationDigit: cleanNumber.substring(7, 9),
      year: cleanNumber.substring(9, 13),
      judicialSegment: cleanNumber.substring(13, 14),
      tribunal: cleanNumber.substring(14, 16),
      originatingUnit: cleanNumber.substring(16, 20),
    }
  }

  /**
   * Validates sequential number (must be between 0000001 and 9999999)
   */
  private validateSequentialNumber(sequential: string): boolean {
    const num = Number.parseInt(sequential, 10)
    return num >= 1 && num <= 9999999
  }

  /**
   * Validates year (must be between 1998 and current year + 1)
   */
  private validateYear(year: string): boolean {
    const yearNum = Number.parseInt(year, 10)
    const currentYear = new Date().getFullYear()
    return yearNum >= 1998 && yearNum <= currentYear + 1
  }

  /**
   * Validates judicial segment
   * 1: Supremo Tribunal Federal
   * 2: Conselho Nacional de Justiça
   * 3: Superior Tribunal de Justiça
   * 4: Justiça Federal
   * 5: Justiça do Trabalho
   * 6: Justiça Eleitoral
   * 7: Justiça Militar da União
   * 8: Justiça dos Estados e do Distrito Federal
   * 9: Justiça Militar Estadual
   */
  private validateJudicialSegment(segment: string): boolean {
    const validSegments = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    return validSegments.includes(segment)
  }

  /**
   * Validates tribunal code (basic validation - would need complete tribunal table)
   */
  private validateTribunal(tribunal: string): boolean {
    const tribunalNum = Number.parseInt(tribunal, 10)
    return tribunalNum >= 1 && tribunalNum <= 99
  }

  /**
   * Validates originating unit
   */
  private validateOriginatingUnit(unit: string): boolean {
    const unitNum = Number.parseInt(unit, 10)
    return unitNum >= 1 && unitNum <= 9999
  }

  /**
   * Calculates verification digit using modulus 97
   */
  private calculateVerificationDigit(cleanNumber: string): string {
    const withoutDigit = cleanNumber.substring(0, 7) + cleanNumber.substring(9)

    let remainder = 0
    for (const element of withoutDigit) {
      remainder = (remainder * 10 + Number.parseInt(element, 10)) % 97
    }

    const digit = 98 - remainder
    return digit.toString().padStart(2, '0')
  }

  /**
   * Generates a valid CNJ number for testing purposes
   */
  async generateTestCnj(options?: {
    year?: number
    judicialSegment?: string
    tribunal?: string
    originatingUnit?: string
  }): Promise<string> {
    const currentYear = new Date().getFullYear()
    const year = options?.year || currentYear
    const segment = options?.judicialSegment || '8' // Estado/DF por padrão
    const tribunal = options?.tribunal || '26' // TJSP por padrão
    const unit = options?.originatingUnit || '0001'

    const sequential = Math.floor(Math.random() * 9999999)
      .toString()
      .padStart(7, '0')
    const partialNumber = sequential + '00' + year + segment + tribunal + unit

    const digit = this.calculateVerificationDigit(partialNumber)
    const fullNumber = sequential + digit + year + segment + tribunal + unit

    logger.info(`🧪 Generated test CNJ: ${this.formatCnjNumber(fullNumber)}`)
    return this.formatCnjNumber(fullNumber)
  }

  /**
   * Validates multiple CNJ numbers in batch
   */
  async validateBatch(cnjNumbers: string[]): Promise<CnjValidationResult[]> {
    logger.info(`🔄 Batch validating ${cnjNumbers.length} CNJ numbers`)

    const results = await Promise.all(cnjNumbers.map((cnj) => this.validate(cnj)))

    const validCount = results.filter((r) => r.isValid).length
    const invalidCount = results.length - validCount

    logger.info(`📊 Batch validation complete: ${validCount} valid, ${invalidCount} invalid`)

    return results
  }
}

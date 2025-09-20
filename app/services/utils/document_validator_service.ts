export default class DocumentValidatorService {
  /**
   * Validate CPF (Brazilian individual taxpayer registry)
   */
  public validateCpf(cpf: string): boolean {
    // Remove non-numeric characters
    const cleanCpf = cpf.replace(/\D/g, '')

    // Check length
    if (cleanCpf.length !== 11) {
      return false
    }

    // Check if all digits are the same
    if (/^(\d)\1+$/.test(cleanCpf)) {
      return false
    }

    // Validate first digit
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += Number.parseInt(cleanCpf.charAt(i)) * (10 - i)
    }
    let remainder = sum % 11
    let digit = remainder < 2 ? 0 : 11 - remainder

    if (Number.parseInt(cleanCpf.charAt(9)) !== digit) {
      return false
    }

    // Validate second digit
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += Number.parseInt(cleanCpf.charAt(i)) * (11 - i)
    }
    remainder = sum % 11
    digit = remainder < 2 ? 0 : 11 - remainder

    return Number.parseInt(cleanCpf.charAt(10)) === digit
  }

  /**
   * Validate CNPJ (Brazilian company taxpayer registry)
   */
  public validateCnpj(cnpj: string): boolean {
    // Remove non-numeric characters
    const cleanCnpj = cnpj.replace(/\D/g, '')

    // Check length
    if (cleanCnpj.length !== 14) {
      return false
    }

    // Check if all digits are the same
    if (/^(\d)\1+$/.test(cleanCnpj)) {
      return false
    }

    // Validate first digit
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += Number.parseInt(cleanCnpj.charAt(i)) * weights1[i]
    }
    let remainder = sum % 11
    let digit = remainder < 2 ? 0 : 11 - remainder

    if (Number.parseInt(cleanCnpj.charAt(12)) !== digit) {
      return false
    }

    // Validate second digit
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    sum = 0
    for (let i = 0; i < 13; i++) {
      sum += Number.parseInt(cleanCnpj.charAt(i)) * weights2[i]
    }
    remainder = sum % 11
    digit = remainder < 2 ? 0 : 11 - remainder

    return Number.parseInt(cleanCnpj.charAt(13)) === digit
  }

  /**
   * Validate document (CPF or CNPJ)
   */
  public validate(document: string): boolean {
    const cleanDoc = document.replace(/\D/g, '')

    if (cleanDoc.length === 11) {
      return this.validateCpf(cleanDoc)
    } else if (cleanDoc.length === 14) {
      return this.validateCnpj(cleanDoc)
    }

    return false
  }

  /**
   * Get document type
   */
  public getType(document: string): 'cpf' | 'cnpj' | null {
    const cleanDoc = document.replace(/\D/g, '')

    if (cleanDoc.length === 11) {
      return 'cpf'
    } else if (cleanDoc.length === 14) {
      return 'cnpj'
    }

    return null
  }

  /**
   * Format CPF
   */
  public formatCpf(cpf: string): string {
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) {
      return cpf
    }
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  /**
   * Format CNPJ
   */
  public formatCnpj(cnpj: string): string {
    const cleanCnpj = cnpj.replace(/\D/g, '')
    if (cleanCnpj.length !== 14) {
      return cnpj
    }
    return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  /**
   * Format document (CPF or CNPJ)
   */
  public format(document: string): string {
    const type = this.getType(document)

    if (type === 'cpf') {
      return this.formatCpf(document)
    } else if (type === 'cnpj') {
      return this.formatCnpj(document)
    }

    return document
  }

  /**
   * Clean document (remove formatting)
   */
  public clean(document: string): string {
    return document.replace(/\D/g, '')
  }
}

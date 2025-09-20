interface CepResponse {
  cep: string
  logradouro: string
  complemento?: string
  bairro: string
  localidade: string
  uf: string
  ibge?: string
  gia?: string
  ddd?: string
  siafi?: string
  erro?: boolean
}

interface Address {
  postal_code: string
  street: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  country: string
}

export default class CepLookupService {
  private static readonly VIACEP_URL = 'https://viacep.com.br/ws'

  /**
   * Lookup address information by CEP using ViaCEP API
   */
  public async lookup(cep: string): Promise<Address | null> {
    try {
      // Clean CEP - remove non-numeric characters
      const cleanCep = cep.replace(/\D/g, '')

      // Validate CEP length
      if (cleanCep.length !== 8) {
        throw new Error('CEP must have 8 digits')
      }

      // Format CEP for API
      const formattedCep = `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`

      // Make request to ViaCEP API
      const response = await fetch(`${CepLookupService.VIACEP_URL}/${cleanCep}/json/`)

      if (!response.ok) {
        throw new Error(`Failed to fetch CEP data: ${response.statusText}`)
      }

      const data = (await response.json()) as CepResponse

      // Check if CEP was found
      if (data.erro) {
        return null
      }

      // Map response to our Address format
      return {
        postal_code: formattedCep,
        street: data.logradouro || '',
        complement: data.complemento || undefined,
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
        country: 'Brasil',
      }
    } catch (error) {
      console.error('Error looking up CEP:', error)
      return null
    }
  }

  /**
   * Validate CEP format
   */
  public isValidCep(cep: string): boolean {
    // Remove non-numeric characters
    const cleanCep = cep.replace(/\D/g, '')

    // Check if has exactly 8 digits
    if (cleanCep.length !== 8) {
      return false
    }

    // Check if it's not all zeros
    if (cleanCep === '00000000') {
      return false
    }

    return true
  }

  /**
   * Format CEP to standard format (00000-000)
   */
  public formatCep(cep: string): string {
    const cleanCep = cep.replace(/\D/g, '')

    if (cleanCep.length !== 8) {
      return cep
    }

    return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`
  }
}

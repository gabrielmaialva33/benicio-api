import axios from 'axios'

interface CepData {
  street: string
  neighborhood: string
  city: string
  state: string
}

export default class CepLookupService {
  async lookup(cep: string): Promise<CepData | null> {
    try {
      // Clean CEP (remove non-digits)
      const cleanCep = cep.replace(/\D/g, '')

      if (cleanCep.length !== 8) {
        return null
      }

      // Use ViaCEP API (free Brazilian CEP service)
      const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`)

      if (response.data.erro) {
        return null
      }

      return {
        street: response.data.logradouro || '',
        neighborhood: response.data.bairro || '',
        city: response.data.localidade || '',
        state: response.data.uf || '',
      }
    } catch (error) {
      console.error('CEP lookup error:', error)
      return null
    }
  }
}

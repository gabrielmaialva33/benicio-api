/**
 * Benicio Advogados Associados - Specific Legal Data
 * Real data based on the actual law firm's structure and operations
 */

export interface BenicioClientData {
  name: string
  cnpj: string
  sector: string
  revenueRange: 'small' | 'medium' | 'large' | 'enterprise'
  relationshipYears?: number
}

export const BenicioFirmData = {
  name: 'Benicio Advogados Associados',
  cnpj: '00149855000189',
  address: {
    street: 'Av. Engenheiro Luís Carlos Berrini',
    number: '105',
    complement: '13º Andar / Ed. Berrini One',
    neighborhood: 'Itaim Bibi',
    city: 'São Paulo',
    state: 'SP',
    postalCode: '04571010',
  },
  phone: '(11) 3920-8800',
  email: 'contato@benicio.com.br',
  website: 'https://benicio.com.br',
  foundedYear: 1967,
}

// Real partners and key personnel
export const BenicioLawyers = [
  {
    name: 'Celso Benício',
    role: 'Director',
    specialization: 'Corporate Law',
    seniority: 'partner',
  },
  {
    name: 'Alessandro Barreto Borges',
    role: 'Partner',
    specialization: 'Tax Law',
    seniority: 'partner',
  },
  { name: 'André Camara', role: 'Partner', specialization: 'Corporate Law', seniority: 'partner' },
]

// Typical corporate clients profile based on Benicio's client base
export const BenicioTypicalClients: BenicioClientData[] = [
  // Large Industrial Clients (similar to Leitesol - 30+ years relationship)
  {
    name: 'Indústria Alimentícia Brasileira S.A.',
    cnpj: '12345678000190',
    sector: 'Indústria Alimentícia',
    revenueRange: 'enterprise',
    relationshipYears: 32,
  },
  {
    name: 'Metalúrgica Nacional Ltda',
    cnpj: '23456789000191',
    sector: 'Metalúrgica',
    revenueRange: 'enterprise',
    relationshipYears: 28,
  },
  {
    name: 'Química Industrial São Paulo S.A.',
    cnpj: '34567890000192',
    sector: 'Química',
    revenueRange: 'enterprise',
    relationshipYears: 25,
  },
  {
    name: 'Grupo Farmacêutico União',
    cnpj: '45678901000193',
    sector: 'Farmacêutico',
    revenueRange: 'enterprise',
    relationshipYears: 20,
  },

  // Distribution Sector
  {
    name: 'Distribuidora Comercial Paulista',
    cnpj: '56789012000194',
    sector: 'Distribuição',
    revenueRange: 'large',
    relationshipYears: 15,
  },
  {
    name: 'Logística e Distribuição Nacional',
    cnpj: '67890123000195',
    sector: 'Logística',
    revenueRange: 'large',
    relationshipYears: 12,
  },
  {
    name: 'Atacadista Mercantil Brasileira',
    cnpj: '78901234000196',
    sector: 'Atacado',
    revenueRange: 'large',
    relationshipYears: 18,
  },

  // Retail Sector
  {
    name: 'Rede Supermercados São Paulo',
    cnpj: '89012345000197',
    sector: 'Varejo Alimentar',
    revenueRange: 'large',
    relationshipYears: 10,
  },
  {
    name: 'Comércio Varejista Premium Ltda',
    cnpj: '90123456000198',
    sector: 'Varejo',
    revenueRange: 'medium',
    relationshipYears: 8,
  },
  {
    name: 'Franquia Alimentação Rápida Brasil',
    cnpj: '01234567000199',
    sector: 'Alimentação',
    revenueRange: 'medium',
    relationshipYears: 6,
  },

  // Financial Services
  {
    name: 'Instituição Financeira Corporativa S.A.',
    cnpj: '11234567000100',
    sector: 'Serviços Financeiros',
    revenueRange: 'enterprise',
    relationshipYears: 15,
  },
  {
    name: 'Corretora de Valores e Investimentos',
    cnpj: '22345678000101',
    sector: 'Mercado de Capitais',
    revenueRange: 'large',
    relationshipYears: 10,
  },
  {
    name: 'Fintech Pagamentos Digitais Ltda',
    cnpj: '33456789000102',
    sector: 'Fintech',
    revenueRange: 'medium',
    relationshipYears: 4,
  },

  // Technology Sector
  {
    name: 'Software Enterprise Solutions Brasil',
    cnpj: '44567890000103',
    sector: 'Tecnologia',
    revenueRange: 'large',
    relationshipYears: 7,
  },
  {
    name: 'Plataforma Digital E-commerce S.A.',
    cnpj: '55678901000104',
    sector: 'E-commerce',
    revenueRange: 'medium',
    relationshipYears: 5,
  },
  {
    name: 'Cloud Services Provider Brasil',
    cnpj: '66789012000105',
    sector: 'Cloud Computing',
    revenueRange: 'medium',
    relationshipYears: 3,
  },

  // Energy Sector
  {
    name: 'Geradora de Energia Renovável S.A.',
    cnpj: '77890123000106',
    sector: 'Energia',
    revenueRange: 'enterprise',
    relationshipYears: 12,
  },
  {
    name: 'Distribuidora Energia Elétrica Regional',
    cnpj: '88901234000107',
    sector: 'Energia Elétrica',
    revenueRange: 'large',
    relationshipYears: 9,
  },

  // Manufacturing
  {
    name: 'Indústria Automotiva Componentes Ltda',
    cnpj: '99012345000108',
    sector: 'Automotivo',
    revenueRange: 'large',
    relationshipYears: 14,
  },
  {
    name: 'Fabricante Eletrônicos Consumo',
    cnpj: '10123456000109',
    sector: 'Eletrônicos',
    revenueRange: 'large',
    relationshipYears: 11,
  },
]

// Practice area specific action types
export const BenicioActionTypes = {
  tax: [
    'Ação de Repetição de Indébito Tributário - IRPJ',
    'Ação de Repetição de Indébito Tributário - CSLL',
    'Mandado de Segurança - ICMS',
    'Ação Declaratória - Exclusão ICMS Base PIS/COFINS',
    'Ação Anulatória de Débito Fiscal',
    'Embargos à Execução Fiscal',
    'Revisão Fiscal - Recuperação de Créditos',
    'Ação Declaratória - Não Incidência ISS',
    'Mandado de Segurança - Retenção na Fonte',
    'Ação Ordinária - Restituição PIS/COFINS',
  ],
  labor: [
    'Reclamação Trabalhista - Horas Extras',
    'Reclamação Trabalhista - Equiparação Salarial',
    'Ação Trabalhista - Acidente de Trabalho',
    'Reclamação Trabalhista - Verbas Rescisórias',
    'Ação Trabalhista - Assédio Moral',
    'Inquérito para Apuração de Falta Grave',
    'Ação de Consignação em Pagamento',
    'Mandado de Segurança - Multa Administrativa MTb',
    'Ação Anulatória - Auto de Infração Trabalhista',
    'Dissídio Coletivo',
  ],
  corporate: [
    'Ação de Dissolução Parcial de Sociedade',
    'Ação de Exclusão de Sócio',
    'Arbitragem - Conflito Societário',
    'Ação Declaratória - Validade Assembleia',
    'Ação de Responsabilidade Civil - Administrador',
    'Ação de Cobrança - Dividendos',
    'Medida Cautelar - Suspensão Assembleia',
    'Ação Anulatória - Deliberação Social',
    'Ação de Exibição de Documentos Societários',
    'Ação de Prestação de Contas',
  ],
  collection: [
    'Ação de Cobrança - Título de Crédito',
    'Execução de Título Extrajudicial',
    'Ação Monitória',
    'Ação de Busca e Apreensão',
    'Embargos à Execução',
    'Ação de Cobrança - Contratos Mercantis',
    'Execução de Sentença',
    'Ação Cautelar de Arresto',
    'Ação de Cobrança - Locação Comercial',
    'Procedimento de Recuperação de Crédito',
  ],
  regulatory: [
    'Ação Anulatória - Multa PROCON',
    'Mandado de Segurança - BACEN',
    'Ação Ordinária - Compliance LGPD',
    'Ação Declaratória - Adequação Regulatória',
    'Mandado de Segurança - CVM',
    'Ação Anulatória - Sanção Administrativa',
    'Ação de Obrigação de Fazer - Licenciamento',
    'Habeas Data - Proteção de Dados',
    'Ação Civil Pública - Defesa Regulatória',
    'Mandado de Segurança - ANEEL',
  ],
  family: [
    'Ação de Inventário e Partilha',
    'Planejamento Sucessório - Holdings Familiares',
    'Ação de Divórcio Consensual',
    'Ação de Alimentos - Empresários',
    'Ação Declaratória - União Estável',
    'Ação de Partilha de Bens - Empresas Familiares',
    'Ação de Reconhecimento de Paternidade',
    'Ação de Modificação de Regime de Bens',
    'Ação de Prestação de Contas - Tutela',
    'Procedimento de Doação com Reserva de Usufruto',
  ],
}

// Common courts used by Benicio (São Paulo focus)
export const BenicioPreferredCourts = [
  '0026', // TJ-SP - Tribunal de Justiça de São Paulo
  '0003', // TRF-3 - Tribunal Regional Federal da 3ª Região
  '0002', // TRT-2 - Tribunal Regional do Trabalho da 2ª Região (SP)
  '0015', // TRT-15 - Tribunal Regional do Trabalho da 15ª Região (Campinas)
]

// Typical case value ranges by practice area
export const BenicioTypicalCaseValues = {
  tax: { min: 500000, max: 50000000 }, // R$ 500k - R$ 50M (high-value tax recovery)
  labor: { min: 50000, max: 500000 }, // R$ 50k - R$ 500k
  corporate: { min: 1000000, max: 100000000 }, // R$ 1M - R$ 100M (M&A, governance)
  collection: { min: 100000, max: 5000000 }, // R$ 100k - R$ 5M
  regulatory: { min: 200000, max: 2000000 }, // R$ 200k - R$ 2M
  family: { min: 500000, max: 20000000 }, // R$ 500k - R$ 20M (estate planning)
}

// Movement descriptions specific to Benicio's practice
export const BenicioMovementDescriptions = {
  tax_recovery: [
    'Protocolada petição inicial requerendo restituição de créditos tributários indevidamente recolhidos',
    'Juntada documentação comprobatória dos pagamentos indevidos de IRPJ/CSLL',
    'Apresentados cálculos de atualização monetária e juros SELIC',
    'Manifestação sobre laudo pericial contábil favorável ao contribuinte',
    'Proferida sentença procedente determinando restituição integral dos valores',
  ],
  labor_defense: [
    'Apresentada contestação refutando integralmente os pedidos da reclamante',
    'Juntados cartões de ponto e contracheques demonstrando pagamento correto',
    'Realizada audiência de conciliação sem acordo entre as partes',
    'Oitiva de testemunhas confirmando jornada de trabalho regular',
    'Proferida sentença de improcedência dos pedidos trabalhistas',
  ],
  corporate_governance: [
    'Protocolada medida cautelar requerendo suspensão de assembleia societária',
    'Deferida liminar suspendendo deliberações até julgamento do mérito',
    'Apresentados estatutos sociais e atas assembleares contestadas',
    'Realizada perícia contábil nas contas da sociedade',
    'Proferida decisão reconhecendo irregularidades na convocação',
  ],
}

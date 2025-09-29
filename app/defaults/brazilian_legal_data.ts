/**
 * Dados realistas do sistema jurídico brasileiro
 * Baseado em pesquisa real sobre tribunais, processos e empresas brasileiras
 */

export interface CourtData {
  name: string
  cnjCode: string
  tribunalCode: string
  courtType: 'federal' | 'state' | 'military' | 'electoral' | 'labor'
  instance: string
  stateCode?: string
  jurisdiction?: string
}

export interface CompanyData {
  name: string
  cnpj: string
  sector: string
  revenueRange: 'small' | 'medium' | 'large' | 'enterprise'
}

/**
 * Tribunais Brasileiros Reais
 * Fonte: CNJ, pesquisa sobre estrutura judiciária brasileira
 */
export const BrazilianCourts: CourtData[] = [
  // Tribunais de Justiça Estaduais (TJs)
  {
    name: 'Tribunal de Justiça de São Paulo',
    cnjCode: '0026',
    tribunalCode: '26',
    courtType: 'state',
    instance: 'second',
    stateCode: 'SP',
    jurisdiction: 'São Paulo',
  },
  {
    name: 'Tribunal de Justiça do Rio de Janeiro',
    cnjCode: '0019',
    tribunalCode: '19',
    courtType: 'state',
    instance: 'second',
    stateCode: 'RJ',
    jurisdiction: 'Rio de Janeiro',
  },
  {
    name: 'Tribunal de Justiça de Minas Gerais',
    cnjCode: '0013',
    tribunalCode: '13',
    courtType: 'state',
    instance: 'second',
    stateCode: 'MG',
    jurisdiction: 'Minas Gerais',
  },
  {
    name: 'Tribunal de Justiça do Paraná',
    cnjCode: '0016',
    tribunalCode: '16',
    courtType: 'state',
    instance: 'second',
    stateCode: 'PR',
    jurisdiction: 'Paraná',
  },
  {
    name: 'Tribunal de Justiça do Rio Grande do Sul',
    cnjCode: '0021',
    tribunalCode: '21',
    courtType: 'state',
    instance: 'second',
    stateCode: 'RS',
    jurisdiction: 'Rio Grande do Sul',
  },
  {
    name: 'Tribunal de Justiça de Santa Catarina',
    cnjCode: '0024',
    tribunalCode: '24',
    courtType: 'state',
    instance: 'second',
    stateCode: 'SC',
    jurisdiction: 'Santa Catarina',
  },
  {
    name: 'Tribunal de Justiça da Bahia',
    cnjCode: '0005',
    tribunalCode: '05',
    courtType: 'state',
    instance: 'second',
    stateCode: 'BA',
    jurisdiction: 'Bahia',
  },
  {
    name: 'Tribunal de Justiça de Pernambuco',
    cnjCode: '0017',
    tribunalCode: '17',
    courtType: 'state',
    instance: 'second',
    stateCode: 'PE',
    jurisdiction: 'Pernambuco',
  },
  {
    name: 'Tribunal de Justiça do Ceará',
    cnjCode: '0006',
    tribunalCode: '06',
    courtType: 'state',
    instance: 'second',
    stateCode: 'CE',
    jurisdiction: 'Ceará',
  },
  {
    name: 'Tribunal de Justiça do Distrito Federal e Territórios',
    cnjCode: '0007',
    tribunalCode: '07',
    courtType: 'state',
    instance: 'second',
    stateCode: 'DF',
    jurisdiction: 'Distrito Federal',
  },

  // Tribunais Regionais Federais (TRFs)
  {
    name: 'Tribunal Regional Federal da 1ª Região',
    cnjCode: '0101',
    tribunalCode: '01',
    courtType: 'federal',
    instance: 'second',
    jurisdiction: 'DF, GO, TO, MT, BA, PI, MA, PA, AP, RR, RO, AC, AM',
  },
  {
    name: 'Tribunal Regional Federal da 2ª Região',
    cnjCode: '0102',
    tribunalCode: '02',
    courtType: 'federal',
    instance: 'second',
    jurisdiction: 'RJ, ES',
  },
  {
    name: 'Tribunal Regional Federal da 3ª Região',
    cnjCode: '0103',
    tribunalCode: '03',
    courtType: 'federal',
    instance: 'second',
    jurisdiction: 'SP, MS',
  },
  {
    name: 'Tribunal Regional Federal da 4ª Região',
    cnjCode: '0104',
    tribunalCode: '04',
    courtType: 'federal',
    instance: 'second',
    jurisdiction: 'RS, PR, SC',
  },
  {
    name: 'Tribunal Regional Federal da 5ª Região',
    cnjCode: '0105',
    tribunalCode: '05',
    courtType: 'federal',
    instance: 'second',
    jurisdiction: 'CE, AL, SE, PB, RN, PE',
  },

  // Tribunais Regionais do Trabalho (TRTs)
  {
    name: 'Tribunal Regional do Trabalho da 2ª Região',
    cnjCode: '0202',
    tribunalCode: '02',
    courtType: 'labor',
    instance: 'second',
    stateCode: 'SP',
    jurisdiction: 'São Paulo (Capital e Região Metropolitana)',
  },
  {
    name: 'Tribunal Regional do Trabalho da 15ª Região',
    cnjCode: '0215',
    tribunalCode: '15',
    courtType: 'labor',
    instance: 'second',
    stateCode: 'SP',
    jurisdiction: 'Campinas e Interior de São Paulo',
  },
  {
    name: 'Tribunal Regional do Trabalho da 1ª Região',
    cnjCode: '0201',
    tribunalCode: '01',
    courtType: 'labor',
    instance: 'second',
    stateCode: 'RJ',
    jurisdiction: 'Rio de Janeiro',
  },
  {
    name: 'Tribunal Regional do Trabalho da 9ª Região',
    cnjCode: '0209',
    tribunalCode: '09',
    courtType: 'labor',
    instance: 'second',
    stateCode: 'PR',
    jurisdiction: 'Paraná',
  },
  {
    name: 'Tribunal Regional do Trabalho da 4ª Região',
    cnjCode: '0204',
    tribunalCode: '04',
    courtType: 'labor',
    instance: 'second',
    stateCode: 'RS',
    jurisdiction: 'Rio Grande do Sul',
  },
]

/**
 * Empresas Brasileiras Reais
 * Fonte: Ranking empresas abertas, setores econômicos
 */
export const BrazilianCompanies: CompanyData[] = [
  {
    name: 'Petrobras S.A.',
    cnpj: '33000167000101',
    sector: 'Energia',
    revenueRange: 'enterprise',
  },
  {
    name: 'Vale S.A.',
    cnpj: '33592510000154',
    sector: 'Mineração',
    revenueRange: 'enterprise',
  },
  {
    name: 'Itaú Unibanco S.A.',
    cnpj: '60701190000104',
    sector: 'Financeiro',
    revenueRange: 'enterprise',
  },
  {
    name: 'Bradesco S.A.',
    cnpj: '60746948000112',
    sector: 'Financeiro',
    revenueRange: 'enterprise',
  },
  {
    name: 'Ambev S.A.',
    cnpj: '07526557000100',
    sector: 'Bebidas',
    revenueRange: 'large',
  },
  {
    name: 'Magazine Luiza S.A.',
    cnpj: '47960950000121',
    sector: 'Varejo',
    revenueRange: 'large',
  },
  {
    name: 'Via Varejo S.A.',
    cnpj: '33041260000156',
    sector: 'Varejo',
    revenueRange: 'large',
  },
  {
    name: 'JBS S.A.',
    cnpj: '02916265000160',
    sector: 'Alimentos',
    revenueRange: 'enterprise',
  },
  {
    name: 'Natura &Co',
    cnpj: '71673990000177',
    sector: 'Cosméticos',
    revenueRange: 'large',
  },
  {
    name: 'Gerdau S.A.',
    cnpj: '33611500000119',
    sector: 'Siderurgia',
    revenueRange: 'large',
  },
  {
    name: 'Embraer S.A.',
    cnpj: '07689002000189',
    sector: 'Aeronáutica',
    revenueRange: 'large',
  },
  {
    name: 'WEG S.A.',
    cnpj: '84429695000111',
    sector: 'Equipamentos Elétricos',
    revenueRange: 'large',
  },
  {
    name: 'B3 S.A.',
    cnpj: '09346601000125',
    sector: 'Mercado Financeiro',
    revenueRange: 'large',
  },
  {
    name: 'Suzano S.A.',
    cnpj: '16404287000155',
    sector: 'Papel e Celulose',
    revenueRange: 'large',
  },
  {
    name: 'BRF S.A.',
    cnpj: '01838723000127',
    sector: 'Alimentos',
    revenueRange: 'large',
  },
  {
    name: 'Localiza Rent a Car S.A.',
    cnpj: '16670085000155',
    sector: 'Locação de Veículos',
    revenueRange: 'large',
  },
  {
    name: 'CPFL Energia S.A.',
    cnpj: '02429144000193',
    sector: 'Energia Elétrica',
    revenueRange: 'large',
  },
  {
    name: 'Eletrobras',
    cnpj: '00001180000126',
    sector: 'Energia Elétrica',
    revenueRange: 'enterprise',
  },
  {
    name: 'Sabesp',
    cnpj: '43776517000180',
    sector: 'Saneamento',
    revenueRange: 'large',
  },
  {
    name: 'TIM S.A.',
    cnpj: '02558157000162',
    sector: 'Telecomunicações',
    revenueRange: 'large',
  },
  {
    name: 'Vivo (Telefônica Brasil)',
    cnpj: '02558157000162',
    sector: 'Telecomunicações',
    revenueRange: 'large',
  },
  {
    name: 'Lojas Americanas S.A.',
    cnpj: '33014556000196',
    sector: 'Varejo',
    revenueRange: 'large',
  },
  {
    name: 'Renner Lojas S.A.',
    cnpj: '92754738000162',
    sector: 'Varejo de Moda',
    revenueRange: 'medium',
  },
  {
    name: 'Marfrig Global Foods S.A.',
    cnpj: '03853896000192',
    sector: 'Alimentos',
    revenueRange: 'large',
  },
  {
    name: 'Raia Drogasil S.A.',
    cnpj: '61585865000151',
    sector: 'Farmacêutico',
    revenueRange: 'large',
  },
  {
    name: 'Banco Santander Brasil S.A.',
    cnpj: '90400888000142',
    sector: 'Financeiro',
    revenueRange: 'enterprise',
  },
  {
    name: 'Banco do Brasil S.A.',
    cnpj: '00000000000191',
    sector: 'Financeiro',
    revenueRange: 'enterprise',
  },
  {
    name: 'Caixa Econômica Federal',
    cnpj: '00360305000104',
    sector: 'Financeiro',
    revenueRange: 'enterprise',
  },
  {
    name: 'Construtora Norberto Odebrecht S.A.',
    cnpj: '15102288000182',
    sector: 'Construção Civil',
    revenueRange: 'large',
  },
  {
    name: 'MRV Engenharia S.A.',
    cnpj: '08343492000120',
    sector: 'Construção Civil',
    revenueRange: 'medium',
  },
]

/**
 * Tipos de Ações Judiciais por Área
 * Baseado em pesquisa sobre processos comuns no Brasil
 */
export const LegalActionTypes = {
  civil_litigation: [
    'Ação de Indenização por Danos Morais',
    'Ação de Indenização por Danos Materiais',
    'Ação de Cobrança',
    'Ação Revisional de Contrato',
    'Ação de Despejo',
    'Ação de Reintegração de Posse',
    'Ação de Usucapião',
    'Ação de Rescisão Contratual',
    'Ação de Consignação em Pagamento',
    'Ação de Busca e Apreensão',
  ],
  labor: [
    'Reclamação Trabalhista - Horas Extras',
    'Ação de Reconhecimento de Vínculo Empregatício',
    'Ação de Rescisão Indireta',
    'Ação de Equiparação Salarial',
    'Ação de Dano Moral no Trabalho',
    'Ação de Acidente de Trabalho',
    'Ação de Recolhimento de FGTS',
    'Ação de Adicional de Insalubridade',
    'Ação de Adicional de Periculosidade',
    'Ação de Horas In Itinere',
  ],
  tax: [
    'Mandado de Segurança - ICMS',
    'Mandado de Segurança - ISS',
    'Execução Fiscal',
    'Ação Anulatória de Débito Fiscal',
    'Ação de Repetição de Indébito Tributário',
    'Ação Declaratória de Inexistência de Relação Jurídico-Tributária',
    'Mandado de Segurança - PIS/COFINS',
    'Ação de Compensação Tributária',
    'Embargos à Execução Fiscal',
    'Ação de Consignação em Pagamento Tributário',
  ],
  criminal: [
    'Ação Penal - Estelionato',
    'Ação Penal - Furto Qualificado',
    'Ação Penal - Roubo',
    'Ação Penal - Apropriação Indébita',
    'Ação Penal - Lavagem de Dinheiro',
    'Ação Penal - Corrupção Passiva',
    'Ação Penal - Tráfico de Drogas',
    'Ação Penal - Crime contra a Ordem Tributária',
  ],
  family: [
    'Ação de Divórcio Consensual',
    'Ação de Divórcio Litigioso',
    'Ação de Alimentos',
    'Ação de Guarda de Menor',
    'Ação de Regulamentação de Visitas',
    'Ação de Investigação de Paternidade',
    'Ação de Adoção',
    'Ação de Partilha de Bens',
  ],
  consumer: [
    'Ação de Reparação de Danos - Relação de Consumo',
    'Ação de Restituição de Valores',
    'Ação de Cumprimento de Oferta',
    'Ação de Vício do Produto',
    'Ação de Cobrança Indevida',
    'Ação contra Negativação Indevida',
  ],
  administrative: [
    'Mandado de Segurança',
    'Ação Anulatória de Ato Administrativo',
    'Ação de Desapropriação',
    'Ação de Indenização contra o Poder Público',
    'Ação Popular',
    'Ação Civil Pública',
  ],
  corporate: [
    'Ação de Dissolução de Sociedade',
    'Ação de Prestação de Contas',
    'Ação de Apuração de Haveres',
    'Ação de Anulação de Assembleia',
    'Ação de Responsabilidade de Administrador',
  ],
  environmental: [
    'Ação Civil Pública Ambiental',
    'Ação de Reparação de Dano Ambiental',
    'Mandado de Segurança Ambiental',
    'Ação de Nulidade de Licença Ambiental',
  ],
  real_estate: [
    'Ação de Usucapião',
    'Ação de Reintegração de Posse Imobiliária',
    'Ação de Adjudicação Compulsória',
    'Ação de Rescisão de Compromisso de Compra e Venda',
    'Ação de Despejo por Falta de Pagamento',
  ],
}

/**
 * Descrições realistas de movimentos processuais
 * Terminologia jurídica brasileira autêntica
 */
export const MovementDescriptions = {
  distribution: [
    'Distribuído por sorteio',
    'Distribuído por dependência',
    'Distribuído por prevenção',
  ],
  citation: [
    'Citado(a) o(a) réu/ré para apresentar contestação no prazo legal',
    'Expedido mandado de citação',
    'Realizada citação por oficial de justiça',
    'Citação por edital publicada',
  ],
  contestation: [
    'Apresentada contestação pelo(a) réu/ré',
    'Juntada contestação aos autos',
    'Protocolada defesa com documentos',
  ],
  hearing: [
    'Designada audiência de conciliação',
    'Designada audiência de instrução e julgamento',
    'Realizada audiência de conciliação - não houve acordo',
    'Realizada audiência - colhido depoimento pessoal',
    'Adiada audiência a pedido das partes',
  ],
  decision: [
    'Proferida decisão interlocutória',
    'Deferida tutela antecipada',
    'Indeferida liminar',
    'Determinada produção de prova pericial',
  ],
  sentence: [
    'Proferida sentença de procedência',
    'Proferida sentença de improcedência',
    'Proferida sentença de procedência parcial',
    'Homologado acordo entre as partes',
  ],
  appeal: [
    'Interposto recurso de apelação',
    'Apresentadas contrarrazões de apelação',
    'Remetidos os autos ao Tribunal',
    'Recebido recurso no efeito suspensivo',
  ],
  expert: [
    'Nomeado perito judicial',
    'Apresentado laudo pericial',
    'Manifestação sobre o laudo pericial',
  ],
  documents: [
    'Juntada de documentos pela parte autora',
    'Juntada de documentos pela parte ré',
    'Juntada de procuração',
    'Juntada de substabelecimento',
  ],
  intimation: [
    'Intimado(a) o(a) advogado(a) da parte autora',
    'Intimado(a) o(a) advogado(a) da parte ré',
    'Expedido mandado de intimação',
  ],
  conclusion: ['Conclusos os autos ao juiz', 'Conclusos para sentença', 'Conclusos para despacho'],
  archiving: [
    'Determinado o arquivamento dos autos',
    'Arquivados os autos definitivamente',
    'Baixado o processo do sistema',
  ],
}

/**
 * Comarcas brasileiras reais por estado
 */
export const BrazilianComarcas = {
  SP: [
    'São Paulo - Foro Central',
    'São Paulo - Foro Regional de Santana',
    'São Paulo - Foro Regional de Ipiranga',
    'São Paulo - Foro Regional da Penha',
    'São Paulo - Foro Regional de Santo Amaro',
    'Campinas',
    'Santos',
    'São José dos Campos',
    'Ribeirão Preto',
    'Sorocaba',
  ],
  RJ: [
    'Rio de Janeiro - Capital',
    'Niterói',
    'Duque de Caxias',
    'São Gonçalo',
    'Nova Iguaçu',
    'Campos dos Goytacazes',
    'Petrópolis',
  ],
  MG: ['Belo Horizonte', 'Contagem', 'Uberlândia', 'Juiz de Fora', 'Betim', 'Montes Claros'],
  PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'Foz do Iguaçu'],
  RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'],
  BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Ilhéus'],
  CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral'],
  PE: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina'],
  DF: ['Brasília'],
}

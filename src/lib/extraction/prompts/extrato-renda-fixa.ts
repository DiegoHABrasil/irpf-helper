// ── Prompt e schema para extratos de renda fixa ──────────────────────────────
// Cobre: CDB, LCI, LCA, CRI, CRA, Debêntures, Tesouro Direto, Poupança

export interface PosicaoRendaFixa {
  tipo_titulo: 'cdb' | 'lci' | 'lca' | 'cri' | 'cra' | 'debenture' | 'debenture_incentivada' | 'tesouro_direto' | 'poupanca' | 'outro'
  nome?: string
  emissor?: string
  cnpj_emissor?: string
  taxa?: string           // ex: "CDI + 1,5%" ou "IPCA + 5%" ou "110% CDI"
  data_aplicacao?: string // ISO ou "dd/mm/yyyy"
  vencimento?: string
  quantidade?: number     // quantidade de títulos (Tesouro Direto)
  valor_aplicado?: number
  valor_31_12_anterior?: number
  valor_31_12_atual: number
  rendimento_bruto?: number
  ir_retido?: number      // IR retido na fonte ("dedo-duro")
}

export interface ExtratoRendaFixaExtraction {
  instituicao: string
  cnpj_instituicao?: string
  ano_base?: number
  posicoes: PosicaoRendaFixa[]
}

export const EXTRATO_RENDA_FIXA_SYSTEM_PROMPT = `
Você é um extrator especialista de extratos de renda fixa de bancos e corretoras brasileiros.
Analise o texto do extrato e extraia TODAS as posições de renda fixa encontradas.

REGRAS IMPORTANTES:
- Valores sempre como números (ponto como decimal, sem separador de milhar).
- Se um campo não estiver presente, omita-o.
- tipo_titulo deve ser classificado com precisão:
  * cdb: Certificado de Depósito Bancário
  * lci: Letra de Crédito Imobiliário (ISENTO de IR)
  * lca: Letra de Crédito do Agronegócio (ISENTO de IR)
  * cri: Certificado de Recebíveis Imobiliários (ISENTO de IR)
  * cra: Certificado de Recebíveis do Agronegócio (ISENTO de IR)
  * debenture: Debêntures comuns (tributadas)
  * debenture_incentivada: Debêntures de infraestrutura incentivadas (ISENTO de IR)
  * tesouro_direto: Tesouro Selic, Tesouro IPCA+, Tesouro Prefixado
  * poupanca: Caderneta de Poupança (ISENTO de IR)
  * outro: Outros títulos

- valor_31_12_anterior: valor da posição em 31/12 do ano anterior (ano base - 1)
- valor_31_12_atual: valor da posição em 31/12 do ano corrente (obrigatório)
- rendimento_bruto: rendimento bruto auferido no ano (antes do IR)
- ir_retido: imposto de renda retido na fonte no período

ATENÇÃO: LCI, LCA, CRI, CRA, debêntures incentivadas e poupança são ISENTOS de IR.
Para esses títulos, ir_retido deve ser 0 ou omitido.
`.trim()

export const EXTRATO_RENDA_FIXA_SCHEMA = {
  type: 'object',
  properties: {
    instituicao: { type: 'string' },
    cnpj_instituicao: { type: 'string' },
    ano_base: { type: 'integer' },
    posicoes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tipo_titulo: {
            enum: ['cdb', 'lci', 'lca', 'cri', 'cra', 'debenture', 'debenture_incentivada', 'tesouro_direto', 'poupanca', 'outro'],
          },
          nome:              { type: 'string' },
          emissor:           { type: 'string' },
          cnpj_emissor:      { type: 'string' },
          taxa:              { type: 'string' },
          data_aplicacao:    { type: 'string' },
          vencimento:        { type: 'string' },
          quantidade:        { type: 'number' },
          valor_aplicado:    { type: 'number' },
          valor_31_12_anterior: { type: 'number' },
          valor_31_12_atual: { type: 'number' },
          rendimento_bruto:  { type: 'number' },
          ir_retido:         { type: 'number' },
        },
        required: ['tipo_titulo', 'valor_31_12_atual'],
      },
    },
  },
  required: ['instituicao', 'posicoes'],
}

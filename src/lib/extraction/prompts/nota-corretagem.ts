export interface OperacaoExtraida {
  ticker: string
  tipo_operacao: 'compra' | 'venda'
  quantidade: number
  preco_unitario: number
  valor_total: number
  mercado?: string
  day_trade?: boolean
}

export interface TaxasExtraidas {
  corretagem?: number
  emolumentos?: number
  liquidacao?: number
  iss?: number
}

export interface NotaCorretagemExtraction {
  corretora: string
  cnpj_corretora?: string
  data_pregao: string // YYYY-MM-DD
  operacoes: OperacaoExtraida[]
  taxas?: TaxasExtraidas
}

export const NOTA_CORRETAGEM_SYSTEM_PROMPT = `
Você é um extrator especialista de notas de corretagem brasileiras.
Analise o texto da nota e extraia TODAS as operações listadas.

REGRAS IMPORTANTES:
- Valores sempre como números com ponto decimal (não strings, não vírgula).
- data_pregao no formato YYYY-MM-DD.
- tipo_operacao: "compra" para C/compra, "venda" para V/venda.
- day_trade: true se a mesma ação foi comprada e vendida no mesmo dia na nota.
- mercado: "vista" (mercado à vista), "fracionario" (frações), "opcoes" (opções), "termo".
- Extraia todas as taxas indicadas na nota (corretagem, emolumentos, liquidação, ISS).
- quantidade sempre como número inteiro positivo.
- Inclua TODAS as operações — não omita nenhuma.
`.trim()

export const NOTA_CORRETAGEM_SCHEMA = {
  type: 'object',
  properties: {
    corretora: { type: 'string' },
    cnpj_corretora: { type: 'string' },
    data_pregao: { type: 'string' },
    operacoes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ticker:         { type: 'string' },
          tipo_operacao:  { enum: ['compra', 'venda'] },
          quantidade:     { type: 'integer' },
          preco_unitario: { type: 'number' },
          valor_total:    { type: 'number' },
          mercado:        { type: 'string' },
          day_trade:      { type: 'boolean' },
        },
        required: ['ticker', 'tipo_operacao', 'quantidade', 'preco_unitario', 'valor_total'],
      },
    },
    taxas: {
      type: 'object',
      properties: {
        corretagem:  { type: 'number' },
        emolumentos: { type: 'number' },
        liquidacao:  { type: 'number' },
        iss:         { type: 'number' },
      },
    },
  },
  required: ['corretora', 'data_pregao', 'operacoes'],
}

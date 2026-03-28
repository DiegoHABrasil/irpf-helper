export interface PosicaoAtivo {
  ticker?: string
  nome?: string
  cnpj?: string
  tipo_ativo: 'acao' | 'fii' | 'etf' | 'bdr' | 'cdb' | 'lci' | 'lca' | 'tesouro_direto' | 'debenture' | 'cri' | 'cra' | 'poupanca' | 'outro'
  quantidade?: number
  valor_31_12_anterior?: number
  valor_31_12_atual?: number
  custo_medio?: number
  emissor?: string
  taxa?: string
  vencimento?: string
}

export interface RendimentoIsento {
  tipo: 'dividendo_acao' | 'dividendo_fii' | 'rendimento_fii' | 'rendimento_lci' | 'rendimento_lca' | 'rendimento_cri' | 'rendimento_cra' | 'rendimento_debenture_incentivada' | 'lucro_venda_abaixo_20k'
  ticker_ou_nome?: string
  cnpj_fonte?: string
  nome_fonte?: string
  valor: number
}

export interface RendimentoExclusivo {
  tipo: 'jcp' | 'rendimento_cdb' | 'rendimento_tesouro' | 'rendimento_debenture' | 'rendimento_fii_trib' | 'outros'
  nome_fonte?: string
  cnpj_fonte?: string
  valor: number
}

export interface InformeRendimentosExtraction {
  instituicao: string
  cnpj_instituicao?: string
  ano_base?: number
  posicoes_31_12?: PosicaoAtivo[]
  rendimentos_isentos?: RendimentoIsento[]
  rendimentos_exclusivos?: RendimentoExclusivo[]
}

export const INFORME_RENDIMENTOS_SYSTEM_PROMPT = `
Você é um extrator especialista de documentos financeiros brasileiros de corretoras e bancos.
Analise o texto e extraia TODOS os dados estruturados que encontrar.

Este documento pode ser um "Informe de Rendimentos Financeiros" oficial OU um "Relatório Auxiliar de Proventos Pagos" da corretora.
Em ambos os casos, extraia dividendos, JCP e rendimentos de FIIs conforme as regras abaixo.

REGRAS PARA rendimentos_isentos:
- DIVIDENDO de ação → tipo: "dividendo_acao"
- RENDIMENTO ou DIVIDENDO de FII (fundo imobiliário com ticker terminando em 11) → tipo: "dividendo_fii"
- Rendimento de LCI, LCA, CRI, CRA → tipo correspondente
- Some os valores de múltiplos eventos do mesmo tipo/ativo no ano (total anual por ativo)
- Use o "Valor Líquido" quando disponível; se não houver, use o "Valor Bruto"
- ticker_ou_nome: coloque o ticker ou nome do ativo (ex: "VALE3", "FIITGATIVO")
- nome_fonte: nome da corretora ou fonte pagadora

REGRAS PARA rendimentos_exclusivos:
- JCP (Juros sobre Capital Próprio) → tipo: "jcp"
- Some todos os JCPs do mesmo ativo no ano
- Use o "Valor Líquido" (já descontado o IR retido)
- nome_fonte: nome do ativo/empresa pagadora

REGRAS PARA posicoes_31_12:
- Só preencha se o documento tiver saldos/posições em 31/12
- tipo_ativo: acao, fii, etf, bdr, cdb, lci, lca, tesouro_direto, debenture, cri, cra, poupanca, outro

REGRAS GERAIS:
- Valores sempre como números com ponto decimal (ex: 130.94, não "130,94")
- Omita campos ausentes (não retorne null)
- Ignore linhas com valor zero
`.trim()

export const INFORME_RENDIMENTOS_SCHEMA = {
  type: 'object',
  properties: {
    instituicao: { type: 'string' },
    cnpj_instituicao: { type: 'string' },
    ano_base: { type: 'integer' },
    posicoes_31_12: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ticker: { type: 'string' },
          nome: { type: 'string' },
          cnpj: { type: 'string' },
          tipo_ativo: {
            enum: ['acao', 'fii', 'etf', 'bdr', 'cdb', 'lci', 'lca', 'tesouro_direto', 'debenture', 'cri', 'cra', 'poupanca', 'outro'],
          },
          quantidade: { type: 'number' },
          valor_31_12_anterior: { type: 'number' },
          valor_31_12_atual: { type: 'number' },
          custo_medio: { type: 'number' },
          emissor: { type: 'string' },
          taxa: { type: 'string' },
          vencimento: { type: 'string' },
        },
        required: ['tipo_ativo'],
      },
    },
    rendimentos_isentos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tipo: {
            enum: ['dividendo_acao', 'dividendo_fii', 'rendimento_fii', 'rendimento_lci', 'rendimento_lca', 'rendimento_cri', 'rendimento_cra', 'rendimento_debenture_incentivada', 'lucro_venda_abaixo_20k'],
          },
          ticker_ou_nome: { type: 'string' },
          cnpj_fonte: { type: 'string' },
          nome_fonte: { type: 'string' },
          valor: { type: 'number' },
        },
        required: ['tipo', 'valor'],
      },
    },
    rendimentos_exclusivos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tipo: {
            enum: ['jcp', 'rendimento_cdb', 'rendimento_tesouro', 'rendimento_debenture', 'rendimento_fii_trib', 'outros'],
          },
          nome_fonte: { type: 'string' },
          cnpj_fonte: { type: 'string' },
          valor: { type: 'number' },
        },
        required: ['tipo', 'valor'],
      },
    },
  },
  required: ['instituicao'],
}

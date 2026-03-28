// ═══════════════════════════════════════════════════════
// Regras de mapeamento IRPF — Determinísticas (não-LLM)
// Fonte: Receita Federal do Brasil
// ═══════════════════════════════════════════════════════

export const IRPF_BENS_DIREITOS = {
  acao:           { grupo: '03', codigo: '01', desc: 'Ações (inclusive em bolsa)' },
  bdr:            { grupo: '03', codigo: '01', desc: 'BDR - Brazilian Depositary Receipt' },
  fii:            { grupo: '07', codigo: '03', desc: 'Fundos de Investimento Imobiliário' },
  etf:            { grupo: '07', codigo: '09', desc: 'Demais fundos de investimento' },
  cdb:            { grupo: '04', codigo: '02', desc: 'Títulos de renda fixa privada' },
  lci:            { grupo: '04', codigo: '02', desc: 'Letra de Crédito Imobiliário' },
  lca:            { grupo: '04', codigo: '02', desc: 'Letra de Crédito do Agronegócio' },
  debenture:              { grupo: '04', codigo: '02', desc: 'Debêntures' },
  debenture_incentivada:  { grupo: '04', codigo: '02', desc: 'Debêntures de Infraestrutura (Lei 12.431)' },
  cri:            { grupo: '04', codigo: '02', desc: 'Certificado de Recebíveis Imobiliários' },
  cra:            { grupo: '04', codigo: '02', desc: 'Certificado de Recebíveis do Agronegócio' },
  tesouro_direto: { grupo: '04', codigo: '01', desc: 'Títulos públicos e privados' },
  poupanca:       { grupo: '04', codigo: '01', desc: 'Caderneta de poupança' },
  outro:          { grupo: '99', codigo: '99', desc: 'Outros bens e direitos' },
} as const

export const IRPF_RENDIMENTOS_ISENTOS = {
  dividendo_acao:               { tipo: '09', desc: 'Lucros e dividendos recebidos' },
  dividendo_fii:                { tipo: '26', desc: 'Outros rendimentos isentos' },
  rendimento_fii:               { tipo: '26', desc: 'Outros rendimentos isentos' },
  rendimento_lci:               { tipo: '12', desc: 'Rendimento - Letra de Crédito Imobiliário' },
  rendimento_lca:               { tipo: '12', desc: 'Rendimento - Letra de Crédito do Agronegócio' },
  rendimento_cri:               { tipo: '12', desc: 'Rendimento - Certificado de Recebíveis Imobiliários' },
  rendimento_cra:               { tipo: '12', desc: 'Rendimento - Certificado de Recebíveis do Agronegócio' },
  rendimento_debenture_incentivada: { tipo: '12', desc: 'Rendimento - Debênture Incentivada' },
  rendimento_poupanca:          { tipo: '12', desc: 'Rendimento - Caderneta de Poupança' },
  lucro_venda_abaixo_20k:       { tipo: '20', desc: 'Ganho líquido em operações no mercado à vista até R$20.000/mês' },
} as const

export const IRPF_RENDIMENTOS_EXCLUSIVOS = {
  jcp:                  { tipo: '10', desc: 'Juros sobre capital próprio' },
  rendimento_cdb:       { tipo: '06', desc: 'Rendimento - CDB / Aplicação financeira' },
  rendimento_tesouro:   { tipo: '06', desc: 'Rendimento - Títulos públicos' },
  rendimento_debenture: { tipo: '06', desc: 'Rendimento - Debêntures' },
  rendimento_fii_trib:  { tipo: '06', desc: 'Rendimento tributado de FII' },
  outros:               { tipo: '12', desc: 'Outros rendimentos' },
} as const

export type TipoAtivo = keyof typeof IRPF_BENS_DIREITOS
export type TipoRendimentoIsento = keyof typeof IRPF_RENDIMENTOS_ISENTOS
export type TipoRendimentoExclusivo = keyof typeof IRPF_RENDIMENTOS_EXCLUSIVOS

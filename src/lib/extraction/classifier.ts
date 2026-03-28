import type { LLMProvider } from '@/lib/llm/types'

export type DocType =
  | 'INFORME_RENDIMENTOS'
  | 'NOTA_CORRETAGEM'
  | 'EXTRATO_RENDA_FIXA'
  | 'INFORME_FII'
  | 'OUTRO'

const CATEGORIES: DocType[] = [
  'INFORME_RENDIMENTOS',
  'NOTA_CORRETAGEM',
  'EXTRATO_RENDA_FIXA',
  'INFORME_FII',
  'OUTRO',
]

const CATEGORY_HINTS = `
- INFORME_RENDIMENTOS: Informe de rendimentos de corretora ou banco (XP, BTG, Rico, etc). Contém dividendos, JCP, rendimentos isentos, posição de ativos em 31/12.
- NOTA_CORRETAGEM: Nota de corretagem de operações na bolsa. Contém operações de compra/venda de ações, FIIs, ETFs com preços e quantidades.
- EXTRATO_RENDA_FIXA: Extrato de títulos de renda fixa (CDB, LCI, LCA, Tesouro Direto, debêntures, CRI, CRA).
- INFORME_FII: Informe de rendimentos específico de Fundo de Investimento Imobiliário.
- OUTRO: Qualquer outro tipo de documento financeiro não listado acima.
`.trim()

export async function classifyDocument(
  rawText: string,
  provider: LLMProvider
): Promise<DocType> {
  // Use at most 4000 chars for classification — economiza tokens
  const excerpt = rawText.slice(0, 4000)

  const result = await provider.classify({
    text: `${CATEGORY_HINTS}\n\nDocumento:\n${excerpt}`,
    categories: CATEGORIES,
  })

  // Validate returned category
  if (CATEGORIES.includes(result.category as DocType)) {
    return result.category as DocType
  }

  return 'OUTRO'
}

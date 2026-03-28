import { prisma } from '@/lib/db/prisma'
import { emitSSE } from '@/lib/sse'
import { recalcularCustoMedio } from './custo-medio'
import { recalcularRendaVariavel } from './ganho-capital'
import type { NotaCorretagemExtraction } from '@/lib/extraction/prompts/nota-corretagem'

export async function mapNotaCorretagem(
  extraction: NotaCorretagemExtraction,
  taxYearId: number,
  documentId: number,
  extractionId: number
): Promise<void> {
  const taxas = extraction.taxas ?? {}
  const totalTaxas =
    (taxas.corretagem ?? 0) +
    (taxas.emolumentos ?? 0) +
    (taxas.liquidacao ?? 0) +
    (taxas.iss ?? 0)

  const totalValorOps = extraction.operacoes.reduce((s, op) => s + op.valor_total, 0)
  const tickersAfetados = new Set<string>()

  for (const op of extraction.operacoes) {
    // Distribuição proporcional das taxas por operação
    const taxasProporcional =
      totalValorOps > 0
        ? (op.valor_total / totalValorOps) * totalTaxas
        : 0

    const dataOperacao = new Date(extraction.data_pregao)

    const operacao = await prisma.operacao.create({
      data: {
        taxYearId,
        documentId,
        extractionId,
        dataOperacao,
        ticker: op.ticker.toUpperCase(),
        tipo: op.tipo_operacao,
        quantidade: op.quantidade,
        precoUnitario: op.preco_unitario,
        valorTotal: op.valor_total,
        taxas: taxasProporcional,
        dayTrade: op.day_trade ?? false,
      },
    })

    tickersAfetados.add(op.ticker.toUpperCase())

    emitSSE(taxYearId, {
      type: 'item_added',
      table: 'operacoes',
      item: {
        id: operacao.id,
        dataOperacao: extraction.data_pregao,
        ticker: operacao.ticker,
        tipo: operacao.tipo,
        quantidade: Number(operacao.quantidade),
        precoUnitario: Number(operacao.precoUnitario),
        valorTotal: Number(operacao.valorTotal),
        dayTrade: operacao.dayTrade,
      },
    })
  }

  // Recalcula custo médio para todos os tickers afetados
  await recalcularCustoMedio(taxYearId, Array.from(tickersAfetados))

  // Recalcula renda variável do ano
  await recalcularRendaVariavel(taxYearId)

  emitSSE(taxYearId, { type: 'renda_variavel_updated', taxYearId })
}

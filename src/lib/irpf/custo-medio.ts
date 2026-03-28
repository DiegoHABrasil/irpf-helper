import { prisma } from '@/lib/db/prisma'

interface PosicaoAtivo {
  quantidade: number
  custoTotal: number  // soma histórica de (qtd × preço + taxas proporcionais)
  custoMedio: number  // custoTotal / quantidade
}

interface ResultadoVenda {
  ganhoPerda: number   // positivo = lucro, negativo = prejuízo
  custoMedioUsado: number
}

/**
 * Recalcula custo médio e ganho/perda para todos os tickers afetados
 * por um conjunto de novas operações.
 * Opera sobre todas as operações do ano-base, ordenadas por data.
 */
export async function recalcularCustoMedio(
  taxYearId: number,
  tickersAfetados: string[]
): Promise<void> {
  for (const ticker of tickersAfetados) {
    const operacoes = await prisma.operacao.findMany({
      where: { taxYearId, ticker },
      orderBy: [{ dataOperacao: 'asc' }, { id: 'asc' }],
    })

    const posicao: PosicaoAtivo = { quantidade: 0, custoTotal: 0, custoMedio: 0 }

    for (const op of operacoes) {
      const qtd = Number(op.quantidade)
      const total = Number(op.valorTotal)
      const taxas = Number(op.taxas)

      let resultado: ResultadoVenda | null = null

      if (op.tipo === 'compra') {
        // Custo médio ponderado: inclui taxas de corretagem proporcionais
        posicao.custoTotal += total + taxas
        posicao.quantidade += qtd
        posicao.custoMedio = posicao.quantidade > 0
          ? posicao.custoTotal / posicao.quantidade
          : 0
      } else {
        // Venda: ganho = receita - (custo médio × qtd) - taxas
        const custoVenda = posicao.custoMedio * qtd
        const ganhoPerda = total - taxas - custoVenda

        resultado = { ganhoPerda, custoMedioUsado: posicao.custoMedio }

        // Atualiza posição
        posicao.custoTotal = Math.max(0, posicao.custoTotal - custoVenda)
        posicao.quantidade = Math.max(0, posicao.quantidade - qtd)
        posicao.custoMedio = posicao.quantidade > 0
          ? posicao.custoTotal / posicao.quantidade
          : 0
      }

      await prisma.operacao.update({
        where: { id: op.id },
        data: {
          custoMedioNaData: posicao.custoMedio,
          ganhoPerda: resultado?.ganhoPerda ?? null,
        },
      })
    }
  }
}

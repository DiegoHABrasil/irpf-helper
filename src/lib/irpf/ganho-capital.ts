import { prisma } from '@/lib/db/prisma'

// Limite mensal de vendas para isenção de ganho de capital em ações (R$)
const LIMITE_ISENCAO_ACOES = 20_000

/**
 * Recalcula irpf_renda_variavel para o ano a partir das operações de venda.
 * Chamado após recalcular custo médio.
 */
export async function recalcularRendaVariavel(taxYearId: number): Promise<void> {
  // Limpa dados calculados anteriormente para recomputar do zero
  await prisma.irpfRendaVariavel.deleteMany({ where: { taxYearId } })

  // Busca todas as vendas com ganho/perda calculado
  const vendas = await prisma.operacao.findMany({
    where: { taxYearId, tipo: 'venda', ganhoPerda: { not: null } },
    orderBy: [{ dataOperacao: 'asc' }],
  })

  // Agrupa por mês
  const porMes = new Map<number, {
    dayTrade: number[]
    vistaGanhos: number[]
    totalVendasVista: number
    irRetido: number
  }>()

  for (const op of vendas) {
    const mes = new Date(op.dataOperacao).getMonth() + 1
    if (!porMes.has(mes)) {
      porMes.set(mes, { dayTrade: [], vistaVendas: [], vistaGanhos: [], totalVendasVista: 0, irRetido: 0 } as never)
    }
    const entry = porMes.get(mes)!

    if (op.dayTrade) {
      ;(entry as unknown as { dayTrade: number[] }).dayTrade.push(Number(op.ganhoPerda))
    } else {
      ;(entry as unknown as { vistaGanhos: number[]; totalVendasVista: number }).vistaGanhos.push(Number(op.ganhoPerda))
      ;(entry as unknown as { totalVendasVista: number }).totalVendasVista += Number(op.valorTotal)
    }
  }

  for (const [mes, data] of porMes.entries()) {
    const d = data as unknown as {
      dayTrade: number[]
      vistaGanhos: number[]
      totalVendasVista: number
      irRetido: number
    }

    // ── Mercado à Vista / Swing-trade ────────────────────────────────────────
    const resultadoVista = d.vistaGanhos.reduce((s, v) => s + v, 0)
    const isento = d.totalVendasVista <= LIMITE_ISENCAO_ACOES && resultadoVista > 0

    if (resultadoVista !== 0) {
      await prisma.irpfRendaVariavel.upsert({
        where: { taxYearId_mes_tipoMercado: { taxYearId, mes, tipoMercado: 'mercado_a_vista' } },
        update: { resultadoLiquido: isento ? 0 : resultadoVista },
        create: {
          taxYearId,
          mes,
          tipoMercado: 'mercado_a_vista',
          resultadoLiquido: isento ? 0 : resultadoVista,
          irRetidoFonte: d.irRetido,
        },
      })
    }

    // ── Day Trade ────────────────────────────────────────────────────────────
    const resultadoDayTrade = d.dayTrade.reduce((s, v) => s + v, 0)

    if (resultadoDayTrade !== 0) {
      await prisma.irpfRendaVariavel.upsert({
        where: { taxYearId_mes_tipoMercado: { taxYearId, mes, tipoMercado: 'day_trade' } },
        update: { resultadoLiquido: resultadoDayTrade },
        create: {
          taxYearId,
          mes,
          tipoMercado: 'day_trade',
          resultadoLiquido: resultadoDayTrade,
        },
      })
    }
  }
}

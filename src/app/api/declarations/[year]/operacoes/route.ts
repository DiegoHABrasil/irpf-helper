import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'))
  if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  await prisma.operacao.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function GET(
  req: NextRequest,
  { params }: { params: { year: string } }
) {
  const year = Number(params.year)
  if (isNaN(year)) return NextResponse.json({ error: 'Ano inválido' }, { status: 400 })

  const ticker = req.nextUrl.searchParams.get('ticker') ?? undefined

  const taxYear = await prisma.taxYear.findUnique({ where: { year } })
  if (!taxYear) return NextResponse.json({ items: [] })

  const items = await prisma.operacao.findMany({
    where: { taxYearId: taxYear.id, ...(ticker ? { ticker: ticker.toUpperCase() } : {}) },
    orderBy: [{ dataOperacao: 'asc' }, { ticker: 'asc' }],
  })

  return NextResponse.json({
    items: items.map((op) => ({
      id: op.id,
      dataOperacao: op.dataOperacao,
      ticker: op.ticker,
      tipo: op.tipo,
      quantidade: Number(op.quantidade),
      precoUnitario: Number(op.precoUnitario),
      valorTotal: Number(op.valorTotal),
      taxas: Number(op.taxas),
      dayTrade: op.dayTrade,
      custoMedioNaData: op.custoMedioNaData ? Number(op.custoMedioNaData) : null,
      ganhoPerda: op.ganhoPerda ? Number(op.ganhoPerda) : null,
    })),
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { year: string } }
) {
  const year = Number(params.year)
  if (isNaN(year)) return NextResponse.json({ error: 'Ano inválido' }, { status: 400 })

  const taxYear = await prisma.taxYear.findUnique({ where: { year } })
  if (!taxYear) return NextResponse.json({ items: [], total31_12_anterior: 0, total31_12_atual: 0 })

  const items = await prisma.irpfBensDireitos.findMany({
    where: { taxYearId: taxYear.id },
    orderBy: [{ grupo: 'asc' }, { codigo: 'asc' }, { createdAt: 'asc' }],
  })

  const total31_12_anterior = items.reduce((sum, i) => sum + Number(i.situacao31_12_anterior), 0)
  const total31_12_atual = items.reduce((sum, i) => sum + Number(i.situacao31_12_atual), 0)

  return NextResponse.json({
    items: items.map((i) => ({
      id: i.id,
      grupo: i.grupo,
      codigo: i.codigo,
      discriminacao: i.discriminacao,
      situacao31_12_anterior: Number(i.situacao31_12_anterior),
      situacao31_12_atual: Number(i.situacao31_12_atual),
      cnpj: i.cnpj,
      ticker: i.ticker,
      tipoAtivo: i.tipoAtivo,
      quantidade: i.quantidade ? Number(i.quantidade) : null,
      custoMedio: i.custoMedio ? Number(i.custoMedio) : null,
    })),
    total31_12_anterior,
    total31_12_atual,
  })
}

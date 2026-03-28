import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'))
  if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  await prisma.irpfRendaVariavel.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

const MES_NOME = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export async function GET(
  _req: NextRequest,
  { params }: { params: { year: string } }
) {
  const year = Number(params.year)
  if (isNaN(year)) return NextResponse.json({ error: 'Ano inválido' }, { status: 400 })

  const taxYear = await prisma.taxYear.findUnique({ where: { year } })
  if (!taxYear) return NextResponse.json({ items: [] })

  const items = await prisma.irpfRendaVariavel.findMany({
    where: { taxYearId: taxYear.id },
    orderBy: [{ mes: 'asc' }, { tipoMercado: 'asc' }],
  })

  return NextResponse.json({
    items: items.map((i) => ({
      id: i.id,
      mes: i.mes,
      mesNome: MES_NOME[i.mes - 1],
      tipoMercado: i.tipoMercado,
      resultadoLiquido: i.resultadoLiquido ? Number(i.resultadoLiquido) : null,
      prejuizoAcumulado: Number(i.prejuizoAcumulado),
      irRetidoFonte: Number(i.irRetidoFonte),
      irDevido: Number(i.irDevido),
    })),
  })
}

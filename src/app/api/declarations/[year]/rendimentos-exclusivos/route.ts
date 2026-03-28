import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'))
  if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  await prisma.irpfRendimentosExclusivos.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { year: string } }
) {
  const year = Number(params.year)
  if (isNaN(year)) return NextResponse.json({ error: 'Ano inválido' }, { status: 400 })

  const taxYear = await prisma.taxYear.findUnique({ where: { year } })
  if (!taxYear) return NextResponse.json({ items: [], total: 0 })

  const items = await prisma.irpfRendimentosExclusivos.findMany({
    where: { taxYearId: taxYear.id },
    orderBy: [{ tipoRendimento: 'asc' }, { createdAt: 'asc' }],
  })

  const total = items.reduce((sum, i) => sum + Number(i.valor), 0)

  return NextResponse.json({
    items: items.map((i) => ({
      id: i.id,
      tipoRendimento: i.tipoRendimento,
      cnpjFonte: i.cnpjFonte,
      nomeFonte: i.nomeFonte,
      valor: Number(i.valor),
      descricao: i.descricao,
    })),
    total,
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const year = Number(req.nextUrl.searchParams.get('year'))
  if (!year || isNaN(year)) {
    return NextResponse.json({ error: 'year obrigatório' }, { status: 400 })
  }

  const taxYear = await prisma.taxYear.findUnique({ where: { year } })
  if (!taxYear) {
    return NextResponse.json({ documents: [] })
  }

  const documents = await prisma.document.findMany({
    where: { taxYearId: taxYear.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      filename: true,
      docType: true,
      processingStatus: true,
      errorMessage: true,
      sourceInstitution: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ documents })
}

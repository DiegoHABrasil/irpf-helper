import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const doc = await prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      filename: true,
      docType: true,
      processingStatus: true,
      errorMessage: true,
      llmProvider: true,
      createdAt: true,
      _count: { select: { extractions: true } },
    },
  })

  if (!doc) {
    return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    id: doc.id,
    filename: doc.filename,
    docType: doc.docType,
    status: doc.processingStatus,
    errorMessage: doc.errorMessage,
    llmProvider: doc.llmProvider,
    extractionCount: doc._count.extractions,
    createdAt: doc.createdAt,
  })
}

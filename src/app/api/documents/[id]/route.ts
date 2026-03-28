import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import fs from 'fs/promises'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const doc = await prisma.document.findUnique({ where: { id }, include: { extractions: true } })
  if (!doc) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })

  const extractionIds = doc.extractions.map((e) => e.id)

  // Delete all IRPF records linked to this document's extractions
  if (extractionIds.length > 0) {
    await prisma.irpfBensDireitos.deleteMany({ where: { extractionId: { in: extractionIds } } })
    await prisma.irpfRendimentosIsentos.deleteMany({ where: { extractionId: { in: extractionIds } } })
    await prisma.irpfRendimentosExclusivos.deleteMany({ where: { extractionId: { in: extractionIds } } })
    await prisma.irpfRendaVariavel.deleteMany({ where: { extractionId: { in: extractionIds } } })
    await prisma.operacao.deleteMany({ where: { extractionId: { in: extractionIds } } })
    await prisma.extraction.deleteMany({ where: { id: { in: extractionIds } } })
  }

  // Delete operacoes linked directly to document
  await prisma.operacao.deleteMany({ where: { documentId: id } })

  await prisma.document.delete({ where: { id } })

  // Delete physical file (non-fatal if missing)
  await fs.unlink(doc.filePath).catch(() => {})

  return NextResponse.json({ ok: true })
}

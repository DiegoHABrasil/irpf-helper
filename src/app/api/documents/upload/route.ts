import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db/prisma'
import { documentQueue } from '@/lib/queue/queue'

const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads')

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const taxYear = Number(formData.get('taxYear'))

    if (!file) {
      return NextResponse.json({ error: 'Arquivo obrigatório' }, { status: 400 })
    }
    if (!taxYear || isNaN(taxYear)) {
      return NextResponse.json({ error: 'taxYear obrigatório' }, { status: 400 })
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Apenas arquivos PDF são aceitos' }, { status: 400 })
    }

    // Ensure uploads dir exists
    await mkdir(UPLOADS_DIR, { recursive: true })

    // Ensure tax year exists
    const taxYearRecord = await prisma.taxYear.upsert({
      where: { year: taxYear },
      update: {},
      create: { year: taxYear },
    })

    // Save file with unique name to avoid collisions
    const timestamp = Date.now()
    const safeFilename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const filePath = path.join(UPLOADS_DIR, safeFilename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Create document record
    const document = await prisma.document.create({
      data: {
        taxYearId: taxYearRecord.id,
        filename: file.name,
        filePath,
        docType: 'OUTRO',
        processingStatus: 'pending',
      },
    })

    // Enqueue processing job
    await documentQueue.add('process', {
      documentId: document.id,
      taxYearId: taxYearRecord.id,
      filePath,
    })

    return NextResponse.json(
      { documentId: document.id, status: 'pending', message: 'Documento na fila de processamento' },
      { status: 202 }
    )
  } catch (error) {
    console.error('POST /api/documents/upload error:', error)
    return NextResponse.json({ error: 'Erro ao processar upload' }, { status: 500 })
  }
}

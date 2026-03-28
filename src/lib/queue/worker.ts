import { Worker } from 'bullmq'
import { prisma } from '@/lib/db/prisma'
import { parsePdf } from '@/lib/extraction/pdf-parser'
import { classifyDocument } from '@/lib/extraction/classifier'
import { extractDocument } from '@/lib/extraction/extractor'
import { getLLMConfig } from '@/lib/settings'
import { createProvider } from '@/lib/llm/factory'
import { emitSSE } from '@/lib/sse'
import { DOCUMENT_QUEUE, type ProcessDocumentJob } from './jobs'

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  ...(process.env.REDIS_URL
    ? (() => {
        const url = new URL(process.env.REDIS_URL!)
        return { host: url.hostname, port: Number(url.port) || 6379 }
      })()
    : {}),
}

const worker = new Worker<ProcessDocumentJob>(
  DOCUMENT_QUEUE,
  async (job) => {
    const { documentId, taxYearId, filePath } = job.data

    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: 'processing' },
    })

    emitSSE(taxYearId, { type: 'document_processing', documentId })

    try {
      // Step 1: Parse PDF → text
      await job.updateProgress(10)
      const rawText = await parsePdf(filePath, documentId)

      await prisma.document.update({
        where: { id: documentId },
        data: { rawText },
      })

      // Step 2: Classify document type (LLM call #1)
      await job.updateProgress(30)
      const llmConfig = await getLLMConfig()
      const provider = createProvider(llmConfig)
      const docType = await classifyDocument(rawText, provider)

      await prisma.document.update({
        where: { id: documentId },
        data: { docType, llmProvider: llmConfig.provider },
      })

      emitSSE(taxYearId, { type: 'document_classified', documentId, docType })

      // Step 3: Structured extraction (LLM call #2)
      await job.updateProgress(50)
      const extractionId = await extractDocument({
        documentId,
        taxYearId,
        docType,
        rawText,
        provider,
      })

      // Step 4: Mark done
      await job.updateProgress(100)
      await prisma.document.update({
        where: { id: documentId },
        data: { processingStatus: 'done' },
      })

      emitSSE(taxYearId, {
        type: 'extraction_complete',
        documentId,
        docType,
        extractionId,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await prisma.document.update({
        where: { id: documentId },
        data: { processingStatus: 'error', errorMessage: message },
      })

      emitSSE(taxYearId, { type: 'processing_error', documentId, error: message })

      throw error
    }
  },
  { connection, concurrency: 2 }
)

worker.on('failed', (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message)
})

worker.on('completed', (job) => {
  console.log(`[worker] Job ${job.id} completed — document ${job.data.documentId}`)
})

console.log('[worker] Started, waiting for jobs...')

export { worker }

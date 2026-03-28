import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getLLMConfig } from '@/lib/settings'
import { createProvider } from '@/lib/llm/factory'
import { retrieveKnowledge, formatKnowledgeContext } from '@/lib/knowledge/retriever'
import type { ChatMessage } from '@/lib/llm/types'

export async function POST(req: NextRequest) {
  const body = await req.json() as { taxYear: number; message: string }
  const { taxYear, message } = body

  if (!taxYear || !message?.trim()) {
    return NextResponse.json({ error: 'taxYear e message são obrigatórios' }, { status: 400 })
  }

  const llmConfig = await getLLMConfig()
  const provider = createProvider(llmConfig)

  // Build document context
  const taxYearRecord = await prisma.taxYear.findUnique({ where: { year: taxYear } })
  let documentContext = ''
  if (taxYearRecord) {
    const docs = await prisma.document.findMany({
      where: { taxYearId: taxYearRecord.id, processingStatus: 'done' },
      select: { filename: true, docType: true, rawText: true },
    })
    if (docs.length > 0) {
      documentContext = docs
        .filter((d) => d.rawText)
        .map((d) => `=== ${d.filename} (${d.docType}) ===\n${d.rawText!.slice(0, 3000)}`)
        .join('\n\n')
        .slice(0, 20000)
    }
  }

  // Retrieve relevant IRPF knowledge based on user query
  const knowledgeResults = retrieveKnowledge(message)
  const knowledgeContext = formatKnowledgeContext(knowledgeResults)

  // Combine contexts: knowledge base + user documents
  const combinedContext = [knowledgeContext, documentContext].filter(Boolean).join('\n\n')

  // Load conversation history (last 20 messages)
  const history = await prisma.chatMessage.findMany({
    where: { taxYearId: taxYearRecord?.id ?? 0 },
    orderBy: { createdAt: 'asc' },
    take: 20,
  })

  const messages: ChatMessage[] = [
    ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: message },
  ]

  // Save user message
  if (taxYearRecord) {
    await prisma.chatMessage.create({
      data: {
        taxYearId: taxYearRecord.id,
        role: 'user',
        content: message,
      },
    })
  }

  // Stream response
  const encoder = new TextEncoder()
  let fullResponse = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const tokens = provider.chat({ messages, context: combinedContext || undefined })
        for await (const token of tokens) {
          fullResponse += token
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`))
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`))
      } finally {
        // Save assistant message
        if (taxYearRecord && fullResponse) {
          await prisma.chatMessage.create({
            data: {
              taxYearId: taxYearRecord.id,
              role: 'assistant',
              content: fullResponse,
            },
          })
        }
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

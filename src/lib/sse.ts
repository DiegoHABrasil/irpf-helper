/**
 * Server-Sent Events via Redis pub/sub.
 *
 * emitSSE()  — chamado pelo worker (processo separado): publica no Redis.
 * SSE endpoint — cria um subscriber Redis por conexão e encaminha mensagens ao cliente.
 */

import Redis from 'ioredis'

function makeRedis() {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL)
  }
  return new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
  })
}

// Publisher singleton (usado pelo worker e pelo Next.js para emitir eventos)
let _publisher: Redis | null = null
function getPublisher(): Redis {
  if (!_publisher) _publisher = makeRedis()
  return _publisher
}

export function sseChannel(taxYearId: number) {
  return `sse:${taxYearId}`
}

/** Publica um evento SSE no canal Redis do ano fiscal. */
export function emitSSE(taxYearId: number, payload: Record<string, unknown>) {
  getPublisher().publish(sseChannel(taxYearId), JSON.stringify(payload)).catch(() => {})
}

/** Cria um ReadableStream SSE que assina o canal Redis e encaminha eventos ao cliente. */
export function createSSEStream(taxYearId: number): Response {
  const encoder = new TextEncoder()
  let subscriber: Redis | null = null

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      subscriber = makeRedis()

      subscriber.subscribe(sseChannel(taxYearId), (err) => {
        if (err) {
          controller.error(err)
          return
        }
        // Ping inicial para confirmar conexão
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'connected', taxYearId })}\n\n`)
        )
      })

      subscriber.on('message', (_channel, message) => {
        try {
          controller.enqueue(encoder.encode(`data: ${message}\n\n`))
        } catch {
          // Stream fechado
        }
      })

      subscriber.on('error', () => {
        try { controller.close() } catch { /* already closed */ }
      })
    },
    cancel() {
      subscriber?.unsubscribe()
      subscriber?.quit()
      subscriber = null
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

import { NextRequest } from 'next/server'
import { registerSSEClient, unregisterSSEClient } from '@/lib/sse'

export async function GET(
  _req: NextRequest,
  { params }: { params: { year: string } }
) {
  const taxYearId = Number(params.year)

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      registerSSEClient(taxYearId, controller)

      // Send initial ping to confirm connection
      const ping = new TextEncoder().encode(
        `data: ${JSON.stringify({ type: 'connected', taxYearId })}\n\n`
      )
      controller.enqueue(ping)
    },
    cancel(controller) {
      unregisterSSEClient(taxYearId, controller as ReadableStreamDefaultController<Uint8Array>)
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

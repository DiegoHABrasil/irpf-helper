/**
 * Server-Sent Events (SSE) broker simples em memória.
 * Mantém um Map de taxYearId → lista de controllers ativos.
 * O worker chama emitSSE(); o endpoint /stream envia para o cliente.
 */

type SSEController = ReadableStreamDefaultController<Uint8Array>

const clients = new Map<number, Set<SSEController>>()

export function registerSSEClient(taxYearId: number, controller: SSEController) {
  if (!clients.has(taxYearId)) clients.set(taxYearId, new Set())
  clients.get(taxYearId)!.add(controller)
}

export function unregisterSSEClient(taxYearId: number, controller: SSEController) {
  clients.get(taxYearId)?.delete(controller)
}

export function emitSSE(taxYearId: number, payload: Record<string, unknown>) {
  const message = `data: ${JSON.stringify(payload)}\n\n`
  const encoded = new TextEncoder().encode(message)

  const controllers = clients.get(taxYearId)
  if (!controllers) return

  for (const ctrl of controllers) {
    try {
      ctrl.enqueue(encoded)
    } catch {
      // Client disconnected — será removido no onClose do endpoint
      controllers.delete(ctrl)
    }
  }
}

'use client'

import { create } from 'zustand'
import { toast } from '@/hooks/useToast'

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface StoreChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

// ── Documentos ───────────────────────────────────────────────────────────────

export interface DocumentItem {
  id: number
  filename: string
  docType: string
  processingStatus: 'pending' | 'processing' | 'done' | 'error'
  errorMessage?: string | null
  sourceInstitution?: string | null
  createdAt: string
}

// ── Declaração ───────────────────────────────────────────────────────────────

export interface BensDireitosItem {
  id: number
  grupo: string
  codigo: string
  discriminacao: string
  situacao31_12_anterior: number
  situacao31_12_atual: number
  cnpj?: string | null
  ticker?: string | null
  tipoAtivo?: string | null
  isNew?: boolean
}

export interface RendimentoItem {
  id: number
  tipoRendimento: string
  nomeFonte?: string | null
  cnpjFonte?: string | null
  valor: number
  descricao?: string | null
  isNew?: boolean
}

export interface OperacaoItem {
  id: number
  dataOperacao: string
  ticker: string
  tipo: 'compra' | 'venda'
  quantidade: number
  precoUnitario: number
  valorTotal: number
  dayTrade: boolean
  custoMedioNaData?: number | null
  ganhoPerda?: number | null
  isNew?: boolean
}

export interface RendaVariavelItem {
  id: number
  mes: number
  mesNome: string
  tipoMercado: string
  resultadoLiquido?: number | null
  prejuizoAcumulado: number
  irRetidoFonte: number
  irDevido: number
}

// ── Store ────────────────────────────────────────────────────────────────────

interface AppState {
  selectedYear: number
  setSelectedYear: (year: number) => void

  documents: DocumentItem[]
  setDocuments: (docs: DocumentItem[]) => void
  addDocument: (doc: DocumentItem) => void
  updateDocument: (id: number, patch: Partial<DocumentItem>) => void

  bensDireitos: BensDireitosItem[]
  rendimentosIsentos: RendimentoItem[]
  rendimentosExclusivos: RendimentoItem[]
  operacoes: OperacaoItem[]
  rendaVariavel: RendaVariavelItem[]

  setBensDireitos: (items: BensDireitosItem[]) => void
  setRendimentosIsentos: (items: RendimentoItem[]) => void
  setRendimentosExclusivos: (items: RendimentoItem[]) => void
  setOperacoes: (items: OperacaoItem[]) => void
  setRendaVariavel: (items: RendaVariavelItem[]) => void

  addBensDireitos: (item: BensDireitosItem) => void
  addRendimentoIsento: (item: RendimentoItem) => void
  addRendimentoExclusivo: (item: RendimentoItem) => void
  addOperacao: (item: OperacaoItem) => void

  removeDocument: (id: number) => void
  removeBensDireitos: (id: number) => void
  removeRendimentoIsento: (id: number) => void
  removeRendimentoExclusivo: (id: number) => void
  removeOperacao: (id: number) => void
  removeRendaVariavel: (id: number) => void

  messages: StoreChatMessage[]
  isChatLoading: boolean
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void

  sseSource: EventSource | null
  connectSSE: (taxYearId: number) => void
  disconnectSSE: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  selectedYear: new Date().getFullYear() - 1,

  documents: [],
  bensDireitos: [],
  rendimentosIsentos: [],
  rendimentosExclusivos: [],
  operacoes: [],
  rendaVariavel: [],
  messages: [],
  isChatLoading: false,
  sseSource: null,

  setSelectedYear: (year) => {
    get().disconnectSSE()
    set({
      selectedYear: year,
      documents: [],
      bensDireitos: [],
      rendimentosIsentos: [],
      rendimentosExclusivos: [],
      operacoes: [],
      rendaVariavel: [],
      messages: [],
    })
    get().connectSSE(year)
  },

  setDocuments: (docs) => set({ documents: docs }),
  addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
  updateDocument: (id, patch) =>
    set((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),

  setBensDireitos: (items) => set({ bensDireitos: items }),
  setRendimentosIsentos: (items) => set({ rendimentosIsentos: items }),
  setRendimentosExclusivos: (items) => set({ rendimentosExclusivos: items }),
  setOperacoes: (items) => set({ operacoes: items }),
  setRendaVariavel: (items) => set({ rendaVariavel: items }),

  addBensDireitos: (item) =>
    set((s) => ({ bensDireitos: [...s.bensDireitos, { ...item, isNew: true }] })),
  addRendimentoIsento: (item) =>
    set((s) => ({ rendimentosIsentos: [...s.rendimentosIsentos, { ...item, isNew: true }] })),
  addRendimentoExclusivo: (item) =>
    set((s) => ({ rendimentosExclusivos: [...s.rendimentosExclusivos, { ...item, isNew: true }] })),
  addOperacao: (item) =>
    set((s) => ({ operacoes: [...s.operacoes, { ...item, isNew: true }] })),

  removeDocument:          (id) => set((s) => ({ documents:              s.documents.filter((x) => x.id !== id) })),
  removeBensDireitos:      (id) => set((s) => ({ bensDireitos:           s.bensDireitos.filter((x) => x.id !== id) })),
  removeRendimentoIsento:  (id) => set((s) => ({ rendimentosIsentos:     s.rendimentosIsentos.filter((x) => x.id !== id) })),
  removeRendimentoExclusivo:(id)=> set((s) => ({ rendimentosExclusivos:  s.rendimentosExclusivos.filter((x) => x.id !== id) })),
  removeOperacao:          (id) => set((s) => ({ operacoes:              s.operacoes.filter((x) => x.id !== id) })),
  removeRendaVariavel:     (id) => set((s) => ({ rendaVariavel:          s.rendaVariavel.filter((x) => x.id !== id) })),

  clearMessages: () => set({ messages: [] }),

  sendMessage: async (content) => {
    const { selectedYear, messages } = get()
    const userMsg: StoreChatMessage = { id: crypto.randomUUID(), role: 'user', content }
    const assistantId = crypto.randomUUID()
    const assistantMsg: StoreChatMessage = { id: assistantId, role: 'assistant', content: '', streaming: true }

    set({ messages: [...messages, userMsg, assistantMsg], isChatLoading: true })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxYear: selectedYear, message: content }),
      })

      if (!res.ok || !res.body) throw new Error('Erro na requisição de chat')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = JSON.parse(line.slice(6)) as { type: string; content?: string }
          if (payload.type === 'token' && payload.content) {
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + payload.content! } : m,
              ),
            }))
          } else if (payload.type === 'done' || payload.type === 'error') {
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === assistantId ? { ...m, streaming: false } : m,
              ),
            }))
          }
        }
      }
    } catch {
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Erro ao obter resposta. Verifique as configurações da LLM.', streaming: false }
            : m,
        ),
      }))
    } finally {
      set({ isChatLoading: false })
    }
  },

  connectSSE: (taxYearId) => {
    const existing = get().sseSource
    if (existing) existing.close()

    const source = new EventSource(`/api/declarations/${taxYearId}/stream`)

    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as Record<string, unknown>
      const store = get()

      switch (payload.type) {
        case 'document_processing':
          store.updateDocument(payload.documentId as number, { processingStatus: 'processing' })
          break
        case 'document_classified':
          store.updateDocument(payload.documentId as number, { docType: payload.docType as string })
          break
        case 'extraction_complete': {
          const doc = store.documents.find((d) => d.id === (payload.documentId as number))
          store.updateDocument(payload.documentId as number, { processingStatus: 'done' })
          toast({
            variant: 'success',
            title: 'Documento processado',
            description: doc?.filename ?? `Documento #${payload.documentId as number}`,
          })
          break
        }
        case 'processing_error': {
          const doc = store.documents.find((d) => d.id === (payload.documentId as number))
          store.updateDocument(payload.documentId as number, {
            processingStatus: 'error',
            errorMessage: payload.error as string,
          })
          toast({
            variant: 'destructive',
            title: 'Erro ao processar documento',
            description: doc?.filename ?? `Documento #${payload.documentId as number}`,
          })
          break
        }
        case 'item_added': {
          const table = payload.table as string
          const item = payload.item as unknown
          if (table === 'bens_direitos')          store.addBensDireitos(item as BensDireitosItem)
          else if (table === 'rendimentos_isentos')   store.addRendimentoIsento(item as RendimentoItem)
          else if (table === 'rendimentos_exclusivos') store.addRendimentoExclusivo(item as RendimentoItem)
          else if (table === 'operacoes')             store.addOperacao(item as OperacaoItem)
          break
        }
        case 'renda_variavel_updated':
          // Reload renda variável from API (easier than incremental SSE for recalculated data)
          fetch(`/api/declarations/${taxYearId}/renda-variavel`)
            .then((r) => r.json())
            .then((data) => store.setRendaVariavel(data.items ?? []))
            .catch(() => {})
          break
      }
    }

    set({ sseSource: source })
  },

  disconnectSSE: () => {
    get().sseSource?.close()
    set({ sseSource: null })
  },
}))

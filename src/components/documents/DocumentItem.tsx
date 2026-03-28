'use client'

import { useState } from 'react'
import { FileText, Loader2, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { DocumentItem as Doc } from '@/store/useAppStore'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Aguardando',
  processing: 'Processando',
  done: 'Concluído',
  error: 'Erro',
}

const DOC_TYPE_LABEL: Record<string, string> = {
  INFORME_RENDIMENTOS: 'Informe de Rendimentos',
  NOTA_CORRETAGEM: 'Nota de Corretagem',
  EXTRATO_RENDA_FIXA: 'Extrato Renda Fixa',
  INFORME_FII: 'Informe FII',
  OUTRO: 'Outro',
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'pending':    return <Clock className="h-4 w-4 text-muted-foreground" />
    case 'processing': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    case 'done':       return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'error':      return <XCircle className="h-4 w-4 text-destructive" />
    default:           return null
  }
}

export function DocumentItem({ doc }: { doc: Doc }) {
  const [deleting, setDeleting] = useState(false)
  const removeDocument = useAppStore((s) => s.removeDocument)
  const selectedYear   = useAppStore((s) => s.selectedYear)

  async function handleDelete() {
    if (!confirm(`Excluir "${doc.filename}" e todos os dados extraídos dele?`)) return
    setDeleting(true)
    try {
      await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' })
      removeDocument(doc.id)

      // Reload declaration data — deleting a document may have removed IRPF records
      const store = useAppStore.getState()
      const year = selectedYear
      const [bdRes, riRes, reRes, opRes, rvRes] = await Promise.all([
        fetch(`/api/declarations/${year}/bens-direitos`),
        fetch(`/api/declarations/${year}/rendimentos-isentos`),
        fetch(`/api/declarations/${year}/rendimentos-exclusivos`),
        fetch(`/api/declarations/${year}/operacoes`),
        fetch(`/api/declarations/${year}/renda-variavel`),
      ])
      if (bdRes.ok) store.setBensDireitos((await bdRes.json()).items ?? [])
      if (riRes.ok) store.setRendimentosIsentos((await riRes.json()).items ?? [])
      if (reRes.ok) store.setRendimentosExclusivos((await reRes.json()).items ?? [])
      if (opRes.ok) store.setOperacoes((await opRes.json()).items ?? [])
      if (rvRes.ok) store.setRendaVariavel((await rvRes.json()).items ?? [])
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-md border text-sm transition-colors',
        doc.processingStatus === 'error'      && 'border-destructive/30 bg-destructive/5',
        doc.processingStatus === 'done'       && 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30',
        doc.processingStatus === 'processing' && 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30',
        doc.processingStatus === 'pending'    && 'border-border bg-muted/30'
      )}
    >
      <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate" title={doc.filename}>{doc.filename}</p>
        {doc.processingStatus === 'done' && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {DOC_TYPE_LABEL[doc.docType] ?? doc.docType}
          </p>
        )}
        {doc.processingStatus === 'error' && doc.errorMessage && (
          <p className="text-xs text-destructive mt-0.5 truncate" title={doc.errorMessage}>
            {doc.errorMessage}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-muted-foreground">{STATUS_LABEL[doc.processingStatus]}</span>
        <StatusIcon status={doc.processingStatus} />
        <button
          onClick={handleDelete}
          disabled={deleting || doc.processingStatus === 'processing'}
          className="ml-1 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
          title="Excluir documento"
        >
          {deleting
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Trash2 className="h-3.5 w-3.5" />
          }
        </button>
      </div>
    </div>
  )
}

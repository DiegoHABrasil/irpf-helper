'use client'

import { useCallback, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { DocumentItem } from '@/store/useAppStore'

export function DropZone() {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const selectedYear = useAppStore((s) => s.selectedYear)
  const addDocument = useAppStore((s) => s.addDocument)

  const upload = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Apenas arquivos PDF são aceitos.')
        return
      }
      setError('')
      setUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('taxYear', String(selectedYear))

        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Erro no upload')
        }

        const { documentId } = await res.json() as { documentId: number }

        addDocument({
          id: documentId,
          filename: file.name,
          docType: 'OUTRO',
          processingStatus: 'pending',
          createdAt: new Date().toISOString(),
        } satisfies DocumentItem)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao fazer upload')
      } finally {
        setUploading(false)
      }
    },
    [selectedYear, addDocument]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const files = Array.from(e.dataTransfer.files)
      files.forEach(upload)
    },
    [upload]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      files.forEach(upload)
      e.target.value = '' // reset so same file can be re-uploaded if needed
    },
    [upload]
  )

  return (
    <div className="space-y-2">
      <label
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-sm transition-colors cursor-pointer',
          dragging
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
          uploading && 'pointer-events-none opacity-60'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Upload className="h-6 w-6" />
        )}
        <span className="font-medium">
          {uploading ? 'Enviando...' : 'Arraste PDFs aqui'}
        </span>
        <span className="text-xs">ou clique para selecionar</span>
        <input
          type="file"
          accept=".pdf"
          multiple
          className="sr-only"
          onChange={handleChange}
          disabled={uploading}
        />
      </label>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

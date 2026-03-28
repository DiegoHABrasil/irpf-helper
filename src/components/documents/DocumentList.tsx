'use client'

import { useAppStore } from '@/store/useAppStore'
import { DocumentItem } from './DocumentItem'

export function DocumentList() {
  const documents = useAppStore((s) => s.documents)

  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhum documento enviado ainda.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <DocumentItem key={doc.id} doc={doc} />
      ))}
    </div>
  )
}

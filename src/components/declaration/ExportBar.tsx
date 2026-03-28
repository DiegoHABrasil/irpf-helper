'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

export function ExportBar() {
  const selectedYear = useAppStore((s) => s.selectedYear)

  function download(format: 'csv' | 'json') {
    window.location.href = `/api/export/${selectedYear}?format=${format}`
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t shrink-0">
      <span className="text-xs text-muted-foreground mr-auto">
        Exporte os dados para preencher no programa da Receita Federal
      </span>
      <Button variant="outline" size="sm" onClick={() => download('csv')}>
        <Download className="h-3.5 w-3.5" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => download('json')}>
        <Download className="h-3.5 w-3.5" />
        JSON
      </Button>
    </div>
  )
}

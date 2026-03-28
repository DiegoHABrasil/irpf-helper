import Link from 'next/link'
import { Settings } from 'lucide-react'
import { YearSelector } from './YearSelector'

export function Header() {
  return (
    <header className="border-b px-4 h-12 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="font-semibold text-base">IRPF Helper</h1>
        <YearSelector />
      </div>
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings className="h-4 w-4" />
        Configurações
      </Link>
    </header>
  )
}

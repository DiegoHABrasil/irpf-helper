'use client'

import { cn } from '@/lib/utils'

export type DeclarationTab =
  | 'bens_direitos'
  | 'rendimentos_isentos'
  | 'rendimentos_exclusivos'
  | 'renda_variavel'
  | 'operacoes'
  | 'guia'

const TABS: { id: DeclarationTab; label: string }[] = [
  { id: 'bens_direitos',         label: 'Bens e Direitos' },
  { id: 'rendimentos_isentos',   label: 'Rend. Isentos' },
  { id: 'rendimentos_exclusivos',label: 'Rend. Trib. Exclusiva' },
  { id: 'renda_variavel',        label: 'Renda Variável' },
  { id: 'operacoes',             label: 'Operações' },
  { id: 'guia',                  label: '📋 Guia de Preenchimento' },
]

interface TabSelectorProps {
  active: DeclarationTab
  onChange: (tab: DeclarationTab) => void
  counts?: Partial<Record<DeclarationTab, number>>
}

export function TabSelector({ active, onChange, counts = {} }: TabSelectorProps) {
  return (
    <div className="flex gap-1 border-b px-4 overflow-x-auto shrink-0">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
            active === tab.id
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
          {counts[tab.id] !== undefined && counts[tab.id]! > 0 && (
            <span className="ml-1.5 text-xs bg-muted rounded-full px-1.5 py-0.5">
              {counts[tab.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

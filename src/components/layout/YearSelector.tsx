'use client'

import { useAppStore } from '@/store/useAppStore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CURRENT_YEAR = new Date().getFullYear()
// Exibe os últimos 5 anos-base
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 1 - i)

export function YearSelector() {
  const selectedYear = useAppStore((s) => s.selectedYear)
  const setSelectedYear = useAppStore((s) => s.setSelectedYear)

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Ano-base:</span>
      <Select
        value={String(selectedYear)}
        onValueChange={(v) => setSelectedYear(Number(v))}
      >
        <SelectTrigger className="w-24 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

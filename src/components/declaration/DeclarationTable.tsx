'use client'

import { useEffect, useRef, useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { BensDireitosItem, RendimentoItem, OperacaoItem, RendaVariavelItem } from '@/store/useAppStore'
import type { DeclarationTab } from './TabSelector'
import { GuidePanel } from './GuidePanel'

// ── Bens e Direitos ──────────────────────────────────────────────────────────

function BensDireitosTable({ items }: { items: BensDireitosItem[] }) {
  const { removeBensDireitos, selectedYear } = useAppStore()
  if (items.length === 0) return <EmptyState text="Nenhum bem ou direito encontrado." />
  const total_anterior = items.reduce((s, i) => s + i.situacao31_12_anterior, 0)
  const total_atual = items.reduce((s, i) => s + i.situacao31_12_atual, 0)
  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
          <tr>
            <Th>Grp</Th><Th>Cód</Th>
            <Th className="min-w-[320px]">Discriminação</Th>
            <Th className="text-right">31/12 ant.</Th>
            <Th className="text-right">31/12 atual</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <NewRow key={item.id} isNew={item.isNew}>
              <Td className="font-mono">{item.grupo}</Td>
              <Td className="font-mono">{item.codigo}</Td>
              <Td className="max-w-xs">
                {item.ticker && <span className="font-medium mr-1">{item.ticker}</span>}
                <span className="text-muted-foreground text-xs truncate block" title={item.discriminacao}>{item.discriminacao}</span>
              </Td>
              <Td className="text-right tabular-nums">{formatCurrency(item.situacao31_12_anterior)}</Td>
              <Td className="text-right tabular-nums font-medium">{formatCurrency(item.situacao31_12_atual)}</Td>
              <Td>
                <DeleteButton onDelete={async () => {
                  await fetch(`/api/declarations/${selectedYear}/bens-direitos?id=${item.id}`, { method: 'DELETE' })
                  removeBensDireitos(item.id)
                }} />
              </Td>
            </NewRow>
          ))}
        </tbody>
        <tfoot className="border-t font-semibold bg-muted/50">
          <tr>
            <td colSpan={3} className="px-3 py-2">Total</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(total_anterior)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(total_atual)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ── Rendimentos (Isentos / Exclusivos) ──────────────────────────────────────

function RendimentosTable({ items, tab }: { items: RendimentoItem[]; tab: 'isentos' | 'exclusivos' }) {
  const { removeRendimentoIsento, removeRendimentoExclusivo, selectedYear } = useAppStore()
  if (items.length === 0) return <EmptyState text="Nenhum rendimento encontrado." />
  const total = items.reduce((s, i) => s + i.valor, 0)
  const endpoint = tab === 'isentos' ? 'rendimentos-isentos' : 'rendimentos-exclusivos'
  const removeItem = tab === 'isentos' ? removeRendimentoIsento : removeRendimentoExclusivo
  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
          <tr>
            <Th>Tipo</Th><Th>Fonte Pagadora</Th>
            <Th className="min-w-[250px]">Descrição</Th>
            <Th className="text-right">Valor</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <NewRow key={item.id} isNew={item.isNew}>
              <Td className="font-mono">{item.tipoRendimento}</Td>
              <Td>{item.nomeFonte ?? '—'}</Td>
              <Td className="text-muted-foreground text-xs max-w-xs truncate" title={item.descricao ?? ''}>{item.descricao}</Td>
              <Td className="text-right tabular-nums font-medium">{formatCurrency(item.valor)}</Td>
              <Td>
                <DeleteButton onDelete={async () => {
                  await fetch(`/api/declarations/${selectedYear}/${endpoint}?id=${item.id}`, { method: 'DELETE' })
                  removeItem(item.id)
                }} />
              </Td>
            </NewRow>
          ))}
        </tbody>
        <tfoot className="border-t font-semibold bg-muted/50">
          <tr>
            <td colSpan={3} className="px-3 py-2">Total</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(total)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ── Operações ────────────────────────────────────────────────────────────────

function OperacoesTable({ items }: { items: OperacaoItem[] }) {
  const { removeOperacao, selectedYear } = useAppStore()
  if (items.length === 0) return <EmptyState text="Nenhuma operação encontrada." />
  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
          <tr>
            <Th>Data</Th><Th>Ticker</Th><Th>Tipo</Th>
            <Th className="text-right">Qtd</Th>
            <Th className="text-right">Preço Unit.</Th>
            <Th className="text-right">Total</Th>
            <Th className="text-right">Custo Médio</Th>
            <Th className="text-right">Ganho/Perda</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {items.map((op) => (
            <NewRow key={op.id} isNew={op.isNew}>
              <Td className="tabular-nums">{formatDate(op.dataOperacao)}</Td>
              <Td className="font-medium">
                {op.ticker}
                {op.dayTrade && <span className="ml-1 text-xs text-orange-500">DT</span>}
              </Td>
              <Td>
                <span className={cn('font-medium', op.tipo === 'compra' ? 'text-blue-600' : 'text-red-600')}>
                  {op.tipo === 'compra' ? 'C' : 'V'}
                </span>
              </Td>
              <Td className="text-right tabular-nums">{op.quantidade.toLocaleString('pt-BR')}</Td>
              <Td className="text-right tabular-nums">{formatCurrency(op.precoUnitario)}</Td>
              <Td className="text-right tabular-nums">{formatCurrency(op.valorTotal)}</Td>
              <Td className="text-right tabular-nums text-muted-foreground">
                {op.custoMedioNaData != null ? formatCurrency(op.custoMedioNaData) : '—'}
              </Td>
              <Td className={cn('text-right tabular-nums font-medium',
                op.ganhoPerda != null && op.ganhoPerda > 0 ? 'text-green-600' : '',
                op.ganhoPerda != null && op.ganhoPerda < 0 ? 'text-red-600' : ''
              )}>
                {op.ganhoPerda != null ? formatCurrency(op.ganhoPerda) : '—'}
              </Td>
              <Td>
                <DeleteButton onDelete={async () => {
                  await fetch(`/api/declarations/${selectedYear}/operacoes?id=${op.id}`, { method: 'DELETE' })
                  removeOperacao(op.id)
                }} />
              </Td>
            </NewRow>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Renda Variável ───────────────────────────────────────────────────────────

const TIPO_MERCADO_LABEL: Record<string, string> = {
  mercado_a_vista: 'Mercado à Vista',
  day_trade:       'Day Trade',
  opcoes:          'Opções',
  futuro:          'Futuro',
}

function RendaVariavelTable({ items }: { items: RendaVariavelItem[] }) {
  const { removeRendaVariavel, selectedYear } = useAppStore()
  if (items.length === 0) return <EmptyState text="Nenhuma operação de renda variável encontrada." />
  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
          <tr>
            <Th>Mês</Th><Th>Mercado</Th>
            <Th className="text-right">Resultado Líquido</Th>
            <Th className="text-right">IR Retido (Dedo-duro)</Th>
            <Th className="text-right">IR Devido</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="group border-b border-border/50 hover:bg-muted/30 transition-colors">
              <Td className="font-medium">{item.mesNome}</Td>
              <Td>{TIPO_MERCADO_LABEL[item.tipoMercado] ?? item.tipoMercado}</Td>
              <Td className={cn('text-right tabular-nums font-medium',
                item.resultadoLiquido != null && item.resultadoLiquido > 0 ? 'text-green-600' : '',
                item.resultadoLiquido != null && item.resultadoLiquido < 0 ? 'text-red-600' : ''
              )}>
                {item.resultadoLiquido != null ? formatCurrency(item.resultadoLiquido) : '—'}
              </Td>
              <Td className="text-right tabular-nums">{formatCurrency(item.irRetidoFonte)}</Td>
              <Td className="text-right tabular-nums">{formatCurrency(item.irDevido)}</Td>
              <Td>
                <DeleteButton onDelete={async () => {
                  await fetch(`/api/declarations/${selectedYear}/renda-variavel?id=${item.id}`, { method: 'DELETE' })
                  removeRendaVariavel(item.id)
                }} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

interface DeclarationTableProps {
  activeTab: DeclarationTab
  bensDireitos: BensDireitosItem[]
  rendimentosIsentos: RendimentoItem[]
  rendimentosExclusivos: RendimentoItem[]
  operacoes: OperacaoItem[]
  rendaVariavel: RendaVariavelItem[]
}

export function DeclarationTable(props: DeclarationTableProps) {
  switch (props.activeTab) {
    case 'bens_direitos':          return <BensDireitosTable items={props.bensDireitos} />
    case 'rendimentos_isentos':    return <RendimentosTable items={props.rendimentosIsentos} tab="isentos" />
    case 'rendimentos_exclusivos': return <RendimentosTable items={props.rendimentosExclusivos} tab="exclusivos" />
    case 'renda_variavel':         return <RendaVariavelTable items={props.rendaVariavel} />
    case 'operacoes':              return <OperacoesTable items={props.operacoes} />
    case 'guia':                   return (
      <GuidePanel
        bensDireitos={props.bensDireitos}
        rendimentosIsentos={props.rendimentosIsentos}
        rendimentosExclusivos={props.rendimentosExclusivos}
        operacoes={props.operacoes}
        rendaVariavel={props.rendaVariavel}
      />
    )
  }
}

// ── Primitivos ───────────────────────────────────────────────────────────────

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap', className)}>
      {children}
    </th>
  )
}

function Td({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) {
  return <td className={cn('px-3 py-2', className)} title={title}>{children}</td>
}

function NewRow({ children, isNew }: { children: React.ReactNode; isNew?: boolean }) {
  const ref = useRef<HTMLTableRowElement>(null)
  useEffect(() => {
    if (isNew && ref.current) ref.current.classList.add('row-new')
  }, [isNew])
  return (
    <tr ref={ref} className="group border-b border-border/50 hover:bg-muted/30 transition-colors">
      {children}
    </tr>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm py-12">
      {text}
    </div>
  )
}

function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [loading, setLoading] = useState(false)
  async function handle() {
    setLoading(true)
    try { await onDelete() } finally { setLoading(false) }
  }
  return (
    <button
      onClick={handle}
      disabled={loading}
      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-40"
      title="Excluir registro"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  )
}

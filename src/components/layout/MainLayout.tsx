'use client'

import { useEffect, useState } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { useAppStore } from '@/store/useAppStore'
import { DropZone } from '@/components/documents/DropZone'
import { DocumentList } from '@/components/documents/DocumentList'
import { TabSelector, type DeclarationTab } from '@/components/declaration/TabSelector'
import { DeclarationTable } from '@/components/declaration/DeclarationTable'
import { ExportBar } from '@/components/declaration/ExportBar'
import { ChatPanel } from '@/components/chat/ChatPanel'

function DeclarationPanel() {
  const [activeTab, setActiveTab] = useState<DeclarationTab>('bens_direitos')
  const bensDireitos        = useAppStore((s) => s.bensDireitos)
  const rendimentosIsentos  = useAppStore((s) => s.rendimentosIsentos)
  const rendimentosExclusivos = useAppStore((s) => s.rendimentosExclusivos)
  const operacoes           = useAppStore((s) => s.operacoes)
  const rendaVariavel       = useAppStore((s) => s.rendaVariavel)

  const counts = {
    bens_direitos:          bensDireitos.length,
    rendimentos_isentos:    rendimentosIsentos.length,
    rendimentos_exclusivos: rendimentosExclusivos.length,
    operacoes:              operacoes.length,
    renda_variavel:         rendaVariavel.length,
  }

  return (
    <div className="h-full flex flex-col">
      <TabSelector active={activeTab} onChange={setActiveTab} counts={counts} />
      <div className="flex-1 overflow-hidden flex flex-col">
        <DeclarationTable
          activeTab={activeTab}
          bensDireitos={bensDireitos}
          rendimentosIsentos={rendimentosIsentos}
          rendimentosExclusivos={rendimentosExclusivos}
          operacoes={operacoes}
          rendaVariavel={rendaVariavel}
        />
      </div>
      <ExportBar />
    </div>
  )
}

export function MainLayout() {
  const {
    selectedYear, connectSSE, disconnectSSE,
    setDocuments, setBensDireitos, setRendimentosIsentos,
    setRendimentosExclusivos, setOperacoes, setRendaVariavel,
  } = useAppStore()

  useEffect(() => {
    let cancelled = false

    async function loadYear() {
      const [docsRes, bdRes, riRes, reRes, opRes, rvRes] = await Promise.all([
        fetch(`/api/documents?year=${selectedYear}`),
        fetch(`/api/declarations/${selectedYear}/bens-direitos`),
        fetch(`/api/declarations/${selectedYear}/rendimentos-isentos`),
        fetch(`/api/declarations/${selectedYear}/rendimentos-exclusivos`),
        fetch(`/api/declarations/${selectedYear}/operacoes`),
        fetch(`/api/declarations/${selectedYear}/renda-variavel`),
      ])
      if (cancelled) return

      if (docsRes.ok) setDocuments((await docsRes.json()).documents ?? [])
      if (bdRes.ok)   setBensDireitos((await bdRes.json()).items ?? [])
      if (riRes.ok)   setRendimentosIsentos((await riRes.json()).items ?? [])
      if (reRes.ok)   setRendimentosExclusivos((await reRes.json()).items ?? [])
      if (opRes.ok)   setOperacoes((await opRes.json()).items ?? [])
      if (rvRes.ok)   setRendaVariavel((await rvRes.json()).items ?? [])
    }

    loadYear().catch(console.error)
    connectSSE(selectedYear)

    return () => {
      cancelled = true
      disconnectSSE()
    }
  }, [
    selectedYear, connectSSE, disconnectSSE,
    setDocuments, setBensDireitos, setRendimentosIsentos,
    setRendimentosExclusivos, setOperacoes, setRendaVariavel,
  ])

  return (
    <div className="flex-1 overflow-hidden">
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={35} minSize={25} maxSize={55}>
          <div className="h-full flex flex-col overflow-hidden">
            <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[55%] min-h-0 shrink-0">
              <section>
                <h2 className="text-sm font-semibold mb-2">Upload de Documentos</h2>
                <DropZone />
              </section>
              <section>
                <h2 className="text-sm font-semibold mb-2">Documentos processados</h2>
                <DocumentList />
              </section>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
              <ChatPanel />
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />

        <Panel defaultSize={65} minSize={40}>
          <DeclarationPanel />
        </Panel>
      </PanelGroup>
    </div>
  )
}

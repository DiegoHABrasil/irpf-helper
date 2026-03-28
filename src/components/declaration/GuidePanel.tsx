'use client'

import { cn, formatCurrency } from '@/lib/utils'
import type {
  BensDireitosItem,
  RendimentoItem,
  OperacaoItem,
  RendaVariavelItem,
} from '@/store/useAppStore'

// ── Primitivos ────────────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/60 px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="divide-y">{children}</div>
    </div>
  )
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
      {n}
    </span>
  )
}

function NavPath({ steps }: { steps: string[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap text-xs font-mono bg-muted/40 rounded px-3 py-1.5 border">
      {steps.map((s, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground">›</span>}
          <span className={i === steps.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'}>{s}</span>
        </span>
      ))}
    </div>
  )
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-xs text-muted-foreground w-40 shrink-0 pt-0.5">{label}:</span>
      <span className={cn(
        'text-xs font-mono rounded px-1.5 py-0.5 leading-relaxed',
        highlight
          ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
          : 'bg-muted text-foreground'
      )}>
        {value}
      </span>
    </div>
  )
}

function ItemCard({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="text-xs font-semibold text-muted-foreground">#{index + 1}</span>
          <div className="w-px flex-1 bg-border" />
        </div>
        <div className="flex flex-col gap-1.5 w-full min-w-0">{children}</div>
      </div>
    </div>
  )
}

function EmptyGuide({ text }: { text: string }) {
  return (
    <p className="px-4 py-6 text-sm text-muted-foreground text-center">{text}</p>
  )
}

// ── Bens e Direitos ───────────────────────────────────────────────────────────

const GRUPO_LABEL: Record<string, string> = {
  '03': 'Participações Societárias',
  '04': 'Aplicações e Investimentos',
  '06': 'Outros Bens Móveis',
  '07': 'Fundos',
  '99': 'Outros Bens e Direitos',
}

function BensDireitosGuide({ items }: { items: BensDireitosItem[] }) {
  return (
    <Section
      title="Bens e Direitos"
      subtitle="Programa IRPF → menu Fichas → Bens e Direitos"
    >
      <div className="px-4 py-3 bg-blue-50 dark:bg-blue-950/30 text-xs text-blue-800 dark:text-blue-200 space-y-1">
        <p className="font-semibold">Como acessar:</p>
        <NavPath steps={['Programa IRPF', 'Fichas', 'Bens e Direitos']} />
        <p className="mt-2">Para cada item abaixo: clique em <strong>"Novo"</strong>, preencha os campos e clique em <strong>"OK"</strong>.</p>
      </div>
      {items.length === 0
        ? <EmptyGuide text="Nenhum bem ou direito extraído ainda." />
        : items.map((item, i) => (
          <ItemCard key={item.id} index={i}>
            <p className="text-xs font-semibold text-foreground">{item.ticker ?? item.discriminacao.split(' ')[0]}</p>
            <Field label="Grupo" value={`${item.grupo} — ${GRUPO_LABEL[item.grupo] ?? 'Outros'}`} highlight />
            <Field label="Código" value={item.codigo} highlight />
            <Field label="Discriminação" value={item.discriminacao} />
            <Field label="Situação em 31/12 (ano anterior)" value={formatCurrency(item.situacao31_12_anterior)} />
            <Field label="Situação em 31/12 (ano atual)" value={formatCurrency(item.situacao31_12_atual)} highlight />
            {item.cnpj && <Field label="CNPJ da fonte" value={item.cnpj} />}
          </ItemCard>
        ))
      }
    </Section>
  )
}

// ── Rendimentos Isentos ───────────────────────────────────────────────────────

const TIPO_ISENTO_LABEL: Record<string, string> = {
  '09': 'Lucros e dividendos recebidos',
  '12': 'Outros (LCI/LCA/CRI/CRA/Poupança/Debênture incentivada)',
  '20': 'Ganho de capital na alienação de bens — operações até R$ 20.000/mês',
  '26': 'Outros (rendimentos de FII)',
}

function RendIsentosGuide({ items }: { items: RendimentoItem[] }) {
  return (
    <Section
      title="Rendimentos Isentos e Não Tributáveis"
      subtitle="Programa IRPF → menu Fichas → Rendimentos Isentos e Não Tributáveis"
    >
      <div className="px-4 py-3 bg-green-50 dark:bg-green-950/30 text-xs text-green-800 dark:text-green-200 space-y-1">
        <p className="font-semibold">Como acessar:</p>
        <NavPath steps={['Programa IRPF', 'Fichas', 'Rendimentos Isentos e Não Tributáveis']} />
        <p className="mt-2">Para cada item: clique em <strong>"Novo"</strong>, selecione o <strong>Tipo</strong> pelo código, preencha os demais campos e clique em <strong>"OK"</strong>.</p>
      </div>
      {items.length === 0
        ? <EmptyGuide text="Nenhum rendimento isento extraído ainda." />
        : items.map((item, i) => (
          <ItemCard key={item.id} index={i}>
            <p className="text-xs font-semibold">{item.descricao ?? item.nomeFonte}</p>
            <Field
              label="Tipo"
              value={`${item.tipoRendimento} — ${TIPO_ISENTO_LABEL[item.tipoRendimento] ?? item.descricao ?? ''}`}
              highlight
            />
            <Field label="Beneficiário" value="Titular (você mesmo)" />
            {item.nomeFonte && <Field label="Nome da fonte pagadora" value={item.nomeFonte} />}
            {item.cnpjFonte && <Field label="CNPJ da fonte pagadora" value={item.cnpjFonte} />}
            <Field label="Valor" value={formatCurrency(item.valor)} highlight />
          </ItemCard>
        ))
      }
    </Section>
  )
}

// ── Rendimentos Exclusivos ────────────────────────────────────────────────────

const TIPO_EXCLUSIVO_LABEL: Record<string, string> = {
  '06': 'Rendimentos de aplicações financeiras (CDB, Tesouro Direto)',
  '10': 'Juros sobre capital próprio (JCP)',
  '12': 'Outros rendimentos',
}

function RendExclusivosGuide({ items }: { items: RendimentoItem[] }) {
  return (
    <Section
      title="Rendimentos Sujeitos à Tributação Exclusiva/Definitiva"
      subtitle="Programa IRPF → menu Fichas → Rendimentos Sujeitos à Tributação Exclusiva/Definitiva"
    >
      <div className="px-4 py-3 bg-orange-50 dark:bg-orange-950/30 text-xs text-orange-800 dark:text-orange-200 space-y-1">
        <p className="font-semibold">Como acessar:</p>
        <NavPath steps={['Programa IRPF', 'Fichas', 'Rendimentos Sujeitos à Tributação Exclusiva']} />
        <p className="mt-2">Para cada item: clique em <strong>"Novo"</strong>, selecione o <strong>Tipo</strong>, preencha os demais campos e clique em <strong>"OK"</strong>.</p>
      </div>
      {items.length === 0
        ? <EmptyGuide text="Nenhum rendimento de tributação exclusiva extraído ainda." />
        : items.map((item, i) => (
          <ItemCard key={item.id} index={i}>
            <p className="text-xs font-semibold">{item.descricao ?? item.nomeFonte}</p>
            <Field
              label="Tipo"
              value={`${item.tipoRendimento} — ${TIPO_EXCLUSIVO_LABEL[item.tipoRendimento] ?? ''}`}
              highlight
            />
            <Field label="Beneficiário" value="Titular (você mesmo)" />
            {item.nomeFonte && <Field label="Nome da fonte pagadora" value={item.nomeFonte} />}
            {item.cnpjFonte && <Field label="CNPJ da fonte pagadora" value={item.cnpjFonte} />}
            <Field label="Valor" value={formatCurrency(item.valor)} highlight />
          </ItemCard>
        ))
      }
    </Section>
  )
}

// ── Renda Variável ────────────────────────────────────────────────────────────

const MERCADO_LABEL: Record<string, string> = {
  mercado_a_vista: 'Mercado à Vista (Ações)',
  day_trade:       'Day Trade',
  opcoes:          'Opções',
  futuro:          'Mercado Futuro',
}

const MERCADO_NAV: Record<string, string[]> = {
  mercado_a_vista: ['Fichas', 'Renda Variável', 'Operações Comuns / Day-Trade', 'Aba: Mercado à Vista'],
  day_trade:       ['Fichas', 'Renda Variável', 'Operações Comuns / Day-Trade', 'Aba: Day-Trade'],
  opcoes:          ['Fichas', 'Renda Variável', 'Operações em Opções'],
  futuro:          ['Fichas', 'Renda Variável', 'Operações em Mercado Futuro'],
}

function RendaVariavelGuide({ items }: { items: RendaVariavelItem[] }) {
  return (
    <Section
      title="Renda Variável"
      subtitle="Programa IRPF → menu Fichas → Renda Variável"
    >
      <div className="px-4 py-3 bg-purple-50 dark:bg-purple-950/30 text-xs text-purple-800 dark:text-purple-200 space-y-1">
        <p className="font-semibold">Como acessar:</p>
        <NavPath steps={['Programa IRPF', 'Fichas', 'Renda Variável']} />
        <p className="mt-2">
          Selecione o <strong>mês</strong> no seletor superior e preencha o resultado líquido em cada aba de mercado.
          Meses com resultado negativo ficam em <strong>"Resultado negativo no mês"</strong> — esses valores serão compensados automaticamente nos meses seguintes pelo programa.
        </p>
        <p className="mt-1 font-semibold text-amber-700 dark:text-amber-400">
          ⚠ Atenção: o DARF (IRRF) só é obrigatório nos meses em que houver lucro líquido após compensação de prejuízos acumulados.
        </p>
      </div>
      {items.length === 0
        ? <EmptyGuide text="Nenhuma operação de renda variável encontrada ainda." />
        : items.map((item, i) => (
          <ItemCard key={item.id} index={i}>
            <p className="text-xs font-semibold">
              {item.mesNome} — {MERCADO_LABEL[item.tipoMercado] ?? item.tipoMercado}
            </p>
            <NavPath steps={['Programa IRPF', ...(MERCADO_NAV[item.tipoMercado] ?? ['Renda Variável'])]} />
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <StepBadge n={1} />
                <span className="text-xs">Selecione o mês <strong className="font-mono">{item.mesNome.toUpperCase()}</strong> no seletor</span>
              </div>
              <div className="flex items-center gap-2">
                <StepBadge n={2} />
                <div className="text-xs">
                  Preencha <strong>"Resultado líquido das operações"</strong>:{' '}
                  <span className={cn(
                    'font-mono font-semibold px-1.5 py-0.5 rounded',
                    item.resultadoLiquido != null && item.resultadoLiquido >= 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                  )}>
                    {item.resultadoLiquido != null ? formatCurrency(item.resultadoLiquido) : '—'}
                  </span>
                </div>
              </div>
              {item.irRetidoFonte > 0 && (
                <div className="flex items-center gap-2">
                  <StepBadge n={3} />
                  <span className="text-xs">
                    Preencha <strong>"IR retido na fonte (dedo-duro)"</strong>:{' '}
                    <span className="font-mono font-semibold">{formatCurrency(item.irRetidoFonte)}</span>
                  </span>
                </div>
              )}
              {item.irDevido > 0 && (
                <div className="flex items-center gap-2">
                  <StepBadge n={item.irRetidoFonte > 0 ? 4 : 3} />
                  <span className="text-xs text-amber-700 dark:text-amber-400">
                    IR devido no mês:{' '}
                    <span className="font-mono font-semibold">{formatCurrency(item.irDevido)}</span>
                    {' '}— verifique se o DARF foi pago até o último dia útil do mês seguinte.
                  </span>
                </div>
              )}
            </div>
          </ItemCard>
        ))
      }
    </Section>
  )
}

// ── Operações — Custo Médio para Bens e Direitos ──────────────────────────────

function OperacoesGuide({ items }: { items: OperacaoItem[] }) {
  // Group by ticker, get latest cost basis
  const byTicker = items.reduce<Record<string, { ticker: string; custoMedio: number; quantidade: number }>>((acc, op) => {
    if (op.custoMedioNaData != null) {
      acc[op.ticker] = { ticker: op.ticker, custoMedio: op.custoMedioNaData, quantidade: op.quantidade }
    }
    return acc
  }, {})
  const tickers = Object.values(byTicker)

  return (
    <Section
      title="Custo Médio das Posições (para Bens e Direitos)"
      subtitle="Use estes valores no campo Discriminação de cada ativo em Bens e Direitos"
    >
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-700 dark:text-slate-300 space-y-1">
        <p>
          O custo médio é o valor declarado na ficha <strong>Bens e Direitos</strong> para cada ação/FII.
          Informe o custo de aquisição total (custo médio × quantidade) na coluna <strong>"Situação em 31/12"</strong>.
        </p>
        <p className="mt-1 text-amber-700 dark:text-amber-400 font-medium">
          ⚠ O programa da Receita não calcula custo médio automaticamente — você é responsável por informar o valor correto.
        </p>
      </div>
      {tickers.length === 0
        ? <EmptyGuide text="Nenhuma operação com custo médio calculado ainda." />
        : tickers.map((t, i) => (
          <ItemCard key={t.ticker} index={i}>
            <p className="text-xs font-semibold">{t.ticker}</p>
            <Field label="Custo médio por unidade" value={formatCurrency(t.custoMedio)} highlight />
            <Field
              label="Valor total para declarar"
              value={`${formatCurrency(t.custoMedio)} × quantidade em 31/12`}
            />
            <p className="text-xs text-muted-foreground">
              Informe o custo total de aquisição em <strong>Bens e Direitos → Discriminação</strong>.
            </p>
          </ItemCard>
        ))
      }
    </Section>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

interface GuidePanelProps {
  bensDireitos: BensDireitosItem[]
  rendimentosIsentos: RendimentoItem[]
  rendimentosExclusivos: RendimentoItem[]
  operacoes: OperacaoItem[]
  rendaVariavel: RendaVariavelItem[]
}

export function GuidePanel(props: GuidePanelProps) {
  const total =
    props.bensDireitos.length +
    props.rendimentosIsentos.length +
    props.rendimentosExclusivos.length +
    props.rendaVariavel.length

  return (
    <div className="overflow-y-auto flex-1 p-4 space-y-4">
      {total === 0 && (
        <div className="text-sm text-muted-foreground text-center py-8">
          Faça o upload de documentos para ver o guia de preenchimento.
        </div>
      )}

      <BensDireitosGuide items={props.bensDireitos} />
      <RendIsentosGuide items={props.rendimentosIsentos} />
      <RendExclusivosGuide items={props.rendimentosExclusivos} />
      <RendaVariavelGuide items={props.rendaVariavel} />
      {props.operacoes.length > 0 && <OperacoesGuide items={props.operacoes} />}
    </div>
  )
}

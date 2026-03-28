import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

const MES_NOME = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export async function GET(
  req: NextRequest,
  { params }: { params: { year: string } }
) {
  const year = Number(params.year)
  if (isNaN(year)) return NextResponse.json({ error: 'Ano inválido' }, { status: 400 })

  const format = req.nextUrl.searchParams.get('format') ?? 'json'
  if (format !== 'csv' && format !== 'json') {
    return NextResponse.json({ error: 'format deve ser csv ou json' }, { status: 400 })
  }

  const taxYear = await prisma.taxYear.findUnique({ where: { year } })
  if (!taxYear) {
    return format === 'csv'
      ? new Response('# Nenhum dado encontrado para o ano ' + year, {
          headers: csvHeaders(`irpf_${year}.csv`),
        })
      : NextResponse.json({ year, bensDireitos: [], rendimentosIsentos: [], rendimentosExclusivos: [], rendaVariavel: [], operacoes: [] })
  }

  const [bd, ri, re, rv, op] = await Promise.all([
    prisma.irpfBensDireitos.findMany({
      where: { taxYearId: taxYear.id },
      orderBy: [{ grupo: 'asc' }, { codigo: 'asc' }],
    }),
    prisma.irpfRendimentosIsentos.findMany({
      where: { taxYearId: taxYear.id },
      orderBy: { tipoRendimento: 'asc' },
    }),
    prisma.irpfRendimentosExclusivos.findMany({
      where: { taxYearId: taxYear.id },
      orderBy: { tipoRendimento: 'asc' },
    }),
    prisma.irpfRendaVariavel.findMany({
      where: { taxYearId: taxYear.id },
      orderBy: [{ mes: 'asc' }, { tipoMercado: 'asc' }],
    }),
    prisma.operacao.findMany({
      where: { taxYearId: taxYear.id },
      orderBy: [{ dataOperacao: 'asc' }, { ticker: 'asc' }],
    }),
  ])

  if (format === 'json') {
    return NextResponse.json(
      {
        year,
        geradoEm: new Date().toISOString(),
        bensDireitos: bd.map((i) => ({
          grupo: i.grupo,
          codigo: i.codigo,
          discriminacao: i.discriminacao,
          situacao31_12_anterior: Number(i.situacao31_12_anterior),
          situacao31_12_atual: Number(i.situacao31_12_atual),
          cnpj: i.cnpj,
          ticker: i.ticker,
        })),
        rendimentosIsentos: ri.map((i) => ({
          tipo: i.tipoRendimento,
          nomeFonte: i.nomeFonte,
          cnpjFonte: i.cnpjFonte,
          valor: Number(i.valor),
          descricao: i.descricao,
        })),
        rendimentosExclusivos: re.map((i) => ({
          tipo: i.tipoRendimento,
          nomeFonte: i.nomeFonte,
          cnpjFonte: i.cnpjFonte,
          valor: Number(i.valor),
          descricao: i.descricao,
        })),
        rendaVariavel: rv.map((i) => ({
          mes: i.mes,
          mesNome: MES_NOME[i.mes - 1],
          tipoMercado: i.tipoMercado,
          resultadoLiquido: i.resultadoLiquido ? Number(i.resultadoLiquido) : null,
          prejuizoAcumulado: Number(i.prejuizoAcumulado),
          irRetidoFonte: Number(i.irRetidoFonte),
          irDevido: Number(i.irDevido),
        })),
        operacoes: op.map((o) => ({
          data: o.dataOperacao,
          ticker: o.ticker,
          tipo: o.tipo,
          quantidade: Number(o.quantidade),
          precoUnitario: Number(o.precoUnitario),
          valorTotal: Number(o.valorTotal),
          dayTrade: o.dayTrade,
          custoMedioNaData: o.custoMedioNaData ? Number(o.custoMedioNaData) : null,
          ganhoPerda: o.ganhoPerda ? Number(o.ganhoPerda) : null,
        })),
      },
      { headers: { 'Content-Disposition': `attachment; filename="irpf_${year}.json"` } }
    )
  }

  // ── CSV ───────────────────────────────────────────────────────────────────
  const rows: string[] = []

  rows.push(`# IRPF Helper — Exportação ano-base ${year}`)
  rows.push(`# Gerado em: ${new Date().toLocaleString('pt-BR')}`)
  rows.push('')

  // Bens e Direitos
  rows.push('## BENS E DIREITOS')
  rows.push('Grupo,Código,Discriminação,Situação 31/12 anterior,Situação 31/12 atual')
  for (const i of bd) {
    rows.push(csvRow([i.grupo, i.codigo, i.discriminacao, fmt(i.situacao31_12_anterior), fmt(i.situacao31_12_atual)]))
  }
  rows.push(`TOTAL,,, ${fmt(bd.reduce((s, i) => s + Number(i.situacao31_12_anterior), 0))},${fmt(bd.reduce((s, i) => s + Number(i.situacao31_12_atual), 0))}`)
  rows.push('')

  // Rendimentos Isentos
  rows.push('## RENDIMENTOS ISENTOS E NÃO TRIBUTÁVEIS')
  rows.push('Tipo,Fonte Pagadora,CNPJ Fonte,Descrição,Valor')
  for (const i of ri) {
    rows.push(csvRow([i.tipoRendimento, i.nomeFonte ?? '', i.cnpjFonte ?? '', i.descricao ?? '', fmt(i.valor)]))
  }
  rows.push(`TOTAL,,,, ${fmt(ri.reduce((s, i) => s + Number(i.valor), 0))}`)
  rows.push('')

  // Rendimentos Exclusivos
  rows.push('## RENDIMENTOS SUJEITOS À TRIBUTAÇÃO EXCLUSIVA')
  rows.push('Tipo,Fonte Pagadora,CNPJ Fonte,Descrição,Valor')
  for (const i of re) {
    rows.push(csvRow([i.tipoRendimento, i.nomeFonte ?? '', i.cnpjFonte ?? '', i.descricao ?? '', fmt(i.valor)]))
  }
  rows.push(`TOTAL,,,, ${fmt(re.reduce((s, i) => s + Number(i.valor), 0))}`)
  rows.push('')

  // Renda Variável
  rows.push('## RENDA VARIÁVEL')
  rows.push('Mês,Mercado,Resultado Líquido,IR Retido (dedo-duro),IR Devido')
  for (const i of rv) {
    rows.push(csvRow([
      MES_NOME[i.mes - 1],
      i.tipoMercado,
      i.resultadoLiquido != null ? fmt(i.resultadoLiquido) : '',
      fmt(i.irRetidoFonte),
      fmt(i.irDevido),
    ]))
  }
  rows.push('')

  // Operações
  rows.push('## OPERAÇÕES')
  rows.push('Data,Ticker,Tipo,Quantidade,Preço Unit.,Total,Day Trade,Custo Médio,Ganho/Perda')
  for (const o of op) {
    rows.push(csvRow([
      String(o.dataOperacao).slice(0, 10),
      o.ticker,
      o.tipo,
      String(Number(o.quantidade)),
      fmt(o.precoUnitario),
      fmt(o.valorTotal),
      o.dayTrade ? 'Sim' : 'Não',
      o.custoMedioNaData ? fmt(o.custoMedioNaData) : '',
      o.ganhoPerda ? fmt(o.ganhoPerda) : '',
    ]))
  }

  const csv = rows.join('\n')
  return new Response(csv, { headers: csvHeaders(`irpf_${year}.csv`) })
}

function fmt(v: unknown): string {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function csvRow(cells: string[]): string {
  return cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
}

function csvHeaders(filename: string) {
  return {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
  }
}

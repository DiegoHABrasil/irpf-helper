import { prisma } from '@/lib/db/prisma'
import {
  IRPF_BENS_DIREITOS,
  IRPF_RENDIMENTOS_ISENTOS,
  IRPF_RENDIMENTOS_EXCLUSIVOS,
  type TipoAtivo,
  type TipoRendimentoIsento,
  type TipoRendimentoExclusivo,
} from './constants'
import type { InformeRendimentosExtraction } from '@/lib/extraction/prompts/informe-rendimentos'
import { emitSSE } from '@/lib/sse'

export async function mapInformeRendimentos(
  extraction: InformeRendimentosExtraction,
  taxYearId: number,
  extractionId: number
) {
  // ── Bens e Direitos (posições em 31/12) ──────────────────────────────────
  for (const pos of extraction.posicoes_31_12 ?? []) {
    const tipoAtivo = (pos.tipo_ativo ?? 'outro') as TipoAtivo
    const mapping = IRPF_BENS_DIREITOS[tipoAtivo] ?? IRPF_BENS_DIREITOS.outro

    const discriminacao = gerarDiscriminacao(pos, extraction.instituicao)

    const item = await prisma.irpfBensDireitos.create({
      data: {
        taxYearId,
        extractionId,
        grupo: mapping.grupo,
        codigo: mapping.codigo,
        discriminacao,
        situacao31_12_anterior: pos.valor_31_12_anterior ?? 0,
        situacao31_12_atual: pos.valor_31_12_atual ?? 0,
        cnpj: pos.cnpj ?? null,
        ticker: pos.ticker ?? null,
        tipoAtivo: tipoAtivo,
        quantidade: pos.quantidade ?? null,
        custoMedio: pos.custo_medio ?? null,
      },
    })

    emitSSE(taxYearId, {
      type: 'item_added',
      table: 'bens_direitos',
      item: {
        id: item.id,
        grupo: item.grupo,
        codigo: item.codigo,
        discriminacao: item.discriminacao,
        situacao31_12_anterior: Number(item.situacao31_12_anterior),
        situacao31_12_atual: Number(item.situacao31_12_atual),
        ticker: item.ticker,
        tipoAtivo: item.tipoAtivo,
      },
    })
  }

  // ── Rendimentos Isentos ──────────────────────────────────────────────────
  for (const rend of extraction.rendimentos_isentos ?? []) {
    const tipoKey = (rend.tipo ?? 'dividendo_acao') as TipoRendimentoIsento
    const mapping = IRPF_RENDIMENTOS_ISENTOS[tipoKey] ?? IRPF_RENDIMENTOS_ISENTOS.dividendo_acao

    const item = await prisma.irpfRendimentosIsentos.create({
      data: {
        taxYearId,
        extractionId,
        tipoRendimento: mapping.tipo,
        cnpjFonte: rend.cnpj_fonte ?? null,
        nomeFonte: rend.nome_fonte ?? null,
        valor: rend.valor ?? 0,
        descricao: mapping.desc + (rend.ticker_ou_nome ? ` — ${rend.ticker_ou_nome}` : ''),
      },
    })

    emitSSE(taxYearId, {
      type: 'item_added',
      table: 'rendimentos_isentos',
      item: {
        id: item.id,
        tipoRendimento: item.tipoRendimento,
        nomeFonte: item.nomeFonte,
        valor: Number(item.valor),
        descricao: item.descricao,
      },
    })
  }

  // ── Rendimentos Tributação Exclusiva ─────────────────────────────────────
  for (const rend of extraction.rendimentos_exclusivos ?? []) {
    const tipoKey = (rend.tipo ?? 'outros') as TipoRendimentoExclusivo
    const mapping = IRPF_RENDIMENTOS_EXCLUSIVOS[tipoKey] ?? IRPF_RENDIMENTOS_EXCLUSIVOS.outros

    const item = await prisma.irpfRendimentosExclusivos.create({
      data: {
        taxYearId,
        extractionId,
        tipoRendimento: mapping.tipo,
        cnpjFonte: rend.cnpj_fonte ?? null,
        nomeFonte: rend.nome_fonte ?? null,
        valor: rend.valor ?? 0,
        descricao: mapping.desc + (rend.nome_fonte ? ` — ${rend.nome_fonte}` : ''),
      },
    })

    emitSSE(taxYearId, {
      type: 'item_added',
      table: 'rendimentos_exclusivos',
      item: {
        id: item.id,
        tipoRendimento: item.tipoRendimento,
        nomeFonte: item.nomeFonte,
        valor: Number(item.valor),
        descricao: item.descricao,
      },
    })
  }
}

// ── Gerador de Discriminação ─────────────────────────────────────────────────

interface Posicao {
  ticker?: string
  nome?: string
  cnpj?: string
  quantidade?: number
  custo_medio?: number
  tipo_ativo?: string
  vencimento?: string
  taxa?: string
  emissor?: string
  valor_31_12_atual?: number
}

function gerarDiscriminacao(pos: Posicao, instituicao: string): string {
  const tipo = pos.tipo_ativo ?? 'outro'

  switch (tipo) {
    case 'acao':
    case 'bdr':
      return [
        pos.quantidade ? `${pos.quantidade} ações/BDRs` : '',
        pos.ticker ? pos.ticker : '',
        pos.nome ? `- ${pos.nome}` : '',
        pos.cnpj ? `CNPJ ${pos.cnpj}.` : '',
        pos.custo_medio ? `Custo médio: R$ ${Number(pos.custo_medio).toFixed(2)}.` : '',
        `Custodiante: ${instituicao}.`,
      ].filter(Boolean).join(' ')

    case 'fii':
      return [
        pos.quantidade ? `${pos.quantidade} cotas` : '',
        pos.ticker ? pos.ticker : '',
        pos.nome ? `- ${pos.nome}` : '',
        pos.cnpj ? `CNPJ ${pos.cnpj}.` : '',
        `Custodiante: ${instituicao}.`,
      ].filter(Boolean).join(' ')

    case 'cdb':
    case 'lci':
    case 'lca':
    case 'cri':
    case 'cra':
    case 'debenture':
      return [
        tipo.toUpperCase(),
        pos.emissor ? `- ${pos.emissor}` : pos.nome ? `- ${pos.nome}` : '',
        pos.cnpj ? `CNPJ ${pos.cnpj}.` : '',
        pos.taxa ? `Taxa: ${pos.taxa}.` : '',
        pos.vencimento ? `Vencimento: ${pos.vencimento}.` : '',
        pos.valor_31_12_atual
          ? `Saldo em 31/12: R$ ${Number(pos.valor_31_12_atual).toFixed(2)}.`
          : '',
      ].filter(Boolean).join(' ')

    case 'tesouro_direto':
      return [
        'Tesouro Direto',
        pos.nome ? `- ${pos.nome}` : '',
        pos.vencimento ? `Vencimento: ${pos.vencimento}.` : '',
        pos.quantidade ? `${pos.quantidade} títulos.` : '',
      ].filter(Boolean).join(' ')

    default:
      return [
        pos.nome ?? pos.ticker ?? 'Ativo',
        pos.cnpj ? `CNPJ ${pos.cnpj}.` : '',
        pos.valor_31_12_atual
          ? `Saldo em 31/12: R$ ${Number(pos.valor_31_12_atual).toFixed(2)}.`
          : '',
      ].filter(Boolean).join(' ')
  }
}

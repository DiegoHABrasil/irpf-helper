import { prisma } from '@/lib/db/prisma'
import { IRPF_BENS_DIREITOS, IRPF_RENDIMENTOS_ISENTOS, IRPF_RENDIMENTOS_EXCLUSIVOS } from './constants'
import type { ExtratoRendaFixaExtraction, PosicaoRendaFixa } from '@/lib/extraction/prompts/extrato-renda-fixa'
import { emitSSE } from '@/lib/sse'

// Tipos de títulos isentos de IR
const TIPOS_ISENTOS = new Set<PosicaoRendaFixa['tipo_titulo']>([
  'lci', 'lca', 'cri', 'cra', 'debenture_incentivada', 'poupanca',
])

// Mapeamento de tipo_titulo → tipo_ativo do IRPF (para Bens e Direitos)
const TITULO_TO_TIPO_ATIVO: Record<PosicaoRendaFixa['tipo_titulo'], keyof typeof IRPF_BENS_DIREITOS> = {
  cdb:                   'cdb',
  lci:                   'lci',
  lca:                   'lca',
  cri:                   'cri',
  cra:                   'cra',
  debenture:             'debenture',
  debenture_incentivada: 'debenture',
  tesouro_direto:        'tesouro_direto',
  poupanca:              'poupanca',
  outro:                 'outro',
}

// Mapeamento de tipo_titulo → chave de rendimento isento
const TITULO_TO_RENDIMENTO_ISENTO: Partial<Record<PosicaoRendaFixa['tipo_titulo'], keyof typeof IRPF_RENDIMENTOS_ISENTOS>> = {
  lci:                   'rendimento_lci',
  lca:                   'rendimento_lca',
  cri:                   'rendimento_cri',
  cra:                   'rendimento_cra',
  debenture_incentivada: 'rendimento_debenture_incentivada',
  poupanca:              'rendimento_poupanca',
}

// Mapeamento de tipo_titulo → chave de rendimento exclusivo
const TITULO_TO_RENDIMENTO_EXCLUSIVO: Partial<Record<PosicaoRendaFixa['tipo_titulo'], keyof typeof IRPF_RENDIMENTOS_EXCLUSIVOS>> = {
  cdb:           'rendimento_cdb',
  tesouro_direto:'rendimento_tesouro',
  debenture:     'rendimento_debenture',
}

export async function mapExtratoRendaFixa(
  extraction: ExtratoRendaFixaExtraction,
  taxYearId: number,
  extractionId: number
) {
  for (const pos of extraction.posicoes ?? []) {
    // ── Bens e Direitos ───────────────────────────────────────────────────────
    const tipoAtivo = TITULO_TO_TIPO_ATIVO[pos.tipo_titulo] ?? 'outro'
    const bdMapping = IRPF_BENS_DIREITOS[tipoAtivo]
    const discriminacao = gerarDiscriminacaoRendaFixa(pos, extraction.instituicao)

    const bdItem = await prisma.irpfBensDireitos.create({
      data: {
        taxYearId,
        extractionId,
        grupo: bdMapping.grupo,
        codigo: bdMapping.codigo,
        discriminacao,
        situacao31_12_anterior: pos.valor_31_12_anterior ?? 0,
        situacao31_12_atual: pos.valor_31_12_atual,
        cnpj: pos.cnpj_emissor ?? null,
        tipoAtivo: tipoAtivo,
      },
    })

    emitSSE(taxYearId, {
      type: 'item_added',
      table: 'bens_direitos',
      item: {
        id: bdItem.id,
        grupo: bdItem.grupo,
        codigo: bdItem.codigo,
        discriminacao: bdItem.discriminacao,
        situacao31_12_anterior: Number(bdItem.situacao31_12_anterior),
        situacao31_12_atual: Number(bdItem.situacao31_12_atual),
        tipoAtivo: bdItem.tipoAtivo,
      },
    })

    // ── Rendimentos: se houver rendimento bruto, mapear para a ficha correta ──
    const rendBruto = pos.rendimento_bruto ?? 0
    if (rendBruto <= 0) continue

    const nomeInstituicao = extraction.instituicao
    const cnpjInstituicao = extraction.cnpj_instituicao ?? null
    const nomeTitulo = pos.nome ?? pos.tipo_titulo.toUpperCase()

    if (TIPOS_ISENTOS.has(pos.tipo_titulo)) {
      // Rendimento isento
      const tipoKey = TITULO_TO_RENDIMENTO_ISENTO[pos.tipo_titulo] ?? 'rendimento_lci'
      const mapping = IRPF_RENDIMENTOS_ISENTOS[tipoKey]

      const item = await prisma.irpfRendimentosIsentos.create({
        data: {
          taxYearId,
          extractionId,
          tipoRendimento: mapping.tipo,
          nomeFonte: nomeInstituicao,
          cnpjFonte: cnpjInstituicao,
          valor: rendBruto,
          descricao: `${mapping.desc} — ${nomeTitulo}${pos.vencimento ? ` (venc. ${pos.vencimento})` : ''}`,
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
    } else {
      // Rendimento exclusivo na fonte (CDB, Tesouro Direto, debêntures comuns)
      const tipoKey = TITULO_TO_RENDIMENTO_EXCLUSIVO[pos.tipo_titulo] ?? 'rendimento_cdb'
      const mapping = IRPF_RENDIMENTOS_EXCLUSIVOS[tipoKey]

      const item = await prisma.irpfRendimentosExclusivos.create({
        data: {
          taxYearId,
          extractionId,
          tipoRendimento: mapping.tipo,
          nomeFonte: nomeInstituicao,
          cnpjFonte: cnpjInstituicao,
          valor: rendBruto,
          descricao: `${mapping.desc} — ${nomeTitulo}${pos.vencimento ? ` (venc. ${pos.vencimento})` : ''}`,
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
}

// ── Gerador de Discriminação para Renda Fixa ──────────────────────────────────

function gerarDiscriminacaoRendaFixa(pos: PosicaoRendaFixa, instituicao: string): string {
  const tipo = pos.tipo_titulo

  const labelMap: Record<PosicaoRendaFixa['tipo_titulo'], string> = {
    cdb:                   'CDB',
    lci:                   'LCI',
    lca:                   'LCA',
    cri:                   'CRI',
    cra:                   'CRA',
    debenture:             'Debênture',
    debenture_incentivada: 'Debênture Incentivada (Lei 12.431)',
    tesouro_direto:        'Tesouro Direto',
    poupanca:              'Caderneta de Poupança',
    outro:                 'Ativo de Renda Fixa',
  }

  const parts: string[] = [labelMap[tipo] ?? tipo.toUpperCase()]

  if (pos.nome)              parts.push(`- ${pos.nome}`)
  else if (pos.emissor)      parts.push(`- ${pos.emissor}`)

  if (pos.cnpj_emissor)      parts.push(`CNPJ ${pos.cnpj_emissor}.`)
  if (pos.taxa)              parts.push(`Taxa: ${pos.taxa}.`)
  if (pos.data_aplicacao)    parts.push(`Aplicação: ${pos.data_aplicacao}.`)
  if (pos.vencimento)        parts.push(`Vencimento: ${pos.vencimento}.`)
  if (pos.quantidade)        parts.push(`${pos.quantidade} títulos.`)

  parts.push(`Custodiante: ${instituicao}.`)

  return parts.join(' ')
}

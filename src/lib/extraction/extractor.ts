import { prisma } from '@/lib/db/prisma'
import type { LLMProvider } from '@/lib/llm/types'
import type { DocType } from './classifier'
import {
  INFORME_RENDIMENTOS_SYSTEM_PROMPT,
  INFORME_RENDIMENTOS_SCHEMA,
  type InformeRendimentosExtraction,
} from './prompts/informe-rendimentos'
import {
  INFORME_FII_SYSTEM_PROMPT,
  INFORME_FII_SCHEMA,
} from './prompts/informe-fii'
import {
  NOTA_CORRETAGEM_SYSTEM_PROMPT,
  NOTA_CORRETAGEM_SCHEMA,
  type NotaCorretagemExtraction,
} from './prompts/nota-corretagem'
import {
  EXTRATO_RENDA_FIXA_SYSTEM_PROMPT,
  EXTRATO_RENDA_FIXA_SCHEMA,
  type ExtratoRendaFixaExtraction,
} from './prompts/extrato-renda-fixa'
import { mapInformeRendimentos } from '@/lib/irpf/mapper'
import { mapNotaCorretagem } from '@/lib/irpf/mapper-nota-corretagem'
import { mapExtratoRendaFixa } from '@/lib/irpf/mapper-extrato-renda-fixa'

export async function extractDocument(params: {
  documentId: number
  taxYearId: number
  docType: DocType
  rawText: string
  provider: LLMProvider
}): Promise<number | null> {
  const { documentId, taxYearId, docType, rawText, provider } = params

  if (docType === 'OUTRO') return null

  let rawJson: unknown
  let extractionType: string

  if (docType === 'INFORME_RENDIMENTOS') {
    extractionType = 'informe_rendimentos'
    rawJson = await provider.extractStructured<InformeRendimentosExtraction>({
      text: rawText,
      schema: INFORME_RENDIMENTOS_SCHEMA,
      systemPrompt: INFORME_RENDIMENTOS_SYSTEM_PROMPT,
    })
  } else if (docType === 'INFORME_FII') {
    extractionType = 'informe_fii'
    rawJson = await provider.extractStructured<InformeRendimentosExtraction>({
      text: rawText,
      schema: INFORME_FII_SCHEMA,
      systemPrompt: INFORME_FII_SYSTEM_PROMPT,
    })
  } else if (docType === 'NOTA_CORRETAGEM') {
    extractionType = 'nota_corretagem'
    rawJson = await provider.extractStructured<NotaCorretagemExtraction>({
      text: rawText,
      schema: NOTA_CORRETAGEM_SCHEMA,
      systemPrompt: NOTA_CORRETAGEM_SYSTEM_PROMPT,
    })
  } else if (docType === 'EXTRATO_RENDA_FIXA') {
    extractionType = 'extrato_renda_fixa'
    rawJson = await provider.extractStructured<ExtratoRendaFixaExtraction>({
      text: rawText,
      schema: EXTRATO_RENDA_FIXA_SCHEMA,
      systemPrompt: EXTRATO_RENDA_FIXA_SYSTEM_PROMPT,
    })
  } else {
    return null
  }

  // Persist raw extraction for audit
  const extraction = await prisma.extraction.create({
    data: {
      documentId,
      extractionType,
      rawJson: JSON.stringify(rawJson),
      validated: true,
    },
  })

  // Map to IRPF tables (deterministic — no LLM)
  if (docType === 'INFORME_RENDIMENTOS' || docType === 'INFORME_FII') {
    await mapInformeRendimentos(
      rawJson as InformeRendimentosExtraction,
      taxYearId,
      extraction.id
    )
  } else if (docType === 'NOTA_CORRETAGEM') {
    await mapNotaCorretagem(
      rawJson as NotaCorretagemExtraction,
      taxYearId,
      documentId,
      extraction.id
    )
  } else if (docType === 'EXTRATO_RENDA_FIXA') {
    await mapExtratoRendaFixa(
      rawJson as ExtratoRendaFixaExtraction,
      taxYearId,
      extraction.id
    )
  }

  return extraction.id
}

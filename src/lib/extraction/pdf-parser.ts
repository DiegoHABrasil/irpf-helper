import fs from 'fs/promises'
import path from 'path'

const EXTRACTED_DIR = path.join(process.cwd(), 'data', 'extracted')

/**
 * Extracts text from a PDF file.
 * Tries pdf-parse first, then pdfjs-dist as fallback.
 * Saves extracted text to data/extracted/<documentId>.txt
 */
export async function parsePdf(filePath: string, documentId: number): Promise<string> {
  await fs.mkdir(EXTRACTED_DIR, { recursive: true })

  const outputPath = path.join(EXTRACTED_DIR, `${documentId}.txt`)

  // Try pdf-parse first
  let text = ''
  try {
    text = await extractWithPdfParse(filePath)
  } catch (err) {
    console.log(`[pdf-parser] Document ${documentId}: pdf-parse failed (${err instanceof Error ? err.message : err}), trying pdfjs-dist...`)
  }

  // Fallback: pdfjs-dist handles a wider range of PDF variants
  if (text.trim().length < 50) {
    try {
      text = await extractWithPdfjsDist(filePath)
      if (text.trim().length >= 50) {
        console.log(`[pdf-parser] Document ${documentId}: pdfjs-dist extraction succeeded`)
      }
    } catch (err) {
      console.log(`[pdf-parser] Document ${documentId}: pdfjs-dist failed (${err instanceof Error ? err.message : err})`)
    }
  }

  if (!text.trim()) {
    throw new Error('Não foi possível extrair texto do PDF. O arquivo pode estar corrompido, protegido por senha, ou ser uma imagem escaneada sem OCR disponível.')
  }

  await fs.writeFile(outputPath, text, 'utf-8')
  return text
}

async function extractWithPdfParse(filePath: string): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default
  const buffer = await fs.readFile(filePath)
  const data = await pdfParse(buffer)
  return data.text
}

async function extractWithPdfjsDist(filePath: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')
  const buffer = await fs.readFile(filePath)
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer), verbosity: 0 })
  const pdf = await loadingTask.promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(pageText)
  }
  return pages.join('\n')
}

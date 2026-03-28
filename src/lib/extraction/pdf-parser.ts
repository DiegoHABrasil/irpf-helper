import fs from 'fs/promises'
import path from 'path'

const EXTRACTED_DIR = path.join(process.cwd(), 'data', 'extracted')

/**
 * Extracts text from a PDF file.
 * Tries pdf-parse first; falls back to Tesseract OCR if no text is found.
 * Saves extracted text to data/extracted/<documentId>.txt
 */
export async function parsePdf(filePath: string, documentId: number): Promise<string> {
  await fs.mkdir(EXTRACTED_DIR, { recursive: true })

  const outputPath = path.join(EXTRACTED_DIR, `${documentId}.txt`)

  // Try pdf-parse first
  let text = await extractWithPdfParse(filePath)

  // If barely any text was extracted, assume it's a scanned PDF and use OCR
  if (text.trim().length < 50) {
    console.log(`[pdf-parser] Document ${documentId}: low text yield, trying OCR...`)
    text = await extractWithOcr(filePath)
  }

  if (!text.trim()) {
    throw new Error('Não foi possível extrair texto do PDF (nem via parsing nem OCR)')
  }

  await fs.writeFile(outputPath, text, 'utf-8')
  return text
}

async function extractWithPdfParse(filePath: string): Promise<string> {
  // Dynamic import to avoid issues with Next.js bundling
  const pdfParse = (await import('pdf-parse')).default
  const buffer = await fs.readFile(filePath)
  const data = await pdfParse(buffer)
  return data.text
}

async function extractWithOcr(filePath: string): Promise<string> {
  const { createWorker } = await import('tesseract.js')

  const worker = await createWorker('por+eng')
  try {
    const { data } = await worker.recognize(filePath)
    return data.text
  } finally {
    await worker.terminate()
  }
}

export const DOCUMENT_QUEUE = 'documents'

export interface ProcessDocumentJob {
  documentId: number
  taxYearId: number
  filePath: string
}

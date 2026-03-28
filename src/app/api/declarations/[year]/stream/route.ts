import { NextRequest } from 'next/server'
import { createSSEStream } from '@/lib/sse'

export async function GET(
  _req: NextRequest,
  { params }: { params: { year: string } }
) {
  const taxYearId = Number(params.year)
  return createSSEStream(taxYearId)
}

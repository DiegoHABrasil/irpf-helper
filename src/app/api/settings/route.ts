import { NextRequest, NextResponse } from 'next/server'
import { getSettings, saveSettings } from '@/lib/settings'
import type { AppSettings } from '@/lib/settings'

export async function GET() {
  try {
    const settings = await getSettings()
    // Mask API key in response
    const response = {
      ...settings,
      llm_api_key: settings.llm_api_key ? '***' : undefined,
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as Partial<AppSettings>

    // Validate provider
    const validProviders = ['claude', 'openai', 'ollama']
    if (body.llm_provider && !validProviders.includes(body.llm_provider)) {
      return NextResponse.json({ error: 'Provider inválido' }, { status: 400 })
    }

    // Don't save masked API key
    if (body.llm_api_key === '***') {
      delete body.llm_api_key
    }

    await saveSettings(body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('PUT /api/settings error:', error)
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 })
  }
}

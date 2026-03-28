import { prisma } from './db/prisma'
import { encrypt, decrypt } from './crypto'
import type { LLMConfig, LLMProviderName } from './llm/types'

const ENCRYPTED_KEYS = ['llm_api_key']

export interface AppSettings {
  llm_provider: LLMProviderName
  llm_api_key?: string
  ollama_base_url?: string
  ollama_model?: string
}

export async function getSettings(): Promise<AppSettings> {
  const rows = await prisma.setting.findMany()
  const map: Record<string, string> = {}

  for (const row of rows) {
    if (ENCRYPTED_KEYS.includes(row.settingKey) && row.settingValue) {
      try {
        map[row.settingKey] = decrypt(row.settingValue)
      } catch {
        map[row.settingKey] = ''
      }
    } else {
      map[row.settingKey] = row.settingValue
    }
  }

  return {
    llm_provider: (map.llm_provider as LLMProviderName) || 'claude',
    llm_api_key: map.llm_api_key || undefined,
    ollama_base_url: map.ollama_base_url || 'http://localhost:11434',
    ollama_model: map.ollama_model || 'llama3',
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const updates = Object.entries(settings).filter(([, v]) => v !== undefined) as [string, string][]

  await prisma.$transaction(
    updates.map(([key, value]) => {
      const storedValue = ENCRYPTED_KEYS.includes(key) && value ? encrypt(value) : value
      return prisma.setting.upsert({
        where: { settingKey: key },
        update: { settingValue: storedValue },
        create: { settingKey: key, settingValue: storedValue },
      })
    })
  )
}

export async function getLLMConfig(): Promise<LLMConfig> {
  const settings = await getSettings()
  return {
    provider: settings.llm_provider,
    apiKey: settings.llm_api_key,
    ollamaBaseUrl: settings.ollama_base_url,
    ollamaModel: settings.ollama_model,
  }
}

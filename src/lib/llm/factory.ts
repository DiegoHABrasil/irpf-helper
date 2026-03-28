import type { LLMConfig, LLMProvider } from './types'
import { ClaudeProvider } from './providers/claude'
import { OpenAIProvider } from './providers/openai'
import { OllamaProvider } from './providers/ollama'

export function createProvider(config: LLMConfig): LLMProvider {
  switch (config.provider) {
    case 'claude':
      if (!config.apiKey) throw new Error('API key obrigatória para o provider Claude')
      return new ClaudeProvider(config.apiKey)

    case 'openai':
      if (!config.apiKey) throw new Error('API key obrigatória para o provider OpenAI')
      return new OpenAIProvider(config.apiKey)

    case 'ollama':
      return new OllamaProvider(
        config.ollamaBaseUrl ?? 'http://localhost:11434',
        config.ollamaModel ?? 'llama3'
      )

    default:
      throw new Error(`Provider desconhecido: ${config.provider}`)
  }
}

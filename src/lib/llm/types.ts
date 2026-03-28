export type JSONSchema = Record<string, unknown>

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ClassifyResult {
  category: string
  confidence: number
}

export interface LLMProvider {
  name: string

  /** Extração estruturada com schema JSON — retorna objeto validado */
  extractStructured<T>(params: {
    text: string
    schema: JSONSchema
    systemPrompt: string
  }): Promise<T>

  /** Chat conversacional com contexto — retorna stream de tokens */
  chat(params: {
    messages: ChatMessage[]
    context?: string
  }): AsyncIterable<string>

  /** Classificação de documento */
  classify(params: {
    text: string
    categories: string[]
  }): Promise<ClassifyResult>
}

export type LLMProviderName = 'claude' | 'openai' | 'ollama'

export interface LLMConfig {
  provider: LLMProviderName
  apiKey?: string
  ollamaBaseUrl?: string
  ollamaModel?: string
}

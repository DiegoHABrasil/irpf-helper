import { createOllama } from 'ollama-ai-provider'
import { generateObject, streamText } from 'ai'
import { z } from 'zod'
import type { ChatMessage, ClassifyResult, JSONSchema, LLMProvider } from '../types'
import { IRPF_SYSTEM_PROMPT } from '@/lib/knowledge/system-prompt'

export class OllamaProvider implements LLMProvider {
  name = 'ollama'
  private ollama: ReturnType<typeof createOllama>
  private model: string

  constructor(baseUrl: string, model: string) {
    this.ollama = createOllama({ baseURL: `${baseUrl}/api` })
    this.model = model
  }

  async extractStructured<T>(params: {
    text: string
    schema: JSONSchema
    systemPrompt: string
  }): Promise<T> {
    const { object } = await generateObject({
      model: this.ollama(this.model),
      system: params.systemPrompt,
      prompt: params.text,
      schema: z.object(jsonSchemaToZod(params.schema)),
    })
    return object as T
  }

  async *chat(params: {
    messages: ChatMessage[]
    context?: string
  }): AsyncIterable<string> {
    const systemContent = params.context
      ? `${IRPF_SYSTEM_PROMPT}\n\n## Informações Complementares\nUse as informações abaixo (base de conhecimento e documentos do usuário) para responder:\n\n${params.context}`
      : IRPF_SYSTEM_PROMPT

    const result = await streamText({
      model: this.ollama(this.model),
      system: systemContent,
      messages: params.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    for await (const chunk of result.textStream) {
      yield chunk
    }
  }

  async classify(params: {
    text: string
    categories: string[]
  }): Promise<ClassifyResult> {
    const { object } = await generateObject({
      model: this.ollama(this.model),
      system: 'Classifique o documento financeiro brasileiro na categoria correta.',
      prompt: `Documento:\n${params.text.slice(0, 3000)}\n\nCategorias disponíveis: ${params.categories.join(', ')}`,
      schema: z.object({
        category: z.enum(params.categories as [string, ...string[]]),
        confidence: z.number().min(0).max(1),
      }),
    })
    return object
  }
}

function jsonSchemaToZod(schema: JSONSchema): Record<string, z.ZodTypeAny> {
  if (schema.type !== 'object' || !schema.properties) return {}
  const shape: Record<string, z.ZodTypeAny> = {}
  const required = (schema.required as string[]) || []

  for (const [key, value] of Object.entries(schema.properties as Record<string, JSONSchema>)) {
    let zodType = jsonSchemaFieldToZod(value)
    if (!required.includes(key)) zodType = zodType.nullish()
    shape[key] = zodType
  }
  return shape
}

function jsonSchemaFieldToZod(field: JSONSchema): z.ZodTypeAny {
  if (field.enum) return z.enum(field.enum as [string, ...string[]])
  switch (field.type) {
    case 'string':  return z.string()
    case 'number':  return z.number()
    case 'integer': return z.number().int()
    case 'boolean': return z.boolean()
    case 'array':   return z.array(field.items ? jsonSchemaFieldToZod(field.items as JSONSchema) : z.unknown())
    case 'object':  return z.object(jsonSchemaToZod(field))
    default:        return z.unknown()
  }
}

// ═══════════════════════════════════════════════════════════════
// Retriever de conhecimento IRPF por keywords
// Busca nos tópicos indexados e retorna conteúdo relevante
// ═══════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { TOPIC_INDEX, type TopicEntry } from './topic-index'

/**
 * Diretório dos arquivos de tópicos.
 * Em dev: src/lib/knowledge/topics (relativo ao cwd do projeto)
 * Em produção (Docker standalone): knowledge/topics (copiado pelo Dockerfile)
 */
const TOPICS_DIR = (() => {
  const devPath = join(process.cwd(), 'src', 'lib', 'knowledge', 'topics')
  if (existsSync(devPath)) return devPath
  return join(process.cwd(), 'knowledge', 'topics')
})()

/** Remove acentos e converte para lowercase */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .trim()
}

/** Tokeniza texto em palavras e bigramas */
function tokenize(text: string): string[] {
  const words = normalize(text).split(/\s+/).filter(Boolean)
  const tokens = [...words]
  // Gerar bigramas para capturar expressões compostas
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]} ${words[i + 1]}`)
  }
  return tokens
}

/** Score de relevância de um tópico para uma query */
function scoreTopic(topic: TopicEntry, queryTokens: string[]): number {
  let score = 0
  const normalizedKeywords = topic.keywords.map(normalize)

  for (const token of queryTokens) {
    for (const keyword of normalizedKeywords) {
      // Match exato de keyword
      if (keyword === token) {
        score += 3
      }
      // Token contido na keyword ou vice-versa
      else if (keyword.includes(token) && token.length >= 3) {
        score += 2
      } else if (token.includes(keyword) && keyword.length >= 3) {
        score += 1
      }
    }
  }
  return score
}

export interface RetrievalResult {
  title: string
  content: string
  score: number
}

/**
 * Recupera os tópicos de conhecimento mais relevantes para a pergunta do usuário.
 *
 * @param query - A pergunta ou mensagem do usuário
 * @param maxTopics - Número máximo de tópicos a retornar (default: 2)
 * @param minScore - Score mínimo para incluir um tópico (default: 2)
 * @returns Array de tópicos com título, conteúdo e score
 */
export function retrieveKnowledge(
  query: string,
  maxTopics: number = 2,
  minScore: number = 2,
): RetrievalResult[] {
  const queryTokens = tokenize(query)

  const scored = TOPIC_INDEX.map((topic) => ({
    topic,
    score: scoreTopic(topic, queryTokens),
  }))
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxTopics)

  return scored.map(({ topic, score }) => {
    let content = ''
    try {
      content = readFileSync(join(TOPICS_DIR, topic.file), 'utf-8')
    } catch {
      content = `[Erro ao carregar tópico: ${topic.file}]`
    }
    return { title: topic.title, content, score }
  })
}

/**
 * Formata os resultados do retriever para injeção no contexto do LLM.
 */
export function formatKnowledgeContext(results: RetrievalResult[]): string {
  if (results.length === 0) return ''

  return results
    .map((r) => `=== Base de Conhecimento: ${r.title} ===\n${r.content}`)
    .join('\n\n')
}

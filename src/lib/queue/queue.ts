import { Queue } from 'bullmq'
import { DOCUMENT_QUEUE } from './jobs'

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  // Suporte a URL completa: redis://host:port
  ...(process.env.REDIS_URL
    ? (() => {
        const url = new URL(process.env.REDIS_URL)
        return { host: url.hostname, port: Number(url.port) || 6379 }
      })()
    : {}),
}

export const documentQueue = new Queue(DOCUMENT_QUEUE, { connection })

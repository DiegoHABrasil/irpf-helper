'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { StoreChatMessage } from '@/store/useAppStore'

interface MessageListProps {
  messages: StoreChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center px-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Assistente IRPF</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Faça perguntas sobre seus documentos processados,<br />
            custo médio de ativos, rendimentos e muito mais.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            'max-w-[88%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words',
            msg.role === 'user'
              ? 'ml-auto bg-primary text-primary-foreground'
              : 'mr-auto bg-muted text-foreground',
          )}
        >
          {msg.content}
          {msg.streaming && <span className="inline-block w-1 h-3 ml-1 bg-current animate-pulse" />}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

'use client'

import { useAppStore } from '@/store/useAppStore'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

export function ChatPanel() {
  const messages = useAppStore((s) => s.messages)
  const isChatLoading = useAppStore((s) => s.isChatLoading)
  const sendMessage = useAppStore((s) => s.sendMessage)

  return (
    <div className="flex flex-col h-full border-t">
      <div className="px-3 py-2 border-b">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assistente</h2>
      </div>
      <MessageList messages={messages} />
      <ChatInput onSend={sendMessage} disabled={isChatLoading} />
    </div>
  )
}

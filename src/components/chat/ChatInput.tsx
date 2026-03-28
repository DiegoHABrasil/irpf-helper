'use client'

import { useRef, useState } from 'react'
import { SendHorizonal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <div className="flex items-end gap-2 p-3 border-t bg-background">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Pergunte sobre seus documentos… (Enter para enviar)"
        className={cn(
          'flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm',
          'placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50 min-h-[38px] max-h-[120px]',
        )}
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        className={cn(
          'flex items-center justify-center h-[38px] w-[38px] rounded-md',
          'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed shrink-0',
        )}
      >
        <SendHorizonal className="h-4 w-4" />
      </button>
    </div>
  )
}

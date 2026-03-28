'use client'

import { useState, useCallback } from 'react'

export interface ToastData {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'destructive'
}

// Simple module-level store so any component can call toast()
let _addToast: ((t: Omit<ToastData, 'id'>) => void) | null = null

export function toast(data: Omit<ToastData, 'id'>) {
  _addToast?.(data)
}

export function useToastStore() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((data: Omit<ToastData, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { ...data, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Register the module-level emitter
  _addToast = addToast

  return { toasts, removeToast }
}

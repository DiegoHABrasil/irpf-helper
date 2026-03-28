'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Provider = 'claude' | 'openai' | 'ollama'

interface SettingsData {
  llm_provider: Provider
  llm_api_key?: string
  ollama_base_url?: string
  ollama_model?: string
}

export function LLMProviderConfig() {
  const [settings, setSettings] = useState<SettingsData>({
    llm_provider: 'claude',
    llm_api_key: '',
    ollama_base_url: 'http://localhost:11434',
    ollama_model: 'llama3',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings((prev) => ({ ...prev, ...data })))
      .catch(() => setError('Erro ao carregar configurações'))
  }, [])

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="provider">Provedor de LLM</Label>
        <Select
          value={settings.llm_provider}
          onValueChange={(v) => setSettings((s) => ({ ...s, llm_provider: v as Provider }))}
        >
          <SelectTrigger id="provider">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="claude">Claude (Anthropic)</SelectItem>
            <SelectItem value="openai">OpenAI (gpt-4o-mini)</SelectItem>
            <SelectItem value="ollama">Ollama (local, 100% privado)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {settings.llm_provider !== 'ollama' && (
        <div className="space-y-2">
          <Label htmlFor="apikey">
            API Key {settings.llm_provider === 'claude' ? '(Anthropic)' : '(OpenAI)'}
          </Label>
          <Input
            id="apikey"
            type="password"
            placeholder={settings.llm_provider === 'claude' ? 'sk-ant-...' : 'sk-...'}
            value={settings.llm_api_key === '***' ? '' : (settings.llm_api_key ?? '')}
            onChange={(e) => setSettings((s) => ({ ...s, llm_api_key: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">
            Armazenada localmente com criptografia AES-256-GCM. Nunca sai da sua máquina.
          </p>
        </div>
      )}

      {settings.llm_provider === 'ollama' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="ollamaUrl">URL do Ollama</Label>
            <Input
              id="ollamaUrl"
              placeholder="http://localhost:11434"
              value={settings.ollama_base_url ?? ''}
              onChange={(e) => setSettings((s) => ({ ...s, ollama_base_url: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ollamaModel">Modelo</Label>
            <Input
              id="ollamaModel"
              placeholder="llama3"
              value={settings.ollama_model ?? ''}
              onChange={(e) => setSettings((s) => ({ ...s, ollama_model: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: llama3, mistral, qwen2.5. Certifique-se que o modelo suporta JSON mode.
            </p>
          </div>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar configurações'}
      </Button>
    </div>
  )
}

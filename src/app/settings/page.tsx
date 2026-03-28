import { LLMProviderConfig } from '@/components/settings/LLMProviderConfig'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground mb-8">
          Configure o provedor de LLM que será usado para processar seus documentos.
        </p>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Provedor de Linguagem (LLM)</h2>
          <LLMProviderConfig />
        </div>

        <div className="mt-6 border rounded-lg p-6 bg-muted/30">
          <h2 className="text-base font-semibold mb-2">Privacidade</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✅ PDFs originais ficam 100% locais na sua máquina</li>
            <li>✅ Dados do MySQL ficam locais — nunca enviados a servidores externos</li>
            <li>⚠️ Texto dos PDFs é enviado ao provedor de LLM selecionado para extração</li>
            <li>✅ Use Ollama para processamento 100% offline e privado</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

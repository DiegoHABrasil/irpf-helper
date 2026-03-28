# IRPF Helper

Assistente local para preenchimento da declaração de Imposto de Renda (IRPF). Processa PDFs de corretoras e bancos via LLM e popula automaticamente os campos corretos das fichas do programa da Receita Federal.

## Funcionalidades

- Upload de PDFs por drag & drop
- Classificação automática do tipo de documento (informe de rendimentos, nota de corretagem, extrato de renda fixa, informe de FII)
- Extração de dados via LLM (Claude, OpenAI ou Ollama local)
- Mapeamento determinístico para as fichas do IRPF:
  - **Bens e Direitos** — ações, FIIs, ETFs, BDRs, CDB, LCI, LCA, CRI, CRA, Tesouro Direto, debêntures
  - **Rendimentos Isentos** — dividendos, LCI/LCA/CRI/CRA, lucros de venda ≤ R$20k/mês
  - **Rendimentos Sujeitos à Tributação Exclusiva** — JCP, CDB, Tesouro Direto
  - **Renda Variável** — resultado mensal por mercado (swing trade, day trade), DARF
  - **Operações** — histórico de compras e vendas com custo médio calculado
- Chat com os documentos em streaming
- Exportação em CSV e JSON
- Atualizações em tempo real via SSE

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- Chave de API: [Claude](https://console.anthropic.com/), [OpenAI](https://platform.openai.com/) ou [Ollama](https://ollama.ai/) local

## Setup

```bash
git clone <repositório>
cd irpf-helper
cp .env.example .env
```

Edite `.env` com suas configurações:

```env
# Banco de dados SQLite (não precisa alterar em desenvolvimento)
DATABASE_URL="file:./data/irpf.db"

# Redis (usado pelo BullMQ para a fila de processamento)
REDIS_URL="redis://redis:6379"

# Chave de criptografia para API keys armazenadas (gere uma com: openssl rand -hex 32)
ENCRYPTION_KEY="sua-chave-hex-de-64-caracteres"
```

Suba os serviços:

```bash
docker compose up
```

Acesse [http://localhost:3000](http://localhost:3000) e vá em **Configurações** para informar a chave de API do provedor LLM escolhido.

## Desenvolvimento local (sem Docker)

Pré-requisitos: Node.js 20+, Redis rodando localmente.

```bash
npm install
npx prisma db push        # cria o banco SQLite em data/irpf.db
npm run dev               # Next.js em :3000
npm run worker            # worker BullMQ em processo separado
```

## Testes

```bash
npm test
```

## Tipos de documentos suportados

| Tipo | Descrição | Exemplos de corretoras |
|------|-----------|------------------------|
| Informe de Rendimentos | Posições em 31/12, dividendos, JCP | XP, BTG, Rico, Clear, Inter |
| Nota de Corretagem | Operações de compra e venda | XP, BTG, Clear, Toro |
| Extrato de Renda Fixa | CDB, LCI, LCA, CRI, CRA, Tesouro, Debêntures | Nubank, Inter, BTG |
| Informe de FII | Cotas, rendimentos isentos e tributados de FIIs | XP, BTG, Rico |

## Arquitetura

```
src/
├── app/
│   ├── api/
│   │   ├── chat/              # Chat com streaming SSE
│   │   ├── declarations/      # Bens, rendimentos, operações, renda variável
│   │   ├── documents/         # Upload e status
│   │   ├── export/            # Download CSV e JSON
│   │   └── settings/          # Configurações de LLM
│   ├── settings/              # Página de configurações
│   └── page.tsx               # Página principal
├── components/
│   ├── chat/                  # ChatPanel, MessageList, ChatInput
│   ├── declaration/           # TabSelector, DeclarationTable, ExportBar
│   ├── documents/             # DropZone, DocumentList, DocumentItem
│   ├── layout/                # MainLayout, Header, YearSelector
│   └── settings/              # LLMProviderConfig
├── lib/
│   ├── extraction/            # PDF parser, classifier, extractor, prompts
│   ├── irpf/                  # Constants, mapper, custo médio, ganho de capital
│   ├── llm/                   # Factory + providers (Claude, OpenAI, Ollama)
│   └── queue/                 # BullMQ jobs + worker
└── store/
    └── useAppStore.ts         # Estado global + SSE listener
```

## Privacidade

Todos os dados ficam no seu computador. Apenas o **texto extraído dos PDFs** é enviado para a API do LLM escolhido. Nenhum dado é enviado para servidores externos além do provedor LLM configurado.

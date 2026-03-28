# IRPF Helper

Assistente local para preenchimento da declaração de Imposto de Renda (IRPF). Processa PDFs de corretoras e bancos via LLM e popula automaticamente os campos corretos das fichas do programa da Receita Federal.

> **Privacidade em primeiro lugar:** todos os dados ficam no seu computador. Apenas o texto extraído dos PDFs é enviado ao provedor LLM configurado. Nenhuma informação é transmitida a servidores externos além do provedor escolhido.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Documentos suportados](#documentos-suportados)
- [Requisitos](#requisitos)
- [Instalação rápida (Docker)](#instalação-rápida-docker)
- [Desenvolvimento local](#desenvolvimento-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Configurando o provedor LLM](#configurando-o-provedor-llm)
- [Arquitetura](#arquitetura)
- [Pipeline de processamento](#pipeline-de-processamento)
- [Referência da API](#referência-da-api)
- [Banco de dados](#banco-de-dados)
- [Testes](#testes)
- [Contribuindo](#contribuindo)

---

## Funcionalidades

- **Upload por drag & drop** — arraste PDFs diretamente para a interface
- **Classificação automática** — o LLM identifica o tipo do documento (informe de rendimentos, nota de corretagem, extrato de renda fixa, informe de FII)
- **Extração estruturada** — dados extraídos e validados com schema JSON + Zod
- **Mapeamento determinístico** — algoritmos (sem LLM) convertem os dados extraídos para as fichas do IRPF:
  - **Bens e Direitos** — ações, FIIs, ETFs, BDRs, CDB, LCI, LCA, CRI, CRA, Tesouro Direto, debêntures
  - **Rendimentos Isentos** — dividendos, LCI/LCA/CRI/CRA, lucros de venda ≤ R$20k/mês
  - **Rendimentos Sujeitos à Tributação Exclusiva** — JCP, CDB, Tesouro Direto, distribuições de FII tributadas
  - **Renda Variável** — resultado mensal por mercado (swing trade, day trade), cálculo automático de DARF
  - **Operações** — histórico de compras e vendas com custo médio calculado (FIFO/preço médio)
- **Chat com os documentos** — pergunte sobre seus documentos em linguagem natural (streaming SSE)
- **Atualizações em tempo real** — progresso do processamento via Server-Sent Events
- **Exportação** — CSV e JSON de todas as fichas
- **Multi-ano** — suporte a múltiplos anos-calendário
- **Múltiplos provedores LLM** — Claude (Anthropic), GPT (OpenAI) ou Ollama (local, 100% offline)

---

## Documentos suportados

| Tipo | Descrição | Exemplos de instituições |
|------|-----------|--------------------------|
| Informe de Rendimentos | Posições em 31/12, dividendos, JCP | XP, BTG, Rico, Clear, Inter |
| Nota de Corretagem | Operações de compra e venda no mercado | XP, BTG, Clear, Toro |
| Extrato de Renda Fixa | CDB, LCI, LCA, CRI, CRA, Tesouro Direto, Debêntures | Nubank, Inter, BTG |
| Informe de FII | Cotas, rendimentos isentos e tributados de Fundos Imobiliários | XP, BTG, Rico |

---

## Requisitos

### Via Docker (recomendado)

- [Docker](https://docs.docker.com/get-docker/) 24+
- [Docker Compose](https://docs.docker.com/compose/) v2+
- Chave de API de um provedor LLM (ver [Configurando o provedor LLM](#configurando-o-provedor-llm))

### Desenvolvimento local

- Node.js 20+
- Redis 7+ rodando localmente
- Chave de API de um provedor LLM

---

## Instalação rápida (Docker)

```bash
# 1. Clone o repositório
git clone https://github.com/<seu-usuario>/irpf-helper.git
cd irpf-helper

# 2. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 3. Gere uma chave de criptografia e cole no .env
openssl rand -hex 32

# 4. Edite o .env com a chave gerada (ENCRYPTION_KEY)
# As demais variáveis já estão pré-configuradas para Docker

# 5. Suba os serviços
docker compose up
```

Acesse [http://localhost:3000](http://localhost:3000) e vá em **Configurações** para informar a chave de API do provedor LLM escolhido.

---

## Desenvolvimento local

Pré-requisitos: Node.js 20+ e Redis rodando em `localhost:6379`.

```bash
# Instale as dependências
npm install

# Configure o .env (DATABASE_URL e REDIS_URL para localhost)
cp .env.example .env

# Crie o banco SQLite e aplique o schema
npx prisma db push

# Inicie o servidor Next.js (terminal 1)
npm run dev

# Inicie o worker BullMQ (terminal 2)
npm run worker
```

O servidor estará disponível em [http://localhost:3000](http://localhost:3000).

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | `file:./data/irpf.db` | Caminho do banco SQLite |
| `REDIS_URL` | `redis://redis:6379` | URL do Redis (BullMQ) |
| `ENCRYPTION_KEY` | — | Chave hex de 64 chars para criptografar API keys no banco. Gere com `openssl rand -hex 32` |
| `NEXTAUTH_SECRET` | — | Segredo para sessões (reservado para autenticação futura) |
| `NEXTAUTH_URL` | `http://localhost:3000` | URL base da aplicação |

> **Atenção:** nunca commite o arquivo `.env` com valores reais. O `.gitignore` já exclui esse arquivo por padrão.

---

## Configurando o provedor LLM

Acesse **Configurações** na interface e escolha um dos provedores:

| Provedor | Onde obter a chave | Modelos recomendados |
|----------|--------------------|----------------------|
| **Claude (Anthropic)** | [console.anthropic.com](https://console.anthropic.com/) | `claude-3-5-haiku` (custo baixo), `claude-3-5-sonnet` (melhor precisão) |
| **OpenAI** | [platform.openai.com](https://platform.openai.com/) | `gpt-4o-mini` (custo baixo), `gpt-4o` (melhor precisão) |
| **Ollama (local)** | [ollama.ai](https://ollama.ai/) — sem chave necessária | `llama3.2`, `mistral`, `qwen2.5` |

As chaves de API são armazenadas **criptografadas** no banco local com AES-256.

---

## Arquitetura

```
irpf-helper/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/              # Chat com streaming SSE
│   │   │   ├── declarations/      # Fichas IRPF por ano
│   │   │   ├── documents/         # Upload e status de documentos
│   │   │   ├── export/            # Download CSV e JSON
│   │   │   └── settings/          # Configuração do provedor LLM
│   │   ├── settings/              # Página de configurações
│   │   └── page.tsx               # Página principal
│   │
│   ├── components/
│   │   ├── chat/                  # ChatPanel, MessageList, ChatInput
│   │   ├── declaration/           # TabSelector, DeclarationTable, ExportBar
│   │   ├── documents/             # DropZone, DocumentList, DocumentItem
│   │   ├── layout/                # MainLayout, Header, YearSelector
│   │   ├── settings/              # LLMProviderConfig
│   │   └── ui/                    # Componentes Radix UI / shadcn
│   │
│   ├── lib/
│   │   ├── extraction/            # Pipeline PDF: parser → classifier → extractor
│   │   │   └── prompts/           # Prompts LLM por tipo de documento
│   │   ├── irpf/                  # Mapeamento determinístico para fichas IRPF
│   │   │   ├── mapper.ts          # Informe de rendimentos → fichas
│   │   │   ├── mapper-nota-corretagem.ts
│   │   │   ├── mapper-extrato-renda-fixa.ts
│   │   │   ├── custo-medio.ts     # Cálculo de preço médio / FIFO
│   │   │   └── ganho-capital.ts   # Day trade vs swing trade
│   │   ├── llm/                   # Abstração de provedores LLM
│   │   │   └── providers/         # Claude, OpenAI, Ollama
│   │   └── queue/                 # BullMQ: definição de jobs e worker
│   │
│   └── store/
│       └── useAppStore.ts         # Estado global Zustand + SSE listener
│
├── prisma/
│   └── schema.prisma              # Schema do banco de dados
│
├── tests/                         # Testes Jest
├── data/                          # Dados em runtime (gitignored)
│   ├── irpf.db                   # Banco SQLite
│   ├── uploads/                   # PDFs enviados
│   └── extracted/                 # Textos extraídos
├── Dockerfile
└── docker-compose.yml
```

### Stack tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS + Radix UI |
| Estado | Zustand |
| Tabelas | TanStack React Table |
| ORM | Prisma 5 |
| Banco de dados | SQLite |
| Fila de jobs | BullMQ + Redis 7 |
| Extração de PDF | pdf-parse + Tesseract.js (OCR fallback) |
| Integração LLM | Vercel AI SDK (`ai`) |
| Validação | Zod |
| Testes | Jest + ts-jest |

---

## Pipeline de processamento

Cada PDF enviado passa por 5 etapas executadas de forma assíncrona pelo worker BullMQ:

```
Upload (POST /api/documents/upload)
    │
    ▼
[1] Parse         — Extrai texto com pdf-parse
                    Fallback para OCR (Tesseract.js) em PDFs digitalizados
    │
    ▼
[2] Classify      — LLM identifica o tipo do documento
                    Usa apenas os primeiros 4.000 chars para economizar tokens
    │
    ▼
[3] Extract       — LLM extrai dados estruturados com JSON schema
                    Validado com Zod antes de persistir
    │
    ▼
[4] Map           — Algoritmos determinísticos mapeiam para as fichas IRPF
                    Cálculo de custo médio, ganho de capital, classificação day/swing
    │
    ▼
[5] Notify        — SSE envia atualização em tempo real para o frontend
```

O progresso de cada etapa é transmitido ao frontend via **Server-Sent Events** sem necessidade de polling.

---

## Referência da API

Todos os endpoints retornam JSON, exceto os de streaming (SSE).

### Documentos

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/documents/upload` | Envia um PDF. Body: `multipart/form-data` com campo `file` e `year`. Retorna `{ documentId }` |
| `GET` | `/api/documents?year={ano}` | Lista documentos do ano. Retorna array de documentos com status |
| `GET` | `/api/documents/{id}/status` | Status de processamento de um documento específico |

**Status possíveis:** `pending` → `processing` → `done` | `error`

### Fichas IRPF

Todos os endpoints de fichas aceitam o parâmetro de rota `{year}` (ex.: `2024`).

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/declarations/{year}/bens-direitos` | Bens e Direitos |
| `GET` | `/api/declarations/{year}/rendimentos-isentos` | Rendimentos Isentos e Não Tributáveis |
| `GET` | `/api/declarations/{year}/rendimentos-exclusivos` | Rendimentos Sujeitos à Tributação Exclusiva |
| `GET` | `/api/declarations/{year}/renda-variavel` | Renda Variável (mensal) |
| `GET` | `/api/declarations/{year}/operacoes` | Histórico de Operações |
| `GET` | `/api/declarations/{year}/stream` | SSE stream — atualizações em tempo real |

### Exportação

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/export/{year}?format=csv` | Exporta todas as fichas em CSV |
| `GET` | `/api/export/{year}?format=json` | Exporta todas as fichas em JSON |

### Chat

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/chat` | Envia mensagem e recebe resposta em streaming (SSE). Body: `{ message, year }` |

### Configurações

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/settings` | Retorna configuração atual do LLM (chave descriptografada) |
| `POST` | `/api/settings` | Salva configuração do LLM (chave criptografada antes de persistir) |

---

## Banco de dados

O banco é SQLite gerenciado pelo Prisma. O schema completo está em `prisma/schema.prisma`.

### Modelos principais

```
TaxYear          — Ano-calendário (year, status: draft|complete)
  └── Document   — PDF enviado (filename, docType, processingStatus, rawText)
        └── Extraction — Dados extraídos do PDF (rawJson, extractionType)
              └── IrpfBensDireitos
              └── IrpfRendimentosIsentos
              └── IrpfRendimentosExclusivos
              └── IrpfRendaVariavel
              └── Operacao

ChatMessage      — Histórico do chat (role, content)
Setting          — Configurações criptografadas (settingKey, encryptedValue)
```

### Migrações

```bash
# Aplicar schema sem gerar arquivos de migração (desenvolvimento)
npx prisma db push

# Gerar e aplicar migration (produção / CI)
npx prisma migrate dev --name <nome-da-migration>

# Visualizar o banco no Prisma Studio
npx prisma studio
```

---

## Testes

```bash
# Rodar todos os testes
npm test

# Rodar em modo watch
npm test -- --watch

# Cobertura
npm test -- --coverage
```

Os testes estão organizados em:

```
tests/
├── extraction/     # Parsing de PDF, classificação, extração
├── irpf/           # Mapeamento para fichas IRPF
└── custo-medio/    # Cálculo de preço médio e FIFO
```

---

## Contribuindo

Contribuições são bem-vindas! Siga os passos abaixo:

### 1. Configuração do ambiente

```bash
git clone https://github.com/<seu-usuario>/irpf-helper.git
cd irpf-helper
npm install
cp .env.example .env
# Edite .env com suas configurações locais
npx prisma db push
```

### 2. Fluxo de trabalho

```bash
# Crie uma branch a partir de main
git checkout -b feat/minha-funcionalidade

# Faça suas alterações e rode os testes
npm test

# Commit e push
git commit -m "feat: descrição da funcionalidade"
git push origin feat/minha-funcionalidade

# Abra um Pull Request para a branch main
```

### 3. Adicionando suporte a novos tipos de documento

1. Adicione o tipo em `src/lib/extraction/prompts/` criando um arquivo com o prompt de extração
2. Registre o novo tipo no classificador em `src/lib/extraction/classifier.ts`
3. Implemente o mapper em `src/lib/irpf/` convertendo os dados extraídos para as fichas IRPF
4. Escreva testes em `tests/irpf/`

### 4. Adicionando um novo provedor LLM

1. Crie o provider em `src/lib/llm/providers/<nome>.ts` implementando a interface `LLMProvider`
2. Registre-o na factory em `src/lib/llm/factory.ts`
3. Adicione a opção na UI em `src/components/settings/LLMProviderConfig.tsx`

### Convenções

- **Commits:** use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- **Código:** TypeScript estrito, sem `any` explícito
- **Testes:** todo novo mapper deve ter testes cobrindo os casos principais
- **Privacidade:** nenhum dado do usuário deve ser logado ou transmitido além do necessário

### Reportando bugs

Abra uma [Issue](../../issues) com:
- Versão do sistema operacional e Node.js
- Provedor LLM utilizado e modelo
- Tipo de documento que causou o problema
- Mensagem de erro (sem dados pessoais)

---

## Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

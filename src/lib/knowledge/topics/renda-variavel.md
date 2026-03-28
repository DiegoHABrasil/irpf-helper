# Renda Variável — Guia Completo para IRPF

## Conceitos Fundamentais

### Swing Trade vs Day Trade
- **Swing Trade:** compra e venda em dias diferentes. Alíquota: 15%.
- **Day Trade:** compra e venda no mesmo dia, do mesmo ativo, na mesma corretora. Alíquota: 20%.

### Custo Médio Ponderado
O custo de aquisição de ações (e FIIs, ETFs, BDRs) é calculado pelo método do custo médio ponderado:
- Custo médio = (Saldo anterior + Novas compras com custos) / Quantidade total
- Custos operacionais (corretagem, emolumentos, taxa de liquidação) são SOMADOS ao custo de aquisição
- Bonificações recebidas: custo = R$ 0 (ou valor informado pela empresa)
- Desdobramento (split): custo médio se ajusta automaticamente (mais ações, mesmo custo total)
- Grupamento (inplit): custo médio se ajusta automaticamente

### Cálculo do Ganho/Prejuízo
```
Ganho/Prejuízo = Valor líquido de venda - (Custo médio × Quantidade vendida)
Valor líquido de venda = Valor bruto - Custos operacionais de venda
```

## Apuração Mensal — Passo a Passo

### 1. Consolidar Operações do Mês
- Separar operações normais (swing) de day trade
- Somar vendas totais do mês (para verificar isenção de R$ 20k)

### 2. Verificar Isenção (apenas swing trade em ações)
- Se total de VENDAS no mês ≤ R$ 20.000: ganho é isento
- A isenção NÃO se aplica a: FIIs, ETFs, BDRs, opções, termo, futuro, day trade
- O limite é pelo total de vendas (alienações), não pelo lucro

### 3. Calcular Ganho Líquido
- Para cada operação com lucro: somar os ganhos
- Para cada operação com prejuízo: somar os prejuízos
- Ganho líquido = Ganhos - Prejuízos do mês (do mesmo tipo: swing com swing, day trade com day trade)

### 4. Compensar Prejuízos Acumulados
- Prejuízos de meses anteriores podem ser compensados
- Day trade: só compensa com ganho de day trade
- Swing trade: só compensa com ganho de swing trade
- FII: só compensa com ganho de FII
- Prejuízo NÃO prescreve (pode ser carregado indefinidamente)

### 5. Deduzir IR Retido na Fonte ("dedo-duro")
- Swing trade: 0,005% sobre o valor de venda (quando valor > R$ 20.000/mês)
- Day trade: 1% sobre o ganho líquido positivo do dia
- Esse valor é deduzido do DARF mensal

### 6. Calcular e Pagar DARF
- Código 6015 (operações comuns e day trade em bolsa)
- Vencimento: último dia útil do mês seguinte à apuração
- Valor mínimo: se IR < R$ 10, acumular para o mês seguinte
- DARF em atraso: acréscimo de multa (0,33%/dia, máx 20%) + SELIC

## Ações — Detalhamento

### Dividendos
- Isentos de IR
- Declarar em "Rendimentos Isentos" (Tipo 09)
- CNPJ: da empresa pagadora

### Juros sobre Capital Próprio (JCP)
- IR retido na fonte: 15%
- Declarar o valor LÍQUIDO em "Rendimentos de Tributação Exclusiva" (Tipo 10)

### Direitos de Subscrição
- Se exercer: aumenta o custo médio
- Se vender: tributado como ganho de capital (mesma regra de ações)

### Bonificação
- Custo de aquisição: valor patrimonial informado pela empresa
- Se não informado, usar R$ 0

## Fundos Imobiliários (FIIs)

### Rendimentos (distribuições mensais)
- Isentos para PF quando: fundo com ≥50 cotistas, cotas negociadas em bolsa, PF detém <10% das cotas
- Declarar em "Rendimentos Isentos" (Tipo 26)

### Ganho de Capital (venda de cotas)
- Alíquota: 20% sobre o ganho
- NÃO há isenção de R$ 20.000/mês
- Apuração mensal, DARF código 6015
- Prejuízo: só compensa com ganho de FII

### Amortização de Cotas
- NÃO é rendimento, é devolução de capital
- Reduz o custo de aquisição das cotas
- Custo novo = Custo anterior - Valor amortizado
- Se amortização > custo, excedente é ganho de capital

## ETFs (Exchange Traded Funds)

### ETF de Renda Variável (ex: BOVA11, IVVB11)
- Tributação igual a ações: 15% swing, 20% day trade
- NÃO possuem isenção de R$ 20.000/mês
- Dividendos distribuídos: tributação exclusiva na fonte

### ETF de Renda Fixa (ex: IMAB11)
- IR retido na fonte pela tabela regressiva de RF
- Declarar como aplicação financeira

## BDRs (Brazilian Depositary Receipts)
- Tributação igual a ações: 15% swing, 20% day trade
- NÃO possuem isenção de R$ 20.000/mês (a partir de 2024 possuem, se negociados em bolsa com formador de mercado)
- Dividendos: podem ter retenção no país de origem (verificar tratado)

## Opções (Calls e Puts)

### Titular (comprador)
- Se exercer: prêmio pago integra o custo de aquisição do ativo
- Se não exercer (vencimento sem valor): prejuízo realizável
- Se vender antes do vencimento: ganho/prejuízo normal

### Lançador (vendedor)
- Se exercido: prêmio recebido reduz o preço de venda (call) ou o custo de aquisição (put)
- Se não exercido: prêmio é ganho

### Tributação
- Mesmo regime de ações: 15% swing, 20% day trade
- Incluir no cálculo mensal de renda variável

## Declaração na Ficha "Renda Variável"
A ficha tem 12 linhas (uma por mês) e colunas para:
- Mercado à vista (ações, BDRs)
- Mercado de opções
- Mercado futuro
- Mercado a termo
- Day trade (separado)
- FIIs

Para cada mês preencher:
- Resultado líquido (ganho ou prejuízo)
- Prejuízo a compensar (acumulado de meses anteriores)
- IR retido na fonte no mês ("dedo-duro")
- Imposto devido
- Imposto pago (DARF)

## Erros Comuns
1. Não compensar prejuízos de meses anteriores
2. Misturar compensação de day trade com swing trade
3. Esquecer de incluir custos operacionais no custo de aquisição
4. Declarar FIIs com isenção de R$ 20k (FII não tem essa isenção)
5. Usar valor de mercado ao invés de custo médio em Bens e Direitos
6. Não declarar meses com prejuízo na ficha de Renda Variável

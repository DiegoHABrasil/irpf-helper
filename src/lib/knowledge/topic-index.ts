// ═══════════════════════════════════════════════════════════════
// Índice de tópicos de conhecimento IRPF
// Cada entrada mapeia um arquivo .md para suas keywords de busca
// ═══════════════════════════════════════════════════════════════

export interface TopicEntry {
  /** Caminho relativo ao diretório topics/ */
  file: string
  /** Nome legível do tópico */
  title: string
  /** Keywords para matching (todas em lowercase, sem acento) */
  keywords: string[]
}

export const TOPIC_INDEX: TopicEntry[] = [
  {
    file: 'bens-direitos.md',
    title: 'Bens e Direitos',
    keywords: [
      'bens', 'direitos', 'imovel', 'imoveis', 'apartamento', 'casa', 'terreno',
      'veiculo', 'carro', 'moto', 'vgbl', 'consorcio', 'poupanca', 'conta corrente',
      'deposito', 'grupo', 'codigo', 'discriminacao', 'custo aquisicao',
      'como declarar', 'declarar bem', 'financiamento', 'financiado',
      'cripto', 'bitcoin', 'criptoativo', 'criptomoeda', 'nft',
      'previdencia privada', 'pgbl', 'vgbl',
      'acao', 'acoes', 'fii', 'etf', 'bdr', 'cdb', 'lci', 'lca', 'cri', 'cra',
      'tesouro direto', 'debenture', 'fundo', 'fundos',
    ],
  },
  {
    file: 'rendimentos-isentos.md',
    title: 'Rendimentos Isentos e Não Tributáveis',
    keywords: [
      'isento', 'isentos', 'isencao', 'nao tributavel', 'rendimento isento',
      'dividendo', 'dividendos', 'lucro distribuido',
      'lci', 'lca', 'cri', 'cra', 'debenture incentivada', 'poupanca',
      'fii rendimento', 'fii distribuicao',
      'venda abaixo 20', '20 mil', '20000', '20.000', 'isencao 20',
      'tipo 09', 'tipo 12', 'tipo 18', 'tipo 20', 'tipo 26',
      'cripto isento', '35 mil', '35000', '35.000',
    ],
  },
  {
    file: 'rendimentos-tributaveis.md',
    title: 'Rendimentos Tributáveis e Tributação Exclusiva',
    keywords: [
      'tributavel', 'tributaveis', 'salario', 'pro-labore', 'prolabore',
      'aposentadoria', 'pensao', 'aluguel', 'aluguel recebido',
      'tributacao exclusiva', 'exclusivo', 'exclusivos',
      'jcp', 'juros sobre capital', 'juros capital proprio',
      'cdb rendimento', 'come-cotas', 'come cotas',
      'previdencia', 'pgbl', 'vgbl', 'tabela regressiva', 'tabela progressiva',
      '13 salario', 'decimo terceiro', 'plr',
      'rendimento aplicacao', 'renda fixa rendimento',
      'carnê-leão', 'carne leao', 'autonomo',
    ],
  },
  {
    file: 'renda-variavel.md',
    title: 'Renda Variável',
    keywords: [
      'renda variavel', 'bolsa', 'b3', 'swing trade', 'day trade', 'daytrade',
      'acao', 'acoes', 'acao venda', 'venda acao',
      'fii', 'fundo imobiliario', 'cota fii', 'venda fii',
      'etf', 'bdr',
      'opcao', 'opcoes', 'call', 'put', 'derivativo',
      'custo medio', 'preco medio', 'custo aquisicao',
      'prejuizo', 'compensar prejuizo', 'compensacao',
      'darf', '6015', 'dedo-duro', 'dedo duro', 'ir retido fonte',
      'apuracao mensal', 'ganho liquido',
      'nota corretagem', 'corretagem',
      'subscricao', 'bonificacao', 'desdobramento', 'grupamento',
      'amortizacao', 'amortizacao cota',
    ],
  },
  {
    file: 'deducoes-pagamentos.md',
    title: 'Deduções e Pagamentos',
    keywords: [
      'deducao', 'deducoes', 'deduzir', 'dedutivel',
      'dependente', 'dependentes',
      'educacao', 'escola', 'faculdade', 'universidade', 'instrucao',
      'saude', 'medico', 'medica', 'hospital', 'plano saude', 'dentista',
      'inss', 'previdencia oficial', 'contribuicao previdenciaria',
      'pgbl', 'previdencia privada',
      'pensao alimenticia', 'pensao judicial',
      'livro caixa', 'autonomo', 'despesa profissional',
      'doacao', 'doacoes', 'incentivo', 'eca', 'rouanet',
      'modelo simplificado', 'modelo completo', 'desconto padrao',
      'pagamento efetuado', 'pagamentos',
    ],
  },
  {
    file: 'ganho-capital.md',
    title: 'Ganho de Capital',
    keywords: [
      'ganho capital', 'ganho de capital', 'gcap', 'lucro venda',
      'alienacao', 'venda imovel', 'venda bem',
      'imovel venda', 'imovel alienacao',
      'reinvestimento', '180 dias', 'isencao imovel',
      'aliquota ganho', '15%', '17.5%', '20%', '22.5%',
      'benfeitoria', 'custo aquisicao imovel',
      'cripto ganho', 'criptoativo venda',
      'pequeno valor', 'bem movel',
      'darf 4600', '4600',
      'moeda estrangeira', 'cambio venda',
      'participacao societaria', 'quotas',
      'veiculo venda',
    ],
  },
  {
    file: 'obrigatoriedade-prazos.md',
    title: 'Obrigatoriedade e Prazos',
    keywords: [
      'obrigado declarar', 'obrigatoriedade', 'quem declara', 'preciso declarar',
      'prazo', 'prazo entrega', 'data limite', 'vencimento',
      'multa atraso', 'multa',
      'restituicao', 'lote restituicao', 'prioridade',
      'retificadora', 'retificar', 'corrigir declaracao',
      'parcelamento', 'parcela', 'quota',
      'pre-preenchida', 'pre preenchida', 'declaracao automatica',
      'programa irpf', 'e-cac', 'ecac', 'gov.br',
      'dependente cpf', 'cpf dependente',
      'espolio', 'falecimento', 'inventario',
      'saida definitiva', 'exterior residencia',
      'modelo', 'simplificado', 'completo',
      'debito automatico', 'pix', 'pagamento imposto',
    ],
  },
  {
    file: 'exterior-cambio.md',
    title: 'Investimentos no Exterior e Câmbio',
    keywords: [
      'exterior', 'investimento exterior', 'aplicacao exterior',
      'offshore', 'trust', 'controlada',
      'lei 14754', '14.754', 'nova lei exterior',
      'acao exterior', 'etf exterior', 'stock', 'nyse', 'nasdaq',
      'reit', 'bond', 'treasury',
      'cambio', 'dolar', 'euro', 'moeda estrangeira', 'ptax',
      'variacao cambial', 'cambio compra',
      'dcbe', 'capitais brasileiros exterior',
      'dupla tributacao', 'imposto pago exterior', 'compensar imposto',
      'conta exterior', 'banco exterior',
      'bdr', 'bdr dividendo',
    ],
  },
]

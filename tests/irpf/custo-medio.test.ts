/**
 * Testes unitários para o algoritmo de custo médio ponderado.
 * Simula a lógica de recalcularCustoMedio sem banco de dados.
 */

// Tipos e lógica extraídos da implementação real para testes isolados

interface Operacao {
  tipo: 'compra' | 'venda'
  quantidade: number
  valorTotal: number
  taxas: number
}

interface ResultadoOp {
  custoMedioNaData: number
  ganhoPerda: number | null
}

function calcularCustoMedio(operacoes: Operacao[]): ResultadoOp[] {
  let posQtd = 0
  let posCusto = 0

  return operacoes.map((op) => {
    if (op.tipo === 'compra') {
      posCusto += op.valorTotal + op.taxas
      posQtd += op.quantidade
      const cm = posQtd > 0 ? posCusto / posQtd : 0
      return { custoMedioNaData: cm, ganhoPerda: null }
    } else {
      const custoVenda = (posCusto / posQtd) * op.quantidade
      const ganhoPerda = op.valorTotal - op.taxas - custoVenda
      posCusto = Math.max(0, posCusto - custoVenda)
      posQtd = Math.max(0, posQtd - op.quantidade)
      const cm = posQtd > 0 ? posCusto / posQtd : 0
      return { custoMedioNaData: cm, ganhoPerda }
    }
  })
}

describe('Custo Médio Ponderado', () => {
  test('compra simples — custo médio igual ao preço + taxa / qtd', () => {
    const ops: Operacao[] = [
      { tipo: 'compra', quantidade: 100, valorTotal: 2850, taxas: 5 },
    ]
    const resultado = calcularCustoMedio(ops)
    // custo médio = (2850 + 5) / 100 = 28.55
    expect(resultado[0].custoMedioNaData).toBeCloseTo(28.55)
    expect(resultado[0].ganhoPerda).toBeNull()
  })

  test('duas compras — custo médio ponderado correto', () => {
    const ops: Operacao[] = [
      { tipo: 'compra', quantidade: 100, valorTotal: 2000, taxas: 0 }, // R$20/ação
      { tipo: 'compra', quantidade: 100, valorTotal: 3000, taxas: 0 }, // R$30/ação
    ]
    const resultado = calcularCustoMedio(ops)
    // Após 2ª compra: (2000 + 3000) / 200 = R$25/ação
    expect(resultado[1].custoMedioNaData).toBeCloseTo(25)
  })

  test('compra e venda — ganho de capital calculado corretamente', () => {
    const ops: Operacao[] = [
      { tipo: 'compra', quantidade: 100, valorTotal: 2000, taxas: 0 }, // R$20/ação
      { tipo: 'venda', quantidade: 50,  valorTotal: 1500, taxas: 0 }, // R$30/ação → lucro R$500
    ]
    const resultado = calcularCustoMedio(ops)
    // ganho = 1500 - (20 × 50) - 0 = 500
    expect(resultado[1].ganhoPerda).toBeCloseTo(500)
  })

  test('venda com prejuízo', () => {
    const ops: Operacao[] = [
      { tipo: 'compra', quantidade: 100, valorTotal: 3000, taxas: 0 }, // R$30/ação
      { tipo: 'venda', quantidade: 100, valorTotal: 2000, taxas: 0 }, // R$20/ação → prejuízo R$1000
    ]
    const resultado = calcularCustoMedio(ops)
    expect(resultado[1].ganhoPerda).toBeCloseTo(-1000)
  })

  test('venda desconta taxas do resultado', () => {
    const ops: Operacao[] = [
      { tipo: 'compra', quantidade: 100, valorTotal: 2000, taxas: 0 },
      { tipo: 'venda', quantidade: 100, valorTotal: 2500, taxas: 10 }, // taxas reduzem o ganho
    ]
    const resultado = calcularCustoMedio(ops)
    // ganho = 2500 - 10 - 2000 = 490
    expect(resultado[1].ganhoPerda).toBeCloseTo(490)
  })

  test('compra inclui taxas no custo médio', () => {
    const ops: Operacao[] = [
      { tipo: 'compra', quantidade: 100, valorTotal: 2000, taxas: 100 }, // R$21/ação após taxas
      { tipo: 'venda', quantidade: 100, valorTotal: 2100, taxas: 0 },
    ]
    const resultado = calcularCustoMedio(ops)
    // custo médio = (2000+100)/100 = R$21
    // ganho = 2100 - 0 - 2100 = 0
    expect(resultado[0].custoMedioNaData).toBeCloseTo(21)
    expect(resultado[1].ganhoPerda).toBeCloseTo(0)
  })

  test('posição zerada após venda total', () => {
    const ops: Operacao[] = [
      { tipo: 'compra', quantidade: 50, valorTotal: 1000, taxas: 0 },
      { tipo: 'venda', quantidade: 50, valorTotal: 1200, taxas: 0 },
    ]
    const resultado = calcularCustoMedio(ops)
    // Após vender tudo, custo médio deve ser 0
    expect(resultado[1].custoMedioNaData).toBe(0)
  })

  test('sequência de compras parciais e venda parcial', () => {
    const ops: Operacao[] = [
      { tipo: 'compra', quantidade: 100, valorTotal: 1000, taxas: 0 }, // R$10
      { tipo: 'compra', quantidade: 200, valorTotal: 2400, taxas: 0 }, // R$12 → CM = (1000+2400)/300 = R$11.33
      { tipo: 'venda', quantidade: 150, valorTotal: 2100, taxas: 0 },  // R$14 → ganho = 2100 - 11.33×150
    ]
    const resultado = calcularCustoMedio(ops)
    const cmEsperado = 3400 / 300
    expect(resultado[1].custoMedioNaData).toBeCloseTo(cmEsperado)
    const ganhoEsperado = 2100 - cmEsperado * 150
    expect(resultado[2].ganhoPerda).toBeCloseTo(ganhoEsperado)
  })
})

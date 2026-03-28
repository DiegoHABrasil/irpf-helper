/**
 * Testes unitários para as regras de mapeamento IRPF.
 * Verifica que o mapeamento determinístico de ativos → grupos/códigos está correto.
 */

import {
  IRPF_BENS_DIREITOS,
  IRPF_RENDIMENTOS_ISENTOS,
  IRPF_RENDIMENTOS_EXCLUSIVOS,
} from '@/lib/irpf/constants'

describe('IRPF_BENS_DIREITOS — grupos e códigos', () => {
  test('ação → grupo 03, código 01', () => {
    expect(IRPF_BENS_DIREITOS.acao).toMatchObject({ grupo: '03', codigo: '01' })
  })

  test('FII → grupo 07, código 03', () => {
    expect(IRPF_BENS_DIREITOS.fii).toMatchObject({ grupo: '07', codigo: '03' })
  })

  test('ETF → grupo 07, código 09', () => {
    expect(IRPF_BENS_DIREITOS.etf).toMatchObject({ grupo: '07', codigo: '09' })
  })

  test('CDB → grupo 04, código 02', () => {
    expect(IRPF_BENS_DIREITOS.cdb).toMatchObject({ grupo: '04', codigo: '02' })
  })

  test('LCI → grupo 04, código 02', () => {
    expect(IRPF_BENS_DIREITOS.lci).toMatchObject({ grupo: '04', codigo: '02' })
  })

  test('Tesouro Direto → grupo 04, código 01', () => {
    expect(IRPF_BENS_DIREITOS.tesouro_direto).toMatchObject({ grupo: '04', codigo: '01' })
  })

  test('Poupança → grupo 04, código 01', () => {
    expect(IRPF_BENS_DIREITOS.poupanca).toMatchObject({ grupo: '04', codigo: '01' })
  })
})

describe('IRPF_RENDIMENTOS_ISENTOS — tipos', () => {
  test('dividendo de ação → tipo 09', () => {
    expect(IRPF_RENDIMENTOS_ISENTOS.dividendo_acao.tipo).toBe('09')
  })

  test('dividendo de FII → tipo 26', () => {
    expect(IRPF_RENDIMENTOS_ISENTOS.dividendo_fii.tipo).toBe('26')
  })

  test('rendimento LCI → tipo 12', () => {
    expect(IRPF_RENDIMENTOS_ISENTOS.rendimento_lci.tipo).toBe('12')
  })

  test('rendimento LCA → tipo 12', () => {
    expect(IRPF_RENDIMENTOS_ISENTOS.rendimento_lca.tipo).toBe('12')
  })

  test('rendimento CRI → tipo 12', () => {
    expect(IRPF_RENDIMENTOS_ISENTOS.rendimento_cri.tipo).toBe('12')
  })

  test('rendimento CRA → tipo 12', () => {
    expect(IRPF_RENDIMENTOS_ISENTOS.rendimento_cra.tipo).toBe('12')
  })

  test('rendimento poupança → tipo 12', () => {
    expect(IRPF_RENDIMENTOS_ISENTOS.rendimento_poupanca.tipo).toBe('12')
  })

  test('debênture incentivada → tipo 12', () => {
    expect(IRPF_RENDIMENTOS_ISENTOS.rendimento_debenture_incentivada.tipo).toBe('12')
  })

  test('lucro venda ≤ R$20k → tipo 20', () => {
    expect(IRPF_RENDIMENTOS_ISENTOS.lucro_venda_abaixo_20k.tipo).toBe('20')
  })
})

describe('IRPF_RENDIMENTOS_EXCLUSIVOS — tipos', () => {
  test('JCP → tipo 10', () => {
    expect(IRPF_RENDIMENTOS_EXCLUSIVOS.jcp.tipo).toBe('10')
  })

  test('rendimento CDB → tipo 06', () => {
    expect(IRPF_RENDIMENTOS_EXCLUSIVOS.rendimento_cdb.tipo).toBe('06')
  })

  test('rendimento Tesouro → tipo 06', () => {
    expect(IRPF_RENDIMENTOS_EXCLUSIVOS.rendimento_tesouro.tipo).toBe('06')
  })
})

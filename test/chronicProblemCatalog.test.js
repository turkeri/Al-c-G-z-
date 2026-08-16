import test from 'node:test'
import assert from 'node:assert/strict'
import { loadSourceModule, closeSourceLoader } from './helpers/viteModuleLoader.js'

const service = await loadSourceModule('/src/services/chronicProblemService.js')
test.after(() => closeSourceLoader())

function mockFetch(problemItems) {
  return async (url) => {
    const path = String(url)
    if (path.endsWith('/catalog/meta')) {
      return new Response(JSON.stringify({ available: true, revision: 'r1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    if (path.includes('/catalog/problems')) {
      return new Response(JSON.stringify({ items: problemItems }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }
}

test('canonical problems are used when a variantId resolves real rows, with Turkish risk labels', async () => {
  const old = globalThis.fetch
  globalThis.fetch = mockFetch([
    { id: 'p1', title: 'Turbo aktüatör arızası', description: 'Boost basıncı dalgalanabilir', severity: 'high', confidence: 'medium' },
    { id: 'p2', title: 'EGR valfi tıkanması', description: 'Rölantide titreme', severity: 'unknown', confidence: 'low' }
  ])
  try {
    const result = await service.assessChronicRiskWithCatalog(
      { brand: 'TestMarka', model: 'TestModel', km: '100000' },
      { variantId: 'variant:1' }
    )
    assert.equal(result.source, 'canonical')
    assert.match(result.notice, /kesin arıza iddiası değil/)
    const titles = result.items.map((i) => i.title)
    assert.ok(titles.includes('Turbo aktüatör arızası'))
    assert.ok(titles.includes('EGR valfi tıkanması'))
    const high = result.items.find((i) => i.title === 'Turbo aktüatör arızası')
    assert.equal(high.risk, 'Yüksek')
    const unknown = result.items.find((i) => i.title === 'EGR valfi tıkanması')
    assert.equal(unknown.risk, 'Orta') // bilinmeyen şiddet düşük değil, nötr sayılır
  } finally {
    globalThis.fetch = old
  }
})

test('empty canonical result falls back to the legacy engine-based calculation', async () => {
  const old = globalThis.fetch
  globalThis.fetch = mockFetch([])
  try {
    const result = await service.assessChronicRiskWithCatalog(
      { brand: 'Volkswagen', model: 'Golf', engine: '1.6 TDI', km: '150000', fuelType: 'Dizel', transmission: 'Manuel' },
      { variantId: 'variant:1' }
    )
    assert.ok(result === null || result.source === 'legacy')
  } finally {
    globalThis.fetch = old
  }
})

test('network failure during canonical lookup falls back to legacy without throwing', async () => {
  const old = globalThis.fetch
  globalThis.fetch = async (url) => {
    if (String(url).endsWith('/catalog/meta')) {
      return new Response(JSON.stringify({ available: true, revision: 'r1' }), { status: 200 })
    }
    throw new Error('network down')
  }
  try {
    const result = await service.assessChronicRiskWithCatalog(
      { brand: 'Volkswagen', model: 'Golf', engine: '1.6 TDI', km: '150000', fuelType: 'Dizel', transmission: 'Manuel' },
      { variantId: 'variant:1' }
    )
    assert.ok(result === null || result.source === 'legacy')
  } finally {
    globalThis.fetch = old
  }
})

test('without variantId or generationId, the legacy path is used directly', async () => {
  const old = globalThis.fetch
  let called = false
  globalThis.fetch = async () => {
    called = true
    return new Response(JSON.stringify({ available: false }), { status: 200 })
  }
  try {
    await service.assessChronicRiskWithCatalog({ brand: 'Volkswagen', model: 'Golf', km: '10000' }, {})
    assert.equal(called, false)
  } finally {
    globalThis.fetch = old
  }
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { loadSourceModule, closeSourceLoader } from './helpers/viteModuleLoader.js'

const service = await loadSourceModule('/src/services/catalogService.js')
test.after(() => closeSourceLoader())

function mockFetch(variant) {
  return async (url) => {
    const path = String(url)
    if (path.endsWith('/catalog/meta')) {
      return new Response(JSON.stringify({ available: true, revision: 'r1' }), { status: 200 })
    }
    if (/\/catalog\/variants\/[^/]+$/.test(path)) {
      return new Response(JSON.stringify(variant), { status: 200 })
    }
    return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }
}

test('canonical package equipment is grouped by availability, unknown kept separate from unavailable', async () => {
  const old = globalThis.fetch
  globalThis.fetch = mockFetch({
    id: 'variant:1',
    package_id: 'pkg:1',
    package_name: 'Elegance',
    equipment: [
      { id: 'e1', display_name: 'LED far', category: 'Aydınlatma', availability: 'standard' },
      { id: 'e2', display_name: 'Deri döşeme', category: 'Konfor', availability: 'standard' },
      { id: 'e3', display_name: 'Panoramik tavan', category: 'Konfor', availability: 'optional' },
      { id: 'e4', display_name: 'Geri görüş kamerası', category: 'Sürüş destek', availability: 'unavailable' },
      { id: 'e5', display_name: 'Kablosuz şarj', category: 'Multimedya', availability: 'unknown' }
    ]
  })
  try {
    const detail = await service.describePackageWithCatalog({ variantId: 'variant:1' })
    assert.equal(detail.source, 'canonical')
    assert.equal(detail.name, 'Elegance')
    const standardLabels = detail.includesDetail.flatMap((g) => g.items.map((i) => i.label))
    assert.deepEqual(standardLabels.sort(), ['Deri döşeme', 'LED far'])
    assert.deepEqual(detail.optionalDetail.map((i) => i.label), ['Panoramik tavan'])
    assert.deepEqual(detail.excludesDetail.map((i) => i.label), ['Geri görüş kamerası'])
    // unknown, ne "var" (includes/optional) ne "yok" (excludes) listesine karışır.
    assert.deepEqual(detail.unknownDetail.map((i) => i.label), ['Kablosuz şarj'])
  } finally {
    globalThis.fetch = old
  }
})

test('variant without a package falls back to the local static package match', async () => {
  const old = globalThis.fetch
  globalThis.fetch = mockFetch({ id: 'variant:2', package_id: null })
  try {
    const detail = await service.describePackageWithCatalog({
      variantId: 'variant:2',
      brand: 'Volkswagen',
      model: 'Golf',
      year: '2015',
      packageName: 'Comfortline'
    })
    assert.ok(!detail || detail.source === 'legacy')
  } finally {
    globalThis.fetch = old
  }
})

test('network failure during canonical variant lookup falls back to legacy without throwing', async () => {
  const old = globalThis.fetch
  globalThis.fetch = async (url) => {
    if (String(url).endsWith('/catalog/meta')) return new Response(JSON.stringify({ available: true, revision: 'r1' }), { status: 200 })
    throw new Error('network down')
  }
  try {
    const detail = await service.describePackageWithCatalog({
      variantId: 'variant:1',
      brand: 'Volkswagen',
      model: 'Golf',
      year: '2015',
      packageName: 'Comfortline'
    })
    assert.ok(!detail || detail.source === 'legacy')
  } finally {
    globalThis.fetch = old
  }
})

test('without variantId, the local static package match is used directly', async () => {
  const old = globalThis.fetch
  let called = false
  globalThis.fetch = async () => {
    called = true
    return new Response(JSON.stringify({ available: false }), { status: 200 })
  }
  try {
    await service.describePackageWithCatalog({ brand: 'Volkswagen', model: 'Golf', year: '2015' })
    assert.equal(called, false)
  } finally {
    globalThis.fetch = old
  }
})

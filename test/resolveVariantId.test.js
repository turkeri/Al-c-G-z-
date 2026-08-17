import test from 'node:test'
import assert from 'node:assert/strict'
import { loadSourceModule, closeSourceLoader } from './helpers/viteModuleLoader.js'

const adapter = await loadSourceModule('/src/services/catalogAdapter.js')
test.after(() => closeSourceLoader())

function mockFetch({ generations, engines, variants }) {
  return async (url) => {
    const path = String(url)
    if (path.endsWith('/catalog/meta')) {
      return new Response(JSON.stringify({ available: true, revision: 'r1' }), { status: 200 })
    }
    if (path.includes('/catalog/brands')) {
      return new Response(JSON.stringify({ items: [{ id: 'brand:1', display_name: 'TestMarka' }] }), { status: 200 })
    }
    if (path.includes('/catalog/models')) {
      return new Response(JSON.stringify({ items: [{ id: 'model:1', display_name: 'TestModel' }] }), { status: 200 })
    }
    if (path.includes('/catalog/generations')) {
      return new Response(JSON.stringify({ items: generations }), { status: 200 })
    }
    if (path.includes('/catalog/engines')) {
      return new Response(JSON.stringify({ items: engines }), { status: 200 })
    }
    if (path.includes('/catalog/variants')) {
      return new Response(JSON.stringify({ items: variants }), { status: 200 })
    }
    return new Response(JSON.stringify({ items: [] }), { status: 200 })
  }
}

test('resolves a variantId from free-text fields when brand/model/engine and a single generation match', async () => {
  const old = globalThis.fetch
  globalThis.fetch = mockFetch({
    generations: [{ id: 'gen:1', display_name: 'Nesil', year_start: 2015, year_end: 2020 }],
    engines: [{ id: 'engine:1', display_name: '1.6 TDI' }],
    variants: [{ id: 'variant:1', engine_id: 'engine:1' }]
  })
  try {
    const id = await adapter.resolveVariantId({ brand: 'TestMarka', model: 'TestModel', year: '2018', engine: '1.6 TDI' })
    assert.equal(id, 'variant:1')
  } finally {
    globalThis.fetch = old
  }
})

test('picks the generation whose year range contains the vehicle year among several', async () => {
  const old = globalThis.fetch
  globalThis.fetch = mockFetch({
    generations: [
      { id: 'gen:old', display_name: 'Eski', year_start: 2005, year_end: 2011 },
      { id: 'gen:new', display_name: 'Yeni', year_start: 2012, year_end: 2018 }
    ],
    engines: [{ id: 'engine:2', display_name: '2.0 TDI' }],
    variants: [{ id: 'variant:2', engine_id: 'engine:2' }]
  })
  try {
    const id = await adapter.resolveVariantId({ brand: 'TestMarka', model: 'TestModel', year: '2015', engine: '2.0 TDI' })
    assert.equal(id, 'variant:2')
  } finally {
    globalThis.fetch = old
  }
})

test('ambiguous generation (year matches none, more than one exists) resolves to empty rather than guessing', async () => {
  const old = globalThis.fetch
  globalThis.fetch = mockFetch({
    generations: [
      { id: 'gen:a', display_name: 'A', year_start: 2005, year_end: 2011 },
      { id: 'gen:b', display_name: 'B', year_start: 2012, year_end: 2018 }
    ],
    engines: [],
    variants: []
  })
  try {
    const id = await adapter.resolveVariantId({ brand: 'TestMarka', model: 'TestModel', year: '2030', engine: '2.0 TDI' })
    assert.equal(id, '')
  } finally {
    globalThis.fetch = old
  }
})

test('no matching engine in the resolved generation resolves to empty', async () => {
  const old = globalThis.fetch
  globalThis.fetch = mockFetch({
    generations: [{ id: 'gen:1', display_name: 'Nesil', year_start: 2015, year_end: 2020 }],
    engines: [{ id: 'engine:1', display_name: '1.6 TDI' }],
    variants: [{ id: 'variant:1', engine_id: 'engine:1' }]
  })
  try {
    const id = await adapter.resolveVariantId({ brand: 'TestMarka', model: 'TestModel', year: '2018', engine: 'Uyumsuz Motor' })
    assert.equal(id, '')
  } finally {
    globalThis.fetch = old
  }
})

test('network failure never throws, resolves to empty', async () => {
  const old = globalThis.fetch
  globalThis.fetch = async (url) => {
    if (String(url).endsWith('/catalog/meta')) return new Response(JSON.stringify({ available: true, revision: 'r1' }), { status: 200 })
    throw new Error('network down')
  }
  try {
    const id = await adapter.resolveVariantId({ brand: 'TestMarka', model: 'TestModel', year: '2018', engine: '1.6 TDI' })
    assert.equal(id, '')
  } finally {
    globalThis.fetch = old
  }
})

test('missing required fields short-circuits without any network call', async () => {
  const old = globalThis.fetch
  let called = false
  globalThis.fetch = async () => { called = true; return new Response(JSON.stringify({ available: false }), { status: 200 }) }
  try {
    assert.equal(await adapter.resolveVariantId({ brand: 'TestMarka', model: '', year: '2018', engine: '1.6 TDI' }), '')
    assert.equal(await adapter.resolveVariantId({ brand: 'TestMarka', model: 'TestModel', year: '2018', engine: '' }), '')
    assert.equal(called, false)
  } finally {
    globalThis.fetch = old
  }
})

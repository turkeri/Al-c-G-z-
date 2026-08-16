import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { closeSourceLoader, loadSourceModule } from './helpers/viteModuleLoader.js'

after(closeSourceLoader)

test('catalog cross-references are internally consistent', async () => {
  const { validateCatalog, getCatalogStats } = await loadSourceModule('/src/data/catalog/index.js')
  const validation = validateCatalog()

  assert.equal(validation.ok, true, JSON.stringify(validation))
  assert.ok(getCatalogStats().modelCount > 0)
  assert.ok(getCatalogStats().engineCount > 0)
  assert.ok(getCatalogStats().transmissionCount > 0)
})

test('generation, engine and transmission matching returns a known VAG profile', async () => {
  const { getGeneration, matchEngine, matchTransmission } = await loadSourceModule('/src/data/catalog/index.js')

  const generation = getGeneration('Volkswagen', 'Golf', 2017)
  const engine = matchEngine('Audi', '1.6 TDI', { fuel: 'Dizel', year: 2017 })
  const transmission = matchTransmission('DSG', { brand: 'Audi', year: 2017 })

  assert.ok(generation)
  assert.ok(generation.generation)
  assert.equal(generation.generation.code, 'Mk7 (5G)')
  assert.ok(engine)
  assert.equal(engine.fuel, 'Dizel')
  assert.ok(transmission)
  assert.match(transmission.name, /DSG/i)
})

test('engine matcher declines a fuel-conflicting profile', async () => {
  const { matchEngine } = await loadSourceModule('/src/data/catalog/index.js')
  const engine = matchEngine('Audi', '1.6 TDI', { fuel: 'Benzin', year: 2017 })
  assert.equal(engine, null)
})

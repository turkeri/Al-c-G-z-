import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { closeSourceLoader, loadSourceModule } from './helpers/viteModuleLoader.js'

after(closeSourceLoader)

test('listing text parser extracts explicit fields without inventing values', async () => {
  const { parseListingText } = await loadSourceModule('/src/services/listingParserService.js')
  const parsed = parseListingText(
    '2017 Audi A3 Sportback Dynamic 1.6 TDI DSG Dizel 142.000 km 1.420.000 TL'
  )

  assert.equal(parsed.brand, 'Audi')
  assert.equal(parsed.model, 'A3')
  assert.equal(parsed.year, '2017')
  assert.equal(parsed.engine, '1.6 TDI')
  assert.equal(parsed.km, '142000')
  assert.equal(parsed.price, '1420000')
  assert.equal(parsed.transmission, 'DSG')
})

test('engine hint supports a commercial diesel designation', async () => {
  const { extractEngineHint } = await loadSourceModule('/src/services/listingParserService.js')
  assert.equal(extractEngineHint('BMW 320d otomatik'), '320d')
})

test('empty listing text produces no inferred vehicle data', async () => {
  const { parseListingText } = await loadSourceModule('/src/services/listingParserService.js')
  assert.deepEqual(parseListingText(''), {})
})

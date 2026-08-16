import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ENTITY_LIST_CONFIG,
  buildEntityUrlParams,
  filterFieldMeta,
  filtersFor,
  mergeEntityItems,
  parseEntityFilters
} from '../src/services/catalogEntityListUi.js'

test('all fourteen catalog entities declare a filter allowlist', () => {
  const expected = [
    'brands', 'models', 'generations', 'engines', 'transmissions', 'packages', 'equipment',
    'vehicleVariants', 'problemArchetypes', 'problemApplicability', 'maintenanceItems',
    'maintenanceApplicability', 'referenceValues', 'valuationFactors'
  ]
  assert.deepEqual(Object.keys(ENTITY_LIST_CONFIG).sort(), expected.sort())
  for (const entity of expected) assert.ok(filtersFor(entity).length > 0, entity)
})

test('unknown entities and fields degrade to safe empty results', () => {
  assert.deepEqual(filtersFor('not-a-real-entity'), [])
  assert.deepEqual(parseEntityFilters('not-a-real-entity', { q: 'x', brand_id: 'y' }), { q: 'x', filters: {} })
})

test('filter field metadata is derived from the shared entity form definitions', () => {
  assert.deepEqual(filterFieldMeta('brands', 'source_confidence'), { label: 'Confidence', type: 'confidence' })
  assert.deepEqual(filterFieldMeta('models', 'brand_id'), { label: 'Marka', type: 'parent:brands' })
  assert.deepEqual(filterFieldMeta('problemApplicability', 'evidence_status'), { label: 'Kanıt durumu', type: 'evidence' })
  // referenceValues.currency ENTITY_FORMS'ta yok; tek elle tanımlı istisna devreye girer.
  assert.deepEqual(filterFieldMeta('referenceValues', 'currency'), { label: 'Para birimi', type: 'text' })
  // Karşılığı hiç olmayan bir alan için düz metin varsayılanına düşer, hata fırlatmaz.
  assert.deepEqual(filterFieldMeta('brands', 'unmapped_field'), { label: 'unmapped_field', type: 'text' })
})

test('URLSearchParams and plain objects both work as filter sources; empty and unknown keys are dropped', () => {
  const params = new URLSearchParams({ q: '  golf  ', brand_id: 'brand:1', bogus: 'ignored', active: '' })
  assert.deepEqual(parseEntityFilters('models', params), { q: 'golf', filters: { brand_id: 'brand:1' } })
  assert.deepEqual(parseEntityFilters('models', { q: 'x', active: '1' }), { q: 'x', filters: { active: '1' } })
})

test('writing filters back to the URL drops empty values and fields outside the entity allowlist', () => {
  const params = buildEntityUrlParams('models', { q: 'audi', filters: { brand_id: 'brand:1', active: '', bogus: 'x' } })
  assert.equal(params.toString(), 'q=audi&brand_id=brand%3A1')
  assert.equal(buildEntityUrlParams('models', {}).toString(), '')
})

test('cursor pagination never adds the same entity row twice', () => {
  const page1 = [{ id: 'a' }, { id: 'b' }]
  const page2 = [{ id: 'b' }, { id: 'c' }]
  assert.deepEqual(mergeEntityItems(page1, page2).map((i) => i.id), ['a', 'b', 'c'])
})

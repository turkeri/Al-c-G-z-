import test from 'node:test'
import assert from 'node:assert/strict'
import { dismiss, isDismissed, normalizeAnnouncements } from '../src/services/announcementsService.js'

function storage(value = '{}') { return { getItem: () => value, setItem: (_key, next) => { value = next } } }
test('public announcements normalize only safe valid fields', () => {
  const [item] = normalizeAnnouncements({ items: [{ id: 'a', title: 'Başlık', message: '<script>x</script>', version: 2, created_by: 'no', updated_by: 'no' }, { title: 'bad', message: 'x', version: 1 }] })
  assert.deepEqual(item, { id: 'a', title: 'Başlık', message: '<script>x</script>', starts_at: null, ends_at: null, version: 2, updated_at: null })
})
test('dismissal uses id and version and survives broken storage', () => {
  const old = globalThis.localStorage; globalThis.localStorage = storage('bad-json')
  try { const one = { id: 'a', version: 1 }; dismiss(one); assert.equal(isDismissed(one), true); assert.equal(isDismissed({ id: 'a', version: 2 }), false) } finally { globalThis.localStorage = old }
})

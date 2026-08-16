import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { announcementDates } from '../server/cloudflare-worker/admin.js'

test('announcement dates accept a valid range', () => assert.deepEqual(announcementDates({ starts_at: 100, ends_at: 200 }), { startsAt: 100, endsAt: 200 }))
test('announcement dates reject invalid start', () => assert.equal(announcementDates({ starts_at: 'x' }), null))
test('announcement dates reject invalid end', () => assert.equal(announcementDates({ ends_at: 'x' }), null))
test('announcement dates reject equal boundaries', () => assert.equal(announcementDates({ starts_at: 100, ends_at: 100 }), null))
test('announcement dates reject descending boundaries', () => assert.equal(announcementDates({ starts_at: 200, ends_at: 100 }), null))
test('announcement dates accept only a start boundary', () => assert.deepEqual(announcementDates({ starts_at: 100 }), { startsAt: 100, endsAt: null }))
test('announcement dates accept only an end boundary', () => assert.deepEqual(announcementDates({ ends_at: 100 }), { startsAt: null, endsAt: 100 }))
test('announcement routes reject malformed IDs for update and publish', async () => {
  const source = await readFile(new URL('../server/cloudflare-worker/worker.js', import.meta.url), 'utf8')
  assert.match(source, /Geçersiz duyuru kimliği/)
  assert.match(source, /publish\|archive\|unpublish/)
})
test('archived announcements cannot be published again', async () => {
  const source = await readFile(new URL('../server/cloudflare-worker/worker.js', import.meta.url), 'utf8')
  assert.match(source, /current\.status === 'archived' && next !== 'archived'/)
  assert.match(source, /Arşivlenmiş duyuru yeniden yayınlanamaz/)
})

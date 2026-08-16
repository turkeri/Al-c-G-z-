import test from 'node:test'
import assert from 'node:assert/strict'
import { linkDeviceData, validDeviceId } from '../server/cloudflare-worker/ownership.js'

const DEVICE = '3b42a7bb-c66b-4c0b-a193-4ed89e1b0d23'
const auth = { userId: 'supabase-subject-a', email: 'fixture@example.test' }

function database({ linkedTo = null, prior = null } = {}) {
  const calls = []
  return {
    calls,
    prepare(sql) {
      const call = { sql, params: [] }
      calls.push(call)
      return {
        bind(...params) {
          call.params = params
          return {
            first: async () => {
              if (/FROM users WHERE auth_subject/i.test(sql)) return { id: 'internal-user-a' }
              if (/FROM device_links/i.test(sql)) return linkedTo ? { user_id: linkedTo } : null
              if (/FROM device_link_transfers/i.test(sql)) return prior
              return null
            },
            all: async () => /FROM analysis_history/i.test(sql) ? { results: [{ id: 'history-1' }] } : { results: [] },
            run: async () => ({ success: true })
          }
        }
      }
    },
    batch: async (statements) => { calls.push({ batch: statements }) }
  }
}

test('device id must be a non-empty UUID', () => {
  assert.equal(validDeviceId(DEVICE), DEVICE)
  assert.equal(validDeviceId(''), null)
  assert.equal(validDeviceId('x'.repeat(500)), null)
  assert.equal(validDeviceId('not-a-device'), null)
})

test('linking uses verified auth subject and records each local data type once', async () => {
  const DB = database()
  const result = await linkDeviceData({ DB }, auth, {
    device_id: DEVICE,
    user_id: 'spoofed-user',
    favorites: [{ id: 'fav-1' }],
    garage: [{ id: 'garage-1' }],
    expertise_notes: [{ id: 'note-1' }],
    history: [{ id: 'local-history-1' }]
  })
  assert.deepEqual(result.counts, { history: 2, favorites: 1, garage: 1, expertiseNotes: 1 })
  assert.equal(result.idempotent, false)
  const inserts = DB.calls.find((call) => call.batch).batch
  assert.ok(inserts.length >= 6)
  assert.ok(DB.calls.every((call) => !String(call.sql).includes('spoofed-user')))
})

test('a device already linked to another user is never taken over', async () => {
  const result = await linkDeviceData({ DB: database({ linkedTo: 'other-user' }) }, auth, { device_id: DEVICE })
  assert.equal(result.status, 409)
})

test('repeated transfer returns its original result without duplicate batch', async () => {
  const DB = database({ prior: { user_id: 'internal-user-a', result_json: JSON.stringify({ history: 1, favorites: 2, garage: 0, expertiseNotes: 3 }) } })
  const result = await linkDeviceData({ DB }, auth, { device_id: DEVICE })
  assert.equal(result.idempotent, true)
  assert.deepEqual(result.counts, { history: 1, favorites: 2, garage: 0, expertiseNotes: 3 })
  assert.equal(DB.calls.some((call) => call.batch), false)
})

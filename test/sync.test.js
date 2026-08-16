import test from 'node:test'
import assert from 'node:assert/strict'
import { pullSync, pushSync, validOperation } from '../server/cloudflare-worker/sync.js'

const DEVICE = '3b42a7bb-c66b-4c0b-a193-4ed89e1b0d23'
const ID = '11111111-1111-4111-8111-111111111111'
const OP = '22222222-2222-4222-8222-222222222222'

test('sync operation rejects spoofed user ids and invalid UUIDs', () => {
  assert.equal(validOperation({ operationId: OP, id: ID, type: 'favorites', action: 'upsert', device_id: DEVICE }), true)
  assert.equal(validOperation({ operationId: OP, id: 'bad', type: 'favorites', action: 'upsert', device_id: DEVICE }), false)
  assert.equal(validOperation({ operationId: OP, id: ID, user_id: 'spoofed', type: 'favorites', action: 'upsert', device_id: DEVICE }), false)
})

test('sync enforces batch size before database work', async () => {
  const result = await pushSync({}, 'user-a', Array.from({ length: 51 }, () => ({})))
  assert.equal(result.status, 400)
})

test('cursor query is scoped to owner and orders by cursor tuple', async () => {
  let params
  const env = { DB: { prepare(sql) { return { bind(...args) { params = { sql, args }; return { all: async () => ({ results: [] }) } } } } } }
  const result = await pullSync(env, 'user-a', null, 20)
  assert.deepEqual(result.items, [])
  assert.match(params.sql, /user_id=\?1/)
  assert.match(params.sql, /updated_at=\?2 AND id>\?3/)
  assert.equal(params.args[0], 'user-a')
})

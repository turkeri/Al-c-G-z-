import test from 'node:test'
import assert from 'node:assert/strict'
import worker from '../server/cloudflare-worker/worker.js'

const DEVICE_ID = '3b42a7bb-c66b-4c0b-a193-4ed89e1b0d23'

test('DELETE /history removes only the requesting device history', async () => {
  const calls = []
  const env = {
    DB: {
      prepare(sql) {
        calls.push({ sql, params: [] })
        return {
          bind(...params) {
            calls.at(-1).params = params
            return { run: async () => ({ success: true }) }
          }
        }
      }
    }
  }
  const request = new Request('https://worker.example/history', {
    method: 'DELETE',
    headers: { 'X-Device-Id': DEVICE_ID }
  })

  const response = await worker.fetch(request, env)

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { ok: true })
  assert.match(calls[0].sql, /DELETE FROM analysis_history/i)
  assert.deepEqual(calls[0].params, [DEVICE_ID])
})

test('DELETE /history requires a valid device id', async () => {
  const response = await worker.fetch(
    new Request('https://worker.example/history', { method: 'DELETE' }),
    { DB: {} }
  )

  assert.equal(response.status, 400)
})

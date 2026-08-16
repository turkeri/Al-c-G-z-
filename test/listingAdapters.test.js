import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveInput } from '../server/cloudflare-worker/listing/adapters.js'

test('listing resolver only accepts a supported HTTPS host', () => {
  const valid = resolveInput('https://www.sahibinden.com/ilan/otomobil/1234567890/detay')
  assert.equal(valid.ok, true)
  assert.equal(valid.adapter.id, 'sahibinden')

  const insecure = resolveInput('http://www.sahibinden.com/ilan/1234567890/detay')
  assert.equal(insecure.ok, false)

  const internal = resolveInput('https://127.0.0.1/ilan/1234567890/detay')
  assert.equal(internal.ok, false)
})

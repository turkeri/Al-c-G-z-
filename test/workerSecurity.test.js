import test from 'node:test'
import assert from 'node:assert/strict'
import { MAX_REQUEST_BODY_BYTES, constantTimeEqual, hasAcceptableBodySize } from '../server/cloudflare-worker/security.js'

test('constant-time token comparison accepts only identical values', () => {
  assert.equal(constantTimeEqual('secret-token', 'secret-token'), true)
  assert.equal(constantTimeEqual('secret-token', 'secret-tokeN'), false)
  assert.equal(constantTimeEqual('secret-token', 'secret-token-extra'), false)
})

test('reported body length is rejected before JSON parsing when over limit', () => {
  const withinLimit = new Request('https://worker.example', {
    headers: { 'Content-Length': String(MAX_REQUEST_BODY_BYTES) }
  })
  const tooLarge = new Request('https://worker.example', {
    headers: { 'Content-Length': String(MAX_REQUEST_BODY_BYTES + 1) }
  })
  const malformed = new Request('https://worker.example', {
    headers: { 'Content-Length': '10mb' }
  })

  assert.equal(hasAcceptableBodySize(withinLimit), true)
  assert.equal(hasAcceptableBodySize(tooLarge), false)
  assert.equal(hasAcceptableBodySize(malformed), false)
})

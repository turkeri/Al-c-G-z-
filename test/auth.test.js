import test from 'node:test'
import assert from 'node:assert/strict'
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose'
import worker from '../server/cloudflare-worker/worker.js'
import { authenticateRequest, clearJwksCacheForTests, verifySupabaseJwt } from '../server/cloudflare-worker/auth.js'
import { closeSourceLoader, loadSourceModule } from './helpers/viteModuleLoader.js'

const ISSUER = 'https://test-project.supabase.co/auth/v1'
const PROJECT_URL = 'https://test-project.supabase.co'
const AUDIENCE = 'authenticated'
const now = Math.floor(Date.now() / 1000)
const { privateKey, publicKey } = await generateKeyPair('RS256')
const publicJwk = { ...(await exportJWK(publicKey)), kid: 'test-key', alg: 'RS256', use: 'sig' }
const localResolver = createLocalJWKSet({ keys: [publicJwk] })

async function signedToken(overrides = {}, header = {}) {
  return new SignJWT({ email: 'fixture@example.test', app_metadata: { provider: 'google' }, ...overrides })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key', ...header })
    .setIssuedAt(now)
    .setIssuer(overrides.iss || ISSUER)
    .setAudience(overrides.aud || AUDIENCE)
    .setSubject(overrides.sub || 'user-fixture-1')
    .setExpirationTime(overrides.exp || now + 300)
    .sign(privateKey)
}

const config = { issuer: ISSUER, audience: AUDIENCE, jwksUrl: `${PROJECT_URL}/auth/v1/.well-known/jwks.json` }

test('JWT doğrulaması geçerli fixture kullanıcısını döndürür', async () => {
  const token = await signedToken()
  const result = await verifySupabaseJwt(token, config, localResolver)
  assert.equal(result.payload.sub, 'user-fixture-1')
  assert.equal(result.payload.email, 'fixture@example.test')
})

test('süresi geçmiş, yanlış issuer/audience ve beklenmeyen algoritma reddedilir', async () => {
  const expired = await signedToken({ exp: now - 10 })
  const wrongIssuer = await signedToken({ iss: 'https://attacker.example/auth/v1' })
  const wrongAudience = await signedToken({ aud: 'wrong-audience' })
  const noneAlgorithm = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJhdHRhY2tlciIsImV4cCI6OTk5OTk5OTk5OX0.'
  await assert.rejects(() => verifySupabaseJwt(expired, config, localResolver))
  await assert.rejects(() => verifySupabaseJwt(wrongIssuer, config, localResolver))
  await assert.rejects(() => verifySupabaseJwt(wrongAudience, config, localResolver))
  await assert.rejects(() => verifySupabaseJwt(noneAlgorithm, config, localResolver))
})

test('/auth/me missing or malformed authorization returns 401', async () => {
  const missing = await worker.fetch(new Request('https://worker.example/auth/me'), {})
  const malformed = await worker.fetch(new Request('https://worker.example/auth/me', { headers: { Authorization: 'Bearer not-a-jwt' } }), {
    SUPABASE_URL: PROJECT_URL, SUPABASE_JWT_ISSUER: ISSUER, SUPABASE_JWT_AUDIENCE: AUDIENCE
  })
  assert.equal(missing.status, 401)
  assert.equal(malformed.status, 401)
})

test('/auth/me verified context uses JWT subject, never request body identity fields', async () => {
  const originalFetch = globalThis.fetch
  clearJwksCacheForTests()
  globalThis.fetch = async () => new Response(JSON.stringify({ keys: [publicJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  try {
    const token = await signedToken()
    const response = await worker.fetch(new Request('https://worker.example/auth/me?user_id=attacker&role=admin&plan=premium', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }), { SUPABASE_URL: PROJECT_URL, SUPABASE_JWT_ISSUER: ISSUER, SUPABASE_JWT_AUDIENCE: AUDIENCE })
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { user: { id: 'user-fixture-1', email: 'fixture@example.test', provider: 'google' } })
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
  } finally {
    globalThis.fetch = originalFetch
    clearJwksCacheForTests()
  }
})

test('JWKS network error is controlled and frontend remains unconfigured without env', async () => {
  const originalFetch = globalThis.fetch
  clearJwksCacheForTests()
  globalThis.fetch = async () => { throw new TypeError('fixture network unavailable') }
  try {
    const token = await signedToken()
    const result = await authenticateRequest(new Request('https://worker.example/auth/me', { headers: { Authorization: `Bearer ${token}` } }), {
      SUPABASE_URL: PROJECT_URL, SUPABASE_JWT_ISSUER: ISSUER, SUPABASE_JWT_AUDIENCE: AUDIENCE
    })
    assert.deepEqual(result, { ok: false, status: 503 })
  } finally {
    globalThis.fetch = originalFetch
    clearJwksCacheForTests()
  }

  const module = await loadSourceModule('/src/services/supabaseClient.js')
  assert.equal(module.isSupabaseConfigured, false)
  assert.equal(module.supabase, null)
})

test.after(async () => {
  await closeSourceLoader()
})

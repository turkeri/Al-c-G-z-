import { createRemoteJWKSet, jwtVerify } from 'jose'

const SUPPORTED_ALGORITHMS = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'EdDSA']
const JWKS_CACHE_MS = 10 * 60 * 1000
const JWKS_COOLDOWN_MS = 30 * 1000
const jwksResolvers = new Map()

function normalizedUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    return url.protocol === 'https:' ? url.toString().replace(/\/$/, '') : null
  } catch {
    return null
  }
}

export function getSupabaseAuthConfig(env) {
  const projectUrl = normalizedUrl(env.SUPABASE_URL)
  const issuer = normalizedUrl(env.SUPABASE_JWT_ISSUER)
  const audience = String(env.SUPABASE_JWT_AUDIENCE || '').trim()
  if (!projectUrl || !issuer || !audience) return null
  return {
    issuer,
    audience,
    jwksUrl: `${projectUrl}/auth/v1/.well-known/jwks.json`
  }
}

function resolverFor(config) {
  let resolver = jwksResolvers.get(config.jwksUrl)
  if (!resolver) {
    resolver = createRemoteJWKSet(new URL(config.jwksUrl), {
      cacheMaxAge: JWKS_CACHE_MS,
      cooldownDuration: JWKS_COOLDOWN_MS
    })
    jwksResolvers.set(config.jwksUrl, resolver)
  }
  return resolver
}

export async function verifySupabaseJwt(token, config, keyResolver = resolverFor(config)) {
  return jwtVerify(token, keyResolver, {
    issuer: config.issuer,
    audience: config.audience,
    algorithms: SUPPORTED_ALGORITHMS,
    requiredClaims: ['sub', 'exp']
  })
}

function bearerToken(request) {
  const header = String(request.headers.get('Authorization') || '')
  const match = /^Bearer\s+([^\s]+)$/i.exec(header)
  return match?.[1] || null
}

function publicContext(payload) {
  const provider = typeof payload.app_metadata?.provider === 'string'
    ? payload.app_metadata.provider
    : null
  return {
    userId: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : null,
    provider,
    claims: {
      subject: payload.sub,
      audience: payload.aud,
      issuer: payload.iss,
      expiresAt: payload.exp,
      authenticatedAt: payload.aal || null
    }
  }
}

/**
 * Authorization başlığından güvenilir context üretir. Hata ayrıntıları
 * kullanıcıya döndürülmez; Worker yalnız 401 veya JWKS erişilemiyorsa 503 verir.
 */
export async function authenticateRequest(request, env) {
  const config = getSupabaseAuthConfig(env)
  const token = bearerToken(request)
  if (!config || !token) return { ok: false, status: 401 }

  try {
    const { payload } = await verifySupabaseJwt(token, config)
    return { ok: true, auth: publicContext(payload) }
  } catch (error) {
    // jose'un ağ/JWKS hataları bir auth hatası gibi görünmez; geçici bir
    // sunucu sorunu olarak ele alınır. Kriptografik ayrıntı asla sızmaz.
    const code = String(error?.code || '')
    if (error instanceof TypeError || code === 'ERR_JWKS_TIMEOUT' || code === 'ERR_JWKS_INVALID') {
      return { ok: false, status: 503 }
    }
    return { ok: false, status: 401 }
  }
}

export function clearJwksCacheForTests() {
  jwksResolvers.clear()
}

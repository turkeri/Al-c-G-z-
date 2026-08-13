/**
 * Gelişmiş analiz servisi.
 *
 * İnternet varsa ve proxy adresi yapılandırılmışsa, şikayeti sunucudaki analiz
 * servisine gönderir. Sunucu yoksa, internet yoksa veya istek başarısız olursa
 * sessizce null döner — bu durumda uygulama yerel kural motoruyla çalışmaya
 * devam eder, kullanıcı hiçbir zaman boş ekranla karşılaşmaz.
 *
 * API anahtarı bu dosyada YOKTUR ve olmamalıdır; anahtar yalnızca proxy'de durur.
 */

// Analiz proxy'sinin adresi. Bu bir sır değildir (API anahtarı sunucuda durur),
// bu yüzden varsayılan adres doğrudan burada tutulur — böylece uygulama ek
// yapılandırma gerekmeden derlenip dağıtılabilir.
// Kendi sunucunu kurarsan .env dosyasına VITE_AI_PROXY_URL yazarak burayı ezebilirsin.
const DEFAULT_PROXY_URL = 'https://arac-dedektifi-ai.turkerinurullah.workers.dev'

const PROXY_URL = import.meta.env.VITE_AI_PROXY_URL || DEFAULT_PROXY_URL
// Sunucudaki üst sınırdan (30 sn) biraz uzun tutulur ki hata mesajı
// zaman aşımı yerine sunucudan gelen gerçek nedeni gösterebilsin.
const TIMEOUT_MS = 40000
const CACHE_KEY = 'arac-dedektifi:ai-cache'
const CACHE_LIMIT = 20

export function isAiConfigured() {
  return Boolean(PROXY_URL)
}

export function isOnline() {
  return typeof navigator === 'undefined' ? true : navigator.onLine !== false
}

export function isAiAvailable() {
  return isAiConfigured() && isOnline()
}

function cacheKeyFor(vehicle, complaint) {
  const v = vehicle ? `${vehicle.brand}|${vehicle.model}|${vehicle.engine}` : 'genel'
  return `${v}::${complaint.trim().toLowerCase()}`
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeCache(store) {
  try {
    const entries = Object.entries(store)
    const trimmed = entries.slice(-CACHE_LIMIT)
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(trimmed)))
  } catch {
    // Depolama doluysa önbellek atlanır, kritik değil
  }
}

function getCached(key) {
  const store = readCache()
  return store[key] || null
}

function setCached(key, value) {
  const store = readCache()
  store[key] = value
  writeCache(store)
}

function normalizeResult(raw) {
  if (!raw || typeof raw !== 'object') return null
  const causes = Array.isArray(raw.causes) ? raw.causes : []
  if (!raw.summary && causes.length === 0) return null

  return {
    summary: typeof raw.summary === 'string' ? raw.summary : '',
    causes: causes
      .filter((c) => c && typeof c.cause === 'string')
      .map((c) => ({
        cause: c.cause,
        likelihood: ['Yüksek', 'Orta', 'Düşük'].includes(c.likelihood) ? c.likelihood : 'Orta',
        solution: typeof c.solution === 'string' ? c.solution : '',
        estimatedCost: typeof c.estimatedCost === 'string' ? c.estimatedCost : '',
        urgency: ['Yüksek', 'Orta', 'Düşük'].includes(c.urgency) ? c.urgency : 'Orta'
      })),
    checks: Array.isArray(raw.checks) ? raw.checks.filter((c) => typeof c === 'string') : [],
    askMechanic: Array.isArray(raw.askMechanic)
      ? raw.askMechanic.filter((c) => typeof c === 'string')
      : []
  }
}

/**
 * @returns {Promise<{result: object}|{error: string}|null>}
 *   result -> başarılı analiz
 *   error  -> kullanıcıya gösterilebilecek kısa hata nedeni
 *   null   -> özellik kapalı, sessizce atlanmalı
 */
export async function fetchAiAnalysis({ vehicle, complaint, localFindings }) {
  if (!isAiConfigured()) return null
  if (!complaint || complaint.trim().length < 3) return null

  const key = cacheKeyFor(vehicle, complaint)
  const cached = getCached(key)
  if (cached) return { result: cached, cached: true }

  if (!isOnline()) {
    return { error: 'İnternet bağlantısı yok, yalnızca cihaz içi analiz gösteriliyor.' }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ vehicle, complaint, localFindings })
    })

    if (response.status === 429) {
      return { error: 'Çok fazla istek gönderildi, birkaç dakika sonra tekrar deneyin.' }
    }
    if (!response.ok) {
      return { error: 'Gelişmiş analiz şu an alınamadı, cihaz içi analiz gösteriliyor.' }
    }

    const data = await response.json()
    const normalized = normalizeResult(data?.result)
    if (!normalized) {
      return { error: 'Gelişmiş analiz okunamadı, cihaz içi analiz gösteriliyor.' }
    }

    setCached(key, normalized)
    return { result: normalized }
  } catch (err) {
    if (err?.name === 'AbortError') {
      return { error: 'Gelişmiş analiz zaman aşımına uğradı, cihaz içi analiz gösteriliyor.' }
    }
    return { error: 'Gelişmiş analize ulaşılamadı, cihaz içi analiz gösteriliyor.' }
  } finally {
    clearTimeout(timer)
  }
}

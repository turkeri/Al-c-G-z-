/**
 * Gelişmiş analiz servisi.
 *
 * İnternet varsa ve proxy adresi yapılandırılmışsa, şikayeti sunucudaki analiz
 * servisine gönderir. Sunucu yoksa, internet yoksa veya istek başarısız olursa
 * sessizce null döner — bu durumda uygulama yerel kural motoruyla çalışmaya
 * devam eder, kullanıcı hiçbir zaman boş ekranla karşılaşmaz.
 *
 * API anahtarı bu dosyada YOKTUR ve olmamalıdır; anahtar yalnızca proxy'de durur.
 *
 * Aylık analiz hakkı da burada DEĞİL sunucuda sayılır (bkz. accountService).
 * İstemcide tutulan bir sayaç kolayca sıfırlanacağı için koruma sağlamaz.
 */

import { accountHeaders, setCachedAccount } from './accountService'

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

export const PROXY_BASE_URL = PROXY_URL

export function isAiConfigured() {
  return Boolean(PROXY_URL)
}

export function isOnline() {
  return typeof navigator === 'undefined' ? true : navigator.onLine !== false
}

export function isAiAvailable() {
  return isAiConfigured() && isOnline()
}

function cacheKeyFor(task, payload) {
  const v = payload?.vehicle
    ? `${payload.vehicle.brand}|${payload.vehicle.model}|${payload.vehicle.engine}|${payload.vehicle.year}|${payload.vehicle.km}`
    : ''
  const pair = payload?.first
    ? `${payload.first.brand}|${payload.first.model}|${payload.first.engine}` +
      `::${payload.second?.brand}|${payload.second?.model}|${payload.second?.engine}`
    : ''
  const text = payload?.complaint ? payload.complaint.trim().toLowerCase() : ''

  /*
   * Fotoğraflı istekte anahtar fotoğrafları da içermeli. Aksi halde aynı araç
   * için ikinci kez farklı fotoğraflarla yapılan inceleme, ilkinin önbellekten
   * gelen sonucunu gösterirdi — kullanıcı yeni fotoğraflarının değerlendirildiğini
   * sanırken eski sonucu okurdu.
   */
  const photos = Array.isArray(payload?.photos)
    ? payload.photos.map((p) => `${p.panel}:${p.data.length}:${p.data.slice(0, 24)}`).join('|')
    : ''

  return `${task}::${v}${pair}::${text}::${photos}`
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

const RISK_LEVELS = ['Yüksek', 'Orta', 'Düşük']
const str = (v) => (typeof v === 'string' ? v : '')
const strList = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()) : [])
const level = (v, fallback = 'Orta') => (RISK_LEVELS.includes(v) ? v : fallback)

const NORMALIZERS = {
  diagnosis(raw) {
    const causes = Array.isArray(raw.causes) ? raw.causes : []
    if (!raw.summary && causes.length === 0) return null
    return {
      summary: str(raw.summary),
      causes: causes
        .filter((c) => c && typeof c.cause === 'string')
        .map((c) => ({
          cause: c.cause,
          likelihood: level(c.likelihood),
          solution: str(c.solution),
          estimatedCost: str(c.estimatedCost),
          urgency: level(c.urgency)
        })),
      checks: strList(raw.checks),
      askMechanic: strList(raw.askMechanic)
    }
  },

  'vehicle-info'(raw) {
    const problems = Array.isArray(raw.commonProblems) ? raw.commonProblems : []
    if (!raw.overview && problems.length === 0) return null
    return {
      overview: str(raw.overview),
      reliability: str(raw.reliability),
      commonProblems: problems
        .filter((p) => p && typeof p.title === 'string')
        .map((p) => ({
          title: p.title,
          risk: level(p.risk),
          description: str(p.description),
          solution: str(p.solution),
          estimatedCost: str(p.estimatedCost),
          checkKm: str(p.checkKm)
        })),
      inspectionChecklist: strList(raw.inspectionChecklist),
      avgFuelConsumption: str(raw.avgFuelConsumption),
      buyAdvice: str(raw.buyAdvice),
      verdict: ['al', 'dikkatli', 'alma'].includes(raw.verdict) ? raw.verdict : 'dikkatli'
    }
  },

  verdict(raw) {
    if (!raw.opinion && !raw.buyAdvice) return null
    return {
      opinion: str(raw.opinion),
      problemAssessment: str(raw.problemAssessment),
      buyAdvice: str(raw.buyAdvice),
      negotiationTips: strList(raw.negotiationTips),
      redFlags: strList(raw.redFlags)
    }
  },

  /*
   * İlan ekran görüntüsünden alan okuma.
   *
   * Model, görselde olmayan alanı boş bırakmakla yükümlü. Burada ek bir
   * güvenlik yok — çünkü boş bırakılan alanı istemci dolduramaz; yapılan tek
   * şey alanların metin olduğundan emin olmak.
   */
  'listing-vision'(raw) {
    if (!raw || typeof raw !== 'object') return null
    const pick = (k) => str(raw[k])
    const out = {
      brand: pick('brand'), model: pick('model'), packageName: pick('packageName'),
      year: pick('year'), bodyType: pick('bodyType'), km: pick('km'),
      engine: pick('engine'), displacement: pick('displacement'), power: pick('power'),
      fuelType: pick('fuelType'), transmission: pick('transmission'), color: pick('color'),
      price: pick('price'), city: pick('city'), sellerType: pick('sellerType'),
      damageRecord: pick('damageRecord'), paintInfo: pick('paintInfo'),
      description: pick('description'),
      readFields: strList(raw.readFields),
      missingFields: strList(raw.missingFields)
    }
    // Hiçbir alan okunamadıysa sonuç yok sayılır.
    const anyValue = Object.entries(out).some(([k, v]) => !['readFields', 'missingFields'].includes(k) && v)
    return anyValue ? out : null
  },

  /*
   * Görsel inceleme.
   *
   * `suspicion` yalnızca bilinen dört değerden biri olabilir. Model buna
   * uymayan bir şey döndürürse (örneğin "kesinlikle boyalı") değer
   * "değerlendirilemedi"ye çekilir. Bu, ekranda asla "kesin boyalı" gibi bir
   * ifadenin çıkmamasını garanti eden ikinci settir; birincisi sunucudaki
   * istemdir.
   */
  'photo-inspect'(raw) {
    const panels = Array.isArray(raw.panels) ? raw.panels : []
    if (!raw.summary && panels.length === 0) return null
    const levels = ['düşük', 'orta', 'yüksek', 'değerlendirilemedi']
    return {
      summary: str(raw.summary),
      panels: panels
        .filter((p) => p && typeof p.panel === 'string')
        .map((p) => ({
          panel: p.panel,
          suspicion: levels.includes(String(p.suspicion).toLocaleLowerCase('tr'))
            ? String(p.suspicion).toLocaleLowerCase('tr')
            : 'değerlendirilemedi',
          observations: strList(p.observations),
          photoQuality: str(p.photoQuality)
        })),
      recommendations: strList(raw.recommendations),
      limitations: str(raw.limitations)
    }
  },

  compare(raw) {
    if (!raw.recommendation && !raw.winner) return null
    return {
      winner: str(raw.winner),
      recommendation: str(raw.recommendation),
      reasoning: strList(raw.reasoning),
      firstSuitableFor: str(raw.firstSuitableFor),
      secondSuitableFor: str(raw.secondSuitableFor),
      watchOut: strList(raw.watchOut)
    }
  }
}

/**
 * Tüm AI görevleri için ortak çağrı.
 *
 * @returns {Promise<{result: object}|{error: string}|null>}
 *   result -> başarılı sonuç
 *   error  -> kullanıcıya gösterilebilecek kısa hata nedeni
 *   null   -> özellik kapalı, sessizce atlanmalı
 */
async function callTask(task, payload) {
  if (!isAiConfigured()) return null

  const normalizer = NORMALIZERS[task]
  if (!normalizer) return null

  const key = cacheKeyFor(task, payload)
  const cached = getCached(key)
  if (cached) return { result: cached, cached: true }

  if (!isOnline()) {
    return { error: 'İnternet bağlantısı yok, yalnızca cihaz içi bilgiler gösteriliyor.' }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      // Cihaz kimliği: sunucu aylık analiz hakkını buna göre sayar.
      headers: { 'Content-Type': 'application/json', ...accountHeaders() },
      signal: controller.signal,
      body: JSON.stringify({ task, ...payload })
    })

    if (response.status === 429) {
      return { error: 'Çok fazla istek gönderildi, birkaç dakika sonra tekrar deneyin.' }
    }

    /*
     * 402: aylık analiz hakkı bitti. Bu bir hata değil, beklenen bir durum;
     * kullanıcıya ayrı bir dille gösterilebilmesi için `quotaExceeded` ile
     * işaretlenir ve güncel hesap durumu önbelleğe yazılır.
     */
    if (response.status === 402) {
      const detail = await response.json().catch(() => null)
      if (detail?.account) setCachedAccount(detail.account)
      return {
        error: detail?.error || 'Bu ayki analiz hakkın doldu.',
        quotaExceeded: true,
        account: detail?.account || null
      }
    }
    if (!response.ok) {
      // Sunucu anlaşılır bir neden gönderdiyse onu göster
      const detail = await response.json().catch(() => null)
      return {
        error: typeof detail?.error === 'string' && detail.error.length < 160
          ? detail.error
          : 'Detaylı değerlendirme şu an alınamadı.'
      }
    }

    const data = await response.json()
    // Sunucu her yanıtta güncel hak durumunu döner; ekranlar bunu gösterir.
    if (data?.account) setCachedAccount(data.account)
    const normalized = normalizer(data?.result || {})
    if (!normalized) {
      return { error: 'Detaylı değerlendirme okunamadı.' }
    }

    setCached(key, normalized)
    return { result: normalized, account: data?.account || null }
  } catch (err) {
    if (err?.name === 'AbortError') {
      return { error: 'Detaylı değerlendirme zaman aşımına uğradı.' }
    }
    return { error: 'Detaylı değerlendirmeye ulaşılamadı.' }
  } finally {
    clearTimeout(timer)
  }
}

/** Şikayet metninden arıza teşhisi */
export async function fetchAiAnalysis({ vehicle, complaint, localFindings }) {
  if (!complaint || complaint.trim().length < 3) return null
  return callTask('diagnosis', { vehicle, complaint, localFindings })
}

/** Veritabanımızda olmayan araç hakkında bilgi */
export async function fetchVehicleInfo(vehicle) {
  if (!vehicle?.brand) return null
  return callTask('vehicle-info', { vehicle })
}

/** Analiz sonucu üzerine yorum ve alım tavsiyesi */
export async function fetchVerdict({ vehicle, analysis }) {
  if (!vehicle?.brand) return null
  return callTask('verdict', { vehicle, analysis })
}

/**
 * İlan ekran görüntüsünden araç alanlarını okur.
 *
 * Otomatik çekme kapalı olduğu için asıl çalışan yol budur. Fotoğraflar
 * cihazda küçültülmüş JPEG olarak gelir; `data:` ön eki ayrılır.
 */
export async function fetchListingFromScreenshot(photos) {
  const list = (photos || [])
    .filter((p) => typeof p?.dataUrl === 'string')
    .slice(0, 4)
    .map((p, i) => ({ panel: 'ekran-' + (i + 1), data: p.dataUrl.replace(/^data:image\/[a-z]+;base64,/, '') }))

  if (!list.length) return null
  return callTask('listing-vision', { photos: list })
}

/**
 * Panel fotoğraflarından görsel inceleme.
 *
 * Fotoğraflar cihazda zaten 800 piksele küçültülüp JPEG'e çevrilmiş durumda;
 * burada yalnızca `data:` ön eki ayrılır çünkü Gemini saf base64 bekler.
 */
export async function fetchPhotoInspection({ vehicle, photos, localFindings }) {
  const list = (photos || [])
    .filter((p) => p && typeof p.dataUrl === 'string')
    .slice(0, 6)
    .map((p) => ({ panel: p.panel, data: p.dataUrl.replace(/^data:image\/[a-z]+;base64,/, '') }))

  if (!list.length) return null
  return callTask('photo-inspect', { vehicle, photos: list, localFindings })
}

/** İki araç arasında tercih önerisi */
export async function fetchComparison({ first, second }) {
  if (!first?.brand || !second?.brand) return null
  return callTask('compare', { first, second })
}

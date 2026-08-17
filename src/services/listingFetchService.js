/**
 * İLAN ÇEKME SERVİSİ (istemci tarafı)
 *
 * ============================================================================
 * NEDEN SUNUCUDAN GEÇİYOR
 * ============================================================================
 * Tarayıcı başka bir sitenin sayfasını CORS yüzünden zaten okuyamaz. İstek
 * sunucudan çıkınca ayrıca önbellek, zaman aşımı ve hata yönetimi tek yerde
 * toplanır. Bu dosya yalnızca kendi sunucumuzla konuşur.
 *
 * ============================================================================
 * DURUMLAR
 * ============================================================================
 * Sunucu her zaman bir `status` döner:
 *   ok         → veri geldi
 *   engelli    → platform sunucu taraflı okumaya kapalı (beklenen durum)
 *   bulunamadi → ilan yok / numara hatalı
 *   okunamadi  → sayfa geldi ama veri çıkarılamadı
 *   hata       → ağ hatası
 *
 * 'engelli' bir arıza değildir; sahibinden.com ve arabam.com sunucu taraflı
 * isteklere bot koruması uygular ve kullanım şartları otomatik veri çekmeyi
 * yasaklar. Bu durumda arayüz kullanıcıyı ekran görüntüsü yoluna yönlendirir.
 */

import { PROXY_BASE_URL } from './aiService'
import { accountHeaders } from './accountService'

const TIMEOUT_MS = 20000
const LISTING_CACHE_KEY = 'arac-dedektifi:listing-fetch-cache'
const LISTING_CACHE_TTL_MS = 6 * 60 * 60 * 1000
const LISTING_CACHE_LIMIT = 20

/** Aynı ilanı URL/numara yazım farklarından bağımsız olarak tek anahtara bağlar. */
export function listingCacheKey(input, platform = 'sahibinden') {
  return `${platform}:${String(input || '').trim().toLocaleLowerCase('tr').replace(/\/$/, '')}`
}

function readListingCache() {
  try {
    const raw = localStorage.getItem(LISTING_CACHE_KEY)
    const value = raw ? JSON.parse(raw) : {}
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

function writeListingCache(cache) {
  try {
    const entries = Object.entries(cache)
      .sort(([, a], [, b]) => Number(b?.savedAt || 0) - Number(a?.savedAt || 0))
      .slice(0, LISTING_CACHE_LIMIT)
    localStorage.setItem(LISTING_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)))
  } catch {
    // Depolama kapalı/doluysa ağ sonucu yine kullanılabilir; cache zorunlu değil.
  }
}

function cachedListing(input, platform) {
  const entry = readListingCache()[listingCacheKey(input, platform)]
  if (!entry || Number(entry.savedAt) + LISTING_CACHE_TTL_MS < Date.now()) return null
  return entry.result?.status === 'ok' ? { ...entry.result, cached: true, cacheSource: 'cihaz' } : null
}

function cacheListing(input, platform, result) {
  // İlan metni/görselleri değil, yalnızca Worker'ın yapılandırılmış sonucu
  // saklanır. Başarısız/engelli cevaplar cache'lenmez; platform sonradan
  // erişilebilir hale gelirse kullanıcı gereksiz yere eski hatayı görmez.
  if (result?.status !== 'ok') return
  const cache = readListingCache()
  cache[listingCacheKey(input, platform)] = { savedAt: Date.now(), result }
  writeListingCache(cache)
}

/** Girdinin ilan numarası/bağlantı olup olmadığını kabaca söyler. */
export function looksLikeListingInput(text) {
  const value = String(text || '').trim()
  if (!value) return false
  if (/^https?:\/\//i.test(value)) return true
  const digits = value.replace(/\D/g, '')
  return digits.length >= 6 && digits.length <= 12 && digits.length === value.replace(/\s/g, '').length
}

/*
 * Bilinen ilan sitelerinin ana makinesi — sunucudaki ADAPTERS listesiyle aynı
 * üç platformu (server/cloudflare-worker/listing/adapters.js) kapsar. Bugün
 * hepsi `fetchable: false`; bu yüzden paylaşımdan gelen bir bağlantı bu
 * listeyle eşleşiyorsa "İlanı Getir"e basıp reddedilmeyi beklemek yerine
 * kullanıcıyı doğrudan çalışan yola (ekran görüntüsü) yönlendiririz. Liste
 * yalnızca bir UX kısayolu içindir — asıl karar (fetchable mi) hâlâ
 * sunucudadır; burada yanlış tahmin edilse bile en kötü ihtimalle kullanıcı
 * bir adım fazladan "İlanı Getir"e basar.
 */
const KNOWN_BLOCKED_HOSTS = [/(^|\.)sahibinden\.com$/i, /(^|\.)arabam\.com$/i, /(^|\.)letgo\.com$/i]

/** Bağlantı bilinen, sunucu taraflı okumaya kapalı bir ilan sitesine mi ait? */
export function isKnownBlockedListingUrl(input) {
  const value = String(input || '').trim()
  if (!/^https?:\/\//i.test(value)) return false
  try {
    const hostname = new URL(value).hostname
    return KNOWN_BLOCKED_HOSTS.some((pattern) => pattern.test(hostname))
  } catch {
    return false
  }
}

/**
 * İlan numarası ya da bağlantıdan ilanı çeker.
 * @returns {Promise<object|null>} sunucunun döndüğü sonuç; ulaşılamazsa null
 */
export async function fetchListingByInput(input, platform) {
  if (!PROXY_BASE_URL) return null

  const selectedPlatform = platform || 'sahibinden'
  const cached = cachedListing(input, selectedPlatform)
  if (cached) return cached

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(PROXY_BASE_URL.replace(/\/$/, '') + '/listing/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...accountHeaders() },
      signal: controller.signal,
      body: JSON.stringify({ input, platform })
    })
    if (!response.ok) {
      return { status: 'hata', error: 'Sunucuya ulaşıldı ama istek reddedildi.' }
    }
    const result = await response.json()
    cacheListing(input, selectedPlatform, result)
    return result
  } catch (err) {
    return {
      status: 'hata',
      error: err?.name === 'AbortError' ? 'İstek zaman aşımına uğradı.' : 'Sunucuya ulaşılamadı.'
    }
  } finally {
    clearTimeout(timer)
  }
}

/** Desteklenen platformlar ve hangisinin çekilebilir olduğu. */
export async function fetchPlatforms() {
  if (!PROXY_BASE_URL) return []
  try {
    const response = await fetch(PROXY_BASE_URL.replace(/\/$/, '') + '/listing/platforms')
    if (!response.ok) return []
    const data = await response.json()
    return Array.isArray(data?.platforms) ? data.platforms : []
  } catch {
    return []
  }
}

/**
 * Sunucudan gelen ilan verisini uygulamanın form yapısına çevirir.
 *
 * Sunucu alanları platformun yazdığı gibi döner ("Dizel", "142.000 km");
 * burada sayısallaştırılır ve uygulamanın beklediği adlara taşınır.
 */
export function toFormData(listing) {
  const f = listing?.fields || {}
  const digits = (v) => String(v || '').replace(/[^\d]/g, '')

  return {
    brand: f.brand || '',
    model: f.model || f.series || '',
    year: f.year || '',
    km: digits(f.km),
    price: digits(f.price),
    engine: f.engine || '',
    fuelType: f.fuelType || '',
    transmission: f.transmission || '',
    // Bu alanlar formun zorunlu girdisi değildir ama yapılandırılmış ilan
    // verisi kaybolmadan VehicleProfile ve rapora aktarılmalıdır.
    packageName: f.packageName || f.package || '',
    bodyType: f.bodyType || '',
    power: f.power || '',
    displacement: f.displacement || '',
    color: f.color || '',
    city: f.city || '',
    sellerType: f.sellerType || '',
    condition: f.condition || '',
    paintInfo: f.paintInfo || '',
    heavyDamage: f.heavyDamage || ''
  }
}

/**
 * Görsel okuma (Vision OCR) sonucunu form yapısına çevirir.
 *
 * Modelin boş bıraktığı alanlar boş kalır — doldurulmaz. Eksik alanların
 * listesi ayrıca döner ki ekran kullanıcıya neyin okunamadığını söyleyebilsin.
 */
export function visionToFormData(result) {
  if (!result) return null
  const digits = (v) => String(v || '').replace(/[^\d]/g, '')

  return {
    formData: {
      brand: result.brand || '',
      model: result.model || '',
      year: result.year || '',
      km: digits(result.km),
      price: digits(result.price),
      engine: result.engine || '',
      fuelType: result.fuelType || '',
      transmission: result.transmission || ''
    },
    extra: {
      packageName: result.packageName || '',
      bodyType: result.bodyType || '',
      power: result.power || '',
      displacement: result.displacement || '',
      color: result.color || '',
      city: result.city || '',
      sellerType: result.sellerType || ''
    },
    /*
     * Hasar/boya beyanı ve satıcı açıklaması, ilan uyarı motoruna metin olarak
     * verilir; böylece görselden okunan ilan da yazıyla yapıştırılan ilanla
     * aynı kurallardan geçer (çelişki, vekalet, kapora vb.).
     */
    text: [result.damageRecord, result.paintInfo, result.description]
      .filter(Boolean)
      .join('\n'),
    readFields: Array.isArray(result.readFields) ? result.readFields : [],
    missingFields: Array.isArray(result.missingFields) ? result.missingFields : []
  }
}

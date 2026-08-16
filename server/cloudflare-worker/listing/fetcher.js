/**
 * LISTING FETCHER SERVICE
 *
 * ============================================================================
 * AKIŞ
 * ============================================================================
 *   Frontend → Backend API → ListingFetcherService → Platform Adapter
 *                                   ↓
 *                                Parser → normalize → Vehicle Analysis Engine
 *
 * Frontend hiçbir zaman doğrudan ilan sitesine gitmez. Bunun iki nedeni var:
 * tarayıcı zaten CORS yüzünden okuyamaz, ve istek sunucudan gittiğinde
 * önbellek, hata yönetimi ve hız sınırı tek yerde uygulanabilir.
 *
 * ============================================================================
 * DÖNÜŞ SÖZLEŞMESİ
 * ============================================================================
 * Bu servis HİÇBİR ZAMAN istisna fırlatmaz; her durumda bir sonuç nesnesi
 * döner ve çağıran taraf `status` alanına bakar:
 *
 *   'ok'        → veri çekildi ve ayrıştırıldı
 *   'engelli'   → platform sunucu taraflı okumaya kapalı (beklenen durum)
 *   'bulunamadi'→ ilan yok, kaldırılmış ya da numara yanlış
 *   'okunamadi' → sayfa geldi ama içinden araç verisi çıkarılamadı
 *   'hata'      → ağ/zaman aşımı
 *
 * Her durumda `fallback` alanı, kullanıcıya ne önerileceğini söyler. Böylece
 * arayüz "çekemedim" deyip bırakmaz, çalışan yola yönlendirir.
 */

import { ADAPTERS, resolveInput } from './adapters.js'

const FETCH_TIMEOUT_MS = 12000
const MAX_HTML_BYTES = 2 * 1024 * 1024

/** Önbellek süresi: aynı ilan kısa sürede tekrar sorulursa siteye gidilmez. */
export const LISTING_CACHE_TTL_SECONDS = 21600 // 6 saat

const FALLBACK_SCREENSHOT = {
  method: 'ekran-goruntusu',
  message:
    'İlan sayfasının ekran görüntüsünü yükle. Görselden marka, model, yıl, kilometre, fiyat ve hasar bilgisi okunup analiz edilir.'
}

const FALLBACK_PASTE = {
  method: 'metin',
  message: 'İlan metnini kopyalayıp yapıştırabilirsin.'
}

/**
 * Bir ilanı çeker ve ayrıştırır.
 *
 * @param {string} input     ilan numarası ya da tam bağlantı
 * @param {object} options   { platform, cache }  cache: Cloudflare Cache API örneği
 */
export async function fetchListing(input, options = {}) {
  const resolved = resolveInput(input, options.platform)

  if (!resolved.ok) {
    return {
      status: 'okunamadi',
      error: resolved.error,
      fallback: [FALLBACK_SCREENSHOT, FALLBACK_PASTE]
    }
  }

  const { adapter, listingId, url } = resolved

  /*
   * Kapalı platform: isteği hiç yapmayız. Denemek hem boşuna gecikme yaratır
   * hem de karşı tarafın kullanım şartlarına aykırı bir davranışı tekrarlar.
   * Kullanıcıya doğrudan çalışan yol önerilir.
   */
  if (!adapter.fetchable) {
    return {
      status: 'engelli',
      platform: adapter.id,
      platformLabel: adapter.label,
      listingId,
      url,
      reason: adapter.blockedReason,
      fallback: [FALLBACK_SCREENSHOT, FALLBACK_PASTE]
    }
  }

  const cacheKey = `listing:${adapter.id}:${listingId}`
  if (options.cache) {
    const cached = await options.cache.get(cacheKey)
    if (cached) return { ...JSON.parse(cached), cached: true }
  }

  let response
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    response = await fetch(url, {
      signal: controller.signal,
      // İzinli bir ilan sitesi başka bir hedefe yönlendirebilir. Yönlendirmeyi
      // otomatik izlememek, adaptör gelecekte açılırsa SSRF sınırını korur.
      redirect: 'manual',
      headers: {
        // Gerçek bir tarayıcı gibi görünmeye ÇALIŞILMAZ; kimliğimizi açıkça
        // bildiririz. Kılık değiştirmek, bot korumasını aşma girişimidir.
        'User-Agent': 'AracDedektifi/1.0 (+ilan analiz botu)',
        Accept: 'text/html'
      }
    })
  } catch (err) {
    clearTimeout(timer)
    return {
      status: 'hata',
      platform: adapter.id,
      error: err?.name === 'AbortError' ? 'Zaman aşımı' : 'Bağlantı kurulamadı',
      fallback: [FALLBACK_SCREENSHOT, FALLBACK_PASTE]
    }
  }
  clearTimeout(timer)

  if (response.status >= 300 && response.status < 400) {
    return {
      status: 'engelli',
      platform: adapter.id,
      error: 'İlan sitesi yönlendirme istedi; güvenlik nedeniyle izlenmedi.',
      fallback: [FALLBACK_SCREENSHOT, FALLBACK_PASTE]
    }
  }

  if (response.status === 404) {
    return {
      status: 'bulunamadi',
      platform: adapter.id,
      listingId,
      error: 'İlan bulunamadı; kaldırılmış ya da numara hatalı olabilir.',
      fallback: [FALLBACK_SCREENSHOT]
    }
  }

  if (!response.ok) {
    return {
      status: 'engelli',
      platform: adapter.id,
      platformLabel: adapter.label,
      listingId,
      url,
      reason: `Site isteği reddetti (HTTP ${response.status}).`,
      fallback: [FALLBACK_SCREENSHOT, FALLBACK_PASTE]
    }
  }

  const contentLength = Number(response.headers.get('content-length') || 0)
  if (contentLength > MAX_HTML_BYTES) {
    return {
      status: 'okunamadi',
      platform: adapter.id,
      error: 'İlan sayfası güvenli işleme sınırını aşıyor.',
      fallback: [FALLBACK_SCREENSHOT, FALLBACK_PASTE]
    }
  }

  const html = await response.text()
  if (html.length > MAX_HTML_BYTES) {
    return {
      status: 'okunamadi',
      platform: adapter.id,
      error: 'İlan sayfası güvenli işleme sınırını aşıyor.',
      fallback: [FALLBACK_SCREENSHOT, FALLBACK_PASTE]
    }
  }
  const parsed = adapter.parse(html)

  // Marka ya da başlık yoksa ayrıştırma başarısız sayılır; yarım veriyle
  // analiz üretmek kullanıcıyı yanıltır.
  if (!parsed.fields.brand && !parsed.fields.title) {
    return {
      status: 'okunamadi',
      platform: adapter.id,
      listingId,
      error: 'Sayfa alındı ama araç bilgileri okunamadı (site yapısı değişmiş olabilir).',
      fallback: [FALLBACK_SCREENSHOT, FALLBACK_PASTE]
    }
  }

  const result = {
    status: 'ok',
    platform: adapter.id,
    platformLabel: adapter.label,
    listingId,
    url,
    listing: parsed
  }

  if (options.cache) {
    await options.cache.put(cacheKey, JSON.stringify(result), {
      expirationTtl: LISTING_CACHE_TTL_SECONDS
    })
  }

  return result
}

/** Arayüzün hangi platformları tanıdığını göstermesi için. */
export function listPlatforms() {
  return ADAPTERS.map((a) => ({
    id: a.id,
    label: a.label,
    fetchable: a.fetchable,
    reason: a.fetchable ? null : a.blockedReason
  }))
}

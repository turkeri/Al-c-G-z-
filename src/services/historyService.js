/**
 * ANALİZ GEÇMİŞİ (istemci tarafı)
 *
 * ============================================================================
 * NE SAKLANIR, NE SAKLANMAZ
 * ============================================================================
 * Sunucuya yalnızca ÖZET gider: marka, model, yıl, kilometre, fiyat, skor.
 *
 * SAKLANMAYANLAR: ilan metni, fotoğraflar, kullanıcının yazdığı notlar. Bunlar
 * cihazda kalır. Kullanıcının yapıştırdığı bir ilan metni ya da yüklediği
 * ekran görüntüsü, sunucuda tutulması gerekmeyen kişisel içeriktir.
 *
 * ============================================================================
 * SUNUCU YOKSA NE OLUR
 * ============================================================================
 * Geçmiş, cihazda da bir kopya tutar. Sunucuya ulaşılamazsa ya da veritabanı
 * bağlı değilse uygulama yerel kopyayı gösterir — kullanıcı geçmişini
 * kaybetmiş hissetmez. Sunucudaki kopyanın işlevi, uygulama silinip yeniden
 * kurulduğunda (aynı cihaz kimliği duruyorsa) geçmişin geri gelmesidir.
 */

import { PROXY_BASE_URL } from './aiService'
import { accountHeaders } from './accountService'
import { getAccessToken } from './authService'

const LOCAL_KEY = 'arac-dedektifi:history'
const LOCAL_LIMIT = 50

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function writeLocal(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, LOCAL_LIMIT)))
  } catch {
    // Depolama doluysa geçmiş yazılamaz; kritik değil.
  }
}

/**
 * Bir analizi geçmişe ekler.
 *
 * Önce yerel kopyaya yazar (anında görünsün), sonra sunucuya gönderir.
 * Sunucu isteği başarısız olursa sessizce geçilir — geçmiş kaydı, analizin
 * kendisinden daha az önemlidir ve kullanıcıya hata göstermeye değmez.
 */
export async function recordAnalysis(entry) {
  if (!entry?.brand) return null

  const record = {
    id: (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : String(Date.now()),
    created_at: Date.now(),
    brand: entry.brand,
    model: entry.model || '',
    year: entry.year || '',
    km: Number(String(entry.km || '').replace(/\D/g, '')) || null,
    price: Number(String(entry.price || '').replace(/\D/g, '')) || null,
    score: entry.score ?? null,
    trust_score: entry.trustScore ?? null,
    verdict: entry.verdict || null,
    source: entry.source || 'form'
  }

  // Aynı aracın arka arkaya tekrar kaydedilmesini önle: kullanıcı sayfada
  // gezinirken aynı analiz birden çok kez tetiklenebilir.
  const local = readLocal()
  const duplicate = local[0] &&
    local[0].brand === record.brand &&
    local[0].model === record.model &&
    local[0].year === record.year &&
    local[0].km === record.km &&
    Date.now() - local[0].created_at < 60000

  if (!duplicate) {
    writeLocal([record, ...local])
  }

  if (!PROXY_BASE_URL || duplicate) return record

  try {
    await fetch(PROXY_BASE_URL.replace(/\/$/, '') + '/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...accountHeaders() },
      body: JSON.stringify({
        brand: record.brand,
        model: record.model,
        year: record.year,
        km: record.km,
        price: record.price,
        score: record.score,
        trustScore: record.trust_score,
        verdict: record.verdict,
        source: record.source
      })
    })
  } catch {
    // Sunucuya ulaşılamadı; yerel kopya yeterli.
  }

  return record
}

/**
 * Geçmişi döner. Sunucudan alınabiliyorsa o kullanılır (cihazlar arası
 * tutarlılık için), yoksa yerel kopya gösterilir.
 */
export async function getHistory() {
  const local = readLocal()
  if (!PROXY_BASE_URL) return local

  try {
    const token = await getAccessToken()
    const response = await fetch(PROXY_BASE_URL.replace(/\/$/, '') + '/history', {
      headers: { ...accountHeaders(), ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
    if (!response.ok) return local
    const data = await response.json()
    const items = Array.isArray(data?.items) ? data.items : []
    if (!items.length) return local

    writeLocal(items)
    return items
  } catch {
    return local
  }
}

/** Yerel geçmişi anında okur (ekran ilk çizimde boş kalmasın). */
export function getLocalHistory() {
  return readLocal()
}

export async function clearHistory() {
  try {
    localStorage.removeItem(LOCAL_KEY)
  } catch {
    // yoksayılır
  }

  if (PROXY_BASE_URL) {
    try {
      // Sunucu, yalnızca X-Device-Id ile eşleşen özet kayıtları siler.
      // İlan metni/fotoğraf/not zaten sunucuya yazılmadığı için silinmez.
      await fetch(PROXY_BASE_URL.replace(/\/$/, '') + '/history', {
        method: 'DELETE',
        headers: accountHeaders()
      })
    } catch {
      // Cihazdaki geçmiş yine silinmiştir. Sunucu silme isteği bağlantı
      // yokken tekrar denenemez; gerçek hesap altyapısında kuyruklanacaktır.
    }
  }
  return []
}

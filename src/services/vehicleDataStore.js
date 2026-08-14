/**
 * Araç veri deposu — gömülü çekirdek + sunucudan gelen güncellemeler.
 *
 * ============================================================================
 * NEDEN BÖYLE
 * ============================================================================
 * Veri uygulamanın içine gömülü olduğu sürece her güncelleme yeni bir sürüm
 * yayınlamayı gerektirir ve veri büyüdükçe uygulama şişer. Veriyi tamamen
 * sunucuya taşımak ise internetsiz kullanımı öldürür — oysa alıcı çoğu zaman
 * kapalı bir otoparkta, çekmeyen bir yerde araca bakar.
 *
 * Bu yüzden iki katman:
 *   1. GÖMÜLÜ ÇEKİRDEK (vehicles.json) — uygulamayla birlikte gelir, internet
 *      olmasa da her şey çalışır. Kesin ve her zaman mevcuttur.
 *   2. SUNUCU KATMANI (Cloudflare D1) — yalnızca DEĞİŞENLER indirilir, cihazda
 *      IndexedDB'de saklanır ve çekirdeğin üzerine bindirilir.
 *
 * Sonuç: veri güncellemek için uygulama yayınlamaya gerek kalmaz, veri
 * büyüdükçe uygulama büyümez, ve internet yokken hiçbir şey bozulmaz.
 *
 * Sunucu kurulmamışsa bu dosya tamamen sessiz kalır; uygulama gömülü veriyle
 * çalışır ve kullanıcı bir fark görmez.
 *
 * ============================================================================
 * SENKRONİZASYON
 * ============================================================================
 * Her sunucu kaydının artan bir `revision` numarası vardır. İstemci elindeki
 * en yüksek revizyonu gönderir, sunucu sadece ondan yenilerini döner. Böylece
 * ilk kurulumdan sonra her açılışta birkaç yüz bayt trafik olur.
 *
 * Senkronizasyon açılış ekranı (far animasyonu) sürerken arka planda çalışır;
 * kullanıcı bekleme hissetmez. Bitmezse de sorun olmaz, veri bir sonraki
 * açılışta tamamlanır.
 */

import bundledVehicles from '../data/vehicles.json'
import { idbGet, idbSet } from './idbCache'

const CACHE_KEY = 'vehicle-overlay'
const PROXY_URL =
  import.meta.env.VITE_AI_PROXY_URL || 'https://arac-dedektifi-ai.turkerinurullah.workers.dev'
const SYNC_TIMEOUT_MS = 12000
const MAX_PAGES = 40

/** "Volkswagen|Golf (Mk7)" biçiminde kararlı anahtar (sunucudakiyle aynı kural). */
export function vehicleKey(brand, model) {
  return (String(brand) + '|' + String(model)).toLowerCase().replace(/\s+/g, ' ').trim()
}

let dataset = bundledVehicles
let overlay = { revision: 0, records: {} }
let status = { source: 'gömülü', revision: 0, remoteCount: 0, syncedAt: null, error: null }

const listeners = new Set()

function notify() {
  listeners.forEach((fn) => {
    try {
      fn()
    } catch {
      // Bir dinleyicinin hatası diğerlerini engellemez.
    }
  })
}

/** Gömülü çekirdeğin üzerine sunucu kayıtlarını bindirir. */
function rebuild() {
  const map = new Map()
  bundledVehicles.forEach((entry) => map.set(vehicleKey(entry.brand, entry.model), entry))

  Object.entries(overlay.records).forEach(([key, record]) => {
    if (record === null) map.delete(key)
    else map.set(key, record)
  })

  dataset = [...map.values()]
  status.remoteCount = Object.keys(overlay.records).length
  status.revision = overlay.revision
  status.source = status.remoteCount > 0 ? 'gömülü + sunucu' : 'gömülü'
  notify()
}

/** Uygulamanın her yerinden kullanılan güncel veri kümesi. */
export function getDataset() {
  return dataset
}

export function getDataStatus() {
  return { ...status }
}

/** Veri değiştiğinde haber almak için (React bileşenleri yeniden çizilsin diye). */
export function subscribeDataset(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

async function fetchJson(path, signal) {
  const response = await fetch(PROXY_URL + path, { signal })
  if (!response.ok) throw new Error('HTTP ' + response.status)
  return response.json()
}

/**
 * Açılışta çağrılır.
 *
 * Önce cihazdaki önbellek yüklenir (anında, internetsiz de çalışır), sonra
 * internet varsa sunucuya sadece "yeni bir şey var mı" diye sorulur.
 */
export async function hydrateVehicleData() {
  // 1) Cihazdaki önbellek
  const cached = await idbGet(CACHE_KEY)
  if (cached && typeof cached === 'object' && cached.records) {
    overlay = { revision: Number(cached.revision) || 0, records: cached.records }
    rebuild()
  }

  // 2) Sunucu güncellemesi (opsiyonel)
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return getDataStatus()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS)

  try {
    const version = await fetchJson('/data/version', controller.signal)
    const remoteRevision = Number(version?.revision) || 0

    if (remoteRevision <= overlay.revision) {
      status.syncedAt = new Date().toISOString()
      status.error = null
      return getDataStatus()
    }

    let since = overlay.revision
    const records = { ...overlay.records }

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const chunk = await fetchJson('/data/vehicles?since=' + since, controller.signal)
      const rows = Array.isArray(chunk?.rows) ? chunk.rows : []
      if (rows.length === 0) break

      rows.forEach((row) => {
        if (!row?.id) return
        records[row.id] = row.deleted ? null : row.vehicle
      })

      since = Number(chunk.nextSince) || since
      if (!chunk.hasMore) break
    }

    overlay = { revision: Math.max(remoteRevision, since), records }
    await idbSet(CACHE_KEY, overlay)
    status.syncedAt = new Date().toISOString()
    status.error = null
    rebuild()
  } catch (err) {
    // Sunucu yoksa, kapalıysa veya veritabanı bağlanmamışsa sessizce geçilir:
    // uygulama gömülü veriyle tam olarak çalışmaya devam eder.
    status.error = err?.name === 'AbortError' ? 'zaman aşımı' : 'ulaşılamadı'
  } finally {
    clearTimeout(timer)
  }

  return getDataStatus()
}

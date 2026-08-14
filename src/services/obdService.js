import codes from '../data/obd-codes.json'
import { normalizeText } from './diagnosisService'

/**
 * OBD arıza kodu sözlüğü.
 *
 * Kullanıcı elindeki cihazdan okuduğu kodu (P0401 gibi) yazar; kodun ne
 * anlama geldiği, tipik sebepleri, çözümü ve yaklaşık maliyeti listelenir.
 * Kod bilinmiyorsa bile ilk karakterlerden hangi sisteme ait olduğu söylenir,
 * böylece kullanıcı tamamen boş dönmez.
 */

const SYSTEM_PREFIXES = {
  P: 'Motor / güç aktarma (Powertrain)',
  B: 'Gövde ve konfor sistemleri (Body)',
  C: 'Şasi, fren, ABS (Chassis)',
  U: 'Modüller arası haberleşme (Network)'
}

const SUBSYSTEM_HINTS = {
  P0: 'Genel (SAE standardı) kod - tüm markalarda aynı anlama gelir',
  P1: 'Üretici tanımlı kod - anlamı markaya göre değişir',
  P2: 'Genel (SAE standardı) kod',
  P3: 'Genel/üretici karışık kod aralığı'
}

export const OBD_SEVERITIES = ['Yüksek', 'Orta', 'Düşük']

function cleanCode(input) {
  return String(input || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

/** Tüm kodlar (liste ekranı için). */
export function getAllCodes() {
  return codes
}

/** Sistemlere göre gruplanmış kod sayıları. */
export function getSystems() {
  const map = new Map()
  codes.forEach((entry) => {
    map.set(entry.system, (map.get(entry.system) || 0) + 1)
  })
  return [...map.entries()].map(([system, count]) => ({ system, count }))
}

/**
 * Kod veya serbest metinle arama.
 * "P0401" tam eşleşme; "egr" gibi bir kelime başlık/anlam içinde aranır.
 */
export function searchCodes(query, limit = 20) {
  const raw = String(query || '').trim()
  if (raw.length < 2) return []

  const code = cleanCode(raw)
  const normalized = normalizeText(raw)

  const scored = codes.map((entry) => {
    const entryCode = cleanCode(entry.code)
    let score = 0

    if (entryCode === code) score += 100
    else if (code.length >= 3 && entryCode.startsWith(code)) score += 60
    else if (code.length >= 3 && entryCode.includes(code)) score += 30

    if (normalized.length >= 3) {
      if (normalizeText(entry.title).includes(normalized)) score += 25
      if (normalizeText(entry.meaning).includes(normalized)) score += 12
      if (normalizeText(entry.system).includes(normalized)) score += 8
      if (entry.causes.some((c) => normalizeText(c).includes(normalized))) score += 6
    }

    return { entry, score }
  })

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry)
}

/**
 * Aranan kod sözlükte yoksa bile kodun yapısından çıkarılabilecek bilgiyi verir.
 * Böylece kullanıcı "bulunamadı" ile baş başa kalmaz.
 */
export function describeUnknownCode(query) {
  const code = cleanCode(query)
  if (!/^[PBCU]\d{4}$/.test(code)) return null

  return {
    code,
    system: SYSTEM_PREFIXES[code[0]] || 'Bilinmeyen sistem',
    subsystem: SUBSYSTEM_HINTS[code.slice(0, 2)] || null,
    note:
      'Bu kod sözlüğümüzde kayıtlı değil. Üretici tanımlı kodlarda (ikinci hane 1 veya 3) anlam markadan markaya değişir; marka cihazıyla okutmak gerekir.'
  }
}

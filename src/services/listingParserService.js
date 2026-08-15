import { FUEL_TYPES } from '../utils/constants'
import { getBrands, getModelsByBrand, getEngineNames } from './vehicleService'

/**
 * İLAN METNİ AYRIŞTIRICI
 *
 * İlan başlığı/açıklaması serbest metindir; buradan marka, model, motor, yıl,
 * kilometre ve fiyat çıkarılır.
 *
 * ============================================================================
 * NEDEN BASİT "includes" YETMİYOR
 * ============================================================================
 * Marka adları kısa olabilir ve başka kelimelerin İÇİNDE geçer:
 *
 *   "DS"  -> "DSG" şanzıman adının içinde
 *   "MG"  -> başka kelimelerde
 *   "Seat"-> İngilizce açıklamalarda
 *
 * Bu yüzden eşleşme KELİME SINIRI ile yapılır ve birden fazla aday varsa en
 * uzun olan kazanır ("Mercedes-Benz", "Mercedes"ten önce gelir). Aksi halde
 * "Volkswagen Golf 1.6 TDI DSG" ilanı DS marka olarak okunuyordu.
 */

const TRANSMISSION_KEYWORDS = [
  'DSG',
  'S tronic',
  'Tiptronic',
  'Multitronic',
  '7G-DCT',
  'CVT',
  'e-CVT',
  'Yarı Otomatik',
  'Otomatik',
  'Manuel'
]

/** İlanlarda sık kullanılan kısaltmalar. */
const BRAND_ALIASES = [
  ['vw', 'Volkswagen'],
  ['mercedes', 'Mercedes-Benz'],
  ['merc', 'Mercedes-Benz'],
  ['citroen', 'Citroën'],
  ['alfa', 'Alfa Romeo'],
  ['range rover', 'Land Rover']
]

function normalize(text) {
  return String(text || '').toLocaleLowerCase('tr')
}

function parseNumber(raw) {
  return Number(String(raw).replace(/[.,]/g, ''))
}

/** Regex'te özel anlamı olan karakterleri kaçırır (örn. "C-HR", "A3"). */
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Adayı metinde KELİME OLARAK arar.
 *
 * Sınır olarak \b kullanılmaz: "Citroën" gibi aksanlı ve "C-HR" gibi tireli
 * adlarda \b beklenmedik yerlerde eşleşir. Onun yerine adayın önünde ve
 * ardında harf/rakam olmaması şart koşulur.
 */
function matchesAsWord(haystack, candidate) {
  const value = normalize(candidate).trim()
  if (!value) return false
  const pattern = new RegExp(`(^|[^0-9a-zçğıöşü])${escapeRegex(value)}([^0-9a-zçğıöşü]|$)`, 'i')
  return pattern.test(haystack)
}

/** Adaylar içinde metinde geçen EN UZUN olanı döner (en belirgin eşleşme). */
function findLongestMatch(haystack, candidates) {
  return (
    candidates
      .slice()
      .sort((a, b) => b.length - a.length)
      .find((candidate) => matchesAsWord(haystack, candidate)) || null
  )
}

export function parseListingText(text) {
  const found = {}
  if (!text || !text.trim()) return found

  const normalized = normalize(text)

  // --- Marka ---------------------------------------------------------------
  let brand = findLongestMatch(normalized, getBrands())

  if (!brand) {
    const alias = BRAND_ALIASES.find(([key]) => matchesAsWord(normalized, key))
    // Takma ad ancak karşılığı veritabanında varsa kabul edilir.
    if (alias && getBrands().includes(alias[1])) brand = alias[1]
  }

  if (brand) {
    found.brand = brand

    const model = findLongestMatch(normalized, getModelsByBrand(brand))
    if (model) {
      found.model = model

      const engine = findLongestMatch(normalized, getEngineNames(brand, model))
      if (engine) found.engine = engine
    }
  }

  // --- Sayısal alanlar ------------------------------------------------------
  const yearMatch = text.match(/\b(19[5-9]\d|20[0-4]\d)\b/)
  if (yearMatch) found.year = yearMatch[1]

  const kmMatch = text.match(/(\d{1,3}(?:[.,]\d{3})+|\d{4,6})\s*km\b/i)
  if (kmMatch) found.km = String(parseNumber(kmMatch[1]))

  const priceMatch = text.match(/(\d{1,3}(?:[.,]\d{3})+|\d{5,9})\s*(?:TL|₺)/i)
  if (priceMatch) found.price = String(parseNumber(priceMatch[1]))

  const fuelType = FUEL_TYPES.find((f) => matchesAsWord(normalized, f))
  if (fuelType) found.fuelType = fuelType

  const transmission = findLongestMatch(normalized, TRANSMISSION_KEYWORDS)
  if (transmission) found.transmission = transmission

  return found
}

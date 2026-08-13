import { FUEL_TYPES } from '../utils/constants'
import { getBrands, getModelsByBrand, getEngineNames } from './vehicleService'

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

function normalize(text) {
  return text.toLocaleLowerCase('tr')
}

function parseNumber(raw) {
  return Number(raw.replace(/[.,]/g, ''))
}

export function parseListingText(text) {
  const found = {}
  if (!text || !text.trim()) return found

  const normalized = normalize(text)

  const brand = getBrands().find((b) => normalized.includes(normalize(b)))
  if (brand) {
    found.brand = brand
    const model = getModelsByBrand(brand)
      .slice()
      .sort((a, b) => b.length - a.length)
      .find((m) => normalized.includes(normalize(m)))
    if (model) {
      found.model = model
      const engine = getEngineNames(brand, model).find((e) => normalized.includes(normalize(e)))
      if (engine) found.engine = engine
    }
  }

  const yearMatch = text.match(/\b(19[5-9]\d|20[0-4]\d)\b/)
  if (yearMatch) found.year = yearMatch[1]

  const kmMatch = text.match(/(\d{1,3}(?:[.,]\d{3})+|\d{4,6})\s*km\b/i)
  if (kmMatch) found.km = String(parseNumber(kmMatch[1]))

  const priceMatch = text.match(/(\d{1,3}(?:[.,]\d{3})+|\d{5,9})\s*(?:TL|₺)/i)
  if (priceMatch) found.price = String(parseNumber(priceMatch[1]))

  const fuelType = FUEL_TYPES.find((f) => normalized.includes(normalize(f)))
  if (fuelType) found.fuelType = fuelType

  const transmission = TRANSMISSION_KEYWORDS.find((t) => normalized.includes(normalize(t)))
  if (transmission) found.transmission = transmission

  return found
}

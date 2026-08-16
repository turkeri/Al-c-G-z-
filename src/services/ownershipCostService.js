/**
 * Sahip olma maliyeti: "bu araba bana yılda ne yakar?"
 *
 * İlan fiyatı, aracın gerçek maliyetinin sadece giriş bileti. Ucuz görünen bir
 * araç yüksek MTV, pahalı bakım ve bilinen bir kronik arıza yüzünden pahalı
 * arabadan daha çok yakabilir. Burada hepsi tek tabloda toplanır.
 *
 * Bu hesapların hepsi kaba tahmindir. Rakamlar zamanla eskiyeceği için
 * güncellenmesi gereken her şey aşağıdaki tek çıpa altında toplanmıştır;
 * yakıt fiyatı ise kullanıcı tarafından ekrandan değiştirilebilir.
 */

import { getEngineData, getVehicleEntry } from './catalogAdapter'

/** Aşağıdaki tahmini tutarların dayandığı dönem. */
export const COST_BASELINE_LABEL = 'Ağustos 2026'

/** Piyasa geneli kayarsa yalnızca bu katsayı güncellenir. */
const COST_INDEX = 1

/** Varsayılan akaryakıt fiyatları (TL/litre, elektrikte TL/kWh). Ekrandan değiştirilebilir. */
export const DEFAULT_FUEL_PRICES = {
  Benzin: 55,
  Dizel: 57,
  LPG: 29,
  Hibrit: 55,
  Elektrik: 4
}

/**
 * Motorlu Taşıtlar Vergisi - otomobil, yaklaşık yıllık tutarlar (TL).
 *
 * Satır: silindir hacmi aralığı. Sütun: yaş grubu (1-3, 4-6, 7-11, 12-15, 16+).
 * Resmi tarife her yıl yeniden yayımlanır ve 2018 sonrası tescillerde araç
 * değerine göre ayrıca kademelenir; buradaki değerler karşılaştırma yapmaya
 * yetecek yaklaşık büyüklüklerdir, kesin tutar için GİB tarifesine bakılmalıdır.
 */
const MTV_TABLE = [
  { maxCc: 1300, amounts: [6500, 4500, 2600, 2000, 700] },
  { maxCc: 1600, amounts: [11500, 8600, 5000, 3500, 1400] },
  { maxCc: 1800, amounts: [20000, 15500, 9000, 5500, 2200] },
  { maxCc: 2000, amounts: [31500, 24000, 14000, 8500, 3300] },
  { maxCc: 2500, amounts: [47000, 34000, 21000, 12500, 5000] },
  { maxCc: 3000, amounts: [65000, 56000, 35000, 19000, 7000] },
  { maxCc: 3500, amounts: [99000, 89000, 53000, 26000, 9500] },
  { maxCc: 4000, amounts: [156000, 134000, 79000, 35000, 14000] },
  { maxCc: Infinity, amounts: [255000, 191000, 113000, 51000, 20000] }
]

/** Elektrikli araçlarda MTV motor gücüne (kW) göre belirlenir. */
const MTV_ELECTRIC = [
  { maxKw: 70, amounts: [2200, 1600, 900, 700, 300] },
  { maxKw: 85, amounts: [3300, 2400, 1400, 1000, 450] },
  { maxKw: 105, amounts: [3800, 2800, 1600, 1200, 500] },
  { maxKw: 135, amounts: [6000, 4400, 2600, 1800, 800] },
  { maxKw: 191, amounts: [12000, 9000, 5200, 3600, 1600] },
  { maxKw: Infinity, amounts: [26000, 19000, 11000, 7500, 3200] }
]

/** Marka bakım seviyeleri: yıllık taban bakım + her 10.000 km için ek. */
const MAINTENANCE_TIERS = {
  premium: { base: 22000, per10k: 4200 },
  mainstream: { base: 13000, per10k: 2600 },
  economy: { base: 9500, per10k: 1900 }
}

const PREMIUM_BRANDS = [
  'BMW', 'Mercedes-Benz', 'Mercedes', 'Audi', 'Volvo', 'Porsche', 'Land Rover',
  'Jaguar', 'Mini', 'Alfa Romeo', 'Maserati', 'Lexus', 'Cupra', 'DS'
]
const ECONOMY_BRANDS = ['Dacia', 'Fiat', 'Tofaş', 'Lada', 'Chery', 'Skoda', 'Seat', 'Suzuki']

const TRAFFIC_INSURANCE = 9500
const KASKO_RATE = 0.032
const KASKO_RATE_PREMIUM = 0.041
const TYRE_SET_COST = 22000
const TYRE_LIFE_KM = 55000
const INSPECTION_BIENNIAL = 3200

const RISK_PROBABILITY = { Yüksek: 0.3, Orta: 0.14, Düşük: 0.05 }
const HIGH_KM_THRESHOLD = 150000
const HIGH_KM_MULTIPLIER = 1.4

function tierFor(brand) {
  if (PREMIUM_BRANDS.includes(brand)) return MAINTENANCE_TIERS.premium
  if (ECONOMY_BRANDS.includes(brand)) return MAINTENANCE_TIERS.economy
  return MAINTENANCE_TIERS.mainstream
}

/** "1.6 TDI" -> 1600 cc. Motor adı hacim içermiyorsa null döner. */
export function displacementFromEngineName(name) {
  if (typeof name !== 'string') return null
  const match = name.match(/(\d)[.,](\d)/)
  if (!match) return null
  const cc = Number(match[1]) * 1000 + Number(match[2]) * 100
  return cc >= 600 && cc <= 8000 ? cc : null
}

function ageColumn(year) {
  const age = new Date().getFullYear() - Number(year)
  if (age <= 3) return 0
  if (age <= 6) return 1
  if (age <= 11) return 2
  if (age <= 15) return 3
  return 4
}

/** Yaklaşık yıllık MTV. */
export function estimateMtv({ year, displacementCc, fuelType, powerKw }) {
  const column = ageColumn(year)
  if (fuelType === 'Elektrik') {
    const kw = Number(powerKw) || 120
    const row = MTV_ELECTRIC.find((r) => kw <= r.maxKw)
    return Math.round(row.amounts[column] * COST_INDEX)
  }
  const cc = Number(displacementCc)
  if (!cc) return null
  const row = MTV_TABLE.find((r) => cc <= r.maxCc)
  return Math.round(row.amounts[column] * COST_INDEX)
}

/** "8.000 - 22.000 TL" gibi bir aralığın orta noktasını TL olarak verir. */
export function parseCostRange(text) {
  if (typeof text !== 'string') return null
  const numbers = text
    .replace(/\./g, '')
    .match(/\d+/g)
  if (!numbers || numbers.length === 0) return null
  const values = numbers.map(Number).filter((n) => n >= 100)
  if (values.length === 0) return null
  if (values.length === 1) return values[0]
  return Math.round((Math.min(...values) + Math.max(...values)) / 2)
}

/**
 * Bilinen kronik arızaların yıllık beklenen maliyeti.
 * Her arıza için (olasılık x tahmini maliyet) toplanır; yüksek kilometrede
 * olasılıklar yukarı çekilir.
 */
export function estimateRiskPremium({ brand, model, engine, km }) {
  const engineData = getEngineData(brand, model, engine)
  const problems = engineData?.knownProblems || []
  if (problems.length === 0) return { amount: 0, items: [] }

  const kmMultiplier = Number(km) >= HIGH_KM_THRESHOLD ? HIGH_KM_MULTIPLIER : 1
  const items = []
  let total = 0

  problems.forEach((problem) => {
    const cost = parseCostRange(problem.estimatedCost)
    if (!cost) return
    const probability = (RISK_PROBABILITY[problem.risk] ?? 0.1) * kmMultiplier
    const expected = cost * probability
    total += expected
    items.push({
      title: problem.title,
      risk: problem.risk,
      cost,
      probabilityPercent: Math.round(probability * 100),
      expected: Math.round(expected)
    })
  })

  items.sort((a, b) => b.expected - a.expected)
  return { amount: Math.round(total), items: items.slice(0, 5) }
}

/**
 * Yıllık toplam sahip olma maliyeti.
 *
 * @param {object} input
 * @param {object} input.formData      { brand, model, engine, year, km, price, fuelType }
 * @param {number} input.yearlyKm      Yılda planlanan kilometre
 * @param {object} input.fuelPrices    Litre/kWh fiyatları (opsiyonel, varsayılanı ezer)
 * @param {boolean} input.includeKasko Kasko dahil edilsin mi
 */
export function estimateOwnershipCost({ formData, yearlyKm = 15000, fuelPrices, includeKasko = true }) {
  if (!formData?.brand) return null

  const price = Number(formData.price) || 0
  const km = Number(formData.km) || 0
  const year = Number(formData.year) || new Date().getFullYear()
  const distance = Math.max(1000, Number(yearlyKm) || 15000)

  const entry = getVehicleEntry(formData.brand, formData.model)
  const engineData = getEngineData(formData.brand, formData.model, formData.engine)
  const fuelType = engineData?.fuelType || formData.fuelType || 'Benzin'
  const prices = { ...DEFAULT_FUEL_PRICES, ...(fuelPrices || {}) }

  const lines = []

  // --- Yakıt ---
  const consumption = Number(engineData?.avgFuelConsumption)
  const unitPrice = Number(prices[fuelType]) || DEFAULT_FUEL_PRICES.Benzin
  let fuelCost = null
  if (Number.isFinite(consumption) && consumption > 0) {
    fuelCost = Math.round((distance / 100) * consumption * unitPrice)
    lines.push({
      id: 'yakit',
      label: 'Yakıt',
      amount: fuelCost,
      detail:
        consumption +
        ' L/100km ortalama, ' +
        unitPrice.toLocaleString('tr-TR') +
        ' TL birim fiyat üzerinden'
    })
  }

  // --- MTV ---
  const displacementCc = displacementFromEngineName(formData.engine)
  const mtv = estimateMtv({ year, displacementCc, fuelType })
  if (mtv) {
    lines.push({
      id: 'mtv',
      label: 'MTV (motorlu taşıtlar vergisi)',
      amount: mtv,
      detail: displacementCc
        ? displacementCc + ' cc, ' + (new Date().getFullYear() - year) + ' yaşında araç için yaklaşık'
        : 'Motor gücüne göre yaklaşık'
    })
  }

  // --- Sigorta ---
  lines.push({
    id: 'trafik',
    label: 'Zorunlu trafik sigortası',
    amount: Math.round(TRAFFIC_INSURANCE * COST_INDEX),
    detail: 'Hasarsızlık indirimine ve tescil iline göre değişir'
  })

  if (includeKasko && price > 0) {
    const rate = PREMIUM_BRANDS.includes(formData.brand) ? KASKO_RATE_PREMIUM : KASKO_RATE
    lines.push({
      id: 'kasko',
      label: 'Kasko',
      amount: Math.round(price * rate),
      detail: 'Araç değerinin yaklaşık %' + (rate * 100).toFixed(1).replace('.', ',') + "'si"
    })
  }

  // --- Bakım ---
  const tier = tierFor(formData.brand)
  const maintenance = Math.round((tier.base + (distance / 10000) * tier.per10k) * COST_INDEX)
  lines.push({
    id: 'bakim',
    label: 'Periyodik bakım',
    amount: maintenance,
    detail: 'Yağ, filtre, fren, genel servis kalemleri'
  })

  // --- Lastik ---
  lines.push({
    id: 'lastik',
    label: 'Lastik (yıla bölünmüş)',
    amount: Math.round(((TYRE_SET_COST * COST_INDEX) / TYRE_LIFE_KM) * distance),
    detail: 'Bir takım lastiğin ' + TYRE_LIFE_KM.toLocaleString('tr-TR') + ' km ömre bölünmesi'
  })

  // --- Muayene ---
  lines.push({
    id: 'muayene',
    label: 'Araç muayenesi (yıla bölünmüş)',
    amount: Math.round((INSPECTION_BIENNIAL * COST_INDEX) / 2),
    detail: 'İki yılda bir yapılır'
  })

  // --- Kronik arıza risk primi ---
  const risk = estimateRiskPremium({
    brand: formData.brand,
    model: formData.model,
    engine: formData.engine,
    km
  })
  if (risk.amount > 0) {
    lines.push({
      id: 'risk',
      label: 'Bilinen arıza risk payı',
      amount: risk.amount,
      detail: 'Bu motorun kronik sorunlarının beklenen yıllık maliyeti',
      items: risk.items
    })
  }

  const total = lines.reduce((sum, line) => sum + line.amount, 0)
  const monthly = Math.round(total / 12)
  const perKm = Math.round((total / distance) * 100) / 100

  return {
    lines,
    total,
    monthly,
    perKm,
    yearlyKm: distance,
    fuelType,
    fuelUnitPrice: unitPrice,
    segment: entry?.features?.segment || null,
    baseline: COST_BASELINE_LABEL
  }
}

import { getVehicleEntry } from './vehicleService'

const ANNUAL_DEPRECIATION = 0.12
const DEPRECIATION_FACTOR_MIN = 0.25
const DEPRECIATION_FACTOR_MAX = 3
const KM_ADJUSTMENT_PER_KM = 0.000001
const KM_ADJUSTMENT_MIN = 0.7
const KM_ADJUSTMENT_MAX = 1.3
const NORMAL_BAND_PERCENT = 10

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function estimateMarketPrice(formData) {
  const entry = getVehicleEntry(formData.brand, formData.model)
  if (!entry?.referencePrice) return null

  const year = Number(formData.year)
  const km = Number(formData.km)
  const listedPrice = Number(formData.price)
  if (!year || Number.isNaN(km) || Number.isNaN(listedPrice)) return null

  const depreciationFactor = clamp(
    Math.pow(1 - ANNUAL_DEPRECIATION, entry.referenceYear - year),
    DEPRECIATION_FACTOR_MIN,
    DEPRECIATION_FACTOR_MAX
  )
  const kmAdjustment = clamp(
    1 - (km - entry.referenceKm) * KM_ADJUSTMENT_PER_KM,
    KM_ADJUSTMENT_MIN,
    KM_ADJUSTMENT_MAX
  )

  const estimatedPrice = Math.round((entry.referencePrice * depreciationFactor * kmAdjustment) / 1000) * 1000
  const diffAmount = listedPrice - estimatedPrice
  const diffPercent = estimatedPrice > 0 ? Math.round((diffAmount / estimatedPrice) * 100) : 0

  let verdict = 'normal'
  let label = 'Piyasa fiyatında'
  if (diffPercent <= -NORMAL_BAND_PERCENT) {
    verdict = 'ucuz'
    label = 'Piyasanın altında'
  } else if (diffPercent >= NORMAL_BAND_PERCENT) {
    verdict = 'pahali'
    label = 'Piyasanın üzerinde'
  }

  return {
    estimatedPrice,
    listedPrice,
    diffAmount,
    diffPercent,
    verdict,
    label
  }
}

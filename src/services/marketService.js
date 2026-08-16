import { getVehicleEntry } from './vehicleService'

/**
 * Fiyat çıpası.
 *
 * Veritabanındaki referencePrice değerleri aşağıdaki tarihteki TL piyasasına
 * göre girilmiştir. Enflasyon ve piyasa hareketi nedeniyle bu tutarlar zamanla
 * kayar. 213 kaydı tek tek güncellemek yerine yalnızca bu iki satırı
 * güncellemek yeterlidir: piyasa genel olarak %30 yükseldiyse PRICE_INDEX 1.3
 * yapılır ve etiket yeni tarihle değiştirilir.
 *
 * Mekanik veri (kronik arızalar, kontrol noktaları) bu çıpadan etkilenmez;
 * o veri yıllara göre eskimediği için sabit kalır.
 */
export const PRICE_BASELINE_LABEL = 'Ağustos 2026'
const PRICE_INDEX = 1

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

  const estimatedPrice =
    Math.round((entry.referencePrice * PRICE_INDEX * depreciationFactor * kmAdjustment) / 1000) * 1000
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

  /*
   * Tek bir sayı vermek ("piyasa değeri 1.375.000 TL") sahte bir kesinlik
   * yaratır: bu hesap marka/model/yaş/kilometreye dayalı kaba bir amortisman,
   * gerçek ilan verisi değil. Aralık vermek hem daha dürüst hem pazarlıkta
   * daha kullanışlı — alıcı "şu bandın altına çekmeliyim" diye düşünebiliyor.
   */
  const RANGE_PERCENT = 0.04
  const estimatedRange = {
    min: Math.round((estimatedPrice * (1 - RANGE_PERCENT)) / 1000) * 1000,
    max: Math.round((estimatedPrice * (1 + RANGE_PERCENT)) / 1000) * 1000
  }

  return {
    estimatedPrice,
    estimatedRange,
    listedPrice,
    diffAmount,
    diffPercent,
    verdict,
    label,
    baseline: PRICE_BASELINE_LABEL
  }
}

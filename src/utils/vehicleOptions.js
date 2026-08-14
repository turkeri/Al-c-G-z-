/**
 * Form seçenekleri.
 *
 * Kilometre ve model yılı elle yazılmak yerine seçilir: mobilde yazmak
 * yavaştır, yanlış girilen bir hane tüm fiyat tahminini bozar. Kilometre
 * bantlar halinde seçilir ve hesaplarda bandın orta noktası kullanılır;
 * kesin değeri bilen kullanıcı için elle giriş seçeneği de korunur.
 */

export const CURRENT_YEAR = new Date().getFullYear()
const OLDEST_YEAR = 1990

export const KM_BANDS = [
  { id: '0-30', label: '0 - 30 bin', min: 0, max: 30000, value: 15000 },
  { id: '30-60', label: '30 - 60 bin', min: 30000, max: 60000, value: 45000 },
  { id: '60-100', label: '60 - 100 bin', min: 60000, max: 100000, value: 80000 },
  { id: '100-150', label: '100 - 150 bin', min: 100000, max: 150000, value: 125000 },
  { id: '150-200', label: '150 - 200 bin', min: 150000, max: 200000, value: 175000 },
  { id: '200-300', label: '200 - 300 bin', min: 200000, max: 300000, value: 250000 },
  { id: '300-400', label: '300 - 400 bin', min: 300000, max: 400000, value: 350000 },
  { id: '400+', label: '400 bin üzeri', min: 400000, max: 900000, value: 460000 }
]

/** Verilen kilometrenin hangi banda düştüğünü bulur (elle giriş sonrası seçimi eşlemek için). */
export function bandForKm(km) {
  const value = Number(km)
  if (!Number.isFinite(value) || value < 0) return null
  return KM_BANDS.find((band) => value >= band.min && value < band.max) || KM_BANDS[KM_BANDS.length - 1]
}

/** "2013-2020" biçimindeki aralığı sayı çiftine çevirir. */
export function parseYearRange(yearRange) {
  if (typeof yearRange !== 'string') return null
  const match = yearRange.match(/(\d{4})\s*-\s*(\d{4})/)
  if (!match) return null
  const from = Number(match[1])
  const to = Number(match[2])
  if (from > to) return null
  return { from, to }
}

/**
 * Seçilen modelin üretim aralığına göre yıl listesi üretir.
 *
 * Model seçilmemişse geniş liste döner. Aralığın iki ucuna birer yıl tolerans
 * eklenir: nesil geçiş yıllarında ilan yılı ile üretim yılı bir yıl kayabilir.
 */
export function yearOptions(yearRange) {
  const range = parseYearRange(yearRange)
  const from = range ? Math.max(OLDEST_YEAR, range.from - 1) : OLDEST_YEAR
  const to = range ? Math.min(CURRENT_YEAR + 1, range.to + 1) : CURRENT_YEAR + 1

  const years = []
  for (let year = to; year >= from; year -= 1) years.push(year)
  return years
}

/** Seçilen yıl, modelin üretim aralığının dışında mı? */
export function isYearOutsideRange(year, yearRange) {
  const range = parseYearRange(yearRange)
  const value = Number(year)
  if (!range || !value) return false
  return value < range.from || value > range.to
}

/**
 * Yıl ve kilometrenin birbiriyle tutarlılığını yorumlar.
 *
 * Yıllık ortalama kilometre, aracın nasıl kullanıldığına dair en ucuz
 * sinyaldir: çok yüksekse ticari kullanım, çok düşükse ya gerçekten az
 * kullanılmış ya da kilometre düşürülmüş olabilir.
 */
export function usageNote(year, km) {
  const yearValue = Number(year)
  const kmValue = Number(km)
  if (!yearValue || !Number.isFinite(kmValue) || kmValue <= 0) return null

  const age = Math.max(1, CURRENT_YEAR - yearValue)
  const perYear = Math.round(kmValue / age)

  if (perYear >= 45000) {
    return {
      tone: 'danger',
      perYear,
      title: 'Yılda ortalama ' + perYear.toLocaleString('tr-TR') + ' km',
      text: 'Bu tempo ticari kullanıma (taksi, kurye, filo, uzun yol) işaret eder. Servis geçmişini ve motor/şanzıman bakım kayıtlarını mutlaka iste.'
    }
  }
  if (perYear >= 30000) {
    return {
      tone: 'warning',
      perYear,
      title: 'Yılda ortalama ' + perYear.toLocaleString('tr-TR') + ' km',
      text: 'Ortalamanın belirgin üzerinde. Çoğunlukla uzun yol ise motor için kötü değildir, ancak sarf parçaları ve debriyaj/şanzıman daha erken yorulur.'
    }
  }
  if (perYear <= 5000 && age >= 4) {
    return {
      tone: 'warning',
      perYear,
      title: 'Yılda ortalama ' + perYear.toLocaleString('tr-TR') + ' km',
      text: 'Çok az kullanılmış görünüyor. Ya gerçekten garajda durmuş (bu durumda lastik, akü, körük ve conta kuruması beklenir) ya da kilometre düşürülmüş olabilir. Servis kayıtlarındaki km ilerleyişini kontrol et.'
    }
  }
  return {
    tone: 'ok',
    perYear,
    title: 'Yılda ortalama ' + perYear.toLocaleString('tr-TR') + ' km',
    text: 'Kullanım temposu normal aralıkta.'
  }
}

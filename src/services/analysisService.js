import { SCORE_BANDS } from '../utils/constants'
import { vehicleAge } from '../utils/formatters'
import { findMatchingEngine, getEngineData } from './vehicleService'

const RISK_WEIGHT = {
  Yüksek: 7,
  Orta: 3,
  Düşük: 1
}

const TRANSMISSION_RISK_PENALTY = {
  Yüksek: 12,
  Orta: 6,
  Düşük: 0
}

function getAgePenalty(age) {
  if (age <= 3) return 0
  if (age <= 6) return 4
  if (age <= 10) return 9
  if (age <= 15) return 14
  return 20
}

function getKmPenalty(km) {
  const value = Number(km) || 0
  if (value <= 50000) return 0
  if (value <= 100000) return 4
  if (value <= 150000) return 8
  if (value <= 200000) return 13
  if (value <= 250000) return 18
  return 24
}

function getProblemsPenalty(knownProblems = []) {
  const raw = knownProblems.reduce((sum, p) => sum + (RISK_WEIGHT[p.risk] || 2), 0)
  return Math.min(raw, 25)
}

export function getScoreBand(score) {
  return SCORE_BANDS.find((band) => score >= band.min && score <= band.max) || SCORE_BANDS[SCORE_BANDS.length - 1]
}

export function resolveEngineData(formData) {
  const { brand, model, engine, fuelType, transmission } = formData
  if (engine) {
    const exact = getEngineData(brand, model, engine)
    if (exact) return exact
  }
  return findMatchingEngine(brand, model, fuelType, transmission)
}

/**
 * Eksik alanlar için nötr varsayım cezaları.
 *
 * Bir alan boş bırakıldığında cezayı sıfır saymak skoru YUKARI çeker ve aracı
 * olduğundan iyi gösterir — eksik veriyle yapılan en tehlikeli hata budur.
 * Bunun yerine ortalama bir araç varsayılır ve durum kullanıcıya bildirilir.
 */
const ASSUMED_AGE_PENALTY = 9
const ASSUMED_KM_PENALTY = 8

const FIELD_LABELS = {
  brand: 'marka',
  model: 'model',
  year: 'model yılı',
  km: 'kilometre',
  price: 'ilan fiyatı',
  engine: 'motor',
  fuelType: 'yakıt tipi',
  transmission: 'şanzıman'
}

/**
 * Girilen verinin ne kadar tam olduğunu ölçer.
 * Skor, eksik alan sayısına göre değil, o alanların karara etkisine göre
 * ağırlıklandırılır: yıl ve kilometre olmadan sağlıklı bir değerlendirme
 * yapılamaz, şanzıman bilgisi ise eksikse sonucu az etkiler.
 */
const FIELD_WEIGHTS = {
  brand: 20,
  model: 20,
  year: 18,
  km: 18,
  engine: 12,
  price: 7,
  fuelType: 3,
  transmission: 2
}

export function assessDataQuality(formData, engineData) {
  const missing = []
  let earned = 0
  let total = 0

  Object.entries(FIELD_WEIGHTS).forEach(([field, weight]) => {
    total += weight
    const value = formData[field]
    const filled = value !== undefined && value !== null && String(value).trim() !== ''
    if (filled) earned += weight
    else missing.push(field)
  })

  const completeness = Math.round((earned / total) * 100)
  const missingLabels = missing.map((f) => FIELD_LABELS[f] || f)

  let warning = null
  if (!engineData) {
    warning =
      'Bu araç veritabanımızda kayıtlı değil. Skor yalnızca yaş ve kilometreye dayanıyor; motora özgü kronik sorunlar hesaba katılamadı.'
  } else if (completeness < 70) {
    warning =
      'Bilgilerin önemli bir kısmı eksik (' +
      missingLabels.join(', ') +
      '). Eksik alanlar için ortalama bir araç varsayıldı, bu yüzden sonuç yanıltıcı olabilir.'
  } else if (missing.length > 0) {
    warning =
      'Şu alanlar boş: ' +
      missingLabels.join(', ') +
      '. Doldurursan sonuç belirgin biçimde isabetli olur.'
  }

  return { completeness, missing, missingLabels, warning, knownVehicle: Boolean(engineData) }
}

export function analyzeVehicle(formData) {
  const { year, km, transmission, fuelType } = formData
  const engineData = resolveEngineData(formData)

  /**
   * Veritabanında olmayan araç için nötr başlangıç.
   *
   * Bilinen bir motorda başlangıç puanı o motorun güvenilirlik notudur.
   * Bilinmeyen araçta ise "bilgi yokluğu" ceza gibi işlememeli: aksi halde
   * sağlam bir araç, sırf veritabanımızda kaydı olmadığı için düşük puan alır.
   * Bu yüzden ortalama bir araç varsayılır ve şanzıman riski bilinmediği için
   * şanzıman cezası uygulanmaz.
   */
  const UNKNOWN_BASE_SCORE = 78

  const baseScore = engineData?.reliabilityScore ?? UNKNOWN_BASE_SCORE
  const knownProblems = engineData?.knownProblems ?? []
  const transmissionRisk = engineData?.transmissionRisk ?? null
  const inspectionChecklist = engineData?.inspectionChecklist ?? []

  const hasYear = String(year ?? '').trim() !== ''
  const hasKm = String(km ?? '').trim() !== ''

  const age = hasYear ? vehicleAge(year) : null
  const agePenalty = hasYear ? getAgePenalty(age) : ASSUMED_AGE_PENALTY
  const kmPenalty = hasKm ? getKmPenalty(km) : ASSUMED_KM_PENALTY
  const transmissionPenalty = transmissionRisk ? TRANSMISSION_RISK_PENALTY[transmissionRisk] ?? 6 : 0
  const problemsPenalty = getProblemsPenalty(knownProblems)

  const rawScore = baseScore - agePenalty - kmPenalty - transmissionPenalty - problemsPenalty
  const score = Math.max(0, Math.min(100, Math.round(rawScore)))
  const band = getScoreBand(score)

  const advantages = []
  const risks = []
  const checkpoints = []

  if (engineData && baseScore >= 80) {
    advantages.push('Bu motor/şanzıman kombinasyonu genel olarak güvenilir kabul ediliyor.')
  }
  if (hasYear && age <= 5) {
    advantages.push('Araç nispeten yeni, yaşa bağlı yıpranma riski düşük.')
  }
  if (hasKm && Number(km) <= 100000) {
    advantages.push('Kilometre makul seviyede, aşırı yıpranma beklenmiyor.')
  }
  if (transmissionRisk === 'Düşük') {
    advantages.push('Şanzıman tipi düşük arıza riski taşıyor.')
  }
  if (engineData && knownProblems.length === 0) {
    advantages.push('Bu motor için kayıtlı belirgin bir kronik sorun bulunmuyor.')
  }

  if (hasYear && age > 10) {
    risks.push('Araç 10 yaşın üzerinde, genel yıpranma ve bakım masrafı riski artıyor.')
  }
  if (hasKm && Number(km) > 150000) {
    risks.push('Yüksek kilometre nedeniyle mekanik parçalarda aşınma riski artıyor.')
  }
  if (!engineData) {
    risks.push(
      'Bu araç veritabanımızda yok; motoruna özgü kronik sorunlar değerlendirmeye katılamadı. Aşağıdaki "Bu Aracı Araştır" bölümünden bilgi alabilirsin.'
    )
  }
  if (transmissionRisk === 'Yüksek') {
    risks.push('Bu şanzıman tipi yüksek arıza/bakım maliyeti riski taşıyor, mutlaka test sürüşü yapılmalı.')
  }
  knownProblems
    .filter((p) => p.risk === 'Yüksek' || p.risk === 'Orta')
    .forEach((p) => {
      risks.push(`${p.title}: ${p.description}`)
    })

  knownProblems.forEach((p) => {
    checkpoints.push(`${p.title} (${p.checkKm} km aralığında kontrol edilmeli)`)
  })
  inspectionChecklist.forEach((item) => {
    checkpoints.push(item)
  })
  if (fuelType === 'Dizel') {
    checkpoints.push('DPF/partikül filtresi ve egzoz dumanı rengi')
  }
  if (transmission && transmission.toLowerCase().includes('otomatik')) {
    checkpoints.push('Otomatik şanzıman yağı değişim geçmişi')
  }

  return {
    score,
    band,
    age,
    engineData,
    dataQuality: assessDataQuality(formData, engineData),
    knownProblems,
    inspectionChecklist,
    advantages: [...new Set(advantages)],
    risks: [...new Set(risks)],
    checkpoints: [...new Set(checkpoints)],
    breakdown: {
      baseScore,
      agePenalty,
      kmPenalty,
      transmissionPenalty,
      problemsPenalty
    }
  }
}

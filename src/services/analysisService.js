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

export function analyzeVehicle(formData) {
  const { year, km, transmission, fuelType } = formData
  const engineData = resolveEngineData(formData)

  const baseScore = engineData?.reliabilityScore ?? 70
  const knownProblems = engineData?.knownProblems ?? []
  const transmissionRisk = engineData?.transmissionRisk ?? 'Orta'
  const inspectionChecklist = engineData?.inspectionChecklist ?? []

  const age = vehicleAge(year)
  const agePenalty = getAgePenalty(age)
  const kmPenalty = getKmPenalty(km)
  const transmissionPenalty = TRANSMISSION_RISK_PENALTY[transmissionRisk] ?? 6
  const problemsPenalty = getProblemsPenalty(knownProblems)

  const rawScore = baseScore - agePenalty - kmPenalty - transmissionPenalty - problemsPenalty
  const score = Math.max(0, Math.min(100, Math.round(rawScore)))
  const band = getScoreBand(score)

  const advantages = []
  const risks = []
  const checkpoints = []

  if (baseScore >= 80) {
    advantages.push('Bu motor/şanzıman kombinasyonu genel olarak güvenilir kabul ediliyor.')
  }
  if (age <= 5) {
    advantages.push('Araç nispeten yeni, yaşa bağlı yıpranma riski düşük.')
  }
  if (Number(km) <= 100000) {
    advantages.push('Kilometre makul seviyede, aşırı yıpranma beklenmiyor.')
  }
  if (transmissionRisk === 'Düşük') {
    advantages.push('Şanzıman tipi düşük arıza riski taşıyor.')
  }
  if (knownProblems.length === 0) {
    advantages.push('Bu motor için kayıtlı belirgin bir kronik sorun bulunmuyor.')
  }

  if (age > 10) {
    risks.push('Araç 10 yaşın üzerinde, genel yıpranma ve bakım masrafı riski artıyor.')
  }
  if (Number(km) > 150000) {
    risks.push('Yüksek kilometre nedeniyle mekanik parçalarda aşınma riski artıyor.')
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

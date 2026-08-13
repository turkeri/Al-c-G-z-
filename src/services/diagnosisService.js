import symptoms from '../data/symptoms.json'
import { resolveEngineData } from './analysisService'

const TR_MAP = { ı: 'i', İ: 'i', ş: 's', Ş: 's', ğ: 'g', Ğ: 'g', ü: 'u', Ü: 'u', ö: 'o', Ö: 'o', ç: 'c', Ç: 'c' }

const STOPWORDS = new Set([
  've', 'ile', 'ama', 'fakat', 'bir', 'bu', 'su', 'o', 'da', 'de', 'ki', 'mi', 'mu', 'ne',
  'icin', 'gibi', 'cok', 'az', 'daha', 'sonra', 'once', 'her', 'ben', 'benim', 'aracim',
  'arabam', 'araba', 'arac', 'oldu', 'oluyor', 'var', 'yok', 'ediyor', 'yapiyor', 'geliyor',
  'diye', 'kadar', 'ise', 'ya', 'hem', 'ancak', 'bazen', 'surekli', 'hep'
])

const PREFIX_LENGTH = 4
const MIN_TOKEN_FOR_PREFIX = 6

const WEIGHT_PHRASE = 10
const WEIGHT_TOKEN_EXACT = 3
const WEIGHT_TOKEN_PREFIX = 1.2
const WEIGHT_TITLE_TOKEN = 2
const WEIGHT_VEHICLE_BOOST = 6

export function normalizeText(text) {
  if (!text) return ''
  let out = ''
  for (const ch of String(text)) {
    out += TR_MAP[ch] ?? ch
  }
  return out
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function tokenize(text) {
  return normalizeText(text)
    .split(' ')
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

function prefixOf(token) {
  return token.length >= MIN_TOKEN_FOR_PREFIX ? token.slice(0, PREFIX_LENGTH) : token
}

function buildSymptomIndex(symptom) {
  const keywordPhrases = symptom.keywords.map((k) => normalizeText(k))
  const keywordTokens = new Set()
  const keywordPrefixes = new Set()
  keywordPhrases.forEach((phrase) => {
    tokenize(phrase).forEach((t) => {
      keywordTokens.add(t)
      keywordPrefixes.add(prefixOf(t))
    })
  })
  const titleTokens = new Set(tokenize(symptom.title))
  return { keywordPhrases, keywordTokens, keywordPrefixes, titleTokens }
}

const INDEX = symptoms.map((s) => ({ symptom: s, index: buildSymptomIndex(s) }))

function scoreSymptom(queryNormalized, queryTokens, entry) {
  const { index } = entry
  let score = 0
  const matchedTerms = new Set()

  index.keywordPhrases.forEach((phrase) => {
    if (phrase.includes(' ') && queryNormalized.includes(phrase)) {
      score += WEIGHT_PHRASE
      matchedTerms.add(phrase)
    }
  })

  queryTokens.forEach((token) => {
    if (index.keywordTokens.has(token)) {
      score += WEIGHT_TOKEN_EXACT
      matchedTerms.add(token)
    } else if (index.keywordPrefixes.has(prefixOf(token))) {
      score += WEIGHT_TOKEN_PREFIX
      matchedTerms.add(token)
    }
    if (index.titleTokens.has(token)) {
      score += WEIGHT_TITLE_TOKEN
      matchedTerms.add(token)
    }
  })

  return { score, matchedTerms: [...matchedTerms] }
}

function findVehicleLinks(symptom, engineData) {
  if (!engineData?.knownProblems?.length) return []
  const symptomText = normalizeText(
    [symptom.title, ...symptom.keywords, ...symptom.causes.map((c) => c.cause)].join(' ')
  )
  const symptomTokens = new Set(tokenize(symptomText))

  return engineData.knownProblems.filter((problem) => {
    const problemTokens = tokenize(problem.title)
    return problemTokens.some(
      (t) => symptomTokens.has(t) || [...symptomTokens].some((s) => prefixOf(s) === prefixOf(t))
    )
  })
}

const URGENCY_RANK = { Yüksek: 3, Orta: 2, Düşük: 1 }

function highestUrgency(causes) {
  return causes.reduce((acc, c) => {
    const rank = URGENCY_RANK[c.urgency] || 0
    return rank > (URGENCY_RANK[acc] || 0) ? c.urgency : acc
  }, 'Düşük')
}

export function diagnose(complaintText, formData = null, limit = 5) {
  const queryNormalized = normalizeText(complaintText)
  const queryTokens = tokenize(complaintText)

  if (queryTokens.length === 0) {
    return { matches: [], queryTokens: [], hasVehicleContext: false }
  }

  const engineData = formData?.brand && formData?.model ? resolveEngineData(formData) : null

  const scored = INDEX.map((entry) => {
    const { score, matchedTerms } = scoreSymptom(queryNormalized, queryTokens, entry)
    const vehicleLinks = engineData ? findVehicleLinks(entry.symptom, engineData) : []
    const totalScore = score + vehicleLinks.length * WEIGHT_VEHICLE_BOOST * (score > 0 ? 1 : 0)
    return { symptom: entry.symptom, score: totalScore, matchedTerms, vehicleLinks }
  }).filter((r) => r.score > 0)

  scored.sort((a, b) => b.score - a.score)

  const top = scored.slice(0, limit)
  const maxScore = top.length ? top[0].score : 0

  const matches = top.map((r) => ({
    symptom: r.symptom,
    matchedTerms: r.matchedTerms,
    vehicleLinks: r.vehicleLinks,
    confidence: maxScore > 0 ? Math.round((r.score / maxScore) * 100) : 0,
    urgency: highestUrgency(r.symptom.causes)
  }))

  return {
    matches,
    queryTokens,
    hasVehicleContext: !!engineData,
    engineData
  }
}

export function getAllSymptoms() {
  return symptoms
}

export function getSymptomCategories() {
  return [...new Set(symptoms.map((s) => s.category))].sort((a, b) => a.localeCompare(b, 'tr'))
}

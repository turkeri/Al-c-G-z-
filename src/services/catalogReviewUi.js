export const REVIEW_STATUSES = ['pending', 'accepted', 'rejected', 'deferred']
export const REVIEW_CONFIDENCES = ['unknown', 'low', 'medium', 'high']

const STATUS_LABELS = { pending: 'Bekliyor', accepted: 'Kabul edildi', rejected: 'Reddedildi', deferred: 'Ertelendi' }
export const statusLabel = (status) => STATUS_LABELS[status] || status || ''

// Reason code, worker tarafında sabit bir enum değildir (yalnız non-empty
// string doğrulanır). Bilinen kodlar için Türkçe karşılık verilir; bilinmeyen
// bir kod uydurma çeviri yerine altçizgiyi boşluğa çevirip sadeleştirilir.
const REASON_LABELS = {
  LOW_CONFIDENCE: 'Düşük güven',
  UNMATCHED: 'Eşleşme bulunamadı',
  AMBIGUOUS_MATCH: 'Birden fazla aday eşleşme'
}

export function reasonCodeLabel(code) {
  if (!code) return ''
  if (REASON_LABELS[code]) return REASON_LABELS[code]
  const text = String(code).toLowerCase().replace(/_/g, ' ').trim()
  return text ? text.charAt(0).toLocaleUpperCase('tr') + text.slice(1) : ''
}

/** Yalnız pending kayıtlarda ve catalog:write izniyle işlem gösterilir. */
export function reviewActionsFor(status, permissions) {
  if (status !== 'pending') return []
  if (!Array.isArray(permissions) || !permissions.includes('catalog:write')) return []
  return ['accept', 'reject', 'defer']
}

/** Boş/undefined filtre değerlerini atar; backend'in beklediği parametrelerle sınırlar. */
export function buildReviewQuery(filters = {}) {
  const query = {}
  for (const key of ['status', 'confidence', 'type', 'q', 'cursor', 'limit']) {
    const value = filters[key]
    if (value !== undefined && value !== null && value !== '') query[key] = value
  }
  return query
}

/** Cursor sayfalamasında aynı kaydın iki kez eklenmesini önler. */
export function mergeReviewItems(current, incoming) {
  return [...current, ...incoming.filter((item) => !current.some((saved) => saved.id === item.id))]
}

/** Accept, mevcut proposed_target_id ya da yeni seçilen hedef olmadan etkin olamaz. */
export function canAcceptReview(item, pickedTargetId) {
  return Boolean(pickedTargetId || item?.proposed_target_id || '')
}

/**
 * source_summary_json güvenli biçimde satıra döker.
 *
 * Bozuk/beklenmeyen JSON sessizce boş listeye düşer — kullanıcıya ham JSON
 * ya da parse hatası asla gösterilmez.
 */
export function parseSourceSummary(json) {
  if (!json) return []
  try {
    const value = JSON.parse(json)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return []
    return Object.entries(value).filter(([, v]) => v !== undefined && v !== null && v !== '')
  } catch {
    return []
  }
}

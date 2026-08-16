import { ENTITY_FORMS } from './adminCatalogForms.js'

/**
 * ENTITY_LIST_CONFIG, worker tarafındaki `server/cloudflare-worker/catalog/
 * entity-list.js` içindeki `config` nesnesinin filtre allowlist'inin bire
 * bir istemci taraflı aynasıdır. Worker, allowlist'te olmayan bir query
 * parametresi görürse 400 döner — bu yüzden UI yalnız bu listede olan
 * alanları göstermeli ve backend'e göndermelidir.
 *
 * Alan tipini (select/text/number/parent) tekrar tanımlamak yerine
 * `adminCatalogForms.js`teki ENTITY_FORMS'tan türetilir — aynı DB kolonu
 * için iki ayrı "doğru" tanım olmasın diye.
 */
export const ENTITY_LIST_CONFIG = {
  brands: ['active', 'source_confidence', 'country_code'],
  models: ['brand_id', 'active', 'source_confidence'],
  generations: ['model_id', 'active', 'source_confidence'],
  engines: ['fuel_type', 'active', 'source_confidence'],
  transmissions: ['transmission_type', 'active', 'source_confidence'],
  packages: ['active', 'source_confidence'],
  equipment: ['category', 'active', 'source_confidence'],
  vehicleVariants: ['generation_id', 'engine_id', 'transmission_id', 'package_id', 'active', 'source_confidence'],
  problemArchetypes: ['category', 'default_severity', 'active', 'source_confidence'],
  problemApplicability: [
    'problem_archetype_id', 'generation_id', 'engine_id', 'transmission_id', 'package_id',
    'vehicle_variant_id', 'confidence', 'evidence_status', 'active'
  ],
  maintenanceItems: ['category', 'active', 'source_confidence'],
  maintenanceApplicability: ['maintenance_item_id', 'generation_id', 'vehicle_variant_id', 'scope_type', 'confidence'],
  referenceValues: ['generation_id', 'vehicle_variant_id', 'currency', 'value_type', 'confidence', 'active'],
  valuationFactors: ['factor_type', 'active', 'source_confidence']
}

// referenceValues.currency düzenleme formunda yok (sunucu varsayılan TRY
// atıyor) ama listelemede filtrelenebilir; ENTITY_FORMS'ta karşılığı
// olmadığı için tek elle tanımlanmış istisna budur.
const FILTER_OVERRIDES = {
  'referenceValues.currency': ['Para birimi', 'text']
}

/** Bir filtre alanının etiketini ve widget tipini ENTITY_FORMS'tan türetir. */
export function filterFieldMeta(entity, field) {
  const override = FILTER_OVERRIDES[`${entity}.${field}`]
  if (override) return { label: override[0], type: override[1] }
  const match = (ENTITY_FORMS[entity]?.fields || []).find(([name]) => name === field)
  if (!match) return { label: field, type: 'text' }
  const [, label, type] = match
  return { label, type }
}

/** Bir entity'nin filtrelenebilir alan listesi. Bilinmeyen entity → boş. */
export function filtersFor(entity) {
  return ENTITY_LIST_CONFIG[entity] || []
}

/**
 * URL query'sinden (URLSearchParams ya da düz obje) bu entity için geçerli
 * arama + filtreleri çıkarır. Allowlist dışındaki ya da boş parametreler
 * sessizce atılır — backend'e asla bilinmeyen bir anahtar gitmez.
 */
export function parseEntityFilters(entity, source) {
  const get = (key) => {
    if (!source) return null
    if (typeof source.get === 'function') return source.get(key)
    return source[key] ?? null
  }
  const q = (get('q') || '').trim()
  const filters = {}
  for (const field of filtersFor(entity)) {
    const value = get(field)
    if (value !== null && value !== undefined && String(value).trim() !== '') filters[field] = String(value)
  }
  return { q, filters }
}

/**
 * Mevcut URL parametrelerinin üzerine yeni filtre durumunu yazar.
 * Boş değerler URL'de tutulmaz; allowlist dışı anahtarlar (q ve entity'nin
 * kendi filtreleri dışında her şey) korunmadan atılır — böylece entity
 * değişince önceki entity'nin filtreleri URL'de sürüklenip kalmaz.
 */
export function buildEntityUrlParams(entity, patch) {
  const params = new URLSearchParams()
  const q = (patch.q ?? '').trim()
  if (q) params.set('q', q)
  for (const field of filtersFor(entity)) {
    const value = patch.filters?.[field]
    if (value !== undefined && value !== null && String(value).trim() !== '') params.set(field, String(value))
  }
  return params
}

/** Cursor sayfalamasında aynı kaydın iki kez eklenmesini önler. */
export function mergeEntityItems(current, incoming) {
  return [...current, ...incoming.filter((item) => !current.some((saved) => saved.id === item.id))]
}

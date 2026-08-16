export function validateVehicleVariants(plan) {
  const blockingErrors = [], warnings = []
  const add = (code, entityType, entityId, message) => blockingErrors.push({ code, entityType, entityId, message })
  const ids = (items) => new Set((items || []).map((item) => item.id))
  const generations = ids(plan.coreGenerations), engines = ids(plan.coreEngines), transmissions = ids(plan.coreTransmissions), packages = ids(plan.corePackages)
  const seen = new Map(), legacy = new Map()
  for (const item of plan.variants || []) {
    if (item.revision_id !== plan.revisionId) add('REVISION_MISMATCH', 'variant', item.id, 'Revision uyumsuz.')
    if (!generations.has(item.generation_id)) add('ORPHAN_GENERATION', 'variant', item.id, 'Generation bulunamadı.')
    if (item.engine_id && !engines.has(item.engine_id)) add('ORPHAN_ENGINE', 'variant', item.id, 'Engine bulunamadı.')
    if (item.transmission_id && !transmissions.has(item.transmission_id)) add('ORPHAN_TRANSMISSION', 'variant', item.id, 'Transmission bulunamadı.')
    if (item.package_id && !packages.has(item.package_id)) add('ORPHAN_PACKAGE', 'variant', item.id, 'Package bulunamadı.')
    if (item.year_start != null && item.year_end != null && item.year_end < item.year_start) add('INVALID_YEAR_RANGE', 'variant', item.id, 'Yıl aralığı geçersiz.')
    if (item.power_hp_override != null && item.power_hp_override < 0) add('INVALID_POWER', 'variant', item.id, 'Güç negatif olamaz.')
    const fingerprint = JSON.stringify(item)
    if (seen.has(item.id) && seen.get(item.id) !== fingerprint) add('ID_PAYLOAD_COLLISION', 'variant', item.id, 'Canonical ID farklı payload taşıyor.')
    seen.set(item.id, fingerprint)
    if (legacy.has(item.legacy_vehicle_key) && legacy.get(item.legacy_vehicle_key) !== item.source_fingerprint) add('LEGACY_KEY_COLLISION', 'variant', item.id, 'Legacy key farklı kaynak fingerprintine bağlı.')
    legacy.set(item.legacy_vehicle_key, item.source_fingerprint)
    if (item.source_confidence === 'low') add('LOW_CONFIDENCE_RELATION', 'variant', item.id, 'Low güvenli kayıt canonical aday olamaz.')
  }
  if (plan.sourceManifestStable === false) add('SOURCE_CHANGED_DURING_DRY_RUN', 'sourceManifest', 'vehicles', 'Kaynak dry-run sırasında değişti.')
  for (const review of plan.reviewCandidates || []) warnings.push({ code: review.type, entityType: 'review', entityId: review.legacyVehicleKey, message: review.reason })
  return { blockingErrors, warnings, information: [{ code: 'NOT_COMPARED_WITH_D1', message: 'Dry-run D1 snapshot karşılaştırması yapmaz.' }], canImport: blockingErrors.length === 0 }
}

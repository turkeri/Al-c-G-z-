export function validatePackages(plan) {
  const blockingErrors = [], warnings = [], information = []
  const add = (list, code, entityType, entityId, message) => list.push({ code, entityType, entityId, message })
  const records = (name) => plan[name] || []
  const ids = (items) => new Set(items.map((item) => item.id))
  const unique = (items, type) => {
    const seen = new Map()
    for (const item of items) {
      const fingerprint = JSON.stringify(item)
      if (seen.has(item.id) && seen.get(item.id) !== fingerprint) add(blockingErrors, 'ID_PAYLOAD_COLLISION', type, item.id, 'Aynı canonical ID farklı payload taşıyor.')
      else if (seen.has(item.id)) add(blockingErrors, 'DUPLICATE_ID', type, item.id, 'Duplicate canonical ID.')
      else seen.set(item.id, fingerprint)
    }
  }
  const packages = records('packages'), equipment = records('equipment'), generations = records('coreGenerations')
  const generationPackages = records('generationPackageRelations'), packageEquipment = records('packageEquipmentRelations')
  for (const [type, items] of Object.entries({ package: packages, equipment, generationPackage: generationPackages, packageEquipment })) unique(items, type)
  const packageIds = ids(packages), equipmentIds = ids(equipment), generationIds = ids(generations)
  const revisionId = plan.revisionId
  for (const [type, items] of Object.entries({ package: packages, equipment, generationPackage: generationPackages, packageEquipment })) {
    for (const item of items) if (item.revision_id !== revisionId) add(blockingErrors, 'REVISION_MISMATCH', type, item.id || `${item.package_id}|${item.equipment_id}`, 'Kayıt core revision ile uyumlu değil.')
  }
  for (const item of packages) {
    if (!String(item.display_name || '').trim()) add(blockingErrors, 'EMPTY_PACKAGE_NAME', 'package', item.id, 'Paket adı boş olamaz.')
    if (item.year_start != null && item.year_end != null && item.year_end < item.year_start) add(blockingErrors, 'INVALID_YEAR_RANGE', 'package', item.id, 'Geçersiz paket yıl aralığı.')
  }
  for (const item of equipment) {
    if (!String(item.display_name || '').trim()) add(blockingErrors, 'EMPTY_EQUIPMENT_NAME', 'equipment', item.id, 'Donanım adı boş olamaz.')
    if (!item.category) add(warnings, 'MISSING_EQUIPMENT_CATEGORY', 'equipment', item.id, 'Kategori kaynakta yok; tahmin edilmedi.')
  }
  const relationKeys = new Set()
  for (const item of generationPackages) {
    const key = `${item.generation_id}|${item.package_id}|${item.year_start ?? ''}|${item.year_end ?? ''}|${item.body_type ?? ''}`
    if (relationKeys.has(key)) add(blockingErrors, 'DUPLICATE_GENERATION_PACKAGE_RELATION', 'generationPackage', item.id, 'Aynı generation-package kapsamı tekrar ediyor.')
    relationKeys.add(key)
    if (!generationIds.has(item.generation_id)) add(blockingErrors, 'ORPHAN_GENERATION', 'generationPackage', item.id, 'Tanımsız generation ilişkisi.')
    if (!packageIds.has(item.package_id)) add(blockingErrors, 'ORPHAN_PACKAGE', 'generationPackage', item.id, 'Tanımsız paket ilişkisi.')
    if (item.source_confidence === 'low') add(blockingErrors, 'LOW_CONFIDENCE_RELATION', 'generationPackage', item.id, 'Low güvenli eşleşme canonical relation olamaz.')
    const generation = generations.find((candidate) => candidate.id === item.generation_id)
    if (generation && item.year_start != null && item.year_end != null && (item.year_start < generation.year_start || item.year_end > generation.year_end)) add(blockingErrors, 'GENERATION_YEAR_MISMATCH', 'generationPackage', item.id, 'Paket yıl aralığı generation kapsamına sığmıyor.')
  }
  const equipmentKeys = new Set()
  for (const item of packageEquipment) {
    const key = `${item.package_id}|${item.equipment_id}`
    if (equipmentKeys.has(key)) add(blockingErrors, 'DUPLICATE_PACKAGE_EQUIPMENT_RELATION', 'packageEquipment', key, 'Aynı paket-donanım ilişkisi tekrar ediyor.')
    equipmentKeys.add(key)
    if (!packageIds.has(item.package_id)) add(blockingErrors, 'ORPHAN_PACKAGE', 'packageEquipment', key, 'Tanımsız paket ilişkisi.')
    if (!equipmentIds.has(item.equipment_id)) add(blockingErrors, 'ORPHAN_EQUIPMENT', 'packageEquipment', key, 'Tanımsız donanım ilişkisi.')
  }
  if (plan.sourceManifestStable === false) add(blockingErrors, 'SOURCE_CHANGED_DURING_DRY_RUN', 'sourceManifest', 'packages', 'Kaynak dosyalar dry-run sırasında değişti.')
  information.push({ code: 'PACKAGE_NAME_NOT_GLOBAL_UNIQUE', message: 'Paket adı global kimlik değildir; canonical ID scope ile üretilir.' })
  information.push({ code: 'NOT_COMPARED_WITH_D1', message: 'Dry-run D1 snapshot karşılaştırması yapmaz.' })
  return { blockingErrors, warnings, information, canImport: blockingErrors.length === 0 }
}

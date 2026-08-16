export function validateCore(plan) {
  const blockingErrors = [], warnings = [], information = []
  const add = (list, code, entityType, entityId, message) => list.push({ code, entityType, entityId, message })
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
  for (const [type, items] of Object.entries({ brand: plan.brands, model: plan.models, generation: plan.generations, engine: plan.engines, transmission: plan.transmissions })) unique(items, type)
  const brandIds = ids(plan.brands), modelIds = ids(plan.models), generationIds = ids(plan.generations), engineIds = ids(plan.engines), transmissionIds = ids(plan.transmissions)
  for (const model of plan.models) if (!brandIds.has(model.brand_id)) add(blockingErrors, 'ORPHAN_BRAND', 'model', model.id, 'Model tanımsız markaya bağlı.')
  for (const generation of plan.generations) {
    if (!modelIds.has(generation.model_id)) add(blockingErrors, 'ORPHAN_MODEL', 'generation', generation.id, 'Nesil tanımsız modele bağlı.')
    if (!Number.isInteger(generation.year_start) || (generation.year_end != null && generation.year_end < generation.year_start)) add(blockingErrors, 'INVALID_YEAR_RANGE', 'generation', generation.id, 'Geçersiz yıl aralığı.')
  }
  for (const engine of plan.engines) for (const field of ['displacement_cc', 'power_hp', 'torque_nm', 'cylinder_count']) if (engine[field] != null && engine[field] <= 0) add(blockingErrors, 'INVALID_TECHNICAL_VALUE', 'engine', engine.id, `${field} pozitif olmalı.`)
  for (const transmission of plan.transmissions) if (transmission.gear_count != null && transmission.gear_count <= 0) add(blockingErrors, 'INVALID_TECHNICAL_VALUE', 'transmission', transmission.id, 'gear_count pozitif olmalı.')
  const relationKeys = new Set()
  for (const relation of [...plan.generationEngines, ...plan.generationTransmissions]) {
    const key = `${relation.kind}|${relation.generation_id}|${relation.target_id}`
    if (relationKeys.has(key)) add(blockingErrors, 'DUPLICATE_RELATION', relation.kind, relation.id, 'Duplicate relation.')
    relationKeys.add(key)
    if (!generationIds.has(relation.generation_id)) add(blockingErrors, 'ORPHAN_GENERATION', relation.kind, relation.id, 'Tanımsız nesil ilişkisi.')
    if (relation.kind === 'generation_engine' && !engineIds.has(relation.target_id)) add(blockingErrors, 'ORPHAN_ENGINE', relation.kind, relation.id, 'Tanımsız motor ilişkisi.')
    if (relation.kind === 'generation_transmission' && !transmissionIds.has(relation.target_id)) add(blockingErrors, 'ORPHAN_TRANSMISSION', relation.kind, relation.id, 'Tanımsız şanzıman ilişkisi.')
  }
  const connectedEngines = new Set(plan.generationEngines.map((item) => item.target_id)), connectedTransmissions = new Set(plan.generationTransmissions.map((item) => item.target_id))
  for (const engine of plan.engines) if (!connectedEngines.has(engine.id)) add(warnings, 'UNUSED_ENGINE', 'engine', engine.id, 'Hiçbir generation ilişkisi yok.')
  for (const transmission of plan.transmissions) if (!connectedTransmissions.has(transmission.id)) add(warnings, 'UNUSED_TRANSMISSION', 'transmission', transmission.id, 'Hiçbir generation ilişkisi yok.')
  information.push({ code: 'NOT_COMPARED_WITH_D1', message: 'Dry-run D1 snapshot karşılaştırması yapmaz.' })
  return { blockingErrors, warnings, information, canImport: blockingErrors.length === 0 }
}

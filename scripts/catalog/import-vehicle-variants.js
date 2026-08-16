import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildCoreDryRun } from './import-core.js'
import { buildPackagesDryRun } from './import-packages.js'
import { normalizeText } from './lib/normalize.js'
import { stableId, payloadFingerprint } from './lib/stable-id.js'
import { validateVehicleVariants } from './lib/validate-vehicle-variants.js'

const sourceFile = 'src/data/vehicles.json'
const readVehicles = async () => JSON.parse(await readFile(new URL('../../src/data/vehicles.json', import.meta.url), 'utf8'))
const sourceHash = async () => createHash('sha256').update(await readFile(new URL('../../src/data/vehicles.json', import.meta.url))).digest('hex')
const years = (value) => { const match = String(value || '').match(/(\d{4})\s*-\s*(\d{4})/); return match ? [Number(match[1]), Number(match[2])] : [null, null] }
const engineName = (value) => normalizeText(value).replace(/tfsi/g, 'tsi').replace(/\s*\/\s*/g, '/')
const modelKey = (brand, model) => `${normalizeText(brand === 'Mercedes' ? 'Mercedes-Benz' : brand)}|${normalizeText(model)}`

export function createLegacyVehicleKey(record, index = null) {
  const [start, end] = years(record.yearRange)
  const key = ['vehicles.json', normalizeText(record.brand), normalizeText(record.model), start, end, normalizeText(record.features?.bodyType)].filter(Boolean)
  return `legacy_vehicle:${payloadFingerprint(key).slice(0, 20)}${key.length === 1 && index != null ? `:${index}` : ''}`
}
export function matchGeneration(record, core) {
  const model = core.models.find((item) => modelKey(core.brands.find((brand) => brand.id === item.brand_id)?.display_name, item.display_name) === modelKey(record.brand, record.model))
  if (!model) return { matched: false, type: 'unmatchedModel', reason: 'Canonical model bulunamadı.', candidates: [] }
  const [start, end] = years(record.yearRange)
  const candidates = core.generations.filter((item) => item.model_id === model.id && start >= item.year_start && end <= item.year_end)
  if (candidates.length === 1) return { matched: true, generation: candidates[0], confidence: 'medium', method: 'singleYearScope' }
  return { matched: false, type: candidates.length ? 'ambiguousGeneration' : 'unmatchedBrand', reason: candidates.length ? 'Birden fazla generation adayı var.' : 'Yıl kapsamına uygun generation yok.', candidates }
}
export function matchEngine(variant, generation, core) {
  const allowed = new Set(core.generationEngines.filter((item) => item.generation_id === generation.id).map((item) => item.target_id))
  const candidates = core.engines.filter((item) => allowed.has(item.id) && normalizeText(item.fuel_type) === normalizeText(variant.fuelType) && engineName(item.display_name) === engineName(variant.name))
  return candidates.length === 1 ? { id: candidates[0].id, confidence: 'medium', method: 'fuelAndName' } : { id: null, type: candidates.length ? 'ambiguousEngine' : 'unmatchedEngine', candidates }
}
export function matchTransmission(variant, generation, core) {
  const allowed = new Set(core.generationTransmissions.filter((item) => item.generation_id === generation.id).map((item) => item.target_id))
  const candidates = core.transmissions.filter((item) => allowed.has(item.id))
  const exact = candidates.filter((item) => normalizeText(item.display_name) === normalizeText(variant.transmission))
  if (exact.length === 1) return { id: exact[0].id, confidence: 'medium', method: 'exactName' }
  if (normalizeText(variant.transmission) === 'manuel' && candidates.filter((item) => normalizeText(item.display_name) === 'manuel').length === 1) return { id: candidates.find((item) => normalizeText(item.display_name) === 'manuel').id, confidence: 'medium', method: 'manual' }
  return { id: null, type: candidates.length > 1 ? 'ambiguousTransmission' : 'unmatchedTransmission', candidates }
}
export async function buildVehicleVariantsDryRun() {
  const hashBefore = await sourceHash(), vehicles = await readVehicles(), core = await buildCoreDryRun(), packages = await buildPackagesDryRun(), revisionId = core.records.revision.id
  const variants = [], reviewCandidates = [], mappings = []
  for (const [recordIndex, record] of vehicles.entries()) {
    const legacyVehicleKey = createLegacyVehicleKey(record, recordIndex), generationMatch = matchGeneration(record, core.records), [year_start, year_end] = years(record.yearRange)
    if (!generationMatch.matched) { reviewCandidates.push({ type: generationMatch.type, legacyVehicleKey, brand: record.brand, model: record.model, yearRange: record.yearRange, candidates: generationMatch.candidates || [], matchMethod: null, confidence: 'unmatched', reason: generationMatch.reason }); continue }
    for (const sourceVariant of record.engines || []) {
      const engine = matchEngine(sourceVariant, generationMatch.generation, core.records), transmission = matchTransmission(sourceVariant, generationMatch.generation, core.records)
      const needsReview = !engine.id || !transmission.id
      if (!engine.id) reviewCandidates.push({ type: engine.type, legacyVehicleKey, brand: record.brand, model: record.model, motor: sourceVariant.name, candidates: engine.candidates || [], matchMethod: null, confidence: 'unmatched', reason: 'Motor canonical olarak tekil eşleşmedi.' })
      if (!transmission.id) reviewCandidates.push({ type: transmission.type, legacyVehicleKey, brand: record.brand, model: record.model, transmission: sourceVariant.transmission, candidates: transmission.candidates || [], matchMethod: null, confidence: 'unmatched', reason: 'Şanzıman canonical olarak tekil eşleşmedi.' })
      const id = stableId('vehicle_variant', [generationMatch.generation.id, engine.id || 'unknown-engine', transmission.id || 'unknown-transmission', year_start, year_end, sourceVariant.name])
      const source_fingerprint = payloadFingerprint([record.brand, record.model, record.yearRange, record.features?.bodyType, record.features?.driveType])
      variants.push({ revision_id: revisionId, id, generation_id: generationMatch.generation.id, engine_id: engine.id, transmission_id: transmission.id, package_id: null, model_year: null, year_start, year_end, body_type: record.features?.bodyType || null, drivetrain: record.features?.driveType || null, fuel_type_override: sourceVariant.fuelType || null, power_hp_override: null, display_name: `${record.brand} ${record.model} ${sourceVariant.name}`, normalized_name: normalizeText(`${record.brand} ${record.model} ${sourceVariant.name}`), active: 1, source_key: `${recordIndex}:${sourceVariant.name}`, source_file: 'vehicles.json', source_confidence: needsReview ? 'medium' : 'medium', legacy_vehicle_key: legacyVehicleKey, source_fingerprint })
      mappings.push({ legacyVehicleKey, variantId: id, sourceVariant: sourceVariant.name })
    }
  }
  const hashAfter = await sourceHash(), sourceManifestStable = hashBefore === hashAfter
  const integrity = validateVehicleVariants({ revisionId, variants, reviewCandidates, coreGenerations: core.records.generations, coreEngines: core.records.engines, coreTransmissions: core.records.transmissions, corePackages: packages.records.packages, sourceManifestStable })
  const duplicateCandidates = variants.length - new Set(variants.map((item) => item.id)).size
  return { mode: 'dry-run', remoteAccess: false, canImport: integrity.canImport, source: { topLevelRecords: vehicles.length, engineVariants: vehicles.reduce((total, item) => total + (item.engines || []).length, 0), sourceManifest: [{ file: sourceFile, sha256: hashBefore }] }, counts: { canonicalVariantCandidates: variants.length, highConfidence: 0, mediumConfidence: variants.length, needsReview: reviewCandidates.length, unmatched: reviewCandidates.filter((item) => item.confidence === 'unmatched').length, duplicateCandidates, legacyMappings: mappings.length }, matches: { engineMatched: variants.filter((item) => item.engine_id).length, transmissionMatched: variants.filter((item) => item.transmission_id).length, packageMatched: 0 }, reviewCandidates, integrity, plan: { createCandidates: variants.length, updates: 'notCompared', unchanged: 'notCompared', rejected: { reviewCandidates: reviewCandidates.length } }, records: { variants, mappings } }
}
const isCli = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url
if (isCli) { if (process.argv.includes('--remote')) { console.error('Remote erişim dry-run aracında yasaktır.'); process.exitCode = 2 } else { const report = await buildVehicleVariantsDryRun(); const output = process.argv.includes('--include-records') ? report : Object.fromEntries(Object.entries(report).filter(([key]) => key !== 'records')); if (process.argv.includes('--json')) console.log(JSON.stringify(output, null, 2)); else console.log(`Variant dry-run\nCandidates: ${report.counts.canonicalVariantCandidates}\nEngine matched: ${report.matches.engineMatched}, transmission matched: ${report.matches.transmissionMatched}\nReview: ${report.counts.needsReview}\ncanImport: ${report.canImport}\nblocking: ${report.integrity.blockingErrors.length}, warnings: ${report.integrity.warnings.length}\nExamples: ${report.reviewCandidates.slice(0, 10).map((item) => `${item.brand} ${item.model}`).join('; ')}`); if (!report.canImport) process.exitCode = 1 } }

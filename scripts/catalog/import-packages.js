import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PACKAGES } from '../../src/data/catalog/packages.js'
import { EQUIPMENT } from '../../src/data/catalog/equipment.js'
import { buildCoreDryRun } from './import-core.js'
import { normalizeText, slugify } from './lib/normalize.js'
import { stableId } from './lib/stable-id.js'
import { validatePackages } from './lib/validate-packages.js'

const files = ['src/data/catalog/packages.js', 'src/data/catalog/equipment.js']
const yearRange = (value) => { const matches = String(value || '').match(/\d{4}/g) || []; return matches.length ? [Number(matches[0]), Number(matches[1] || matches[0])] : [null, null] }
const hashFile = async (file) => createHash('sha256').update(await readFile(new URL(`../../${file}`, import.meta.url))).digest('hex')
const manifest = async () => Promise.all(files.map(async (file) => ({ file, sha256: await hashFile(file) })))
const modelKey = (brand, model) => `${normalizeText(brand)}|${normalizeText(model)}`

export function matchPackageToGeneration(item, corePlan) {
  const models = new Map(corePlan.models.map((model) => [modelKey(corePlan.brands.find((brand) => brand.id === model.brand_id)?.display_name, model.display_name), model]))
  const model = models.get(modelKey(item.brand, item.model))
  const [yearStart, yearEnd] = yearRange(item.years)
  if (!model) return { matched: false, confidence: 'unmatched', reason: 'Canonical model bulunamadı.', candidates: [] }
  const candidates = corePlan.generations.filter((generation) => generation.model_id === model.id)
  if (item.generationId) {
    const generation = candidates.find((candidate) => candidate.id === item.generationId || candidate.source_key === item.generationId)
    return generation ? { matched: true, confidence: 'high', method: 'id', generation, candidates: [generation] } : { matched: false, confidence: 'unmatched', reason: 'Açık generation ID tanımsız.', candidates: [] }
  }
  if (item.generationCode) {
    const matches = candidates.filter((candidate) => normalizeText(candidate.code) === normalizeText(item.generationCode) && yearStart >= candidate.year_start && yearEnd <= candidate.year_end)
    if (matches.length === 1) return { matched: true, confidence: 'medium', method: 'generationCodeAndYear', generation: matches[0], candidates: matches }
    return { matched: false, confidence: 'low', reason: matches.length ? 'Generation code birden fazla aday üretti.' : 'Generation code/yıl kapsamı eşleşmedi.', candidates: matches }
  }
  const matches = candidates.filter((candidate) => yearStart != null && yearEnd != null && yearStart >= candidate.year_start && yearEnd <= candidate.year_end)
  if (matches.length === 1) return { matched: true, confidence: 'medium', method: 'singleGenerationYearScope', generation: matches[0], candidates: matches }
  return { matched: false, confidence: matches.length ? 'low' : 'unmatched', reason: matches.length ? 'Yıl kapsamı birden fazla generation ile eşleşti.' : 'Paket yıl kapsamı hiçbir generation içine sığmıyor.', candidates: matches }
}

export async function buildPackagesDryRun() {
  const sourceManifest = await manifest()
  const core = await buildCoreDryRun()
  const revisionId = core.records.revision.id
  const equipment = EQUIPMENT.map((item, index) => ({ revision_id: revisionId, id: stableId('equipment', [], item.id), category: item.category || null, display_name: item.label, normalized_name: normalizeText(item.label), description: item.whyItMatters || null, active: 1, sort_order: index, source_key: item.id, source_file: 'equipment.js', source_confidence: item.category ? 'high' : 'unknown', created_at: '<db-write-time>', updated_at: '<db-write-time>' }))
  const equipmentBySource = new Map(EQUIPMENT.map((item, index) => [item.id, equipment[index].id]))
  const packages = [], generationPackageRelations = [], packageEquipmentRelations = [], reviewCandidates = [], sourceWarnings = []
  for (const [index, item] of PACKAGES.entries()) {
    const [year_start, year_end] = yearRange(item.years)
    const scope = [item.brand, item.model, item.generationId || item.generationCode || '', year_start, year_end, ...(item.bodyTypes || []), item.name]
    const packageId = stableId('package', scope)
    packages.push({ revision_id: revisionId, id: packageId, display_name: item.name, normalized_name: normalizeText(item.name), code: item.code || null, description: item.extras?.join('; ') || null, active: 1, sort_order: index, source_key: scope.map((part) => slugify(part)).filter(Boolean).join('|'), source_file: 'packages.js', source_confidence: item.confidence === 'dogrulanmis' ? 'high' : 'medium', year_start, year_end, created_at: '<db-write-time>', updated_at: '<db-write-time>' })
    const match = matchPackageToGeneration(item, core.records)
    if (match.matched) {
      for (const body_type of item.bodyTypes || [null]) generationPackageRelations.push({ id: stableId('generation_package', [match.generation.id, packageId, year_start, year_end, body_type]), revision_id: revisionId, generation_id: match.generation.id, package_id: packageId, year_start, year_end, body_type: body_type || null, source_key: item.name, source_file: 'packages.js', source_confidence: match.confidence, created_at: '<db-write-time>' })
    } else reviewCandidates.push({ packageSourceKey: packages.at(-1).source_key, packageName: item.name, brand: item.brand, model: item.model, generationText: item.generationId || item.generationCode || null, yearStart: year_start, yearEnd: year_end, candidates: match.candidates.map((candidate) => ({ id: candidate.id, code: candidate.code, yearStart: candidate.year_start, yearEnd: candidate.year_end })), reason: match.reason, confidence: match.confidence })
    const availabilityByEquipment = new Map()
    for (const [availability, sourceIds] of [['standard', item.includes], ['optional', item.optional], ['unavailable', item.excludes]]) for (const sourceId of sourceIds || []) {
      const values = availabilityByEquipment.get(sourceId) || new Set()
      values.add(availability)
      availabilityByEquipment.set(sourceId, values)
    }
    for (const [sourceId, availabilityValues] of availabilityByEquipment) {
      const availability = availabilityValues.size === 1 ? [...availabilityValues][0] : 'unknown'
      if (availability === 'unknown') sourceWarnings.push({ code: 'CONFLICTING_PACKAGE_EQUIPMENT_AVAILABILITY', entityType: 'packageEquipment', entityId: `${packageId}|${sourceId}`, message: 'Kaynak aynı donanımı çelişkili availability listelerinde taşıyor; unknown olarak korundu.' })
      packageEquipmentRelations.push({ revision_id: revisionId, id: stableId('package_equipment', [packageId, sourceId]), package_id: packageId, equipment_id: equipmentBySource.get(sourceId) || `missing:${sourceId}`, availability, standard: availability === 'standard' ? 1 : 0, notes: null, source_file: 'packages.js', source_confidence: item.confidence === 'dogrulanmis' ? 'high' : 'medium', created_at: '<db-write-time>' })
    }
  }
  const sourceManifestAfter = await manifest()
  const sourceManifestStable = JSON.stringify(sourceManifest) === JSON.stringify(sourceManifestAfter)
  const records = { packages, equipment, generationPackageRelations, packageEquipmentRelations, coreGenerations: core.records.generations }
  const integrity = validatePackages({ ...records, revisionId, sourceManifestStable })
  integrity.warnings.push(...sourceWarnings)
  return { mode: 'dry-run', remoteAccess: false, canImport: core.canImport && integrity.canImport, corePlan: { compatible: core.canImport, sourceManifest: core.sourceManifest }, sourceManifest, counts: { packages: packages.length, equipment: equipment.length, generationPackageRelations: generationPackageRelations.length, packageEquipmentRelations: packageEquipmentRelations.length, matchedPackages: packages.length - reviewCandidates.length, unmatchedPackages: reviewCandidates.filter((candidate) => candidate.confidence === 'unmatched').length, reviewCandidates: reviewCandidates.length }, integrity, reviewCandidates, plan: { createCandidates: { packages: packages.length, equipment: equipment.length, generationPackageRelations: generationPackageRelations.length, packageEquipmentRelations: packageEquipmentRelations.length }, updates: 'notCompared', unchanged: 'notCompared', rejected: { reviewCandidates: reviewCandidates.length } }, records }
}

const isCli = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url
if (isCli) {
  if (process.argv.includes('--remote')) { console.error('Remote erişim dry-run aracında yasaktır.'); process.exitCode = 2 } else {
    const report = await buildPackagesDryRun()
    const output = process.argv.includes('--include-records') ? report : Object.fromEntries(Object.entries(report).filter(([key]) => key !== 'records'))
    if (process.argv.includes('--json')) console.log(JSON.stringify(output, null, 2))
    else console.log(`Package dry-run\nPackages: ${report.counts.packages}\nEquipment: ${report.counts.equipment}\nGeneration-package: ${report.counts.generationPackageRelations}\nPackage-equipment: ${report.counts.packageEquipmentRelations}\nMatched: ${report.counts.matchedPackages}, unmatched: ${report.counts.unmatchedPackages}, review: ${report.counts.reviewCandidates}\ncanImport: ${report.canImport}\nblocking: ${report.integrity.blockingErrors.length}, warnings: ${report.integrity.warnings.length}\nUnmatched: ${report.reviewCandidates.slice(0, 10).map((item) => `${item.brand} ${item.model} ${item.packageName}`).join('; ')}`)
    if (!report.canImport) process.exitCode = 1
  }
}

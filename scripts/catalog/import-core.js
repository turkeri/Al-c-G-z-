import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { BRANDS } from '../../src/data/catalog/brands.js'
import { MODELS } from '../../src/data/catalog/models.js'
import { ENGINES } from '../../src/data/catalog/engines.js'
import { TRANSMISSIONS } from '../../src/data/catalog/transmissions.js'
import { normalizeText, slugify } from './lib/normalize.js'
import { stableId } from './lib/stable-id.js'
import { validateCore } from './lib/validate-core.js'

const files = ['src/data/catalog/brands.js', 'src/data/catalog/models.js', 'src/data/catalog/engines.js', 'src/data/catalog/transmissions.js']
const yearRange = (value) => { const match = String(value || '').match(/(\d{4})\s*-\s*(\d{4})/); return match ? [Number(match[1]), Number(match[2])] : [null, null] }
const hashFile = async (file) => createHash('sha256').update(await readFile(new URL(`../../${file}`, import.meta.url))).digest('hex')

export async function buildCoreDryRun() {
  const sourceManifest = await Promise.all(files.map(async (file) => ({ file, sha256: await hashFile(file) })))
  const revisionId = 'dry-run:core-v1'
  const brands = BRANDS.map((item) => ({ revision_id: revisionId, id: stableId('brand', [item.name], item.id), slug: slugify(item.name), display_name: item.name, normalized_name: normalizeText(item.name), active: 1, source_key: item.id, source_file: 'brands.js', source_confidence: 'high', created_at: '<db-write-time>', updated_at: '<db-write-time>' }))
  const brandByName = new Map(BRANDS.map((item, index) => [item.name, brands[index].id]))
  const engines = ENGINES.map((item) => { const [year_start, year_end] = yearRange(item.years); const power = String(item.power || '').match(/\d+/); return { revision_id: revisionId, id: stableId('engine', [item.family, item.name], item.id), code: item.codes?.[0] || null, display_name: item.name, normalized_name: normalizeText(item.name), fuel_type: item.fuel || null, displacement_cc: item.displacement || null, power_hp: power ? Number(power[0]) : null, torque_nm: null, cylinder_count: null, year_start, year_end, active: 1, source_key: item.id, source_file: 'engines.js', source_confidence: 'high', created_at: '<db-write-time>', updated_at: '<db-write-time>' } })
  const transmissions = TRANSMISSIONS.map((item) => ({ revision_id: revisionId, id: stableId('transmission', [item.name], item.id), code: item.id, display_name: item.name, normalized_name: normalizeText(item.name), transmission_type: item.type || null, gear_count: item.gears || null, active: 1, source_key: item.id, source_file: 'transmissions.js', source_confidence: 'high', created_at: '<db-write-time>', updated_at: '<db-write-time>' }))
  const engineBySource = new Map(ENGINES.map((item, index) => [item.id, engines[index].id])), transmissionBySource = new Map(TRANSMISSIONS.map((item, index) => [item.id, transmissions[index].id]))
  const models = [], generations = [], generationEngines = [], generationTransmissions = []
  for (const item of MODELS) {
    const brand_id = brandByName.get(item.brand)
    const id = stableId('model', [brand_id, item.model], item.id)
    models.push({ revision_id: revisionId, id, brand_id, slug: slugify(item.model), display_name: item.model, normalized_name: normalizeText(item.model), active: 1, source_key: item.id || `${item.brand}|${item.model}`, source_file: 'models.js', source_confidence: brand_id ? 'high' : 'low', created_at: '<db-write-time>', updated_at: '<db-write-time>' })
    for (const generation of item.generations || []) {
      const [year_start, year_end] = yearRange(generation.years)
      const generationId = stableId('generation', [id, generation.code, generation.years], generation.id)
      generations.push({ revision_id: revisionId, id: generationId, model_id: id, code: generation.code || null, display_name: `${item.model} ${generation.code || generation.years}`, normalized_name: normalizeText(`${item.model} ${generation.code || generation.years}`), year_start, year_end, active: 1, source_key: generation.code || generation.years, source_file: 'models.js', source_confidence: 'high', created_at: '<db-write-time>', updated_at: '<db-write-time>' })
      for (const sourceId of generation.engineIds || []) generationEngines.push({ revision_id: revisionId, id: stableId('generation_engine', [generationId, sourceId]), kind: 'generation_engine', generation_id: generationId, target_id: engineBySource.get(sourceId) || `missing:${sourceId}`, source_key: sourceId, source_file: 'models.js', source_confidence: 'high' })
      for (const sourceId of generation.transmissionIds || []) generationTransmissions.push({ revision_id: revisionId, id: stableId('generation_transmission', [generationId, sourceId]), kind: 'generation_transmission', generation_id: generationId, target_id: transmissionBySource.get(sourceId) || `missing:${sourceId}`, source_key: sourceId, source_file: 'models.js', source_confidence: 'high' })
    }
  }
  const plan = { revision: { id: revisionId, label: 'Core catalog dry-run', status: 'draft', sourceManifest }, brands, models, generations, engines, transmissions, generationEngines, generationTransmissions }
  const integrity = validateCore(plan)
  const sourceManifestAfter = await Promise.all(files.map(async (file) => ({ file, sha256: await hashFile(file) })))
  if (JSON.stringify(sourceManifest) !== JSON.stringify(sourceManifestAfter)) {
    integrity.blockingErrors.push({ code: 'SOURCE_CHANGED_DURING_DRY_RUN', entityType: 'sourceManifest', entityId: 'core', relation: 'sha256', message: 'Kaynak katalog dosyası dry-run sırasında değişti.', source: 'scripts/catalog/import-core.js' })
    integrity.canImport = false
  }
  return { mode: 'dry-run', remoteAccess: false, canImport: integrity.canImport, sourceManifest, counts: { brands: brands.length, models: models.length, generations: generations.length, engines: engines.length, transmissions: transmissions.length }, relations: { generationEngines: generationEngines.length, generationTransmissions: generationTransmissions.length }, integrity, idStrategy: { deterministic: true, namespaces: ['brand','model','generation','engine','transmission','generation_engine','generation_transmission'], randomUuid: false }, plan: { createCandidates: { brands: brands.length, models: models.length, generations: generations.length, engines: engines.length, transmissions: transmissions.length }, updates: 'notCompared', unchanged: 'notCompared', rejected: {} }, records: plan }
}

const isCli = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url
if (isCli) {
  if (process.argv.includes('--remote')) { console.error('Remote erişim dry-run aracında yasaktır.'); process.exitCode = 2 }
  else { const report = await buildCoreDryRun(); const output = process.argv.includes('--include-records') ? report : Object.fromEntries(Object.entries(report).filter(([key]) => key !== 'records')); if (process.argv.includes('--json')) console.log(JSON.stringify(output, null, 2)); else console.log(`Core dry-run\nBrands: ${report.counts.brands}\nModels: ${report.counts.models}\nGenerations: ${report.counts.generations}\nEngines: ${report.counts.engines}\nTransmissions: ${report.counts.transmissions}\nRelations: ${report.relations.generationEngines + report.relations.generationTransmissions}\ncanImport: ${report.canImport}\nblocking: ${report.integrity.blockingErrors.length}, warnings: ${report.integrity.warnings.length}`); if (!report.canImport) process.exitCode = 1 }
}

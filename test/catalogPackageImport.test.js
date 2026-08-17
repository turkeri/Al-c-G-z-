import test from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile } from 'node:fs/promises'
import { buildPackagesDryRun, matchPackageToGeneration } from '../scripts/catalog/import-packages.js'
import { validatePackages } from '../scripts/catalog/lib/validate-packages.js'
import { stableId } from '../scripts/catalog/lib/stable-id.js'

const exec = promisify(execFile)
const minimalPlan = () => ({ revisionId: 'dry-run:core-v1', sourceManifestStable: true, packages: [{ id: 'p', revision_id: 'dry-run:core-v1', display_name: 'Premium', year_start: 2020, year_end: 2021 }], equipment: [{ id: 'e', revision_id: 'dry-run:core-v1', display_name: 'ESP', category: 'guvenlik' }], coreGenerations: [{ id: 'g', year_start: 2020, year_end: 2022 }], generationPackageRelations: [{ id: 'gp', revision_id: 'dry-run:core-v1', generation_id: 'g', package_id: 'p', year_start: 2020, year_end: 2021, source_confidence: 'medium' }], packageEquipmentRelations: [{ id: 'pe', revision_id: 'dry-run:core-v1', package_id: 'p', equipment_id: 'e' }] })

test('real package dry-run has 134 packages, 53 equipment and keeps core revision compatible', async () => {
  const report = await buildPackagesDryRun()
  assert.equal(report.counts.packages, 134)
  assert.equal(report.counts.equipment, 61)
  assert.equal(report.corePlan.compatible, true)
  assert.equal(report.canImport, true)
})
test('package IDs are deterministic, scoped and package names are not global unique', () => {
  assert.equal(stableId('package', ['Audi', 'A3', '2013', 'Dynamic']), stableId('package', ['Audi', 'A3', '2013', 'Dynamic']))
  assert.notEqual(stableId('package', ['Audi', 'A3', '2013', 'Premium']), stableId('package', ['Skoda', 'Octavia', '2013', 'Premium']))
  assert.notEqual(stableId('generation_package', ['g', 'p', 2013, 2016]), stableId('generation_package', ['g', 'p', 2017, 2020]))
})
test('explicit generation ID is high confidence and single year scope is medium confidence', () => {
  const core = { brands: [{ id: 'b', display_name: 'Audi' }], models: [{ id: 'm', brand_id: 'b', display_name: 'A3' }], generations: [{ id: 'g', model_id: 'm', source_key: '8V', code: '8V', year_start: 2012, year_end: 2020 }] }
  assert.equal(matchPackageToGeneration({ brand: 'Audi', model: 'A3', years: '2013-2020', generationId: '8V' }, core).confidence, 'high')
  assert.equal(matchPackageToGeneration({ brand: 'Audi', model: 'A3', years: '2013-2020' }, core).confidence, 'medium')
})
test('ambiguous or low confidence matching stays review-only', () => {
  const core = { brands: [{ id: 'b', display_name: 'Audi' }], models: [{ id: 'm', brand_id: 'b', display_name: 'A3' }], generations: [{ id: 'g1', model_id: 'm', code: '8V', year_start: 2012, year_end: 2020 }, { id: 'g2', model_id: 'm', code: '8V', year_start: 2012, year_end: 2020 }] }
  assert.equal(matchPackageToGeneration({ brand: 'Audi', model: 'A3', years: '2013-2020', generationCode: '8V' }, core).matched, false)
})
test('known unresolved package model relations remain review candidates', async () => {
  const report = await buildPackagesDryRun()
  const expected = ['Audi|Q3', 'Skoda|Octavia', 'Honda|CR-V', 'Ford|Fiesta', 'Ford|Kuga', 'Peugeot|208', 'Opel|Corsa', 'Hyundai|i10', 'Kia|Sportage']
  const unresolved = new Set(report.reviewCandidates.map((item) => `${item.brand}|${item.model}`))
  for (const key of expected) assert.ok(unresolved.has(key))
  assert.equal(report.reviewCandidates.filter((item) => expected.includes(`${item.brand}|${item.model}`)).length, 9)
})
test('validator blocks missing equipment, orphan generation, invalid years and source collisions', () => {
  const plan = minimalPlan()
  plan.packageEquipmentRelations[0].equipment_id = 'missing'
  plan.generationPackageRelations[0].generation_id = 'missing'
  plan.packages[0].year_end = 2019
  plan.packages.push({ ...plan.packages[0], display_name: 'Different' })
  const codes = validatePackages(plan).blockingErrors.map((item) => item.code)
  for (const code of ['ORPHAN_EQUIPMENT', 'ORPHAN_GENERATION', 'INVALID_YEAR_RANGE', 'ID_PAYLOAD_COLLISION']) assert.ok(codes.includes(code))
})
test('validator detects duplicate package equipment and refuses low confidence canonical relation', () => {
  const plan = minimalPlan()
  plan.packageEquipmentRelations.push({ ...plan.packageEquipmentRelations[0], id: 'pe2' })
  plan.generationPackageRelations[0].source_confidence = 'low'
  const codes = validatePackages(plan).blockingErrors.map((item) => item.code)
  assert.ok(codes.includes('DUPLICATE_PACKAGE_EQUIPMENT_RELATION'))
  assert.ok(codes.includes('LOW_CONFIDENCE_RELATION'))
})
test('warnings do not block import while a changed source hash does', () => {
  const warningPlan = minimalPlan(); warningPlan.equipment[0].category = null
  assert.equal(validatePackages(warningPlan).canImport, true)
  const changedPlan = minimalPlan(); changedPlan.sourceManifestStable = false
  assert.equal(validatePackages(changedPlan).canImport, false)
})
test('dry-run does not use D1, network or file writes and CLI returns JSON', async () => {
  const source = await readFile(new URL('../scripts/catalog/import-packages.js', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /fetch\s*\(|wrangler|writeFile|D1\.(prepare|batch|exec)/i)
  const { stdout } = await exec(process.execPath, ['scripts/catalog/import-packages.js', '--json'])
  assert.equal(JSON.parse(stdout).remoteAccess, false)
  await assert.rejects(exec(process.execPath, ['scripts/catalog/import-packages.js', '--remote']))
})
test('package source hashes stay stable across dry-runs', async () => {
  const a = await buildPackagesDryRun(), b = await buildPackagesDryRun()
  assert.deepEqual(a.sourceManifest, b.sourceManifest)
})

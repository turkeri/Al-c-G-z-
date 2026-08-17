import test from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { buildCoreDryRun } from '../scripts/catalog/import-core.js'
import { normalizeText } from '../scripts/catalog/lib/normalize.js'
import { stableId } from '../scripts/catalog/lib/stable-id.js'
import { validateCore } from '../scripts/catalog/lib/validate-core.js'
const exec = promisify(execFile)

test('core dry-run is deterministic and preserves baseline and Audi A3 relations', async () => {
  const a = await buildCoreDryRun(), b = await buildCoreDryRun()
  assert.deepEqual(a.records.models.map((x) => x.id), b.records.models.map((x) => x.id))
  assert.deepEqual(a.sourceManifest, b.sourceManifest)
  assert.deepEqual(a.counts, { brands: 31, models: 130, generations: 97, engines: 111, transmissions: 28 })
  assert.deepEqual(a.records.generations.filter((x) => x.display_name.startsWith('A3 ')).map((x) => x.code), ['8P','8V','8Y'])
})
test('stable ids include parent context and normalization is deterministic', () => {
  assert.notEqual(stableId('model',['audi','A3']), stableId('model',['bmw','A3']))
  assert.equal(normalizeText(' İSTANBUL  A3 '), normalizeText('istanbul a3'))
  assert.equal(stableId('generation',['a3','8V','2012-2020']), stableId('generation',['a3','8V','2012-2020']))
})
test('validator separates warnings from blocking relations', () => {
  const base = { brands:[{id:'b'}],models:[],generations:[],engines:[],transmissions:[],generationEngines:[],generationTransmissions:[] }
  assert.equal(validateCore(base).canImport, true)
  base.generationEngines.push({ id:'x',kind:'generation_engine',generation_id:'missing',target_id:'missing' })
  assert.equal(validateCore(base).canImport, false)
})
test('CLI JSON is parseable and remote is rejected', async () => {
  const { stdout } = await exec(process.execPath, ['scripts/catalog/import-core.js','--json'])
  assert.equal(JSON.parse(stdout).remoteAccess, false)
  await assert.rejects(exec(process.execPath, ['scripts/catalog/import-core.js','--remote']))
})

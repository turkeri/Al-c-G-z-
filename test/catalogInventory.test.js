import assert from 'node:assert/strict'
import test from 'node:test'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile } from 'node:fs/promises'
import {
  buildInventoryReport,
  findDuplicateIds,
  findOrphanReferences,
  isNegative,
  parseYearRange
} from '../scripts/catalog/catalog-inventory.js'

const execFileAsync = promisify(execFile)
const report = buildInventoryReport()

test('entity türleri ayrı sayılır', () => {
  assert.equal(report.summary.brands, 31)
  assert.equal(report.summary.engineDefinitions, 111)
  assert.notEqual(report.summary.engineDefinitions, report.summary.transmissionDefinitions)
})

test('vehicles üst kaydı model sayısı olarak etiketlenmez', () => {
  assert.equal(report.vehicles.topLevelRecords, 213)
  assert.match(report.definitions.vehicleTopLevelRecord, /model.*değildir/i)
})

test('motor varyantı, problem girdisi ve normalize problem başlığı ayrı sayılır', () => {
  assert.equal(report.vehicles.engineVariants, 335)
  assert.equal(report.vehicles.problemEntries, 740)
  assert.equal(report.vehicles.uniqueProblemTitles, 137)
})

test('duplicate ID küçük fixture ile tespit edilir', () => {
  assert.deepEqual(findDuplicateIds([{ id: 'a' }, { id: 'b' }, { id: 'a' }]), ['a'])
})

test('orphan motor ve şanzıman referansları küçük fixture ile tespit edilir', () => {
  assert.deepEqual(findOrphanReferences(['engine-a', 'missing-engine'], new Set(['engine-a'])), ['missing-engine'])
  assert.deepEqual(findOrphanReferences(['manual', 'missing-transmission'], new Set(['manual'])), ['missing-transmission'])
})

test('package equipment orphan küçük fixture ile tespit edilir', () => {
  assert.deepEqual(findOrphanReferences(['esp', 'missing-equipment'], new Set(['esp'])), ['missing-equipment'])
})

test('geçersiz yıl aralığı ve negatif değer yardımcılarla reddedilir', () => {
  const range = parseYearRange('2024-2020')
  assert.ok(range)
  assert.ok(range.start > range.end)
  assert.equal(parseYearRange('geçersiz'), null)
  assert.equal(isNegative(-1), true)
  assert.equal(isNegative(0), false)
})

test('warning ve blocking error ayrı tutulur', () => {
  assert.equal(report.integrity.blockingErrorCount, 0)
  assert.equal(report.integrity.warningCount, 3)
  assert.notStrictEqual(report.integrity.blockingErrors, report.integrity.warnings)
})

test('aynı girdi deterministik sonuç üretir', () => {
  assert.deepEqual(buildInventoryReport(), report)
})

test('JSON sözleşmesi gerekli üst alanları içerir', () => {
  for (const key of ['summary', 'vehicles', 'integrity', 'knownFixtures', 'sourceUsage', 'definitions']) assert.ok(key in report)
})

test('Audi A3 8P, 8V ve 8Y zincirlerini içerir', () => {
  assert.deepEqual(report.knownFixtures.audiA3.generations.map((generation) => generation.code), ['8P', '8V', '8Y'])
})

test('HomePage katalog sayaçlarını kullanmaz ve dört split source alanı vardır', () => {
  assert.equal(report.sourceUsage.usesCatalogStats, false)
  assert.equal(report.sourceUsage.splitSources.length, 4)
})

test('inventory script network veya remote D1 çağrısı yapmaz', async () => {
  const source = await readFile(new URL('../scripts/catalog/catalog-inventory.js', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /\bfetch\s*\(/)
  assert.doesNotMatch(source, /wrangler\s+/)
})

test('CLI --json çıktısı parse edilebilir JSONdur', async () => {
  const { stdout } = await execFileAsync(process.execPath, ['scripts/catalog/catalog-inventory.js', '--json'])
  const cliReport = JSON.parse(stdout)
  assert.equal(cliReport.summary.brands, report.summary.brands)
  assert.equal(cliReport.integrity.blockingErrorCount, 0)
})

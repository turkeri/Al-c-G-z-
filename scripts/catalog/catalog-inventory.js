import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { BRANDS } from '../../src/data/catalog/brands.js'
import { MODELS } from '../../src/data/catalog/models.js'
import { ENGINES } from '../../src/data/catalog/engines.js'
import { TRANSMISSIONS } from '../../src/data/catalog/transmissions.js'
import { PACKAGES } from '../../src/data/catalog/packages.js'
import { EQUIPMENT } from '../../src/data/catalog/equipment.js'
import { PROBLEM_ARCHETYPES } from '../../src/data/catalog/problems.js'
import { MAINTENANCE_ITEMS } from '../../src/data/catalog/maintenance.js'

const vehiclesJson = JSON.parse(await readFile(new URL('../../src/data/vehicles.json', import.meta.url), 'utf8'))
const vehicleList = Array.isArray(vehiclesJson) ? vehiclesJson : vehiclesJson.vehicles || []
const vehicleEngines = vehicleList.flatMap((vehicle) => vehicle.engines || [])
const vehicleProblems = vehicleEngines.flatMap((engine) => engine.knownProblems || [])
const problemTitles = new Set(vehicleProblems.map((problem) => String(problem.title || '').trim()).filter(Boolean))
export const normalize = (value) => String(value || '').trim().toLocaleLowerCase('tr')
const finding = (code, entityType, entityId, relation, message, source) => ({ code, entityType, entityId, relation, message, source })
const hasValue = (value) => String(value || '').trim().length > 0
export const isNegative = (value) => Number.isFinite(Number(value)) && Number(value) < 0
export const parseYearRange = (value) => {
  const match = String(value || '').match(/^\s*(\d{4})\s*-\s*(\d{4})\s*$/)
  return match ? { start: Number(match[1]), end: Number(match[2]) } : null
}
export const findDuplicateIds = (list) => {
  const seen = new Set()
  return list.map((entry) => entry?.id).filter((id) => id && (seen.has(id) || !seen.add(id)))
}
export const findOrphanReferences = (references, knownIds) => references.filter((id) => !knownIds.has(id))

const sources = [
  { entityType: 'brand', source: 'brands.js', list: BRANDS, id: (entry) => entry.id, required: ['id', 'name'] },
  { entityType: 'engine', source: 'engines.js', list: ENGINES, id: (entry) => entry.id, required: ['id', 'name'] },
  { entityType: 'transmission', source: 'transmissions.js', list: TRANSMISSIONS, id: (entry) => entry.id, required: ['id', 'name'] },
  { entityType: 'equipment', source: 'equipment.js', list: EQUIPMENT, id: (entry) => entry.id, required: ['id', 'label'] },
  { entityType: 'problem', source: 'problems.js', list: PROBLEM_ARCHETYPES, id: (entry) => entry.id, required: ['id', 'title'] },
  { entityType: 'maintenance', source: 'maintenance.js', list: MAINTENANCE_ITEMS, id: (entry) => entry.id, required: ['id', 'label'] }
]

const blockingErrors = []
const warnings = [finding('VEHICLE_CANONICAL_ID_NOT_EXPLICIT', 'vehicle', null, 'id', 'vehicles.json üst kayıtlarında stabil canonical id bulunmadığı için duplicate canonical ID denetimi yapılamaz.', 'vehicles.json')]
const information = []
let duplicateIdCount = 0
let duplicateCanonicalKeyCount = 0
let invalidRangeCount = 0
let missingRequiredFieldCount = 0

for (const source of sources) {
  const seenIds = new Set()
  for (const entry of source.list) {
    const entityId = source.id(entry) || null
    for (const field of source.required) {
      if (!hasValue(entry[field])) {
        missingRequiredFieldCount += 1
        blockingErrors.push(finding('MISSING_REQUIRED_FIELD', source.entityType, entityId, field, `Zorunlu ${field} alanı boş.`, source.source))
      }
    }
    if (entityId && seenIds.has(entityId)) {
      duplicateIdCount += 1
      blockingErrors.push(finding('DUPLICATE_ID', source.entityType, entityId, 'id', 'Aynı açık ID birden fazla kayıtta kullanılmış.', source.source))
    }
    if (entityId) seenIds.add(entityId)
  }
}

const brandNames = new Set(BRANDS.map((brand) => normalize(brand.name)))
const engineIds = new Set(ENGINES.map((engine) => engine.id))
const transmissionIds = new Set(TRANSMISSIONS.map((transmission) => transmission.id))
const equipmentIds = new Set(EQUIPMENT.map((equipment) => equipment.id))
const modelKeys = new Set()
const generationKeys = new Set()

for (const model of MODELS) {
  const modelKey = `${normalize(model.brand)}|${normalize(model.model)}`
  if (!hasValue(model.brand) || !hasValue(model.model)) {
    missingRequiredFieldCount += 1
    blockingErrors.push(finding('MISSING_REQUIRED_FIELD', 'model', modelKey, 'brand/model', 'Modelin marka veya model adı boş.', 'models.js'))
  }
  if (modelKeys.has(modelKey)) {
    duplicateCanonicalKeyCount += 1
    blockingErrors.push(finding('DUPLICATE_CANONICAL_KEY', 'model', modelKey, 'brand/model', 'Aynı marka altında normalize model adı tekrarlanıyor.', 'models.js'))
  }
  modelKeys.add(modelKey)
  if (!brandNames.has(normalize(model.brand))) warnings.push(finding('MODEL_BRAND_NAME_REFERENCE', 'model', modelKey, 'brand', 'Model marka adıyla eşleşemedi; kaynak brandId taşımıyor.', 'models.js'))

  for (const generation of model.generations || []) {
    const generationKey = `${modelKey}|${normalize(generation.code)}`
    if (!hasValue(generation.code)) {
      missingRequiredFieldCount += 1
      blockingErrors.push(finding('MISSING_REQUIRED_FIELD', 'generation', generationKey, 'code', 'Nesil/kasa kodu boş.', 'models.js'))
    }
    if (generationKeys.has(generationKey)) {
      duplicateCanonicalKeyCount += 1
      blockingErrors.push(finding('DUPLICATE_CANONICAL_KEY', 'generation', generationKey, 'model/code', 'Aynı model altında normalize nesil/kasa kodu tekrarlanıyor.', 'models.js'))
    }
    generationKeys.add(generationKey)
    const range = parseYearRange(generation.years)
    if (generation.years && (!range || range.start > range.end)) {
      invalidRangeCount += 1
      blockingErrors.push(finding('INVALID_YEAR_RANGE', 'generation', generationKey, 'years', 'Yıl aralığı geçersiz veya başlangıç yılı bitiş yılından büyük.', 'models.js'))
    }
    for (const id of generation.engineIds || []) if (!engineIds.has(id)) blockingErrors.push(finding('ORPHAN_ENGINE_REFERENCE', 'generation', generationKey, 'engineIds', `Tanımsız motor ID referansı: ${id}.`, 'models.js'))
    for (const id of generation.transmissionIds || []) if (!transmissionIds.has(id)) blockingErrors.push(finding('ORPHAN_TRANSMISSION_REFERENCE', 'generation', generationKey, 'transmissionIds', `Tanımsız şanzıman ID referansı: ${id}.`, 'models.js'))
    if (Array.isArray(generation.packageIds) && generation.packageIds.length) information.push(finding('GENERATION_PACKAGE_IDS_NOT_SUPPORTED', 'generation', generationKey, 'packageIds', 'Paket kaynağı açık paket ID taşımadığı için bu ilişki kanonik olarak denetlenemez.', 'models.js'))
  }
}

const packageKeys = new Set()
for (const pkg of PACKAGES) {
  const packageKey = `${normalize(pkg.brand)}|${normalize(pkg.model)}|${normalize(pkg.years)}|${normalize(pkg.name)}`
  if (!hasValue(pkg.brand) || !hasValue(pkg.model) || !hasValue(pkg.name)) {
    missingRequiredFieldCount += 1
    blockingErrors.push(finding('MISSING_REQUIRED_FIELD', 'package', packageKey, 'brand/model/name', 'Paketin marka, model veya adı boş.', 'packages.js'))
  }
  if (packageKeys.has(packageKey)) {
    duplicateCanonicalKeyCount += 1
    blockingErrors.push(finding('DUPLICATE_CANONICAL_KEY', 'package', packageKey, 'brand/model/years/name', 'Aynı marka-model-yıl kapsamı altında normalize paket adı tekrarlanıyor.', 'packages.js'))
  }
  packageKeys.add(packageKey)
  if (!brandNames.has(normalize(pkg.brand)) || !modelKeys.has(`${normalize(pkg.brand)}|${normalize(pkg.model)}`)) warnings.push(finding('PACKAGE_NAME_REFERENCE', 'package', packageKey, 'brand/model', 'Paketin isim bazlı marka/model ilişkisi eşleşemedi; kaynak canonical ID taşımıyor.', 'packages.js'))
  const range = parseYearRange(pkg.years)
  if (pkg.years && (!range || range.start > range.end)) {
    invalidRangeCount += 1
    blockingErrors.push(finding('INVALID_YEAR_RANGE', 'package', packageKey, 'years', 'Paket yıl aralığı geçersiz veya başlangıç yılı bitiş yılından büyük.', 'packages.js'))
  }
  for (const id of [...(pkg.includes || []), ...(pkg.excludes || []), ...(pkg.optional || [])]) if (!equipmentIds.has(id)) blockingErrors.push(finding('ORPHAN_EQUIPMENT_REFERENCE', 'package', packageKey, 'equipmentIds', `Tanımsız donanım ID referansı: ${id}.`, 'packages.js'))
}

for (const engine of ENGINES) if (isNegative(engine.displacement)) {
  invalidRangeCount += 1
  blockingErrors.push(finding('NEGATIVE_NUMERIC_VALUE', 'engine', engine.id, 'displacement', 'Motor hacmi negatif olamaz.', 'engines.js'))
}
for (const maintenance of MAINTENANCE_ITEMS) for (const field of ['everyKm', 'min', 'max']) if (isNegative(maintenance[field])) {
  invalidRangeCount += 1
  blockingErrors.push(finding('NEGATIVE_NUMERIC_VALUE', 'maintenance', maintenance.id, field, `${field} negatif olamaz.`, 'maintenance.js'))
}

if (PROBLEM_ARCHETYPES.some((problem) => problem.appliesTo)) information.push(finding('PROBLEM_APPLICABILITY_NON_CANONICAL', 'problem', null, 'appliesTo', 'Problem applicability yalnız yakıt/şanzıman türü gibi değerler taşıyor; marka/model/nesil/motor/paket ID referansı yok.', 'problems.js'))
information.push(
  finding('MAINTENANCE_NOT_VEHICLE_SCOPED', 'maintenance', null, 'applicability', 'Bakım tanımları global kalemlerdir; araç ilişkisi türetilemez.', 'maintenance.js'),
  finding('MARKET_DATA_HAS_NO_ENTITY_REFERENCES', 'marketData', null, 'brand/model/generation/engine', 'marketData.js genel katsayılar taşır; doğrulanabilir araç entity referansı yok.', 'marketData.js'),
  finding('PACKAGE_GENERATION_REFERENCE_NOT_EXPLICIT', 'package', null, 'generation', 'Paketlerde generation ID yerine yıl ve kasa metni bulunur; kırılgan isim eşleştirmesi uygulanmadı.', 'packages.js')
)

const orphanReferenceCount = blockingErrors.filter((entry) => entry.code.startsWith('ORPHAN_')).length
const integrity = { blockingErrors, warnings, information, blockingErrorCount: blockingErrors.length, warningCount: warnings.length, informationCount: information.length, orphanReferenceCount, duplicateIdCount, duplicateCanonicalKeyCount, invalidRangeCount, missingRequiredFieldCount }

const sourceUsage = {
  consumers: [
    { consumer: 'src/services/vehicleDataStore.js', sources: ['src/data/vehicles.json', 'Worker GET /data/version', 'Worker GET /data/vehicles', 'IndexedDB vehicle-overlay'], purpose: 'Gömülü araç çekirdeğini sunucu güncellemeleriyle birleştirir.', runtime: 'frontend', canonicalStatus: 'primary', notes: ['Sunucu erişilemezse gömülü veriyle devam eder.'] },
    { consumer: 'src/services/vehicleService.js', sources: ['src/services/vehicleDataStore.js', 'src/data/problemArchetypes.js', 'src/data/catalog/index.js'], purpose: 'Araç seçimi, araç içi kronik sorunlar ve katalog istatistikleri.', runtime: 'frontend', canonicalStatus: 'derived', notes: ['Araç kayıtları dataset üzerinden okunur; arketipler eski ayrı kaynaktan zenginleştirme için kullanılır.'] },
    { consumer: 'src/services/catalogService.js', sources: ['src/data/catalog/index.js', 'src/data/catalog/transmissions.js'], purpose: 'Motor/şanzıman/nesil/paket/donanım profilini kurar.', runtime: 'frontend', canonicalStatus: 'primary', notes: ['Eşleşmeyen katalog katmanı null döner.'] },
    { consumer: 'src/services/valuationService.js', sources: ['src/services/vehicleService.js', 'src/data/catalog/marketData.js', 'src/data/catalog/index.js'], purpose: 'Referans fiyat çıpasını katalog katsayılarıyla aralığa dönüştürür.', runtime: 'frontend', canonicalStatus: 'derived', notes: ['referencePrice vehicles datasetinden, düzeltme katsayıları marketData.js dosyasındandır.'] },
    { consumer: 'src/services/marketService.js', sources: ['src/services/vehicleService.js'], purpose: 'Alternatif gömülü referans-fiyat tahmini üretir.', runtime: 'frontend', canonicalStatus: 'legacy', notes: ['marketData.js kullanmaz; yalnız vehicle referencePrice alanını kullanır.'] },
    { consumer: 'src/services/analysisService.js', sources: ['src/services/vehicleService.js'], purpose: 'Temel analiz skoru için araç motoru ve araç içi sorun kaydını çözer.', runtime: 'frontend', canonicalStatus: 'derived', notes: [] },
    { consumer: 'src/services/diagnosisService.js', sources: ['src/data/symptoms.json', 'src/data/problemArchetypes.js', 'src/services/analysisService.js'], purpose: 'Belirti eşleştirme ve araç motoru bağlamında teşhis ön-analizi.', runtime: 'frontend', canonicalStatus: 'derived', notes: [] },
    { consumer: 'src/services/chronicProblemService.js', sources: ['src/data/catalog/index.js', 'src/data/catalog/transmissions.js', 'src/services/vehicleService.js'], purpose: 'Motor, şanzıman, araç içi kayıt ve genel arketipleri tek risk sonucunda birleştirir.', runtime: 'frontend', canonicalStatus: 'derived', notes: ['Aynı sorun başlığı sonuçta tekilleştirilir.'] },
    { consumer: 'src/pages/AnalysisFormPage.jsx', sources: ['src/services/vehicleService.js', 'src/services/analysisService.js'], purpose: 'Marka/model/motor seçimi ve analiz başlatma.', runtime: 'frontend', canonicalStatus: 'primary', notes: ['Araç seçimi güncel dataset üzerinden gelir.'] },
    { consumer: 'src/pages/AnalysisResultPage.jsx', sources: ['src/services/catalogService.js', 'src/services/marketService.js'], purpose: 'Katalog profili, paket gezgini ve piyasa tahminini gösterir.', runtime: 'frontend', canonicalStatus: 'derived', notes: [] },
    { consumer: 'src/pages/ChronicIssuesPage.jsx', sources: ['src/services/vehicleService.js'], purpose: 'Araç içi motor ve kronik sorun kayıtlarını listeler.', runtime: 'frontend', canonicalStatus: 'primary', notes: ['Statik problem arketipleri doğrudan bu sayfada gösterilmez.'] },
    { consumer: 'src/components/PackageExplorer.jsx', sources: ['src/services/catalogService.js'], purpose: 'Paket donanım ID listesini açıklamalı donanım nesnelerine açar.', runtime: 'frontend', canonicalStatus: 'derived', notes: [] },
    { consumer: 'src/components/VehiclePicker.jsx', sources: ['src/services/vehicleService.js'], purpose: 'Tekrarlı marka/model/motor seçici.', runtime: 'frontend', canonicalStatus: 'primary', notes: [] },
    { consumer: 'src/pages/HomePage.jsx', sources: [], purpose: 'Ana işlem kartları ve aktif duyurular.', runtime: 'frontend', canonicalStatus: 'derived', notes: ['usesCatalogStats: false'] },
    { consumer: 'server/cloudflare-worker/worker.js', sources: ['Cloudflare D1 vehicles', 'Worker GET /data/version', 'Worker GET /data/vehicles'], purpose: 'Araç overlay güncellemelerini D1 üzerinden sunar.', runtime: 'worker', canonicalStatus: 'primary', notes: ['Statik catalog kaynaklarını import etmez.'] }
  ],
  splitSources: [
    { feature: 'Araç veri kümesi', sources: ['src/data/vehicles.json', 'Cloudflare D1 vehicles'], risk: 'Gömülü çekirdek ile D1 overlay farklı revizyonda kalabilir; istemci yalnız overlay anahtarlarını bindirir.', evidence: ['src/services/vehicleDataStore.js: bundledVehicles + hydrateVehicleData()', 'server/cloudflare-worker/worker.js: handleDataVehicles()'] },
    { feature: 'Piyasa değerleme', sources: ['vehicles.json referencePrice', 'src/data/catalog/marketData.js', 'src/services/marketService.js sabitleri'], risk: 'İki ayrı değerleme yolu aynı referans çıpasını farklı katsayılarla yorumlayabilir.', evidence: ['src/services/valuationService.js: valuate()', 'src/services/marketService.js: estimateMarketPrice()'] },
    { feature: 'Kronik sorunlar', sources: ['vehicles.json knownProblems', 'src/data/catalog/engines.js', 'src/data/catalog/transmissions.js', 'src/data/catalog/problems.js', 'src/data/problemArchetypes.js'], risk: 'Aynı sorun farklı kaynaklarda farklı açıklama/maliyetle bulunabilir; sonuç katmanı başlığa göre tekilleştirir.', evidence: ['src/services/chronicProblemService.js: assessChronicRisk()', 'src/services/vehicleService.js: enrichProblem()'] },
    { feature: 'Paket ve araç seçimi', sources: ['src/data/catalog/models.js', 'src/data/catalog/packages.js', 'src/data/catalog/equipment.js', 'vehicles.json'], risk: 'Seçici vehicles datasetinden, paket ekranı statik catalogdan gelir; kapsama farkı paket eşleşmesini boş bırakabilir.', evidence: ['src/components/VehiclePicker.jsx', 'src/services/catalogService.js: buildVehicleProfile()'] }
  ],
  usesCatalogStats: false
}

const rangesOverlap = (left, right) => {
  const a = parseYearRange(left)
  const b = parseYearRange(right)
  if (!a || !b) return false
  const overlapStart = Math.max(a.start, b.start)
  const overlapEnd = Math.min(a.end, b.end)
  return overlapStart === a.start && overlapStart === b.start || overlapEnd - overlapStart >= 1
}
const audiModel = MODELS.find((model) => model.brand === 'Audi' && model.model === 'A3')
const audiPackages = PACKAGES.filter((pkg) => pkg.brand === 'Audi' && pkg.model === 'A3')
const audiVehicleRecords = vehicleList.filter((vehicle) => normalize(vehicle.brand) === 'audi' && normalize(vehicle.model) === 'a3')
const equipmentById = new Map(EQUIPMENT.map((equipment) => [equipment.id, equipment]))
const audiGenerations = (audiModel?.generations || []).map((generation) => {
  const engines = (generation.engineIds || []).map((id) => {
    const engine = ENGINES.find((entry) => entry.id === id)
    return { id, name: engine?.name || null, source: 'src/data/catalog/engines.js', matchMethod: engine ? 'id' : 'notMatched', confidence: engine ? 'high' : 'low', notes: engine ? [] : ['Motor ID katalogda bulunamadı.'] }
  })
  const transmissions = (generation.transmissionIds || []).map((id) => {
    const transmission = TRANSMISSIONS.find((entry) => entry.id === id)
    return { id, name: transmission?.name || null, source: 'src/data/catalog/transmissions.js', matchMethod: transmission ? 'id' : 'notMatched', confidence: transmission ? 'high' : 'low', notes: transmission ? [] : ['Şanzıman ID katalogda bulunamadı.'] }
  })
  const packages = audiPackages.filter((pkg) => rangesOverlap(generation.years, pkg.years)).map((pkg) => {
    const equipment = [...(pkg.includes || []), ...(pkg.excludes || []), ...(pkg.optional || [])].map((id) => ({ id, name: equipmentById.get(id)?.label || null, source: 'src/data/catalog/equipment.js', matchMethod: equipmentById.has(id) ? 'id' : 'notMatched', confidence: equipmentById.has(id) ? 'high' : 'low', notes: [] }))
    return { name: pkg.name, years: pkg.years, source: 'src/data/catalog/packages.js', matchMethod: 'normalizedName', confidence: 'medium', notes: ['Paket kaynağı generation ID taşımıyor; yıl aralığı kesişimiyle ilişkilendirildi.'], equipment }
  })
  const genericProblems = PROBLEM_ARCHETYPES.filter((problem) => problem.appliesTo?.fuel && engines.some((item) => ENGINES.find((engine) => engine.id === item.id)?.fuel === problem.appliesTo.fuel)).map((problem) => ({ id: problem.id, title: problem.title, source: 'src/data/catalog/problems.js', matchMethod: 'normalizedName', confidence: 'low', notes: ['Genel arketip yakıt türü üzerinden eşleşti; araca özgü kayıt değildir.'] }))
  const vehicles = audiVehicleRecords.filter((vehicle) => rangesOverlap(generation.years, vehicle.yearRange)).map((vehicle) => ({ yearRange: vehicle.yearRange, engineVariants: (vehicle.engines || []).map((engine) => ({ name: engine.name, problemCount: (engine.knownProblems || []).length })), referencePrice: vehicle.referencePrice || null, referenceYear: vehicle.referenceYear || null, source: 'src/data/vehicles.json', matchMethod: 'normalizedName', confidence: 'medium', notes: ['vehicles.json nesil ID taşımadığı için yıl aralığı kesişimi kullanıldı.'] }))
  return {
    code: generation.code,
    years: generation.years,
    source: 'src/data/catalog/models.js',
    matchMethod: 'canonicalKey',
    confidence: 'high',
    engines,
    transmissions,
    packages,
    packageMatch: packages.length ? { matched: true, matchMethod: 'normalizedName', confidence: 'medium', notes: ['Yıl aralığı kesişimi kullanıldı.'] } : { matched: false, reason: 'Bu neslin yıl aralığıyla kesişen Audi A3 paket kaydı yok.', source: 'src/data/catalog/packages.js', matchMethod: 'notMatched', confidence: 'high', notes: [] },
    genericProblems,
    vehicles,
    vehicleMatch: vehicles.length ? { matched: true, matchMethod: 'normalizedName', confidence: 'medium', notes: ['Yıl aralığı kesişimi kullanıldı; vehicles.json nesil ID taşımaz.'] } : { matched: false, reason: 'Bu neslin yıl aralığıyla kesişen Audi A3 vehicles.json kaydı yok.', source: 'src/data/vehicles.json', matchMethod: 'notMatched', confidence: 'high', notes: [] }
  }
})
const audiA3 = {
  brand: { value: 'Audi', source: 'src/data/catalog/brands.js', matchMethod: 'id', confidence: 'high', notes: [] },
  model: { value: 'A3', source: 'src/data/catalog/models.js', matchMethod: audiModel ? 'canonicalKey' : 'notMatched', confidence: audiModel ? 'high' : 'low', notes: [] },
  generations: audiGenerations,
  marketData: { matched: false, reason: 'marketData.js araç kimliği veya gerçek ilan fiyatı taşımaz; yalnız genel katsayılar içerir.', source: 'src/data/catalog/marketData.js', matchMethod: 'notMatched', confidence: 'high', notes: [] },
  matchSummary: { fullLinks: audiGenerations.reduce((total, generation) => total + generation.engines.length + generation.transmissions.length, 0), partialLinks: audiGenerations.reduce((total, generation) => total + generation.packages.length + generation.genericProblems.length + generation.vehicles.length, 0) }
}
const report = {
  summary: { brands: BRANDS.length, brandModels: MODELS.length, generations: generationKeys.size, engineDefinitions: ENGINES.length, transmissionDefinitions: TRANSMISSIONS.length, packages: PACKAGES.length, equipment: EQUIPMENT.length, problemArchetypes: PROBLEM_ARCHETYPES.length, maintenanceDefinitions: MAINTENANCE_ITEMS.length },
  vehicles: { topLevelRecords: vehicleList.length, engineVariants: vehicleEngines.length, problemEntries: vehicleProblems.length, uniqueProblemTitles: problemTitles.size, generationValues: 'notDerivable', referencePricePresent: 'notDerivable', referencePriceMissing: 'notDerivable', duplicateTopLevelIds: 0, blankTopLevelIds: vehicleList.filter((vehicle) => !vehicle.id).length },
  integrity,
  knownFixtures: { audiA3 },
  sourceUsage,
  definitions: { vehicleTopLevelRecord: '213 sayısı model, motor veya arıza sayısı değildir; vehicles.json içindeki üst seviye birleşik araç nesnesi sayısıdır.' }
}

export const inventoryReport = report
export const buildInventoryReport = () => report

const isCli = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url
if (isCli && process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2))
else if (isCli) console.log(`Katalog envanteri\nMarka: ${report.summary.brands}\nMarka-model: ${report.summary.brandModels}\nNesil/kasa: ${report.summary.generations}\nMotor: ${report.summary.engineDefinitions}\nVehicles üst kayıt: ${report.vehicles.topLevelRecords}\nVehicles motor varyantı: ${report.vehicles.engineVariants}\nVehicles problem girdisi: ${report.vehicles.problemEntries}\nIntegrity: blocking=${integrity.blockingErrorCount}, warning=${integrity.warningCount}, orphan=${integrity.orphanReferenceCount}, duplicate=${integrity.duplicateIdCount + integrity.duplicateCanonicalKeyCount}, invalidRange=${integrity.invalidRangeCount}\nSplit source: ${sourceUsage.splitSources.length}\nAudi A3: ${audiA3.generations.length} nesil, ${audiA3.matchSummary.fullLinks} tam / ${audiA3.matchSummary.partialLinks} kısmi halka`)

import { archetypeFor } from '../data/problemArchetypes'
import { getCatalogStats } from '../data/catalog'
import { getDataset } from './vehicleDataStore'

/**
 * Veri artık doğrudan JSON dosyasından değil, veri deposundan okunur.
 * Depo gömülü çekirdeği sunucudan gelen güncellemelerle birleştirir; bu
 * dosyadaki fonksiyonların imzası değişmediği için ekranlar etkilenmez.
 */
export function getAllVehicles() {
  return getDataset()
}

/**
 * Bir kronik arıza kaydını arketip bilgisiyle zenginleştirir.
 *
 * Veritabanındaki kayıt "ne olduğunu" söyler (başlık, risk, çözüm, maliyet);
 * arketip ise "nasıl hissedilir" (belirtiler), "hangi kod düşer", "kaç
 * kilometrede çıkar" ve "bu araçtan vazgeçirir mi" sorularını cevaplar.
 * İkisi çalışma anında birleştirilir, böylece 740 kaydın tamamı ek alan
 * kazanır.
 */
export function enrichProblem(problem) {
  const archetype = archetypeFor(problem.title)
  if (!archetype) return { ...problem, symptoms: [], obdCodes: [] }
  return {
    ...problem,
    symptoms: archetype.symptoms,
    obdCodes: archetype.obdCodes,
    typicalKm: problem.checkKm || archetype.typicalKm,
    dealbreaker: archetype.dealbreaker,
    laborHours: archetype.laborHours,
    partNote: archetype.partNote,
    archetypeId: archetype.id
  }
}

/** Motorun kronik arızalarını zenginleştirilmiş biçimde döner. */
export function getEnrichedProblems(brand, model, engineName) {
  const engine = getEngineData(brand, model, engineName)
  if (!engine) return []
  return engine.knownProblems.map(enrichProblem)
}

export function getBrands() {
  return [...new Set(getDataset().map((v) => v.brand))].sort((a, b) => a.localeCompare(b, 'tr'))
}

export function getModelsByBrand(brand) {
  return getDataset()
    .filter((v) => v.brand === brand)
    .map((v) => v.model)
    .sort((a, b) => a.localeCompare(b, 'tr'))
}

export function getVehicleEntry(brand, model) {
  return getDataset().find((v) => v.brand === brand && v.model === model) || null
}

export function getEngineNames(brand, model) {
  const entry = getVehicleEntry(brand, model)
  if (!entry) return []
  return entry.engines.map((e) => e.name)
}

export function getEngineData(brand, model, engineName) {
  const entry = getVehicleEntry(brand, model)
  if (!entry) return null
  return entry.engines.find((e) => e.name === engineName) || null
}

export function findMatchingEngine(brand, model, fuelType, transmission) {
  const entry = getVehicleEntry(brand, model)
  if (!entry) return null
  return (
    entry.engines.find(
      (e) =>
        (!fuelType || e.fuelType === fuelType) &&
        (!transmission || e.transmission === transmission)
    ) || entry.engines[0]
  )
}

export function getDatabaseStats() {
  const catalog = getCatalogStats()
  return {
    brandCount: getBrands().length,
    modelCount: getDataset().length,
    engineCount: getDataset().reduce((sum, v) => sum + v.engines.length, 0),
    problemCount: getDataset().reduce(
      (sum, v) => sum + v.engines.reduce((s, e) => s + e.knownProblems.length, 0),
      0
    ),
    generationCount: catalog.generationCount,
    transmissionCount: catalog.transmissionCount,
    packageCount: catalog.packageCount,
    equipmentCount: catalog.equipmentCount
  }
}

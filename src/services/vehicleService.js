import vehicles from '../data/vehicles.json'

export function getAllVehicles() {
  return vehicles
}

export function getBrands() {
  return [...new Set(vehicles.map((v) => v.brand))].sort((a, b) => a.localeCompare(b, 'tr'))
}

export function getModelsByBrand(brand) {
  return vehicles
    .filter((v) => v.brand === brand)
    .map((v) => v.model)
    .sort((a, b) => a.localeCompare(b, 'tr'))
}

export function getVehicleEntry(brand, model) {
  return vehicles.find((v) => v.brand === brand && v.model === model) || null
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

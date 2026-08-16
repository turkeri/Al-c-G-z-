/**
 * KATALOG SERVİSİ
 *
 * Uygulama ekranları ile `data/catalog` veri katmanı arasındaki ince köprü.
 * Ekranlar doğrudan veri dosyalarını değil bu servisi çağırır; böylece veri
 * kaynağı ileride sunucuya taşınırsa (D1) sadece bu dosya değişir.
 *
 * Katalog eşleşmesi ZORUNLU DEĞİLDİR: eşleşme bulunamazsa null döner ve
 * ekran o bölümü hiç göstermez. Yanlış motor bilgisi göstermektense hiç
 * göstermemek tercih edilir.
 */

import {
  enrichWithCatalog,
  matchEngine,
  getCatalogStats,
  getPackagesFor,
  matchPackage,
  getBrandInfo,
  brandOwnershipScore,
  getGeneration,
  faceliftStatus,
  expandEquipment,
  groupEquipment,
  upcomingMaintenance,
  validateCatalog
} from '../data/catalog'
import { matchTransmissionInfo } from '../data/catalog/transmissions'
import { getVehicleVariant } from './catalogAdapter'

export { getCatalogStats, getPackagesFor, brandOwnershipScore, upcomingMaintenance, validateCatalog }

/**
 * Bir paket kaydını ekranda gösterilebilir hâle getirir: kimlik listeleri
 * kategorilere ayrılmış tam donanım kayıtlarına çevrilir.
 *
 * Ayrı bir fonksiyon olmasının nedeni, aynı dönüşümün üç yerde (analiz sonucu,
 * ilan raporu, yazdırılabilir rapor) tekrar etmesidir.
 */
export function describePackage(pkg) {
  if (!pkg) return null
  return {
    ...pkg,
    includesDetail: groupEquipment(expandEquipment(pkg.includes)),
    excludesDetail: expandEquipment(pkg.excludes),
    optionalDetail: expandEquipment(pkg.optional)
  }
}

/** Canonical donanım satırlarını (display_name/category) kategoriye göre gruplar. */
function groupCanonicalEquipment(rows) {
  const groups = new Map()
  rows.forEach((row) => {
    const key = row.category || 'Diğer'
    if (!groups.has(key)) groups.set(key, { id: key, label: key, items: [] })
    groups.get(key).items.push({ id: row.id, label: row.display_name })
  })
  return [...groups.values()]
}

/**
 * Bir aracın paket/donanım bilgisini canonical katalogdan çeker; yoksa/hata
 * verirse/paket bağlı değilse yerel statik `describePackage`'a düşer.
 *
 * ============================================================================
 * NEDEN AYRI GRUPLAR
 * ============================================================================
 * `catalog_package_equipment.availability` dört değer alır: standard,
 * optional, unavailable, unknown. `unknown` KESİNLİKLE "yok" ya da "var"
 * sayılmaz — ayrı bir grupta durur ve ekran bunu "belirsiz, araçta doğrula"
 * diye göstermelidir. Yerel statik paketlerde bu belirsizlik kategorisi
 * yoktur (`confidence: kismi` tüm listeye uygulanır); canonical veri daha
 * ayrıntılı olduğu için doğruluğu daha iyi yansıtır.
 *
 * @param {object} vehicle { variantId, brand, model, year, packageName, bodyType }
 */
export async function describePackageWithCatalog(vehicle) {
  if (vehicle?.variantId) {
    try {
      const variant = await getVehicleVariant(vehicle.variantId)
      if (variant?.package_id) {
        const rows = variant.equipment || []
        const byAvailability = (value) => rows.filter((r) => r.availability === value)
        return {
          name: variant.package_name || '',
          tier: null,
          confidence: null,
          includesDetail: groupCanonicalEquipment(byAvailability('standard')),
          optionalDetail: byAvailability('optional').map((r) => ({ id: r.id, label: r.display_name })),
          excludesDetail: byAvailability('unavailable').map((r) => ({ id: r.id, label: r.display_name })),
          unknownDetail: byAvailability('unknown').map((r) => ({ id: r.id, label: r.display_name })),
          extras: [],
          source: 'canonical'
        }
      }
    } catch {
      // Ağ hatası ya da beklenmeyen yanıt — aşağıda legacy pakete düşülür.
    }
  }

  const pkg = matchPackage(vehicle?.brand, vehicle?.model, vehicle?.year, vehicle?.packageName, vehicle?.bodyType)
  const legacy = describePackage(pkg)
  return legacy ? { ...legacy, source: 'legacy' } : null
}

/**
 * Bir form/ilan verisinden motor ve şanzıman kaydını bulur.
 *
 * @param {object} formData  { brand, model, year, engine, fuelType, transmission }
 * @returns {{ engine: object|null, transmission: object|null, transmissionConfidence: string|null }}
 */
export function enrichVehicle(formData) {
  if (!formData) return { engine: null, transmission: null, transmissionConfidence: null }

  const engine = matchEngine(formData.brand, formData.engine, {
    fuel: formData.fuelType,
    year: formData.year
  })

  const transmissionInfo = matchTransmissionInfo(formData.transmission, {
    brand: formData.brand,
    year: formData.year
  })

  return {
    engine,
    transmission: transmissionInfo ? transmissionInfo.transmission : null,
    // 'kesin' | 'tahmin' — "tahmin" ise ekranda "muhtemelen" diye gösterilir.
    transmissionConfidence: transmissionInfo ? transmissionInfo.confidence : null
  }
}

export { enrichWithCatalog }

/**
 * Bir araç için TÜM katalog katmanlarını tek çağrıda toplar.
 *
 * Ekranlar bu tek fonksiyonu çağırır; hangi verinin hangi dosyadan geldiğini
 * bilmek zorunda kalmazlar. Bulunamayan katman `null` döner ve ekran o bölümü
 * hiç göstermez — eksik veriyi tahminle doldurmak yerine göstermemeyi
 * tercih ediyoruz.
 *
 * @param {object} formData  { brand, model, year, km, engine, fuelType, transmission, packageName }
 */
export function buildVehicleProfile(formData) {
  if (!formData?.brand) return null

  const engineAndTransmission = enrichVehicle(formData)

  // --- Nesil ---------------------------------------------------------------
  const generationInfo = getGeneration(formData.brand, formData.model, formData.year)
  const generation = generationInfo?.generation || null

  // --- Paket ---------------------------------------------------------------
  const pkg = matchPackage(
    formData.brand,
    formData.model,
    formData.year,
    formData.packageName,
    formData.bodyType
  )
  const packageDetail = describePackage(pkg)

  return {
    // Bu ham bilgiler adapter/Vision/metin ayrıştırıcısından sonra tek bir
    // sözleşmede kalır. Katalog eşleşmesi bulunamasa bile rapor kaynak veriyi
    // kaybetmez; bulunamayan alanlar boş bırakılır, tahmin edilmez.
    vehicle: {
      brand: formData.brand || '',
      model: formData.model || '',
      year: formData.year || '',
      bodyType: formData.bodyType || '',
      engine: formData.engine || '',
      fuelType: formData.fuelType || '',
      transmission: formData.transmission || '',
      packageName: formData.packageName || '',
      km: formData.km || '',
      price: formData.price || '',
      city: formData.city || '',
      color: formData.color || ''
    },
    ...engineAndTransmission,
    brand: getBrandInfo(formData.brand),
    ownership: brandOwnershipScore(formData.brand),
    modelInfo: generationInfo?.model || null,
    generation,
    facelift: generation ? faceliftStatus(generation, formData.year) : null,
    allGenerations: generationInfo?.generations || [],
    package: packageDetail,
    availablePackages: getPackagesFor(
      formData.brand,
      formData.model,
      formData.year,
      formData.bodyType
    ),
    maintenance: upcomingMaintenance(formData)
  }
}

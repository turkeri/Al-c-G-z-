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
  getPackagesFor
} from '../data/catalog'
import { matchTransmissionInfo } from '../data/catalog/transmissions'

export { getCatalogStats, getPackagesFor }

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

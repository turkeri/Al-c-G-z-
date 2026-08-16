/**
 * PİYASA DEĞERLEME MOTORU
 *
 * ============================================================================
 * NE ÜRETİR
 * ============================================================================
 *   { min, avg, max }        piyasa değer aralığı
 *   { listed, diffPercent }  ilan fiyatıyla karşılaştırma
 *   negotiationTarget        savunulabilir bir pazarlık hedefi
 *   factors[]                HANGİ FAKTÖRÜN fiyata ne kadar etki ettiği
 *   confidence               hesabın ne kadar bilgiye dayandığı
 *
 * `factors` dizisi bu servisin en önemli çıktısıdır. Kullanıcıya çıplak bir
 * sayı vermek ("piyasa değeri 1.375.000 TL") ona hiçbir şey öğretmez ve
 * yanlışsa fark edemez. Oysa "2015 model olduğu için -%43, 142.000 km olduğu
 * için -%6, dizel olduğu için +%5" dizisini gören kullanıcı hesabın mantığını
 * görür, kendi bildiğiyle karşılaştırır ve pazarlıkta kullanır.
 *
 * ============================================================================
 * YAPAY ZEKÂ BURAYA KARIŞMAZ
 * ============================================================================
 * Fiyat, kullanıcının en çok güvendiği sayı. Yapay zekâ her çağrıda farklı
 * rakam verir ve kaynağını gösteremez. Bu hesap tamamen deterministiktir:
 * aynı araç için her zaman aynı sonuç çıkar ve internetsiz de çalışır.
 */

import { getVehicleEntry } from './vehicleService'
import {
  PRICE_INDEX,
  MARKET_BASELINE_LABEL,
  ageRetention,
  kmBandFor,
  FUEL_FACTORS,
  TRANSMISSION_FACTORS,
  transmissionFactorKey,
  PACKAGE_FACTORS,
  liquidityNote,
  RANGE_WIDTH,
  NEGOTIATION_BASE_DISCOUNT
} from '../data/catalog/marketData'
import { getBrandInfo, matchPackage } from '../data/catalog'

/** Yüzde etkisini okunur bir metne çevirir: 1.05 → "+%5" */
function percentLabel(factor) {
  const percent = Math.round((factor - 1) * 100)
  if (percent === 0) return '—'
  return (percent > 0 ? '+%' : '-%') + Math.abs(percent)
}

/**
 * Bir aracın piyasa değerini hesaplar.
 *
 * @param {object} vehicle { brand, model, year, km, price, fuelType, transmission, packageName }
 * @returns null (referans fiyat yoksa) ya da değerleme nesnesi
 */
export function valuate(vehicle) {
  if (!vehicle?.brand) return null

  const entry = getVehicleEntry(vehicle.brand, vehicle.model)
  if (!entry?.referencePrice) return null

  const year = Number(vehicle.year)
  const km = Number(vehicle.km)
  const listed = Number(String(vehicle.price || '').replace(/[^\d]/g, '')) || null

  if (!year) return null

  const factors = []

  // --- Temel: referans fiyat ------------------------------------------------
  const base = entry.referencePrice * PRICE_INDEX
  factors.push({
    id: 'referans',
    label: `${entry.brand} ${entry.model} referans değeri`,
    detail: `${entry.referenceYear} model, ${(entry.referenceKm || 0).toLocaleString('tr-TR')} km`,
    effect: '—',
    value: base
  })

  /*
   * --- Yaş -----------------------------------------------------------------
   * Referans yılına GÖRE hesaplanır: referans 2018 ise ve araç 2015 ise,
   * 2015'in kalan değeri / 2018'in kalan değeri oranı uygulanır.
   */
  const currentYear = new Date().getFullYear()
  const vehicleAge = Math.max(0, currentYear - year)
  const referenceAge = Math.max(0, currentYear - (entry.referenceYear || year))
  const ageFactor = ageRetention(vehicleAge) / ageRetention(referenceAge)
  factors.push({
    id: 'yas',
    label: `Model yılı ${year} (${vehicleAge} yaşında)`,
    detail: `Referans ${entry.referenceYear} modele göre`,
    effect: percentLabel(ageFactor)
  })

  // --- Kilometre ------------------------------------------------------------
  let kmFactor = 1
  if (Number.isFinite(km) && km > 0) {
    const band = kmBandFor(km)
    const referenceBand = kmBandFor(entry.referenceKm || 100000)
    kmFactor = band.factor / (referenceBand?.factor || 1)
    factors.push({
      id: 'km',
      label: `${km.toLocaleString('tr-TR')} km (${band.label})`,
      detail: `Referans ${(entry.referenceKm || 100000).toLocaleString('tr-TR')} km`,
      effect: percentLabel(kmFactor)
    })
  }

  // --- Yakıt ----------------------------------------------------------------
  let fuelFactor = 1
  if (vehicle.fuelType && FUEL_FACTORS[vehicle.fuelType]) {
    fuelFactor = FUEL_FACTORS[vehicle.fuelType]
    factors.push({
      id: 'yakit',
      label: vehicle.fuelType,
      detail:
        vehicle.fuelType === 'Dizel'
          ? 'Dizel araç ikinci elde genelde primli işlem görür'
          : vehicle.fuelType === 'Hibrit'
            ? 'Hibrit son yıllarda belirgin prim kazandı'
            : '',
      effect: percentLabel(fuelFactor)
    })
  }

  // --- Şanzıman -------------------------------------------------------------
  let transmissionFactor = 1
  const transmissionKey = transmissionFactorKey(vehicle.transmission)
  if (transmissionKey && TRANSMISSION_FACTORS[transmissionKey]) {
    transmissionFactor = TRANSMISSION_FACTORS[transmissionKey]
    factors.push({
      id: 'sanziman',
      label: vehicle.transmission,
      detail:
        transmissionKey === 'cift-kavrama-riskli'
          ? 'Bu çift kavramalı ünite sorunlarıyla bilindiği için otomatik primini büyük ölçüde kaybeder'
          : transmissionKey === 'otomatik'
            ? 'Otomatik araç şehir içinde daha çok aranır'
            : '',
      effect: percentLabel(transmissionFactor)
    })
  }

  // --- Donanım paketi -------------------------------------------------------
  let packageFactor = 1
  const pkg = matchPackage(
    vehicle.brand,
    vehicle.model,
    vehicle.year,
    vehicle.packageName,
    vehicle.bodyType
  )
  if (pkg && PACKAGE_FACTORS[pkg.tier]) {
    packageFactor = PACKAGE_FACTORS[pkg.tier]
    factors.push({
      id: 'paket',
      label: `${pkg.name} paketi (${pkg.tier})`,
      detail: 'Üst donanım ikinci elde primlidir ama yeni fiyattaki farkın tamamını yansıtmaz',
      effect: percentLabel(packageFactor)
    })
  }

  /*
   * --- Marka likiditesi ----------------------------------------------------
   * Fiyata ÇARPILMAZ: referans fiyat zaten o markanın piyasa fiyatı, ayrıca
   * prim eklemek çifte sayım olurdu. Yalnızca "satarken ne kadar kolay alıcı
   * bulursun" bilgisi olarak taşınır.
   */
  const brandInfo = getBrandInfo(vehicle.brand)
  const liquidity = brandInfo ? liquidityNote(brandInfo.resaleSpeed) : null

  // --- Sonuç ----------------------------------------------------------------
  const avg = base * ageFactor * kmFactor * fuelFactor * transmissionFactor * packageFactor

  /*
   * Aralık genişliği, hesabın ne kadar bilgiye dayandığına göre belirlenir.
   * Az bilgi = geniş aralık. Dar bir aralık vermek, tek sayı vermek kadar
   * yanıltıcıdır.
   */
  const known = [vehicle.year, vehicle.km, vehicle.fuelType, vehicle.transmission].filter(Boolean)
  const confidence = known.length >= 4 ? 'tam' : known.length >= 2 ? 'kismi' : 'zayif'
  const width = RANGE_WIDTH[confidence]

  const round = (value) => Math.round(value / 5000) * 5000
  const min = round(avg * (1 - width))
  const max = round(avg * (1 + width))

  const result = {
    min,
    avg: round(avg),
    max,
    listed,
    factors,
    confidence,
    liquidity,
    baseline: MARKET_BASELINE_LABEL
  }

  if (!listed) return result

  // --- İlan fiyatıyla karşılaştırma ----------------------------------------
  const diffPercent = Math.round(((listed - result.avg) / result.avg) * 100)
  result.diffPercent = diffPercent
  result.diffAmount = listed - result.avg

  if (listed < min) result.verdict = 'ucuz'
  else if (listed > max) result.verdict = 'pahali'
  else result.verdict = 'normal'

  result.label =
    result.verdict === 'ucuz'
      ? 'Piyasa aralığının altında'
      : result.verdict === 'pahali'
        ? 'Piyasa aralığının üzerinde'
        : 'Piyasa aralığında'

  return result
}

/**
 * Pazarlık hedefi üretir.
 *
 * "Kaç lira teklif edeyim" sorusunun cevabı. Piyasa ortalamasının biraz altı
 * hedeflenir; beyan edilen hasar ve yaklaşan bakım kalemleri varsa hedef
 * aşağı çekilir ve GEREKÇESİ gösterilir — pazarlıkta işe yarayan şey rakam
 * değil, rakamın arkasındaki argümandır.
 *
 * @param {object} valuation  valuate() çıktısı
 * @param {object} context    { damage, maintenance, chronic }
 */
export function negotiationTarget(valuation, context = {}) {
  if (!valuation?.avg) return null

  const reasons = []
  let target = valuation.avg * (1 - NEGOTIATION_BASE_DISCOUNT)
  reasons.push({
    label: 'Pazarlık payı',
    detail: 'İkinci elde ilan fiyatı genelde pazarlık payı içerir',
    amount: -(valuation.avg * NEGOTIATION_BASE_DISCOUNT)
  })

  // Beyan edilen hasarın değer kaybı doğrudan düşülür.
  if (context.damage?.lossAmount > 0) {
    target -= context.damage.lossAmount
    reasons.push({
      label: 'Beyan edilen hasar',
      detail: `%${context.damage.lossPercent} tahmini değer kaybı`,
      amount: -context.damage.lossAmount
    })
  }

  /*
   * Yaklaşan bakım kalemlerinin YARISI düşülür, tamamı değil: satıcının bir
   * kısmını yaptırmış olma ihtimali var ve tamamını istemek gerçekçi olmayan
   * bir teklif üretir.
   */
  if (context.maintenance?.total?.min > 0) {
    const share = Math.round(context.maintenance.total.min / 2)
    target -= share
    reasons.push({
      label: 'Yaklaşan bakım kalemleri',
      detail: 'Faturası olmayan kalemler için; toplamın yarısı hesaba katıldı',
      amount: -share
    })
  }

  const rounded = Math.max(0, Math.round(target / 5000) * 5000)

  return {
    target: rounded,
    reasons,
    /*
     * İlan fiyatıyla hedef arasındaki fark, kullanıcının isteyeceği indirim.
     * Negatifse (hedef ilan fiyatının üstünde) indirim istenecek bir durum yok.
     */
    discount: valuation.listed ? Math.max(0, valuation.listed - rounded) : null
  }
}

/**
 * KRONİK SORUN MOTORU
 *
 * ============================================================================
 * NEDEN AYRI BİR MOTOR
 * ============================================================================
 * "Bu araçta ne çıkar?" sorusunun cevabı yapay zekâ yorumuna bırakılmamalı.
 * Yapay zekâ her çağrıda biraz farklı cevap verir, kaynağını gösteremez ve
 * internet yokken hiç çalışmaz. Oysa bu bilgi deterministik olmalı: aynı araç
 * için her zaman aynı liste, aynı sıra, aynı maliyet aralığı çıkmalı.
 *
 * Bu servis KATALOG VERİSİNDEN hesaplar:
 *   catalog/engines.js        → motorun kronik arızaları
 *   catalog/transmissions.js  → şanzımanın kronik arızaları
 *   data/vehicles.json        → araca özel kayıtlı arızalar
 *
 * Yapay zekâ bunun yerine geçmez, üzerine yorum yapar.
 *
 * ============================================================================
 * KİLOMETRE PENCERESİ
 * ============================================================================
 * Bir arıza "150.000 km'de görülür" diye kayıtlıysa, 40.000 km'deki araçta
 * onu en üste koymak yanıltıcıdır. Bu yüzden her kalem aracın kilometresine
 * göre üç durumdan birine düşer:
 *
 *   gecti  — kilometre aralığın üzerinde; yapılmadıysa risk yüksek
 *   yakin  — aralığa girilmiş ya da girilmek üzere; asıl dikkat edilecek grup
 *   erken  — henüz uzak; bilgi olarak durur
 *
 * ============================================================================
 * MALİYET ARALIĞI
 * ============================================================================
 * Kalemlerin maliyetleri toplanırken hepsinin aynı anda çıkacağı VARSAYILMAZ —
 * bu, gerçekçi olmayan korkutucu bir rakam üretir. Bunun yerine kilometreye
 * göre yakın olan kalemler tam, uzak olanlar azaltılmış ağırlıkla toplanır.
 */

import { matchEngine } from '../data/catalog'
import { matchTransmissionInfo } from '../data/catalog/transmissions'
import { getEnrichedProblems } from './vehicleService'

const RISK_WEIGHT = { 'Yüksek': 22, Orta: 11, 'Düşük': 4 }

/** Uzaktaki kalemlerin maliyete katkısı düşürülür. */
const TIMING_FACTOR = { gecti: 1, yakin: 1, erken: 0.35 }
const TIMING_LABEL = {
  gecti: 'Kilometre aralığı geçilmiş',
  yakin: 'Kilometre aralığına yakın',
  erken: 'Henüz erken'
}

/** "25.000 - 60.000 TL" → { min, max } */
function parseCost(text) {
  const numbers = String(text || '')
    .replace(/\./g, '')
    .match(/\d{3,9}/g)
  if (!numbers || !numbers.length) return null
  const values = numbers.map(Number)
  return { min: Math.min(...values), max: Math.max(...values) }
}

/** "100000-180000" ya da "150000+ km" → { from, to } */
function parseKmWindow(text) {
  const cleaned = String(text || '').replace(/\./g, '')
  const numbers = cleaned.match(/\d{4,7}/g)
  if (!numbers || !numbers.length) return null
  const from = Number(numbers[0])
  const to = numbers.length > 1 ? Number(numbers[1]) : null
  return { from, to }
}

/**
 * Kilometre penceresine göre kalemin durumu.
 * Pencere bilinmiyorsa 'yakin' kabul edilir — belirsiz bir kalemi görmezden
 * gelmektense listede tutmak daha güvenlidir.
 */
function timingFor(km, window) {
  if (!km || !window) return 'yakin'
  const upper = window.to || window.from
  if (km >= upper) return 'gecti'
  if (km >= window.from * 0.75) return 'yakin'
  return 'erken'
}

function toItem({ title, risk, cost, note, checkKm, source }, km) {
  const window = parseKmWindow(checkKm)
  const timing = timingFor(km, window)
  return {
    title,
    risk: risk || 'Orta',
    cost: cost || '',
    costRange: parseCost(cost),
    note: note || '',
    checkKm: checkKm || '',
    timing,
    timingLabel: TIMING_LABEL[timing],
    source
  }
}

/**
 * Bir araç için kronik risk değerlendirmesi üretir.
 *
 * @param {object} formData  { brand, model, year, km, engine, fuelType, transmission }
 * @param {object} context   { analysis, catalog } — hazırsa yeniden hesaplanmaz
 * @returns null (veri yoksa) ya da { score, band, items, costRange, dueCount, sources }
 */
export function assessChronicRisk(formData, context = {}) {
  if (!formData?.brand) return null

  const km = Number(formData.km) || null

  const engine =
    context.catalog?.engine ??
    matchEngine(formData.brand, formData.engine, { fuel: formData.fuelType, year: formData.year })

  const transmissionInfo =
    context.catalog?.transmission
      ? { transmission: context.catalog.transmission, confidence: context.catalog.transmissionConfidence }
      : matchTransmissionInfo(formData.transmission, { brand: formData.brand, year: formData.year })

  const items = []
  const sources = []

  // --- Motor kataloğu -------------------------------------------------------
  if (engine) {
    sources.push(`Motor: ${engine.name} (${engine.family})`)
    engine.problems.forEach((p) => {
      items.push(toItem({ ...p, source: engine.family }, km))
    })
  }

  // --- Şanzıman kataloğu ----------------------------------------------------
  if (transmissionInfo?.transmission) {
    const t = transmissionInfo.transmission
    const label = transmissionInfo.confidence === 'tahmin' ? `${t.name} (tahmin)` : t.name
    sources.push(`Şanzıman: ${label}`)
    t.problems.forEach((p) => {
      items.push(toItem({ ...p, source: label }, km))
    })
  }

  // --- Araca özel kayıtlar --------------------------------------------------
  const vehicleProblems = getEnrichedProblems(formData.brand, formData.model, formData.engine) || []
  if (vehicleProblems.length) {
    sources.push('Araç kaydı')
    vehicleProblems.forEach((p) => {
      items.push(
        toItem(
          {
            title: p.title,
            risk: p.risk,
            cost: p.estimatedCost,
            note: p.description,
            checkKm: p.checkKm,
            source: 'Araç kaydı'
          },
          km
        )
      )
    })
  }

  if (!items.length) return null

  // Aynı arıza hem motor hem araç kaydından gelebilir; başlığa göre tekilleştirilir.
  const seen = new Map()
  items.forEach((item) => {
    const key = item.title.toLocaleLowerCase('tr').slice(0, 40)
    const existing = seen.get(key)
    // Daha yüksek riskli ve maliyet bilgisi olan kayıt tutulur.
    if (!existing || RISK_WEIGHT[item.risk] > RISK_WEIGHT[existing.risk]) seen.set(key, item)
  })
  const unique = [...seen.values()]

  /*
   * Sıralama: önce kilometre olarak yakın/geçmiş olanlar, sonra risk seviyesi,
   * sonra maliyet. Kullanıcının ilk gördüğü kalem, en yakında parasını
   * çıkaracak kalem olmalı.
   */
  const timingRank = { gecti: 0, yakin: 1, erken: 2 }
  unique.sort(
    (a, b) =>
      timingRank[a.timing] - timingRank[b.timing] ||
      RISK_WEIGHT[b.risk] - RISK_WEIGHT[a.risk] ||
      (b.costRange?.max || 0) - (a.costRange?.max || 0)
  )

  /*
   * --- Puan ----------------------------------------------------------------
   *
   * Her kalemin cezası düz toplanmaz. Toplasaydık, hakkında ÇOK BİLGİ olan
   * araçlar (Golf, 3 Serisi gibi çok satan, çok yazılan modeller) hakkında
   * hiç kayıt olmayan araçlardan kötü görünürdü. Bu tam tersi bir sonuç: veri
   * zenginliği bir kusur değil, avantajdır.
   *
   * Bu yüzden azalan katsayı uygulanır: en ağır kalem tam, ikincisi %75,
   * üçüncüsü %55... Bir aracın "en kötü üç kalemi" riski büyük ölçüde
   * belirler; on ikinci kalemin katkısı sembolik olmalıdır.
   */
  const DECAY = [1, 0.75, 0.55, 0.4, 0.3, 0.22, 0.16, 0.12, 0.09, 0.07]
  const decayAt = (index) => DECAY[index] ?? 0.05

  const ranked = [...unique].sort((a, b) => {
    const weight = (x) => (RISK_WEIGHT[x.risk] ?? 8) * (x.timing === 'erken' ? 0.35 : 1)
    return weight(b) - weight(a)
  })

  let penalty = 0
  ranked.forEach((item, index) => {
    const base = RISK_WEIGHT[item.risk] ?? 8
    const timingFactor = item.timing === 'erken' ? 0.35 : 1
    penalty += base * timingFactor * decayAt(index)
  })
  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)))

  /*
   * --- Beklenen masraf ------------------------------------------------------
   *
   * Kalemlerin maliyetini olduğu gibi toplamak gerçekçi değildir: hiçbir araçta
   * kayıtlı arızaların HEPSİ birden çıkmaz. Toplam, korkutucu ve yanıltıcı bir
   * rakam üretir ("bu araç sana 317.000 TL'ye patlar" gibi).
   *
   * Bunun yerine her kalem, gerçekleşme olasılığıyla ağırlıklandırılır:
   * yüksek riskli bir kalemin çıkma ihtimali düşük riskliye göre belirgin
   * biçimde fazladır. Sonuç "kesin ödeyeceğin para" değil, "bu araçta önümüzdeki
   * dönemde beklenebilecek masraf" olarak sunulur.
   */
  const LIKELIHOOD = { 'Yüksek': 0.5, Orta: 0.25, 'Düşük': 0.1 }

  let min = 0
  let max = 0
  unique.forEach((item) => {
    if (!item.costRange) return
    const chance = (LIKELIHOOD[item.risk] ?? 0.2) * TIMING_FACTOR[item.timing]
    min += item.costRange.min * chance
    max += item.costRange.max * chance
  })

  const dueCount = unique.filter((i) => i.timing !== 'erken').length

  let band
  if (score >= 75) band = { label: 'Düşük kronik risk', tone: 'excellent' }
  else if (score >= 55) band = { label: 'Orta kronik risk', tone: 'good' }
  else if (score >= 35) band = { label: 'Yüksek kronik risk', tone: 'warning' }
  else band = { label: 'Çok yüksek kronik risk', tone: 'danger' }

  return {
    score,
    band,
    items: unique,
    // Alan adı "beklenen" — ekranda "toplam masraf" diye gösterilmemeli.
    costRange: { min: Math.round(min / 1000) * 1000, max: Math.round(max / 1000) * 1000 },
    costBasis: 'beklenen',
    dueCount,
    sources
  }
}

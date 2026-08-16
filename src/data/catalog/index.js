/**
 * KATALOG KAYIT DEFTERİ
 *
 * ============================================================================
 * MİMARİ
 * ============================================================================
 * Veri tek bir dev JSON yerine konusuna göre ayrı dosyalarda tutulur:
 *
 *   catalog/engines.js        — motor aileleri (kod, güç, kronik arıza)
 *   catalog/transmissions.js  — şanzımanlar (tip, güvenilirlik, sorunlar)
 *   catalog/packages.js       — donanım paketleri
 *   data/vehicles.json        — marka/model/nesil kayıtları (mevcut)
 *
 * Böylece yeni bir motor eklemek tek dosyaya bir kayıt eklemekten ibarettir
 * ve aynı motoru kullanan onlarca araç bundan otomatik yararlanır.
 *
 * ============================================================================
 * MEVCUT VERİYLE İLİŞKİ
 * ============================================================================
 * `vehicles.json` DEĞİŞTİRİLMEZ. Katalog onun üzerine bir bilgi katmanıdır:
 * araç kaydındaki motor adı ("1.6 TDI") ve şanzıman adı ("DSG") katalogla
 * eşleştirilir, eşleşen kayıt varsa ek bilgi (motor kodu, dayanıklılık puanı,
 * şanzıman güvenilirliği, alım notu) sonuca eklenir.
 *
 * Eşleşme bulunamazsa hiçbir şey bozulmaz; uygulama bugünkü davranışını
 * aynen sürdürür. Bu, kataloğu kademeli büyütebilmek için bilinçli bir tercihtir.
 *
 * ============================================================================
 * EŞLEŞTİRME NEDEN BU KADAR UĞRAŞTIRIYOR
 * ============================================================================
 * Aynı motor piyasada bambaşka isimlerle yazılır:
 *
 *   "2.0 TDI"  "2.0 TDI quattro"  "2.0 TFSI"  "20 TDI"   (VAG)
 *   "320d"     "xDrive20d"        "2.0d (N47)"           (BMW)
 *   "220 CDI"  "E220d"            "2.1 CDI (OM651)"      (Mercedes)
 *
 * Bu yüzden eşleştirme tek bir metin karşılaştırması değil, PUANLAMA ile
 * yapılır: marka grubu, motor kodu, ticari kod (320d), hacim, yakıt ve yıl
 * ayrı ayrı puanlanır; eşik puanı geçilmezse "bilmiyorum" denir. Yanlış motor
 * bilgisi göstermek, hiç göstermemekten daha zararlıdır.
 */

import { ENGINES, getEngineById } from './engines'
import { TRANSMISSIONS, getTransmissionById, matchTransmission } from './transmissions'
import { PACKAGES, getPackagesFor, matchPackage } from './packages'
import { BRANDS, getBrandInfo, brandOwnershipScore } from './brands'
import { MODELS, getModelInfo, getGeneration, faceliftStatus, getGenerationCount } from './models'
import { EQUIPMENT, expandEquipment, groupEquipment, getEquipment } from './equipment'
import { MAINTENANCE_ITEMS, upcomingMaintenance, guessSegment } from './maintenance'

export { ENGINES, TRANSMISSIONS, PACKAGES, BRANDS, MODELS, EQUIPMENT, MAINTENANCE_ITEMS }
export { getEngineById, getTransmissionById, matchTransmission, getPackagesFor, matchPackage }
export { getBrandInfo, brandOwnershipScore }
export { getModelInfo, getGeneration, faceliftStatus }
export { expandEquipment, groupEquipment, getEquipment }
export { upcomingMaintenance, guessSegment }

/**
 * Metni eşleştirme için sadeleştirir.
 *
 * Türkçe karakterlerin yanı sıra Avrupa aksanları da temizlenir (NFD ayrıştırma
 * + birleşik işaretlerin atılması). Bu olmadan "Citroën" -> "citro n" olup
 * marka eşleşmesi sessizce kaybediliyordu.
 */
function normalize(text) {
  return String(text || '')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim()
}

/*
 * Marka grupları normalize edilmiş biçimde yazılır ("mercedes benz"), çünkü
 * arama da normalize edilmiş metinle yapılır. Tireli yazım ("mercedes-benz")
 * normalize sırasında boşluğa döner.
 */
const BRAND_GROUPS = {
  volkswagen: 'VAG', audi: 'VAG', skoda: 'VAG', seat: 'VAG', cupra: 'VAG',
  bmw: 'BMW', mini: 'BMW',
  'mercedes benz': 'Mercedes-Benz', mercedes: 'Mercedes-Benz',
  renault: 'Renault-Nissan', dacia: 'Renault-Nissan', nissan: 'Renault-Nissan',
  peugeot: 'Stellantis-PSA', citroen: 'Stellantis-PSA', ds: 'Stellantis-PSA',
  opel: 'Opel',
  fiat: 'Stellantis-Fiat', 'alfa romeo': 'Stellantis-Fiat', jeep: 'Stellantis-Fiat',
  tofas: 'Stellantis-Fiat', lancia: 'Stellantis-Fiat',
  ford: 'Ford',
  toyota: 'Toyota', lexus: 'Toyota',
  hyundai: 'Hyundai-Kia', kia: 'Hyundai-Kia',
  honda: 'Honda',
  volvo: 'Volvo',
  mazda: 'Mazda',
  suzuki: 'Suzuki',
  mitsubishi: 'Mitsubishi',
  chevrolet: 'GM', 'land rover': 'JLR', jaguar: 'JLR',
  subaru: 'Subaru', ssangyong: 'SsangYong', infiniti: 'Renault-Nissan'
}

/*
 * Aynı motoru paylaşan gruplar. Opel 2017 öncesi kendi (GM) motorlarını,
 * sonrasında PSA motorlarını kullanır; Infiniti Mercedes ve Renault motorları
 * taşır. Bu yüzden bir markanın birden fazla grup denemesi olabilir.
 */
const GROUP_FALLBACKS = {
  Opel: ['Opel', 'GM', 'Stellantis-PSA'],
  GM: ['GM', 'Opel'],
  'Stellantis-PSA': ['Stellantis-PSA', 'Opel'],
  'Renault-Nissan': ['Renault-Nissan', 'Mercedes-Benz'],
  JLR: ['JLR', 'Ford']
}

export function brandGroupOf(brand) {
  return BRAND_GROUPS[normalize(brand)] || null
}

/*
 * Motor adına karışan ama motorla ilgisi olmayan kelimeler.
 * "3.0 TDI quattro" ile "3.0 TDI" aynı motordur; "quattro" çekiş sistemidir.
 * "1.6 Valvematic Multidrive S" içindeki "Multidrive S" şanzıman adıdır.
 */
const NOISE_PHRASES = [
  'quattro', 'xdrive', 'x drive', '4matic', '4motion', 'allgrip', 'awd', '4wd', '4x4',
  'multidrive s', 'multidrive', 'x tronic', 'xtronic', 's tronic', 'stronic',
  'tiptronic', 'steptronic', 'powershift', 'dualogic', 'easy r',
  'dsg', 'dct', 'cvt', 'edc', 'eat8', 'eat6', 'otomatik', 'manuel', 'automatic',
  'hp', 'ps', 'bg'
]

/** Yakıt bilgisi motor adına yazıldığında ("1.6 Benzin") ayrı alana taşınır. */
const FUEL_WORDS = {
  benzin: 'Benzin', petrol: 'Benzin',
  dizel: 'Dizel', diesel: 'Dizel',
  hibrit: 'Hibrit', hybrid: 'Hibrit',
  lpg: 'LPG', elektrik: 'Elektrik', electric: 'Elektrik'
}

/**
 * Serbest yazılmış bir motor adını eşleştirilebilir parçalara ayırır.
 *
 * Girdi : "2.0 TFSI quattro (190 hp)"
 * Çıktı : { text: '2.0 tfsi', volumes: ['2.0'], fuel: null, tokens: [...] }
 */
function canonicalName(raw) {
  let text = normalize(raw)

  // Parantez içi (güç aralığı, motor kodu) ayrı ele alınır; kod zaten
  // parantezden önce/sonra token olarak kalır.
  const parenthesised = []
  text = text.replace(/\(([^)]*)\)/g, (_, inner) => {
    parenthesised.push(inner)
    return ' '
  })
  // normalize() parantezi zaten boşluğa çevirdiği için yukarıdaki yakalama
  // çoğu zaman boş döner; içerik token olarak metinde kalır ve zararsızdır.

  let fuel = null
  const words = text.split(' ').filter(Boolean)
  const kept = []
  for (const word of words) {
    if (FUEL_WORDS[word]) {
      fuel = fuel || FUEL_WORDS[word]
      continue
    }
    kept.push(word)
  }
  text = kept.join(' ')

  for (const phrase of NOISE_PHRASES) {
    text = text.replace(new RegExp(`(^| )${phrase}( |$)`, 'g'), ' ')
  }
  text = text.replace(/\s+/g, ' ').trim()

  // "2.0d" / "1.6i" gibi bitişik yazımlarda hacmi son ekten ayır ki
  // "2.0 d" ile "2.0d" aynı sayılsın.
  text = text.replace(/(\d\.\d+)([a-z])/g, '$1 $2').replace(/\s+/g, ' ').trim()

  const volumes = (text.match(/\b\d\.\d+\b/g) || [])

  return {
    text,
    fuel,
    volumes,
    tokens: text.split(' ').filter(Boolean),
    extra: parenthesised.map(normalize)
  }
}

/**
 * Bir motor kaydının eşleşebileceği tüm isim biçimleri.
 *
 * Katalogda motorlar okunabilirlik için birleşik yazılır ("1.5 / 1.6 TDCi"),
 * araç kayıtlarında ise tek tek geçer ("1.5 TDCi"). Bu yüzden birleşik isim
 * parçalarına ayrılıp her hacim son ekle birleştirilir. VAG'da aynı motor
 * VW'de "TSI", Audi'de "TFSI" adıyla satılır; bu eşlenik burada üretilir.
 */
function expandSlashName(raw) {
  // Parantez içindeki motor kodu ("(N43/N46)") isim değil, koddur; ayrılır.
  const clean = String(raw || '').replace(/\([^)]*\)/g, ' ')

  const volumes = []
  const suffixes = []
  clean.split('/').forEach((chunk) => {
    const piece = canonicalName(chunk).text
    if (!piece) return
    const match = piece.match(/^(\d\.\d+)\s*(.*)$/)
    if (match) {
      volumes.push(match[1])
      if (match[2]) suffixes.push(match[2])
    } else {
      suffixes.push(piece)
    }
  })

  if (!volumes.length) return suffixes
  if (!suffixes.length) return volumes

  const out = []
  volumes.forEach((v) => suffixes.forEach((s) => out.push(`${v} ${s}`)))
  return out
}

function aliasesOf(engine) {
  const out = new Set()
  out.add(canonicalName(engine.name).text)

  /*
   * Katalogda bir kayıt birden fazla varyantı temsil edebilir:
   * "1.4 / 1.6 MPI / GDI / T-GDI" altı ayrı ticari isim demektir. Bunlar
   * hacim × son ek çarpımı olarak açılır, yoksa araç kaydındaki "1.6 GDI"
   * hiçbir zaman eşleşmez.
   */
  expandSlashName(engine.name).forEach((a) => out.add(a))

  ;(engine.aliases || []).forEach((a) => {
    out.add(canonicalName(a).text)
    expandSlashName(a).forEach((x) => out.add(x))
  })

  // Yazım eşlenikleri: aynı motorun markaya göre değişen ticari adı
  const swaps = [
    ['tfsi', 'tsi'], ['tsi', 'tfsi'],
    ['hibrit', 'hybrid'], ['hybrid', 'hibrit']
  ]
  ;[...out].forEach((value) => {
    swaps.forEach(([from, to]) => {
      if (value.includes(from)) out.add(value.replace(from, to))
    })
  })

  return [...out].filter(Boolean)
}

/**
 * Bir motor kaydının kapsadığı motor hacimleri (litre).
 *
 * Bir kayıt birden fazla hacmi temsil edebilir ("1.4 / 1.6 MPI"), bu yüzden
 * yalnızca `displacement` alanına bakmak yetmez; isimde ve takma adlarda geçen
 * tüm hacimler toplanır.
 */
function volumesOf(engine) {
  const out = new Set()
  if (engine.displacement) out.add((engine.displacement / 1000).toFixed(1))
  const sources = [engine.name, ...(engine.aliases || [])].join(' ')
  ;(normalize(sources).match(/\b\d\.\d+\b/g) || []).forEach((v) => out.add(v))
  return [...out].map(Number)
}

/*
 * Hacim toleransı yalnızca YAZIM farkını kapsamalıdır, farklı motorları değil.
 *
 * Kapsaması gerekenler: "1.3" ↔ "1.33" (Toyota), "1.4" ↔ "1.395" (VAG).
 * AYIRMASI gerekenler:  "1.5" ↔ "1.6"  — bunlar gerçekten farklı motorlardır.
 *
 * 0.15 çok genişti: Honda "1.6 i-VTEC" araması 1.5 VTEC Turbo ile eşleşiyor,
 * yanlış motorun kronik arızaları gösteriliyordu. 0.06 her iki yazım farkını
 * da kapsar (0.03 ve 0.005) ama 0.1'lik gerçek hacim farkını eler.
 */
const VOLUME_TOLERANCE = 0.06

/** "2007 - 2015" -> [2007, 2015]. Açık uçlu ("2015 - ") bugüne kadar sayılır. */
function yearSpan(text) {
  const found = String(text || '').match(/\d{4}/g)
  if (!found || !found.length) return null
  const start = Number(found[0])
  const end = found.length > 1 ? Number(found[1]) : new Date().getFullYear()
  return [start, end]
}

const SCORE_THRESHOLD = 10

/**
 * Araç kaydındaki motor adını katalogla eşleştirir.
 *
 * @param brand       "Audi", "Citroën" ...
 * @param engineName  "2.0 TDI quattro", "320d", "1.6 Benzin" ...
 * @param options     { fuel, year } — varsa ayrıştırmayı belirgin biçimde
 *                    iyileştirir. Örneğin "320d" hem N47 hem B47 olabilir;
 *                    yıl bilgisi doğru nesli seçer.
 *
 * Marka grubu şart koşulur, çünkü "2.0 TDI" ile "2.0 TDCi" yazımı benzer ama
 * tamamen farklı motorlardır; markasız eşleştirme yanlış bilgi üretir.
 */
export function matchEngine(brand, engineName, options = {}) {
  const query = canonicalName(engineName)
  if (!query.text) return null

  const group = brandGroupOf(brand)
  const candidateGroups = group ? GROUP_FALLBACKS[group] || [group] : []

  const wantedFuel = options.fuel || query.fuel
  const wantedYear = Number(options.year) || null

  let best = null

  for (const engine of ENGINES) {
    let score = 0

    if (group) {
      const index = candidateGroups.indexOf(engine.group)
      if (index === 0) score += 5
      else if (index > 0) score += 3 // ödünç alınan motor: daha zayıf sinyal
      else continue // başka markanın motoru, hiç değerlendirme
    }

    /*
     * ============================ SERT ELEMELER ============================
     * Aşağıdaki iki kontrol puanlamaya girmez, doğrudan eler. Sebebi: yanlış
     * motor eşleştirmek, uygulamanın kullanıcıya YANLIŞ kronik arıza listesi
     * ve yanlış bakım maliyeti göstermesi demektir. "1.4 CRDi" arayan birine
     * 1.6 CRDi'nin arızalarını göstermek, hiçbir şey göstermemekten kötüdür.
     */

    // 1) Yakıt uyuşmuyorsa aynı motor olamaz.
    if (wantedFuel && engine.fuel && engine.fuel !== wantedFuel) continue

    // 2) İsimde açıkça hacim yazıyorsa, kaydın kapsadığı hacimlerden biri olmalı.
    const engineVolumes = volumesOf(engine)
    if (query.volumes.length && engineVolumes.length) {
      const overlaps = query.volumes.some((v) =>
        engineVolumes.some((ev) => Math.abs(Number(v) - ev) <= VOLUME_TOLERANCE)
      )
      if (!overlaps) continue
      score += 3
    }
    // ========================================================================

    const aliases = aliasesOf(engine)
    if (aliases.includes(query.text)) score += 8
    else if (aliases.some((a) => a.length >= 4 && (query.text.includes(a) || a.includes(query.text)))) score += 4

    /*
     * Motor kodu en güçlü sinyaldir. Araç kayıtlarında kod çoğu zaman kısaltılmış
     * geçer ("N47" ama katalogda "N47D20"), bu yüzden tam eşleşme değil ön ek
     * eşleşmesi aranır. Aile adı da ("EA189", "OM651") kod gibi değerlendirilir.
     */
    const codeTokens = [...engine.codes, engine.family].map(normalize).filter(Boolean)
    const nameTokens = [...query.tokens, ...query.extra].filter((t) => t.length >= 3)
    if (codeTokens.some((code) => nameTokens.some((t) => code.startsWith(t) || t.startsWith(code)))) {
      score += 10
    }

    /*
     * Ticari kod eşleşmesi (BMW "320d", Mercedes "E220d"). Bu kodlar hacmi
     * artık yansıtmadığı için ("318i" 1.5 motordur) tahminle üretilemez;
     * her motor kaydında elle listelenir.
     */
    const designations = (engine.designations || []).map((d) => canonicalName(d).text)
    if (designations.length && designations.some((d) => query.tokens.includes(d))) score += 9

    if (wantedFuel && engine.fuel === wantedFuel) score += 3

    // Yıl, aynı ticari kodun nesillerini ayırt eden tek bilgidir.
    const span = yearSpan(engine.years)
    if (wantedYear && span) {
      if (wantedYear >= span[0] && wantedYear <= span[1]) score += 4
      else score -= 4
    }

    if (!best || score > best.score) best = { engine, score }
  }

  return best && best.score >= SCORE_THRESHOLD ? best.engine : null
}

/**
 * Bir araç kaydını katalog bilgisiyle zenginleştirir.
 * Kaydın kendisi değiştirilmez; yeni bir nesne döner.
 */
export function enrichWithCatalog({ brand, engineName, transmissionName, fuelType, year }) {
  return {
    engine: matchEngine(brand, engineName, { fuel: fuelType, year }),
    transmission: matchTransmission(transmissionName, { brand, year })
  }
}

/** Katalog büyüklüğü (ana ekran istatistikleri ve doküman için). */
export function getCatalogStats() {
  return {
    brandCount: BRANDS.length,
    modelCount: MODELS.length,
    generationCount: getGenerationCount(),
    engineCount: ENGINES.length,
    engineCodeCount: ENGINES.reduce((sum, e) => sum + e.codes.length, 0),
    transmissionCount: TRANSMISSIONS.length,
    packageCount: PACKAGES.length,
    equipmentCount: EQUIPMENT.length,
    maintenanceItemCount: MAINTENANCE_ITEMS.length,
    engineProblemCount: ENGINES.reduce((sum, e) => sum + e.problems.length, 0),
    transmissionProblemCount: TRANSMISSIONS.reduce((sum, t) => sum + t.problems.length, 0)
  }
}

/**
 * KATALOG BÜTÜNLÜK DENETİMİ
 *
 * models.js, motorlara ve şanzımanlara KİMLİKLE bağlanır. Bir kimlik yanlış
 * yazılırsa hiçbir hata oluşmaz — o nesil sessizce motorsuz kalır ve kullanıcı
 * eksik bilgiyle karar verir. Sessiz veri hatası, gürültülü koddan çok daha
 * tehlikelidir.
 *
 * Bu yüzden çapraz referanslar denetlenebilir tutulur; testte çağrılır.
 *
 * @returns {{ok: boolean, missingEngines: string[], missingTransmissions: string[]}}
 */
export function validateCatalog() {
  const engineIds = new Set(ENGINES.map((e) => e.id))
  const transmissionIds = new Set(TRANSMISSIONS.map((t) => t.id))

  const missingEngines = []
  const missingTransmissions = []

  MODELS.forEach((model) => {
    model.generations.forEach((generation) => {
      (generation.engineIds || []).forEach((id) => {
        if (!engineIds.has(id)) missingEngines.push(`${model.brand} ${model.model} ${generation.code} → ${id}`)
      })
      ;(generation.transmissionIds || []).forEach((id) => {
        if (!transmissionIds.has(id)) {
          missingTransmissions.push(`${model.brand} ${model.model} ${generation.code} → ${id}`)
        }
      })
    })
  })

  /*
   * Paketler donanım sözlüğüne kimlikle bağlanır; yanlış yazılmış bir kimlik
   * o donanımın listede hiç görünmemesine yol açar. Aynı sessiz hata sınıfı.
   */
  const equipmentIds = new Set(EQUIPMENT.map((e) => e.id))
  const missingEquipment = []
  PACKAGES.forEach((pkg) => {
    [...(pkg.includes || []), ...(pkg.excludes || []), ...(pkg.optional || [])].forEach((id) => {
      if (!equipmentIds.has(id)) missingEquipment.push(`${pkg.brand} ${pkg.model} ${pkg.name} → ${id}`)
    })
  })

  return {
    ok:
      missingEngines.length === 0 &&
      missingTransmissions.length === 0 &&
      missingEquipment.length === 0,
    missingEngines,
    missingTransmissions,
    missingEquipment
  }
}

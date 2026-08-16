/**
 * İLAN ANALİZ SİSTEMİ
 *
 * ============================================================================
 * BU SERVİS NE YAPAR
 * ============================================================================
 * Kullanıcının yapıştırdığı ilan metnini okuyup üç ayrı şey üretir:
 *
 *   1. ÇIKARILAN VERİ   — marka, model, yıl, km, fiyat, yakıt, şanzıman, şehir
 *   2. BEYAN EDİLEN HASAR— "2 boyalı, 1 değişen", tramer tutarı, hasar kaydı
 *   3. İLAN UYARILARI   — metnin kendisindeki riskli kalıplar
 *
 * Üçüncüsü bu servisin asıl değeridir. Aracın kendi riski (yaş, km, kronik
 * arıza) zaten analysisService'te hesaplanıyor. Burada değerlendirilen şey
 * ARACIN değil İLANIN güvenilirliği: çelişkili beyanlar, dolandırıcılık
 * kalıpları, baskı dili, eksik bilgi.
 *
 * ============================================================================
 * NEDEN OTOMATİK ÇEKMİYORUZ, KOPYALA-YAPIŞTIR İSTİYORUZ
 * ============================================================================
 * sahibinden.com gibi siteler tarayıcıdan doğrudan okunamaz (CORS engeli) ve
 * içeriklerinin izinsiz çekilmesi kullanım şartlarına aykırıdır. Bu yüzden
 * uygulama ilanı kendisi indirmez; kullanıcı metni yapıştırır. Bu aynı zamanda
 * kullanıcının verisinin hiçbir sunucuya gitmemesi anlamına gelir — tüm
 * ayrıştırma cihazda, bu dosyada yapılır.
 *
 * ============================================================================
 * DÜRÜSTLÜK SINIRI
 * ============================================================================
 * Buradaki uyarılar SUÇLAMA DEĞİLDİR. "Vekaleten satılık" yazan her ilan
 * dolandırıcılık değildir; sadece ek kontrol gerektirir. Bu yüzden her uyarı
 * bir `action` (ne yapmalı) alanı taşır ve metinler "şudur" değil "şunu
 * doğrula" dilinde yazılmıştır.
 */

import { parseListingText } from './listingParserService'

/** Türkçe karakterleri sadeleştirir; kalıp aramaları bunun üzerinde yapılır. */
function normalize(text) {
  return String(text || '')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, ' ')
}

function parseAmount(raw) {
  return Number(String(raw).replace(/[.\s]/g, '').replace(',', '.'))
}

// ============================================================================
// 1. BEYAN EDİLEN BOYA / DEĞİŞEN
// ============================================================================

/*
 * İlanlarda hasar beyanı iki biçimde geçer:
 *   sayıyla  : "2 boyalı, 1 değişen"
 *   parçayla : "sağ ön kapı boyalı, kaput değişen"
 *
 * İkisi de yakalanır. Parça adları önemlidir çünkü civatalı parça (kapı,
 * kaput, çamurluk) ile kaynaklı parça (tavan, direk, marşpiyel) arasında
 * değer kaybı açısından uçurum vardır — damageService bunları ayrı sayar.
 */
const BOLTED_PARTS = [
  'kaput', 'camurluk', 'kapi', 'bagaj kapagi', 'bagaj kapak', 'tampon', 'ayna'
]
const WELDED_PARTS = [
  'tavan', 'direk', 'marspiyel', 'arka panel', 'sasi', 'travers', 'podye', 'havuz'
]

function countDeclaredParts(text) {
  const out = { localPaint: 0, paintedBolted: 0, paintedWelded: 0, changedBolted: 0, changedWelded: 0 }

  // "3 boyalı", "2 adet değişen", "1 lokal boyalı"
  const numeric = [...text.matchAll(/(\d{1,2})\s*(?:adet\s*)?(lokal\s*boyali|lokal|boyali|boya|degisen|degismis)/g)]
  numeric.forEach(([, count, kind]) => {
    const n = Number(count)
    if (!n || n > 20) return
    if (kind.startsWith('lokal')) out.localPaint += n
    else if (kind.startsWith('degis')) out.changedBolted += n
    else out.paintedBolted += n
  })

  /*
   * Parça adı geçen beyanlar. Parça adının ARDINDAN gelen ilk 30 karakter
   * içinde "boyali"/"degisen" aranır; böylece "kaput boyalı, kapı orjinal"
   * cümlesinde kapı yanlışlıkla boyalı sayılmaz.
   */
  const scan = (parts, paintedKey, changedKey) => {
    parts.forEach((part) => {
      const regex = new RegExp(part + '[^.,;]{0,30}', 'g')
      for (const [chunk] of text.matchAll(regex)) {
        if (/degis/.test(chunk)) out[changedKey] += 1
        else if (/boya/.test(chunk)) out[paintedKey] += 1
      }
    })
  }
  scan(BOLTED_PARTS, 'paintedBolted', 'changedBolted')
  scan(WELDED_PARTS, 'paintedWelded', 'changedWelded')

  return out
}

/** damageService'in beklediği `parts` sözlüğüne çevirir. */
function toDamageParts(declared) {
  const parts = {}
  if (declared.localPaint) parts['lokal-boya'] = declared.localPaint
  if (declared.paintedBolted) parts['boyali-civatali'] = declared.paintedBolted
  if (declared.paintedWelded) parts['boyali-kaynakli'] = declared.paintedWelded
  if (declared.changedBolted) parts['degisen-civatali'] = declared.changedBolted
  if (declared.changedWelded) parts['degisen-kaynakli'] = declared.changedWelded
  if (declared.airbag) parts.airbag = 1
  if (declared.chassis) parts.sasi = 1
  return parts
}

// ============================================================================
// 2. İLAN UYARILARI
// ============================================================================

/*
 * Her kural: metinde aranan kalıp + uyarı kaydı.
 *
 * `level`:
 *   kritik — para veya mülkiyet riski; doğrulanmadan ilerlenmemeli
 *   uyari  — ek kontrol gerektirir
 *   bilgi  — olumlu ya da nötr, sadece bilinmesi gereken
 *
 * `weight` ilan güven puanından düşülen puandır.
 */
const RULES = [
  {
    id: 'vekalet',
    pattern: /vekalet|vekaleten|noter vekaleti/,
    level: 'kritik',
    weight: 30,
    title: 'Vekaleten satış',
    detail:
      'Aracı satan kişi ruhsat sahibi değil, vekaletle işlem yapıyor. Vekalet iptal edilmiş olabilir, araç üzerinde haciz/rehin bulunabilir ya da satıcı gerçek sahibin haberi olmadan işlem yapıyor olabilir.',
    action:
      'Ruhsat sahibiyle telefonda GÖRÜŞ, vekaletnamenin güncel ve satış yetkisi içerdiğini notere teyit ettir. Devir noterde ve ruhsat sahibi ya da geçerli vekille yapılmalı.'
  },
  {
    id: 'kapora',
    pattern: /kapora|kaparo|iban|havale|eft|onden odeme|kargo ile gonder/,
    level: 'kritik',
    weight: 35,
    title: 'Ön ödeme / havale isteniyor',
    detail:
      'Aracı görmeden kapora veya havale istenmesi, ikinci el araç dolandırıcılığının en yaygın yöntemidir. Araç genelde hiç yoktur; ilan görselleri başka ilanlardan alınmıştır.',
    action:
      'Aracı görmeden, ruhsatı ve satıcının kimliğini kontrol etmeden hiçbir ödeme yapma. Ödeme noterde devir anında yapılmalı.'
  },
  {
    id: 'rehin-haciz',
    pattern: /rehin|haciz|kredili arac|kredi kapatilacak|banka rehni|yakalama/,
    level: 'kritik',
    weight: 25,
    title: 'Araç üzerinde rehin / haciz olabilir',
    detail:
      'Üzerinde rehin, haciz ya da yakalama kaydı olan araç devredilemez. Devir yapılsa bile araç sonradan elinden alınabilir.',
    action:
      'e-Devlet üzerinden "Araç Rehin/Haciz Sorgulama" yap. Kayıt varsa, kaldırıldığına dair belge görmeden devre girme.'
  },
  {
    id: 'agir-hasar',
    pattern: /agir hasar|pert|pert kayitli|hasarli arac|hasar kaydi vardir/,
    level: 'kritik',
    weight: 25,
    title: 'Ağır hasar / pert kaydı belirtilmiş',
    detail:
      'Ağır hasar veya pert kaydı aracın değerini kalıcı biçimde düşürür ve satarken alıcı bulmayı zorlaştırır. Onarım kalitesi kötüyse sürüş güvenliği de etkilenir.',
    action:
      'Kaydın türünü (ağır hasar / pert / pert-çürük) ruhsattan ve e-Devlet hasar sorgusundan doğrula. Şasi ölçümü yaptırmadan alma.'
  },
  {
    id: 'yurtdisi',
    pattern: /yurt disi cikisli|yurtdisi cikisli|gumruk|ithal edilmis|ceza kagidi/,
    level: 'uyari',
    weight: 12,
    title: 'Yurt dışı çıkışlı / gümrük konusu',
    detail:
      'Yurt dışından gelen araçlarda geçmiş hasar kaydı Türkiye tramer sistemine yansımaz; araç temiz görünse de geçmişi bilinmiyor olabilir.',
    action: 'Aracın yurt dışı geçmişini VIN ile sorgulatabileceğin bir servise götür; boya ölçümünü mutlaka yaptır.'
  },
  {
    id: 'km-garanti',
    pattern: /km garantili|kilometre garantili|orjinal km|orijinal km/,
    level: 'uyari',
    weight: 8,
    title: '"Kilometre garantili" ifadesi',
    detail:
      'Bu ifadenin hukuki bir karşılığı yoktur; kilometre düşürülmüş araçlarda da sıkça kullanılır. Gerçek güvence servis kayıtlarıdır.',
    action:
      'Yetkili servis bakım geçmişini (kilometre kayıtlı) iste. Muayene istasyonu kayıtları da e-Devlet üzerinden kilometre içerir.'
  },
  {
    id: 'aciliyet',
    pattern: /acil|acilen|acil ihtiyactan|bugun satilik|ilk gelen alir|fiyat dusuruldu son/,
    level: 'uyari',
    weight: 6,
    title: 'Aciliyet / baskı dili',
    detail:
      'Aciliyet vurgusu, alıcının kontrol yaptırmadan karar vermesini sağlamak için kullanılan yaygın bir satış baskısıdır. Her zaman kötü niyet göstermez ama acele ettirilmeye izin verilmemeli.',
    action: 'Ekspertiz randevusu almadan karar verme. Gerçekten iyi bir araç, bir gün daha bekler.'
  },
  {
    id: 'motor-mudahale',
    pattern: /motor revizyon|motor yenilendi|yeni motor|motor acildi|rektefiye|silindir kapagi degisti/,
    level: 'uyari',
    weight: 14,
    title: 'Motora müdahale edilmiş',
    detail:
      'Revizyon veya motor değişimi kendi başına kötü değildir ama işçilik kalitesi belirleyicidir. Ayrıca motorun neden açıldığı (hararet, yağsız kalma, zincir kopması) sorulmalıdır.',
    action:
      'İşlemi yapan servisin faturasını iste. Kompresyon testi ve soğutma suyunda yağ/hava kontrolü yaptır.'
  },
  {
    id: 'yazilim',
    pattern: /chip tuning|yazilim yapildi|stage 1|stage 2|guc artirim|dpf iptal|egr iptal/,
    level: 'uyari',
    weight: 12,
    title: 'Motor yazılımı değiştirilmiş / emisyon parçası iptal edilmiş',
    detail:
      'Güç artırımı motor, turbo ve şanzıman üzerindeki yükü kalıcı olarak artırır. DPF/EGR iptali ise muayenede sorun çıkarır ve yasal değildir.',
    action:
      'Yazılımın orijinale döndürülüp döndürülemeyeceğini sor. DPF/EGR iptali varsa muayene ve emisyon açısından maliyeti hesaba kat.'
  },
  {
    id: 'tek-anahtar',
    pattern: /tek anahtar|ikinci anahtar yok|anahtari kayip/,
    level: 'uyari',
    weight: 5,
    title: 'İkinci anahtar yok',
    detail:
      'Modern araçlarda ikinci anahtarın yaptırılması immobilizer kodlaması nedeniyle pahalıdır; markaya göre birkaç bin TL ile on binlerce TL arasında değişir.',
    action: 'İkinci anahtarın maliyetini markanın yetkili servisinden öğrenip pazarlığa yaz.'
  },
  {
    id: 'muayene',
    pattern: /muayenesi yok|muayene suresi gecmis|muayenesi bitmis/,
    level: 'uyari',
    weight: 6,
    title: 'Muayenesi geçmiş',
    detail: 'Geciken muayene için gecikme cezası işler ve araç muayeneden kalırsa onarım maliyeti alıcıya kalır.',
    action: 'Muayene ve varsa gecikme cezasının satıcı tarafından karşılanmasını pazarlığa dahil et.'
  },
  {
    id: 'takas',
    pattern: /takas|takasa uygun|degisim olur/,
    level: 'bilgi',
    weight: 0,
    title: 'Takasa açık',
    detail: 'Satıcı takas kabul ediyor. Kendi aracın varsa değerlendirme imkânı doğar.',
    action: 'Takasta kendi aracına düşük değer biçilmesi yaygındır; iki aracı da ayrı ayrı fiyatlandır.'
  },
  {
    id: 'servis-bakimli',
    pattern: /yetkili servis|servis bakimli|tum bakimlari yapildi|bakim gecmisi mevcut|faturali bakim/,
    level: 'bilgi',
    weight: -8, // olumlu sinyal: güven puanını yükseltir
    title: 'Servis bakım geçmişi belirtilmiş',
    detail:
      'Düzenli bakım kaydı, ikinci elde en değerli bilgilerden biridir; özellikle zincir, DSG ve turbo gibi bakıma duyarlı parçalarda riski belirgin biçimde düşürür.',
    action: 'Bakım kayıtlarını fatura ya da servis defteri üzerinden gerçekten gör; sözlü beyanla yetinme.'
  },
  {
    id: 'ekspertizli',
    pattern: /ekspertiz raporu|ekspertizden gecmis|boya olcum raporu/,
    level: 'bilgi',
    weight: -6,
    title: 'Ekspertiz raporu olduğu belirtilmiş',
    detail: 'Rapor varlığı olumludur ama raporu kimin yaptırdığı önemlidir.',
    action:
      'Raporun tarihini ve hangi firmadan alındığını kontrol et. Kendi seçtiğin bağımsız bir ekspertize ayrıca götürmek en sağlıklısıdır.'
  }
]

/*
 * "Hatasız boyasız tramersiz" iddiası ayrı ele alınır: tek başına olumludur,
 * ancak metinde boya/değişen/tramer beyanıyla birlikte geçiyorsa bu bir
 * ÇELİŞKİDİR ve ilanın güvenilirliğini doğrudan zedeler.
 */
const SPOTLESS_PATTERN = /hatasiz|boyasiz|tramersiz|tamami orjinal|tamami orijinal|degisensiz/

/*
 * Türkçede olumsuzluk cümlenin SONUNDA gelir: "ağır hasar kayıtlı değildir",
 * "tramer kaydı yoktur". Kalıbı aynen aramak bu cümleleri yanlışlıkla uyarıya
 * çevirir — yani ilan tam tersini söylerken sistem "ağır hasar var" der.
 *
 * Bu yüzden eşleşmenin ardından gelen kısa pencerede olumsuzluk eki aranır.
 */
const NEGATION = /\b(degildir|degil|yoktur|yok|bulunmamaktadir|bulunmuyor|yapilmamis|olmamistir|hic)\b/

/** Kalıp metinde geçiyor mu — ve OLUMLU bir cümlede mi? */
function matchesPositively(text, pattern) {
  const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g')
  for (const match of text.matchAll(global)) {
    // Eşleşmeden sonraki 45 karakter, aynı cümlenin devamı sayılır.
    const tail = text.slice(match.index + match[0].length, match.index + match[0].length + 45)
    const sentenceTail = tail.split(/[.;\n]/)[0]
    if (!NEGATION.test(sentenceTail)) return true
  }
  return false
}

function detectFlags(text, declared, context) {
  const flags = []

  RULES.forEach((rule) => {
    if (matchesPositively(text, rule.pattern)) {
      flags.push({
        id: rule.id,
        level: rule.level,
        weight: rule.weight,
        title: rule.title,
        detail: rule.detail,
        action: rule.action
      })
    }
  })

  const claimsSpotless = matchesPositively(text, SPOTLESS_PATTERN)
  const declaredTotal =
    declared.localPaint + declared.paintedBolted + declared.paintedWelded +
    declared.changedBolted + declared.changedWelded

  if (claimsSpotless && (declaredTotal > 0 || declared.tramerAmount > 0)) {
    flags.push({
      id: 'celiski',
      level: 'kritik',
      weight: 28,
      title: 'İlan kendi içinde çelişiyor',
      detail:
        'İlanda hem "hatasız / boyasız / tramersiz" ifadesi hem de boya, değişen parça ya da tramer kaydı geçiyor. Bu ifadelerden en az biri doğru değil.',
      action:
        'Satıcıya bu çelişkiyi doğrudan sor. Boya ölçümü ve e-Devlet hasar sorgusu yapılmadan bu ilana güvenme.'
    })
  }

  // Piyasanın belirgin altındaki fiyat, gizlenen bir sorunun en güçlü işaretidir.
  if (context.marketDiffPercent !== null && context.marketDiffPercent <= -25) {
    flags.push({
      id: 'ucuz',
      level: 'uyari',
      weight: 18,
      title: `Fiyat piyasanın %${Math.abs(context.marketDiffPercent)} altında`,
      detail:
        'Bu kadar düşük fiyat genellikle bir nedeni olduğunu gösterir: bildirilmemiş hasar, motor/şanzıman sorunu, rehin kaydı ya da ilanın gerçek olmaması.',
      action:
        'Ucuzluğun sebebini satıcıya açıkça sor ve cevabını ekspertizde doğrulat. Sebep bulunamıyorsa bu bir fırsat değil, uyarıdır.'
    })
  }

  if (context.kmPerYear !== null && context.kmPerYear <= 5000 && context.age >= 5) {
    flags.push({
      id: 'dusuk-km',
      level: 'uyari',
      weight: 10,
      title: `Yıllık ortalama kilometre çok düşük (${context.kmPerYear.toLocaleString('tr-TR')} km/yıl)`,
      detail:
        'Yaşına göre bu kadar az kullanılmış bir araç ya gerçekten az kullanılmıştır ya da kilometresi düşürülmüştür. Uzun süre çalışmadan bekleyen araçlarda ayrıca lastik, akü, keçe ve fren sorunları görülür.',
      action:
        'Muayene istasyonu kayıtlarındaki kilometreleri e-Devlet\'ten kontrol et; kilometre geriye gitmiş mi bak.'
    })
  }

  if (context.kmPerYear !== null && context.kmPerYear >= 45000) {
    flags.push({
      id: 'yuksek-km',
      level: 'uyari',
      weight: 8,
      title: `Yıllık ortalama kilometre çok yüksek (${context.kmPerYear.toLocaleString('tr-TR')} km/yıl)`,
      detail:
        'Bu kullanım yoğunluğu genellikle ticari kullanıma (kurye, taksi, filo) işaret eder. Aracın mekanik yıpranması yaşından fazladır.',
      action: 'Aracın ticari kullanılıp kullanılmadığını sor; ruhsattaki kullanım amacına bak.'
    })
  }

  return flags
}

// ============================================================================
// 3. ANA GİRİŞ NOKTASI
// ============================================================================

const REQUIRED_FIELDS = [
  { key: 'brand', label: 'Marka' },
  { key: 'model', label: 'Model' },
  { key: 'year', label: 'Model yılı' },
  { key: 'km', label: 'Kilometre' },
  { key: 'price', label: 'Fiyat' }
]

const SELLER_TYPES = [
  { pattern: /galeriden|galeri|oto merkezi|otomotiv ltd/, label: 'Galeriden' },
  { pattern: /yetkili bayi|plaza/, label: 'Yetkili bayiden' },
  { pattern: /sahibinden/, label: 'Sahibinden' }
]

/**
 * @param {string} text            İlan metni (kullanıcı yapıştırır)
 * @param {object} options
 * @param {number} options.marketDiffPercent  Piyasa farkı yüzdesi (varsa)
 * @returns ayrıştırılmış veri, beyan edilen hasar, uyarılar ve güven puanı
 */
export function analyzeListing(text, options = {}) {
  const source = String(text || '')
  if (!source.trim()) return null

  const normalized = normalize(source)
  const extracted = parseListingText(source)

  // --- Beyan edilen hasar -------------------------------------------------
  const declared = countDeclaredParts(normalized)

  const tramerMatch = normalized.match(/tramer[^0-9]{0,20}(\d{1,3}(?:\.\d{3})+|\d{4,9})/)
  declared.tramerAmount = tramerMatch ? parseAmount(tramerMatch[1]) : 0

  // Olumsuz cümleler ("hava yastığı açmamıştır") uyarıya çevrilmemeli.
  declared.airbag = matchesPositively(normalized, /hava yastigi acmis|airbag acilmis|yastik patlamis/)
  declared.chassis = matchesPositively(normalized, /sasi|travers|cekme yapilmis|sasi duzeltme/)

  if (/tramer kaydi yok|tramersiz|tramer yoktur/.test(normalized)) declared.tramerClaimNone = true

  let recordType = 'yok'
  if (matchesPositively(normalized, /pert/)) recordType = 'pert'
  else if (matchesPositively(normalized, /agir hasar/)) recordType = 'agir-hasar'
  else if (
    declared.tramerAmount > 0 ||
    matchesPositively(normalized, /hasar kaydi vardir|hasar kayitli/)
  ) {
    recordType = 'hasar-kayitli'
  }

  // --- Bağlam (uyarı kuralları için) --------------------------------------
  const year = Number(extracted.year) || null
  const km = Number(extracted.km) || null
  const age = year ? Math.max(0, new Date().getFullYear() - year) : null
  const kmPerYear = km && age !== null && age > 0 ? Math.round(km / age) : null

  const context = {
    marketDiffPercent: Number.isFinite(options.marketDiffPercent) ? options.marketDiffPercent : null,
    kmPerYear,
    age
  }

  const flags = detectFlags(normalized, declared, context)

  // --- Eksik alanlar ------------------------------------------------------
  const missing = REQUIRED_FIELDS.filter((f) => !extracted[f.key]).map((f) => f.label)

  // --- Satıcı tipi ve şehir ------------------------------------------------
  const sellerType = SELLER_TYPES.find((s) => s.pattern.test(normalized))?.label || null

  /*
   * İlan güven puanı, aracın değil ilanın güvenilirliğidir. 100'den başlar,
   * her uyarının ağırlığı düşülür; olumlu sinyaller (negatif ağırlık) ekler.
   * Eksik her kritik alan da güveni azaltır, çünkü bilgi saklanıyor olabilir.
   */
  const flagPenalty = flags.reduce((sum, f) => sum + f.weight, 0)
  const missingPenalty = missing.length * 6
  const trustScore = Math.max(0, Math.min(100, 100 - flagPenalty - missingPenalty))

  const criticalCount = flags.filter((f) => f.level === 'kritik').length
  const warningCount = flags.filter((f) => f.level === 'uyari').length

  let trustBand
  if (criticalCount > 0) trustBand = { label: 'Ciddi uyarı var', tone: 'danger' }
  else if (trustScore < 60) trustBand = { label: 'Temkinli yaklaş', tone: 'warning' }
  else if (trustScore < 80) trustBand = { label: 'Makul, kontrol et', tone: 'good' }
  else trustBand = { label: 'İlan tutarlı görünüyor', tone: 'excellent' }

  return {
    extracted,
    declared,
    damageInput: {
      price: extracted.price,
      tramerAmount: declared.tramerAmount,
      recordType,
      parts: toDamageParts(declared)
    },
    flags: flags.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]),
    missing,
    sellerType,
    kmPerYear,
    trustScore,
    trustBand,
    criticalCount,
    warningCount,
    /** analysisService ve diğer motorların beklediği form yapısı. */
    formData: {
      brand: extracted.brand || '',
      model: extracted.model || '',
      year: extracted.year || '',
      km: extracted.km || '',
      price: extracted.price || '',
      engine: extracted.engine || '',
      fuelType: extracted.fuelType || '',
      transmission: extracted.transmission || '',
      // Paket adı, donanım beklentisini belirlediği için forma taşınır.
      packageName: extracted.packageName || ''
    }
  }
}

const LEVEL_ORDER = { kritik: 0, uyari: 1, bilgi: 2 }

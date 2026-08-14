/**
 * Hasar kaydı (tramer) değerlendirme ve değer kaybı hesabı.
 *
 * İkinci el alımında en çok kafa karıştıran konu budur: ilanda "tramer 45.000"
 * yazar, alıcı bunun çok mu az mı olduğunu bilemez. Burada iki ayrı soru
 * cevaplanır:
 *
 *   1. Kayıtlı hasar tutarı, aracın değerine göre ne kadar ağır?
 *   2. Boyalı/değişen parçalar bu araca yaklaşık ne kadar değer kaybettirir?
 *
 * Oranlar Türkiye ikinci el piyasasında yerleşmiş teamüllerdir; bilirkişi
 * raporu değildir, pazarlıkta dayanak olarak kullanılmak üzere hesaplanır.
 */

/** Oranların dayandığı dönem. Piyasa teamülü değişirse burası güncellenir. */
export const DAMAGE_BASELINE_LABEL = 'Ağustos 2026'

/**
 * Parça grupları ve tek bir parçanın yaklaşık değer kaybı etkisi (% olarak).
 *
 * Civatalı parçalar (kaput, çamurluk, kapı, bagaj kapağı) sökülüp takılabilir,
 * bu yüzden değişmesi görece hafif kalır. Kaynaklı parçalar araç gövdesinin
 * taşıyıcı bütünlüğüne dokunur ve çok daha ağır değerlendirilir.
 */
export const PART_GROUPS = [
  {
    id: 'lokal-boya',
    label: 'Lokal boya / rötuş',
    hint: 'Çizik, park darbesi gibi küçük yüzey işlemleri',
    lossPercent: 0.6,
    weight: 1
  },
  {
    id: 'boyali-civatali',
    label: 'Boyalı civatalı parça',
    hint: 'Kaput, çamurluk, kapı, bagaj kapağı',
    lossPercent: 2,
    weight: 2
  },
  {
    id: 'boyali-kaynakli',
    label: 'Boyalı kaynaklı parça',
    hint: 'Tavan, direk, marşpiyel, arka panel',
    lossPercent: 4.5,
    weight: 4
  },
  {
    id: 'degisen-civatali',
    label: 'Değişen civatalı parça',
    hint: 'Kaput, çamurluk, kapı, bagaj kapağı',
    lossPercent: 4,
    weight: 4
  },
  {
    id: 'degisen-kaynakli',
    label: 'Değişen kaynaklı parça',
    hint: 'Tavan, direk, arka panel, şasi kulağı',
    lossPercent: 13,
    weight: 9
  },
  {
    id: 'sasi',
    label: 'Şasi / travers onarımı, çekme',
    hint: 'Gövde iskeletine müdahale edilmiş',
    lossPercent: 25,
    weight: 14
  },
  {
    id: 'airbag',
    label: 'Hava yastığı açmış',
    hint: 'Ciddi çarpışma göstergesi',
    lossPercent: 12,
    weight: 8
  }
]

/** Ruhsattaki/kayıttaki hasar durumu. Bu, tutar oranından bağımsız bir damgadır. */
export const RECORD_TYPES = [
  { id: 'yok', label: 'Kayıt yok', extraLossPercent: 0 },
  { id: 'hasar-kayitli', label: 'Hasar kayıtlı', extraLossPercent: 0 },
  { id: 'agir-hasar', label: 'Ağır hasar kayıtlı', extraLossPercent: 25 },
  { id: 'pert', label: 'Pert / pert-çürük kayıtlı', extraLossPercent: 40 }
]

/** Aynı gruptan ikinci, üçüncü parçanın etkisi azalarak eklenir. */
const REPEAT_FACTORS = [1, 0.65, 0.45, 0.32, 0.22]
const MAX_TOTAL_LOSS_PERCENT = 55

function repeatFactor(index) {
  return REPEAT_FACTORS[index] ?? 0.15
}

function tramerSeverity(ratioPercent) {
  if (ratioPercent <= 0) return { key: 'yok', label: 'Kayıt görünmüyor', tone: 'excellent' }
  if (ratioPercent < 3) return { key: 'hafif', label: 'Hafif hasar', tone: 'excellent' }
  if (ratioPercent < 10) return { key: 'orta', label: 'Orta düzey hasar', tone: 'warning' }
  if (ratioPercent < 25) return { key: 'ciddi', label: 'Ciddi hasar', tone: 'danger' }
  return { key: 'agir', label: 'Ağır hasar seviyesi', tone: 'danger' }
}

/**
 * @param {object} input
 * @param {number} input.price        İlan fiyatı (TL)
 * @param {number} input.tramerAmount Kayıtlı hasar tutarı (TL)
 * @param {string} input.recordType   RECORD_TYPES id'si
 * @param {object} input.parts        { [groupId]: adet }
 */
export function evaluateDamage({ price, tramerAmount = 0, recordType = 'yok', parts = {} }) {
  const priceValue = Number(price)
  if (!Number.isFinite(priceValue) || priceValue <= 0) return null

  const tramer = Math.max(0, Number(tramerAmount) || 0)
  const ratioPercent = Math.round((tramer / priceValue) * 1000) / 10
  const severity = tramerSeverity(ratioPercent)

  // --- Parça bazlı değer kaybı ---
  const breakdown = []
  let partLossPercent = 0
  let structuralWeight = 0

  PART_GROUPS.forEach((group) => {
    const count = Math.max(0, Math.floor(Number(parts[group.id]) || 0))
    if (count === 0) return

    let groupLoss = 0
    for (let i = 0; i < count; i += 1) groupLoss += group.lossPercent * repeatFactor(i)

    partLossPercent += groupLoss
    structuralWeight += group.weight * count
    breakdown.push({
      id: group.id,
      label: group.label,
      count,
      lossPercent: Math.round(groupLoss * 10) / 10
    })
  })

  const record = RECORD_TYPES.find((r) => r.id === recordType) || RECORD_TYPES[0]
  const rawLossPercent = partLossPercent + record.extraLossPercent
  const lossPercent = Math.min(MAX_TOTAL_LOSS_PERCENT, Math.round(rawLossPercent * 10) / 10)
  const lossAmount = Math.round((priceValue * lossPercent) / 100 / 500) * 500

  // Hasarsız eşdeğerinin karşılığı: ilan fiyatı zaten hasarı yansıtıyorsa
  // pazarlık payı kalmaz; yansıtmıyorsa aradaki fark pazarlık payıdır.
  const comparablePrice = Math.round((priceValue - lossAmount) / 500) * 500

  // --- Yorumlar ---
  const negotiationPoints = []
  const redFlags = []

  if (lossPercent > 0) {
    negotiationPoints.push(
      'Kayıtlı boyalı/değişen parçalar bu araca yaklaşık %' +
        lossPercent +
        ' değer kaybettirir. Aynı yıl ve kilometrede hasarsız bir örnek bulup fiyat farkını satıcıya göster.'
    )
  }
  if (tramer > 0) {
    negotiationPoints.push(
      'Kayıtlı hasar tutarı ' +
        tramer.toLocaleString('tr-TR') +
        ' TL, ilan fiyatının %' +
        ratioPercent +
        "'i. Hasarın hangi tarihte ve hangi parçalarda olduğunu sigorta ekspertiz raporundan iste."
    )
  }

  if (record.id === 'pert') {
    redFlags.push(
      'Pert kayıtlı araçta kasko yaptırmak çok zorlaşır, kredi çoğu bankada çıkmaz ve satarken alıcı bulmak ciddi problemdir. Fiyat ne kadar cazip olursa olsun bu kaydın kalıcı olduğunu unutma.'
    )
  }
  if (record.id === 'agir-hasar') {
    redFlags.push(
      'Ağır hasar kaydı ruhsata işlenir ve bir daha silinmez. Satarken aynı sorunu sen yaşayacaksın; alım fiyatı bunu net biçimde yansıtmalı.'
    )
  }
  if (parts.sasi > 0) {
    redFlags.push(
      'Şasi/travers müdahalesi olan araçta çarpışma güvenliği fabrika seviyesinde değildir. Direksiyon merkezini, düz yolda çekme yapıp yapmadığını ve lastiklerin düzensiz aşınmasını mutlaka test sürüşünde kontrol et.'
    )
  }
  if (parts['degisen-kaynakli'] > 0) {
    redFlags.push(
      'Kaynaklı parça değişimi, aracın taşıyıcı gövdesine müdahale edildiği anlamına gelir. Kaynak dikişlerinin fabrika görünümünde olup olmadığını, bagaj havuzu ve marşpiyel altını mutlaka kaldırıp gösterttir.'
    )
  }
  if (parts.airbag > 0) {
    redFlags.push(
      'Hava yastığı açmış araçta yastıkların ve gergi kemerlerinin orijinal muadiliyle değişip değişmediği hayati önemde. Airbag ikaz lambasının kontakta yanıp sönmesini izle; hiç yanmıyorsa lamba iptal edilmiş olabilir.'
    )
  }
  if (tramer === 0 && record.id === 'yok') {
    redFlags.push(
      'Tramer kaydının boş olması "hiç darbe almamış" demek değildir: sigortaya bildirilmeden yaptırılan boya ve onarımlar kayda girmez. Kaporta kontrolünü yine de mikron ölçümüyle yap.'
    )
  }
  if (ratioPercent >= 10 && lossPercent < 5) {
    redFlags.push(
      'Kayıtlı hasar tutarı yüksek ama işaretlediğin boyalı/değişen parça az. Ekspertizde gözden kaçan bir onarım olabilir; aracı ikinci bir yerde ölçtürmeyi düşün.'
    )
  }

  return {
    ratioPercent,
    severity,
    tramerAmount: tramer,
    recordType: record,
    lossPercent,
    lossAmount,
    comparablePrice,
    structuralWeight,
    breakdown,
    negotiationPoints,
    redFlags,
    baseline: DAMAGE_BASELINE_LABEL
  }
}

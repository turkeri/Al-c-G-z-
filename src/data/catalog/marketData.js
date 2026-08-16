/**
 * PİYASA DEĞERLEME KATSAYILARI
 *
 * ============================================================================
 * BU HESAP NEDEN YAPAY ZEKÂYA BIRAKILMIYOR
 * ============================================================================
 * Fiyat, kullanıcının en çok güvendiği ve en kolay yanıldığı sayı. Yapay zekâ
 * her çağrıda biraz farklı rakam verir, kaynağını gösteremez ve internet
 * yokken hiç çalışmaz. Oysa değerleme deterministik olmalı: aynı araç için
 * her zaman aynı aralık çıkmalı ve HANGİ FAKTÖRÜN ne kadar etkilediği
 * gösterilebilmeli.
 *
 * Bu yüzden hesap burada, açık katsayılarla yapılır.
 *
 * ============================================================================
 * DÜRÜST SINIR — BU BİR PİYASA TARAMASI DEĞİL
 * ============================================================================
 * Uygulama ilan sitelerinden canlı fiyat çekemiyor (bkz. listing/adapters.js).
 * Dolayısıyla buradaki rakamlar "şu an sahibinden'de şu fiyata satılıyor"
 * demek DEĞİLDİR. Bir MODELLEME'dir:
 *
 *   vehicles.json'daki referans fiyat (bilinen bir yıl/km için)
 *     × yaş amortismanı
 *     × kilometre düzeltmesi
 *     × motor / şanzıman / donanım katsayıları
 *     × marka likidite düzeltmesi
 *
 * Modelin çıktısı bir ARALIKTIR ve her katsayının etkisi kullanıcıya ayrı
 * gösterilir. Böylece kullanıcı sayıya körü körüne inanmak yerine mantığını
 * görebilir ve kendi bildiğiyle karşılaştırabilir.
 */

export const MARKET_BASELINE_LABEL = 'Ağustos 2026'

/**
 * Genel fiyat endeksi.
 *
 * vehicles.json'daki 213 referans fiyat yukarıdaki tarihe göre girildi.
 * Piyasa topluca hareket ettiğinde 213 kaydı tek tek güncellemek yerine
 * yalnızca bu sayı değiştirilir: piyasa %30 yükseldiyse 1.3 yapılır.
 */
export const PRICE_INDEX = 1

/**
 * YAŞ AMORTİSMANI
 *
 * Düz yıllık yüzde kullanmak yanlış sonuç verir: bir araç ilk yılında çok,
 * onuncu yılında çok az değer kaybeder. Aşağıdaki tablo yaş → o yaşa kadar
 * KALAN değer oranını verir (yeni fiyatına göre değil, referans yılına göre
 * göreli hesaplanır).
 */
const AGE_RETENTION = [
  1.0,    // 0 yaş
  0.82,   // 1
  0.71,   // 2
  0.63,   // 3
  0.56,   // 4
  0.50,   // 5
  0.45,   // 6
  0.41,   // 7
  0.37,   // 8
  0.33,   // 9
  0.30,   // 10
  0.27,   // 11
  0.245,  // 12
  0.22,   // 13
  0.20,   // 14
  0.185   // 15
]

/*
 * Eğri kalibrasyonu.
 *
 * Tablo mutlak fiyat değil ORAN üretir: iki yaş arasındaki oran kullanılır.
 * Örnek: referans 2018 (8 yaş) ve araç 2015 (11 yaş) ise 0.27 / 0.37 = 0.73,
 * yani üç yıl için yaklaşık -%27. İlk hâlinde eğri fazla yassıydı ve aynı üç
 * yıl için -%17 veriyordu; bu, eski araçları olduğundan değerli gösteriyordu.
 */

/** 15 yaş üstünde değer kaybı çok yavaşlar; klasik/nostalji etkisi hariç. */
const OLD_CAR_FLOOR = 0.14
const OLD_CAR_DECAY_PER_YEAR = 0.008

export function ageRetention(age) {
  if (age === null || age === undefined) return 1
  const a = Math.max(0, Math.round(age))
  if (a < AGE_RETENTION.length) return AGE_RETENTION[a]
  const extra = a - (AGE_RETENTION.length - 1)
  return Math.max(OLD_CAR_FLOOR, AGE_RETENTION[AGE_RETENTION.length - 1] - extra * OLD_CAR_DECAY_PER_YEAR)
}

/**
 * KİLOMETRE BANTLARI
 *
 * Referans kilometre (vehicles.json'da kayıtlı, genelde 100.000) için katsayı
 * 1.00'dir. Az kilometre değeri yükseltir, çok kilometre düşürür — ama etki
 * doğrusal değildir: 30.000 ile 50.000 arasındaki fark, 200.000 ile 220.000
 * arasındaki farktan büyüktür.
 */
export const KM_BANDS = [
  { max: 30000, factor: 1.18, label: '0 - 30.000 km' },
  { max: 60000, factor: 1.11, label: '30.000 - 60.000 km' },
  { max: 90000, factor: 1.05, label: '60.000 - 90.000 km' },
  { max: 120000, factor: 1.0, label: '90.000 - 120.000 km' },
  { max: 160000, factor: 0.94, label: '120.000 - 160.000 km' },
  { max: 200000, factor: 0.88, label: '160.000 - 200.000 km' },
  { max: 250000, factor: 0.82, label: '200.000 - 250.000 km' },
  { max: 320000, factor: 0.76, label: '250.000 - 320.000 km' },
  { max: Infinity, factor: 0.70, label: '320.000 km üzeri' }
]

export function kmBandFor(km) {
  const value = Number(km)
  if (!Number.isFinite(value) || value <= 0) return null
  return KM_BANDS.find((b) => value <= b.max) || KM_BANDS[KM_BANDS.length - 1]
}

/**
 * YAKIT KATSAYISI
 *
 * Türkiye'de dizel araç ikinci elde genelde primli satılır (yakıt ekonomisi
 * ve uzun yol kullanımı beklentisi). Hibrit son yıllarda belirgin prim
 * kazandı. LPG'li araç ise bir kesim alıcı tarafından tercih edilmediği için
 * hafif iskontolu işlem görür.
 */
export const FUEL_FACTORS = {
  Dizel: 1.05,
  Benzin: 1.0,
  Hibrit: 1.09,
  Elektrik: 0.97,
  LPG: 0.95
}

/**
 * ŞANZIMAN KATSAYISI
 *
 * Otomatik araç şehir içi kullanımda daha çok aranır ve prim yapar. Ancak
 * SORUNLU olduğu bilinen çift kavramalı üniteler (kuru DSG, Powershift) bu
 * primi büyük ölçüde kaybeder — alıcı çevresi bunu bilir ve fiyata yansıtır.
 */
export const TRANSMISSION_FACTORS = {
  manuel: 1.0,
  otomatik: 1.07,
  'cift-kavrama': 1.05,
  'cift-kavrama-riskli': 0.99,
  cvt: 1.02,
  robotize: 0.95
}

/** Riskli kabul edilen çift kavramalı üniteler (fiyat primi düşer). */
const RISKY_DCT = /dq200|dsg\s*7|powershift|dps6|dualogic|mmt|6dct/i

export function transmissionFactorKey(name) {
  const text = String(name || '').toLocaleLowerCase('tr')
  if (!text) return null
  if (/dualogic|mmt|robotize/.test(text)) return 'robotize'
  if (RISKY_DCT.test(text)) return 'cift-kavrama-riskli'
  if (/dsg|dct|edc|s tronic|powershift|çift kavrama|cift kavrama/.test(text)) return 'cift-kavrama'
  if (/cvt|multidrive|x-?tronic|multitronic/.test(text)) return 'cvt'
  if (/manuel|düz|duz/.test(text)) return 'manuel'
  if (/otomatik|tronic|automatic|eat|zf|aisin|steptronic/.test(text)) return 'otomatik'
  return null
}

/**
 * DONANIM PAKETİ KATSAYISI
 *
 * Üst donanım ikinci elde primlidir ama prim, yeni fiyattaki farkın tamamını
 * yansıtmaz: 200.000 TL'lik opsiyon farkı ikinci elde 60-80 bin TL'ye iner.
 * Bu yüzden çarpanlar ölçülü tutulmuştur.
 */
export const PACKAGE_FACTORS = {
  giriş: 0.95,
  orta: 1.0,
  üst: 1.07,
  spor: 1.09
}

/**
 * MARKA LİKİDİTESİ — FİYATA ÇARPILMAZ, BİLGİ OLARAK GÖSTERİLİR
 *
 * İlk tasarımda bu katsayı fiyatla çarpılıyordu ve bu bir ÇİFTE SAYIM'dı:
 * `vehicles.json`'daki referans fiyat zaten o markanın kendi piyasa fiyatı.
 * Volkswagen'in referansına ayrıca "Volkswagen likit bir marka" diye %3 prim
 * eklemek, aynı bilgiyi iki kez saymak demek.
 *
 * Likidite bilgisi yine de alıcı için değerlidir — ama fiyatı değil, SATMA
 * KOLAYLIĞINI anlatır. Bu yüzden ayrı bir bilgi olarak gösterilir.
 */
export function liquidityNote(resaleSpeed) {
  const value = Number(resaleSpeed)
  if (!Number.isFinite(value)) return null
  if (value >= 5) return 'Satarken alıcı bulmak çok kolay'
  if (value === 4) return 'Satarken alıcı bulmak kolay'
  if (value === 3) return 'Satarken ortalama sürede alıcı bulunur'
  if (value === 2) return 'Satarken alıcı bulmak zaman alabilir'
  return 'Satarken alıcı bulmak zor; fiyat kırmak gerekebilir'
}

/**
 * FİYAT ARALIĞI GENİŞLİĞİ
 *
 * Model ne kadar az bilgiye dayanıyorsa aralık o kadar geniş olmalı. Tek bir
 * sayı vermek sahte kesinlik; dar bir aralık vermek de öyle.
 */
export const RANGE_WIDTH = {
  tam: 0.05,     // marka, model, yıl, km, motor, şanzıman biliniyor
  kismi: 0.09,   // bazıları eksik
  zayif: 0.15    // yalnızca marka/model/yıl var
}

/**
 * PAZARLIK HEDEFİ
 *
 * Alıcının "kaç lira teklif edeyim" sorusunun cevabı. Piyasa ortalamasının
 * biraz altı hedeflenir; hasar ve yaklaşan bakım kalemleri varsa hedef daha
 * aşağı çekilir.
 *
 * Bu bir "kesin bu fiyata alırsın" vaadi değil, savunulabilir bir başlangıç
 * noktasıdır — ve gerekçesi kullanıcıya gösterilir.
 */
export const NEGOTIATION_BASE_DISCOUNT = 0.03

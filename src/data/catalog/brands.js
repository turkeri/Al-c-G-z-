/**
 * MARKA VERİTABANI
 *
 * ============================================================================
 * NEDEN MARKA AYRI BİR KATMAN
 * ============================================================================
 * İkinci el alımında kararı yalnızca aracın kendisi belirlemez. Aynı yaş ve
 * kilometredeki iki araçtan biri, markası yüzünden çok daha pahalıya sahip
 * olunur: parça fiyatı, servis ağının genişliği, usta bulma kolaylığı ve
 * satarken alıcı bulma hızı markaya bağlıdır.
 *
 * Bu bilgi motora ya da modele değil MARKAYA aittir, bu yüzden ayrı durur ve
 * o markanın tüm modelleri otomatik yararlanır.
 *
 * ============================================================================
 * ALANLAR
 * ============================================================================
 *   partsCost        1-5  parça maliyeti (1 = ucuz, 5 = çok pahalı)
 *   serviceNetwork   1-5  yetkili servis + özel servis yaygınlığı
 *   partsAvailability 1-5 yedek parça bulunabilirliği
 *   resaleSpeed      1-5  ikinci elde satarken alıcı bulma hızı (likidite)
 *   note             alıcının bilmesi gereken markaya özgü gerçek
 *
 * ============================================================================
 * BU PUANLAR NEDİR, NE DEĞİLDİR
 * ============================================================================
 * Bunlar laboratuvar ölçümü değil, Türkiye pazarındaki yaygın deneyimin
 * göreli özetidir. "Volvo 2/5 parça maliyeti" demek "Volvo pahalıdır" değil,
 * "aynı segmentteki Toyota'ya göre belirgin biçimde pahalıdır" demektir.
 * Mutlak rakam vermek yanıltıcı olurdu; göreli sıralama kullanıcının kararına
 * gerçekten yardım eder.
 */

export const BRANDS = [
  // ---------------------------------------------------------------- ALMAN
  {
    id: 'volkswagen',
    name: 'Volkswagen',
    origin: 'Almanya',
    group: 'VAG',
    partsCost: 3,
    serviceNetwork: 5,
    partsAvailability: 5,
    resaleSpeed: 5,
    note:
      'Türkiye\'de en yaygın markalardan; parça ve usta her yerde bulunur. Yan sanayi parça seçeneği geniş olduğu için bakım maliyeti kontrol edilebilir. Satarken alıcı bulmak kolaydır.'
  },
  {
    id: 'audi',
    name: 'Audi',
    origin: 'Almanya',
    group: 'VAG',
    partsCost: 4,
    serviceNetwork: 4,
    partsAvailability: 4,
    resaleSpeed: 4,
    note:
      'Volkswagen ile aynı teknik altyapıyı paylaşır ama parça fiyatları belirgin biçimde yüksektir. Aynı motorun VW\'deki parçası çoğu zaman daha ucuza bulunur; usta bu ikameyi bilir.'
  },
  {
    id: 'bmw',
    name: 'BMW',
    origin: 'Almanya',
    group: 'BMW',
    partsCost: 4,
    serviceNetwork: 4,
    partsAvailability: 4,
    resaleSpeed: 4,
    note:
      'Sürüş dinamiği güçlü, bakım disiplini şart. Elektrik ve soğutma sistemi parçaları yaşla birlikte sıraya girer; "bakımsız ucuz BMW" ikinci el alımında en pahalı tuzaklardan biridir.'
  },
  {
    id: 'mercedes-benz',
    name: 'Mercedes-Benz',
    origin: 'Almanya',
    group: 'Mercedes-Benz',
    partsCost: 5,
    serviceNetwork: 4,
    partsAvailability: 4,
    resaleSpeed: 4,
    note:
      'Parça ve işçilik pahalıdır; özellikle hava süspansiyonlu ve çok donanımlı versiyonlarda tek bir arıza bütçeyi zorlayabilir. Bakım geçmişi olmayan araçtan uzak durulmalı.'
  },
  {
    id: 'skoda',
    name: 'Skoda',
    origin: 'Çekya',
    group: 'VAG',
    partsCost: 2,
    serviceNetwork: 4,
    partsAvailability: 5,
    resaleSpeed: 4,
    note:
      'Volkswagen mekaniğini daha uygun parça fiyatlarıyla sunar; ikinci elde fiyat/performans açısından en dengeli markalardan biri kabul edilir.'
  },
  {
    id: 'seat',
    name: 'Seat',
    origin: 'İspanya',
    group: 'VAG',
    partsCost: 2,
    serviceNetwork: 3,
    partsAvailability: 4,
    resaleSpeed: 3,
    note:
      'VAG mekaniği, Skoda\'ya benzer maliyet avantajı. Servis ağı Volkswagen kadar geniş değildir ama parçalar büyük ölçüde ortaktır.'
  },
  {
    id: 'opel',
    name: 'Opel',
    origin: 'Almanya',
    group: 'Opel',
    partsCost: 2,
    serviceNetwork: 4,
    partsAvailability: 4,
    resaleSpeed: 3,
    note:
      '2017 sonrası modeller PSA (Peugeot-Citroën) altyapısına geçti; öncesi GM altyapısıdır. Aynı model adının farklı yıllarda tamamen farklı mekaniği olabilir, motor koduna bakmak şart.'
  },

  // ---------------------------------------------------------------- FRANSIZ
  {
    id: 'renault',
    name: 'Renault',
    origin: 'Fransa',
    group: 'Renault-Nissan',
    partsCost: 1,
    serviceNetwork: 5,
    partsAvailability: 5,
    resaleSpeed: 5,
    note:
      'Türkiye\'de üretim geçmişi sayesinde parça en ucuz ve en kolay bulunan markalardan. Her ilçede usta bulunur; bakım maliyeti düşüktür.'
  },
  {
    id: 'dacia',
    name: 'Dacia',
    origin: 'Romanya',
    group: 'Renault-Nissan',
    partsCost: 1,
    serviceNetwork: 4,
    partsAvailability: 5,
    resaleSpeed: 5,
    note:
      'Renault mekaniği, sade donanım. Az elektronik = az arıza; ikinci elde değer kaybı düşüktür. Konfor ve yalıtım beklentisi yüksek olan kullanıcıyı memnun etmeyebilir.'
  },
  {
    id: 'peugeot',
    name: 'Peugeot',
    origin: 'Fransa',
    group: 'Stellantis-PSA',
    partsCost: 2,
    serviceNetwork: 4,
    partsAvailability: 4,
    resaleSpeed: 3,
    note:
      'Dizel motorları (HDi/BlueHDi) genelde dayanıklıdır. Benzinli PureTech ailesinin yağ banyolu triger kayışı, bakım aksatıldığında ciddi masraf çıkarabilir.'
  },
  {
    id: 'citroen',
    name: 'Citroën',
    origin: 'Fransa',
    group: 'Stellantis-PSA',
    partsCost: 2,
    serviceNetwork: 3,
    partsAvailability: 4,
    resaleSpeed: 3,
    note:
      'Peugeot ile aynı motor ve şanzımanları paylaşır; parçalar büyük ölçüde ortaktır. İkinci elde alıcı çevresi Peugeot\'dan dardır.'
  },

  // ---------------------------------------------------------------- UZAK DOĞU
  {
    id: 'toyota',
    name: 'Toyota',
    origin: 'Japonya',
    group: 'Toyota',
    partsCost: 3,
    serviceNetwork: 4,
    partsAvailability: 4,
    resaleSpeed: 5,
    note:
      'Güvenilirlik açısından referans kabul edilir; hibrit sistemleri özellikle dertsizdir. Bunun bedeli ikinci el fiyatının yüksek olmasıdır — ucuza Toyota bulmak zordur, bulunduğunda nedeni sorgulanmalı.'
  },
  {
    id: 'honda',
    name: 'Honda',
    origin: 'Japonya',
    group: 'Honda',
    partsCost: 3,
    serviceNetwork: 3,
    partsAvailability: 3,
    resaleSpeed: 4,
    note:
      'Benzinli motorları çok dayanıklıdır ve yağ bakımı kısa aralıkla yapılmalıdır. Bazı modellerde supap ayarı periyodik bir bakım kalemidir; ihmal edilirse ses ve güç kaybı yapar.'
  },
  {
    id: 'hyundai',
    name: 'Hyundai',
    origin: 'Güney Kore',
    group: 'Hyundai-Kia',
    partsCost: 2,
    serviceNetwork: 5,
    partsAvailability: 5,
    resaleSpeed: 4,
    note:
      'Türkiye\'de üretim ve geniş servis ağı sayesinde parça ucuz ve hızlı bulunur. Uzun garanti geleneği nedeniyle bakım kayıtlı araç bulmak görece kolaydır.'
  },
  {
    id: 'kia',
    name: 'Kia',
    origin: 'Güney Kore',
    group: 'Hyundai-Kia',
    partsCost: 2,
    serviceNetwork: 4,
    partsAvailability: 4,
    resaleSpeed: 4,
    note:
      'Hyundai ile aynı motor ve şanzımanları paylaşır; teknik olarak kardeş markadır. Kuru çift kavramalı (6DCT) şanzımanlı versiyonlarda test sürüşü şarttır.'
  },
  {
    id: 'nissan',
    name: 'Nissan',
    origin: 'Japonya',
    group: 'Renault-Nissan',
    partsCost: 3,
    serviceNetwork: 3,
    partsAvailability: 3,
    resaleSpeed: 3,
    note:
      'Renault ile ortak motorlar taşır. CVT şanzımanlı modellerde yağ bakım kaydı alım kararının merkezinde olmalıdır.'
  },
  {
    id: 'mazda',
    name: 'Mazda',
    origin: 'Japonya',
    group: 'Mazda',
    partsCost: 3,
    serviceNetwork: 2,
    partsAvailability: 2,
    resaleSpeed: 3,
    note:
      'Atmosferik benzinli (Skyactiv-G) motorları dertsizdir. Skyactiv-D dizellerde kısa mesafe kullanımı ciddi sorun kaynağıdır. Servis ağı dar olduğu için onarım süresi uzayabilir.'
  },
  {
    id: 'suzuki',
    name: 'Suzuki',
    origin: 'Japonya',
    group: 'Suzuki',
    partsCost: 3,
    serviceNetwork: 2,
    partsAvailability: 2,
    resaleSpeed: 3,
    note: 'Hafif ve basit araçlar; mekanik olarak sağlamdır. Servis ağı sınırlıdır.'
  },
  {
    id: 'mitsubishi',
    name: 'Mitsubishi',
    origin: 'Japonya',
    group: 'Mitsubishi',
    partsCost: 3,
    serviceNetwork: 2,
    partsAvailability: 2,
    resaleSpeed: 2,
    note: 'Servis ağı dardır; parça temini bazı modellerde beklemeye girebilir.'
  },

  // ---------------------------------------------------------------- DİĞER
  {
    id: 'ford',
    name: 'Ford',
    origin: 'ABD / Avrupa',
    group: 'Ford',
    partsCost: 2,
    serviceNetwork: 5,
    partsAvailability: 5,
    resaleSpeed: 4,
    note:
      'Türkiye\'de üretim (Ford Otosan) sayesinde parça ve servis çok yaygındır. Powershift çift kavramalı şanzımanlı yıllarda şanzıman geçmişi mutlaka sorulmalıdır.'
  },
  {
    id: 'fiat',
    name: 'Fiat',
    origin: 'İtalya',
    group: 'Stellantis-Fiat',
    partsCost: 1,
    serviceNetwork: 5,
    partsAvailability: 5,
    resaleSpeed: 5,
    note:
      'Tofaş üretimi sayesinde parça en ucuz markalardandır; Egea Türkiye\'nin en çok satan modellerinden biri olduğu için usta ve parça her yerde bulunur.'
  },
  {
    id: 'volvo',
    name: 'Volvo',
    origin: 'İsveç',
    group: 'Volvo',
    partsCost: 4,
    serviceNetwork: 2,
    partsAvailability: 3,
    resaleSpeed: 3,
    note:
      'Güvenlik donanımı güçlüdür. Servis ağı dar, parça pahalıdır; yağ banyolu triger kayışı kullanan dizellerde bakım aralığına uyulması kritiktir.'
  },
  {
    id: 'alfa-romeo',
    name: 'Alfa Romeo',
    origin: 'İtalya',
    group: 'Stellantis-Fiat',
    partsCost: 3,
    serviceNetwork: 2,
    partsAvailability: 3,
    resaleSpeed: 2,
    note: 'Fiat mekaniğini paylaşır ama markaya özel parçalar pahalı ve zor bulunur; alıcı çevresi dardır.'
  },
  {
    id: 'jeep',
    name: 'Jeep',
    origin: 'ABD',
    group: 'Stellantis-Fiat',
    partsCost: 4,
    serviceNetwork: 2,
    partsAvailability: 3,
    resaleSpeed: 3,
    note: 'Bazı modellerde ZF 9HP şanzıman şikayetleri yaygındır; test sürüşünde düşük hız geçişleri dinlenmeli.'
  },
  {
    id: 'mini',
    name: 'Mini',
    origin: 'İngiltere',
    group: 'BMW',
    partsCost: 4,
    serviceNetwork: 2,
    partsAvailability: 3,
    resaleSpeed: 3,
    note: 'BMW mekaniği taşır; parça fiyatları BMW seviyesindedir. Servis ağı dardır.'
  },
  {
    id: 'chevrolet',
    name: 'Chevrolet',
    origin: 'ABD / Kore',
    group: 'GM',
    partsCost: 3,
    serviceNetwork: 1,
    partsAvailability: 2,
    resaleSpeed: 2,
    note:
      'Marka Türkiye pazarından çekildi; yetkili servis yoktur. Parça temini özel tedarikçilere bağlıdır, onarım süresi uzayabilir. Fiyatı düşük görünen ilanların nedeni çoğu zaman budur.'
  },
  {
    id: 'ssangyong',
    name: 'SsangYong',
    origin: 'Güney Kore',
    group: 'SsangYong',
    partsCost: 3,
    serviceNetwork: 1,
    partsAvailability: 1,
    resaleSpeed: 1,
    note:
      'Servis ve parça ağı çok dardır. Ucuz görünen fiyat, satarken alıcı bulmanın zorluğuyla dengelenir.'
  },
  {
    id: 'land-rover',
    name: 'Land Rover',
    origin: 'İngiltere',
    group: 'JLR',
    partsCost: 5,
    serviceNetwork: 2,
    partsAvailability: 2,
    resaleSpeed: 2,
    note:
      'Bakım ve onarım maliyeti bu listedeki en yüksek gruplardandır. Ingenium dizellerde zincir sorunu, elektronikte arıza sıklığı bilinen konulardır; bütçeye onarım payı ayrılmadan alınmamalı.'
  },
  {
    id: 'jaguar',
    name: 'Jaguar',
    origin: 'İngiltere',
    group: 'JLR',
    partsCost: 5,
    serviceNetwork: 1,
    partsAvailability: 2,
    resaleSpeed: 1,
    note: 'Parça pahalı, servis ağı çok dar, ikinci elde alıcı bulmak zordur.'
  },
  {
    id: 'subaru',
    name: 'Subaru',
    origin: 'Japonya',
    group: 'Subaru',
    partsCost: 4,
    serviceNetwork: 1,
    partsAvailability: 2,
    resaleSpeed: 2,
    note:
      'Boxer motor ve sürekli dört çeker yapısı nedeniyle bazı işçilikler diğer markalara göre pahalıdır. Servis ağı çok dardır.'
  },
  {
    id: 'tofas',
    name: 'Tofaş',
    origin: 'Türkiye',
    group: 'Stellantis-Fiat',
    partsCost: 1,
    serviceNetwork: 5,
    partsAvailability: 5,
    resaleSpeed: 4,
    note: 'Parça en ucuz ve en yaygın bulunan gruptur; her ustanın bildiği mekanik.'
  },

  // ---------------------------------------------------------------- DİĞER
  {
    id: 'lexus',
    name: 'Lexus',
    origin: 'Japonya',
    group: 'Toyota',
    partsCost: 4,
    serviceNetwork: 2,
    partsAvailability: 3,
    resaleSpeed: 3,
    note: 'Toyota ile aynı hibrit teknolojisini ve güvenilirlik seviyesini taşır; servis ağı Toyota\'ya göre çok daha dardır, bu da bekleme süresini uzatabilir.'
  },
  {
    id: 'porsche',
    name: 'Porsche',
    origin: 'Almanya',
    group: 'VAG',
    partsCost: 5,
    serviceNetwork: 2,
    partsAvailability: 3,
    resaleSpeed: 4,
    note: 'Cayenne/Macan gibi SUV modelleri VW/Audi ile ortak platform ve motor kullanır; işçilik ve orijinal parça markanın karakteri gereği çok pahalıdır.'
  },
  {
    id: 'mg',
    name: 'MG',
    origin: 'Çin',
    group: 'MG',
    partsCost: 2,
    serviceNetwork: 3,
    partsAvailability: 2,
    resaleSpeed: 2,
    note: 'Türkiye pazarına yeni giren, agresif fiyatlanan bir markadır. Servis ağı hızla büyüyor ama ikinci el fiyat davranışı ve parça arzı için henüz uzun vadeli veri yoktur.'
  },
  {
    id: 'ds',
    name: 'DS',
    origin: 'Fransa',
    group: 'Stellantis-PSA',
    partsCost: 4,
    serviceNetwork: 1,
    partsAvailability: 2,
    resaleSpeed: 2,
    note: 'Citroën\'in premium alt markasıdır; PSA motor ailesini paylaşır ama bayi/servis ağı Türkiye\'de çok dardır.'
  }
]

const BY_ID = new Map(BRANDS.map((b) => [b.id, b]))
const BY_NAME = new Map(BRANDS.map((b) => [b.name.toLocaleLowerCase('tr'), b]))

export function getBrandInfo(name) {
  if (!name) return null
  const key = String(name).toLocaleLowerCase('tr').trim()
  return BY_NAME.get(key) || BY_ID.get(key) || null
}

/**
 * Markadan doğan sahiplik yükünü tek bir puana indirger (0-100).
 *
 * Yüksek puan = bu markaya sahip olmak kolay ve ucuz.
 * Parça maliyeti ters çevrilir (pahalı olmak kötüdür), diğerleri düz alınır.
 */
export function brandOwnershipScore(name) {
  const brand = getBrandInfo(name)
  if (!brand) return null

  const inverted = 6 - brand.partsCost // 1 (çok pahalı) → 5 puan yerine 1
  const total =
    inverted * 0.3 +
    brand.serviceNetwork * 0.25 +
    brand.partsAvailability * 0.25 +
    brand.resaleSpeed * 0.2

  return {
    brand,
    score: Math.round((total / 5) * 100),
    note: brand.note
  }
}

export function getBrandCount() {
  return BRANDS.length
}

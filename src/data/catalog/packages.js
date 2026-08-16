/**
 * DONANIM PAKETİ VERİTABANI
 *
 * ============================================================================
 * DÜRÜST NOT — BU DOSYA NEDEN YAVAŞ BÜYÜYOR
 * ============================================================================
 * Donanım paketleri, bu projedeki en zor veri türüdür. Bir paketin içeriği
 * markadan markaya, yıldan yıla, hatta aynı yıl içinde pazardan pazara
 * değişir: Türkiye'ye gelen "Audi A3 Dynamic" ile Almanya'daki aynı paket
 * farklı donanımlar taşır. Üstelik birçok donanım opsiyoneldir — aynı paketin
 * iki aracından birinde vardır, diğerinde yoktur.
 *
 * Bu bilgiyi tahminle doldurmak kullanıcıyı doğrudan yanıltır: adam "bu
 * pakette geri görüş kamerası var" diye alır, aracında çıkmaz. Bu yüzden
 * burada YALNIZCA yaygın olarak doğrulanabilir paketler bulunur ve her kaydın
 * bir `confidence` (güven) alanı vardır.
 *
 * Uygulama, paketi bilinmeyen bir araçta bu bölümü hiç göstermez — yanlış
 * bilgi vermektense hiç göstermemek tercih edilir.
 *
 * ============================================================================
 * GÜVEN SEVİYESİ NASIL SEÇİLDİ
 * ============================================================================
 *   dogrulanmis : Türkiye'de tek bir donanım listesiyle satılmış, opsiyon
 *                 karmaşası düşük paketler. Toyota, Renault, Fiat, Hyundai,
 *                 Kia gibi markalarda paket içeriği yıl boyunca sabit kalır.
 *   kismi       : Alman markalarının çoğu bu gruptadır. Aynı "Comfortline"
 *                 iki araçta farklı donanım taşıyabilir çünkü satış anında
 *                 tek tek opsiyon işaretlenmiştir. Bu kayıtlarda `optional`
 *                 listesi asıl bilgidir: "olabilir de olmayabilir de".
 *
 * Hiçbir kayıt "kesin" değildir. Ekran her durumda kullanıcıya donanımı araç
 * başında doğrulamasını söyler — ilanda yazması yeterli sayılmaz.
 *
 * ============================================================================
 * DONANIM SÖZLÜĞÜNE BAĞLILIK
 * ============================================================================
 * `includes` ve `excludes` alanları serbest metin değil, equipment.js
 * içindeki KİMLİKLERDİR. Böylece "geri görüş kamerası" bilgisi tek yerde
 * tanımlıdır ve yanında nasıl kontrol edileceği, bozuksa ne tuttuğu da gelir.
 *
 * `extras` alanı ise sözlükte karşılığı olmayan, pakete özel serbest
 * metinler içindir (örn. "Alcantara döşeme").
 *
 * ============================================================================
 * VERİ YAPISI — MARKA → MODEL → YIL → KASA → PAKET
 * ============================================================================
 *   brand      : marka
 *   model      : model (models.js ile aynı yazım)
 *   years      : paketin geçerli olduğu yıl aralığı
 *   bodyTypes  : bu paketin sunulduğu kasa tipleri (Sedan, Hatchback, SUV...)
 *   name       : paket adı
 *   tier       : giriş | orta | üst | spor  (karşılaştırma sıralaması için)
 *   includes   : bu pakette standart gelen donanım kimlikleri
 *   excludes   : bu pakette OLMAYAN, alıcının sıkça beklediği donanımlar
 *   optional   : bu pakette OPSİYONEL olabilen donanımlar — "olabilir de olmayabilir de"
 *   confidence : 'dogrulanmis' | 'kismi'  — kısmi olanlar ekranda uyarıyla gösterilir
 *
 * Kasa bilgisi neden önemli: aynı model adının sedan ve hatchback hâli farklı
 * donanım listesiyle satılabilir (Fiat Egea Sedan ile Egea HB, Golf ile Golf
 * Variant). Kasa bilinmiyorsa tüm kasalar gösterilir; yanlış daraltma yerine
 * geniş liste tercih edilir.
 */

export const PACKAGE_TIERS = ['giriş', 'orta', 'üst', 'spor']

export const PACKAGES = [
  // ==========================================================================
  // VOLKSWAGEN
  // ==========================================================================
  {
    brand: 'Volkswagen',
    model: 'Golf',
    years: '2013-2020',
    bodyTypes: ['Hatchback', 'Station Wagon'],
    name: 'Trendline',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix', 'manuel-klima', 'celik-jant', 'halojen-far', 'bluetooth'],
    excludes: ['led-far', 'navigasyon', 'geri-kamera', 'park-sensoru', 'otomatik-klima'],
    optional: ['hiz-sabitleyici'],
    extras: ['Kumaş döşeme', 'Elektrikli ön camlar']
  },
  {
    brand: 'Volkswagen',
    model: 'Golf',
    years: '2013-2020',
    bodyTypes: ['Hatchback', 'Station Wagon'],
    name: 'Comfortline',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'otomatik-klima', 'park-sensoru', 'alasim-jant', 'esp', 'isofix',
      'deri-direksiyon', 'yagmur-sensoru', 'hiz-sabitleyici', 'kumas-doseme'
    ],
    excludes: ['matris-far', 'geri-kamera', 'elektrikli-koltuk', 'panoramik-tavan'],
    optional: ['dokunmatik-ekran', 'sis-far', 'on-park-sensoru', 'led-gunduz'],
    extras: ['Orta kol dayama', 'Krom iç detaylar']
  },
  {
    brand: 'Volkswagen',
    model: 'Golf',
    years: '2013-2020',
    bodyTypes: ['Hatchback', 'Station Wagon'],
    name: 'Highline',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'cift-bolge-klima', 'park-sensoru', 'alasim-jant', 'dokunmatik-ekran', 'esp',
      'led-gunduz', 'yagmur-sensoru', 'otomatik-far', 'deri-direksiyon', 'ambiyans-isik'
    ],
    excludes: ['hud'],
    optional: ['led-far', 'geri-kamera', 'koltuk-isitma', 'panoramik-tavan', 'navigasyon', 'yarim-deri-doseme'],
    extras: ['Alcantara/deri karışık döşeme', 'Spor ön koltuklar']
  },
  {
    brand: 'Volkswagen',
    model: 'Golf',
    years: '2013-2020',
    bodyTypes: ['Hatchback'],
    name: 'R-Line',
    tier: 'spor',
    confidence: 'kismi',
    includes: [
      'cift-bolge-klima', 'park-sensoru', 'alasim-jant', 'dokunmatik-ekran', 'esp',
      'led-gunduz', 'deri-direksiyon', 'ambiyans-isik', 'otomatik-far'
    ],
    excludes: [],
    optional: ['led-far', 'geri-kamera', 'koltuk-isitma', 'panoramik-tavan', 'dijital-gosterge'],
    extras: [
      'R-Line tampon ve marşpiyel seti',
      '17-18 inç R-Line jant',
      'Spor süspansiyon (bazı araçlarda)',
      'Alcantara spor koltuk'
    ]
  },
  {
    brand: 'Volkswagen',
    model: 'Golf',
    years: '2020-2024',
    bodyTypes: ['Hatchback'],
    name: 'Impression',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix', 'manuel-klima', 'dokunmatik-ekran', 'led-far', 'serit-takip', 'lastik-basinc'],
    excludes: ['geri-kamera', 'navigasyon', 'alasim-jant'],
    optional: ['apple-android', 'park-sensoru'],
    extras: ['Dijital gösterge (küçük ekran)']
  },
  {
    brand: 'Volkswagen',
    model: 'Golf',
    years: '2020-2024',
    bodyTypes: ['Hatchback'],
    name: 'Life',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'led-far',
      'alasim-jant', 'park-sensoru', 'serit-takip', 'acil-frenleme', 'dijital-gosterge', 'ambiyans-isik'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['geri-kamera', 'adaptif-hiz', 'koltuk-isitma', 'kablosuz-sarj'],
    extras: ['Travel Assist (bazı araçlarda)']
  },
  {
    brand: 'Volkswagen',
    model: 'Golf',
    years: '2020-2024',
    bodyTypes: ['Hatchback'],
    name: 'Style',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'led-far',
      'alasim-jant', 'park-sensoru', 'geri-kamera', 'serit-takip', 'acil-frenleme',
      'dijital-gosterge', 'ambiyans-isik', 'koltuk-isitma', 'anahtarsiz-giris', 'kablosuz-sarj'
    ],
    excludes: [],
    optional: ['matris-far', 'panoramik-tavan', 'hud', 'kor-nokta', 'adaptif-hiz'],
    extras: ['IQ.Light matris far (opsiyon)', 'Ergo koltuk (opsiyon)']
  },
  {
    brand: 'Volkswagen',
    model: 'Passat',
    years: '2015-2023',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Trendline',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'hiz-sabitleyici'],
    excludes: ['navigasyon', 'geri-kamera', 'led-far', 'alasim-jant'],
    optional: ['park-sensoru'],
    extras: ['Kumaş döşeme']
  },
  {
    brand: 'Volkswagen',
    model: 'Passat',
    years: '2015-2023',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Comfortline',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'cift-bolge-klima', 'park-sensoru', 'alasim-jant', 'esp', 'isofix',
      'deri-direksiyon', 'yagmur-sensoru', 'hiz-sabitleyici', 'arka-klima-menfezi'
    ],
    excludes: ['panoramik-tavan', 'hud'],
    optional: ['dokunmatik-ekran', 'geri-kamera', 'led-gunduz', 'on-park-sensoru'],
    extras: []
  },
  {
    brand: 'Volkswagen',
    model: 'Passat',
    years: '2015-2023',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Impression',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'cift-bolge-klima', 'park-sensoru', 'dokunmatik-ekran', 'alasim-jant', 'esp',
      'yagmur-sensoru', 'otomatik-far', 'deri-direksiyon', 'arka-klima-menfezi', 'elektrikli-katlanir-ayna'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['geri-kamera', 'koltuk-isitma', 'led-far', 'navigasyon', 'on-park-sensoru'],
    extras: []
  },
  {
    brand: 'Volkswagen',
    model: 'Passat',
    years: '2015-2023',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Highline',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'cift-bolge-klima', 'park-sensoru', 'on-park-sensoru', 'geri-kamera', 'led-far',
      'dokunmatik-ekran', 'alasim-jant', 'esp', 'ambiyans-isik', 'otomatik-far',
      'yagmur-sensoru', 'elektrikli-katlanir-ayna', 'arka-klima-menfezi'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'hud', 'elektrikli-koltuk', 'kor-nokta', 'koltuk-isitma', 'dijital-gosterge'],
    extras: ['Deri döşeme (opsiyon)', 'Ergo Comfort koltuk (opsiyon)']
  },
  {
    brand: 'Volkswagen',
    model: 'Passat',
    years: '2015-2023',
    bodyTypes: ['Sedan'],
    name: 'Elegance',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'cift-bolge-klima', 'park-sensoru', 'on-park-sensoru', 'geri-kamera', 'led-far',
      'dokunmatik-ekran', 'apple-android', 'alasim-jant', 'esp', 'ambiyans-isik',
      'dijital-gosterge', 'anahtarsiz-giris', 'deri-doseme', 'koltuk-isitma'
    ],
    excludes: [],
    optional: ['matris-far', 'panoramik-tavan', 'hud', 'kor-nokta', 'adaptif-hiz', 'elektrikli-bagaj'],
    extras: ['Krom dış detaylar']
  },
  {
    brand: 'Volkswagen',
    model: 'Polo',
    years: '2018-2024',
    bodyTypes: ['Hatchback'],
    name: 'Trendline',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix', 'manuel-klima', 'celik-jant', 'halojen-far', 'bluetooth', 'lastik-basinc'],
    excludes: ['geri-kamera', 'navigasyon', 'led-far', 'park-sensoru', 'alasim-jant'],
    optional: ['dokunmatik-ekran'],
    extras: ['Kumaş döşeme']
  },
  {
    brand: 'Volkswagen',
    model: 'Polo',
    years: '2018-2024',
    bodyTypes: ['Hatchback'],
    name: 'Comfortline',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'manuel-klima', 'dokunmatik-ekran', 'apple-android',
      'alasim-jant', 'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz'
    ],
    excludes: ['geri-kamera', 'panoramik-tavan'],
    optional: ['park-sensoru', 'otomatik-klima', 'sis-far'],
    extras: []
  },
  {
    brand: 'Volkswagen',
    model: 'Polo',
    years: '2018-2024',
    bodyTypes: ['Hatchback'],
    name: 'Highline',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'apple-android', 'alasim-jant',
      'park-sensoru', 'deri-direksiyon', 'led-far', 'otomatik-far', 'yagmur-sensoru'
    ],
    excludes: [],
    optional: ['geri-kamera', 'dijital-gosterge', 'kor-nokta', 'adaptif-hiz'],
    extras: ['Beats ses sistemi (opsiyon)']
  },
  {
    brand: 'Volkswagen',
    model: 'Tiguan',
    years: '2016-2023',
    bodyTypes: ['SUV'],
    name: 'Trend&Fun',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix', 'cift-bolge-klima', 'bluetooth', 'alasim-jant', 'hiz-sabitleyici', 'lastik-basinc'],
    excludes: ['led-far', 'geri-kamera', 'navigasyon', 'panoramik-tavan'],
    optional: ['park-sensoru', 'dokunmatik-ekran'],
    extras: ['Kumaş döşeme']
  },
  {
    brand: 'Volkswagen',
    model: 'Tiguan',
    years: '2016-2023',
    bodyTypes: ['SUV'],
    name: 'Comfortline',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'park-sensoru', 'alasim-jant',
      'deri-direksiyon', 'yagmur-sensoru', 'arka-klima-menfezi', 'tavan-rayi'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['geri-kamera', 'led-far', 'on-park-sensoru', 'koltuk-isitma'],
    extras: []
  },
  {
    brand: 'Volkswagen',
    model: 'Tiguan',
    years: '2016-2023',
    bodyTypes: ['SUV'],
    name: 'Highline',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'park-sensoru', 'on-park-sensoru',
      'geri-kamera', 'led-far', 'alasim-jant', 'ambiyans-isik', 'otomatik-far', 'yagmur-sensoru',
      'elektrikli-katlanir-ayna', 'arka-klima-menfezi', 'tavan-rayi'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'elektrikli-bagaj', 'dijital-gosterge', 'kor-nokta', 'adaptif-hiz', 'deri-doseme'],
    extras: ['Active Info Display (opsiyon)']
  },
  {
    brand: 'Volkswagen',
    model: 'T-Roc',
    years: '2019-2024',
    bodyTypes: ['SUV'],
    name: 'Style',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'led-far',
      'alasim-jant', 'park-sensoru', 'serit-takip', 'acil-frenleme', 'ambiyans-isik', 'lastik-basinc'
    ],
    excludes: [],
    optional: ['geri-kamera', 'dijital-gosterge', 'panoramik-tavan', 'adaptif-hiz', 'kor-nokta'],
    extras: ['Renkli tavan seçeneği']
  },

  // ==========================================================================
  // AUDI
  // ==========================================================================
  {
    brand: 'Audi',
    model: 'A3',
    years: '2013-2020',
    bodyTypes: ['Hatchback', 'Sedan'],
    name: 'Attraction',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'halojen-far', 'deri-direksiyon'],
    excludes: ['led-far', 'navigasyon', 'geri-kamera', 'otomatik-klima'],
    optional: ['park-sensoru', 'alasim-jant', 'hiz-sabitleyici'],
    extras: ['Kumaş döşeme', 'MMI çevirmeli kumanda']
  },
  {
    brand: 'Audi',
    model: 'A3',
    years: '2013-2020',
    bodyTypes: ['Hatchback', 'Sedan'],
    name: 'Ambition / Sport',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'otomatik-klima', 'alasim-jant', 'park-sensoru', 'esp', 'isofix',
      'deri-direksiyon', 'yagmur-sensoru', 'otomatik-far', 'hiz-sabitleyici'
    ],
    excludes: ['geri-kamera', 'panoramik-tavan'],
    optional: ['dokunmatik-ekran', 'koltuk-isitma', 'xenon', 'navigasyon', 'kablosuz-sarj'],
    extras: ['Spor koltuk', 'Spor süspansiyon (Sport paketinde)']
  },
  {
    brand: 'Audi',
    model: 'A3',
    years: '2013-2020',
    bodyTypes: ['Hatchback', 'Sedan'],
    name: 'Dynamic / S line',
    tier: 'spor',
    confidence: 'kismi',
    includes: [
      'led-far', 'alasim-jant', 'otomatik-klima', 'esp', 'isofix', 'park-sensoru',
      'deri-direksiyon', 'yagmur-sensoru', 'otomatik-far', 'ambiyans-isik'
    ],
    excludes: [],
    optional: ['geri-kamera', 'navigasyon', 'panoramik-tavan', 'koltuk-isitma', 'kor-nokta', 'yarim-deri-doseme'],
    extras: ['S line gövde kiti', '17-18 inç jant', 'Spor süspansiyon', 'Alcantara/deri spor koltuk']
  },
  {
    brand: 'Audi',
    model: 'A3',
    years: '2020-2024',
    bodyTypes: ['Hatchback', 'Sedan'],
    name: 'Advanced',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'led-far',
      'alasim-jant', 'park-sensoru', 'dijital-gosterge', 'serit-takip', 'acil-frenleme', 'ambiyans-isik'
    ],
    excludes: [],
    optional: ['geri-kamera', 'adaptif-hiz', 'kablosuz-sarj', 'panoramik-tavan', 'koltuk-isitma'],
    extras: ['Audi virtual cockpit']
  },
  {
    brand: 'Audi',
    model: 'A4',
    years: '2015-2023',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Sport',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'yagmur-sensoru', 'otomatik-far', 'hiz-sabitleyici', 'arka-klima-menfezi', 'led-far'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['geri-kamera', 'navigasyon', 'dijital-gosterge', 'koltuk-isitma', 'elektrikli-koltuk'],
    extras: ['MMI Radio Plus']
  },
  {
    brand: 'Audi',
    model: 'A4',
    years: '2015-2023',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Design / Design Line',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'on-park-sensoru',
      'deri-direksiyon', 'yagmur-sensoru', 'otomatik-far', 'led-far', 'ambiyans-isik',
      'elektrikli-katlanir-ayna', 'arka-klima-menfezi'
    ],
    excludes: [],
    optional: ['geri-kamera', 'navigasyon', 'dijital-gosterge', 'matris-far', 'panoramik-tavan', 'hud', 'deri-doseme'],
    extras: ['Krom dış çerçeveler', 'İç mekân dekor panelleri']
  },
  {
    brand: 'Audi',
    model: 'A4',
    years: '2015-2023',
    bodyTypes: ['Sedan'],
    name: 'S line',
    tier: 'spor',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'on-park-sensoru',
      'led-far', 'deri-direksiyon', 'ambiyans-isik', 'otomatik-far', 'yagmur-sensoru'
    ],
    excludes: [],
    optional: ['matris-far', 'geri-kamera', 'dijital-gosterge', 'hud', 'kor-nokta', 'adaptif-hiz'],
    extras: ['S line gövde kiti', 'Spor süspansiyon', '18-19 inç jant', 'Alcantara spor koltuk']
  },
  {
    brand: 'Audi',
    model: 'Q2',
    years: '2017-2024',
    bodyTypes: ['SUV'],
    name: 'Sport',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'hiz-sabitleyici', 'led-gunduz', 'dokunmatik-ekran'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['led-far', 'geri-kamera', 'navigasyon', 'dijital-gosterge', 'koltuk-isitma'],
    extras: []
  },
  {
    brand: 'Audi',
    model: 'Q3',
    years: '2015-2023',
    bodyTypes: ['SUV'],
    name: 'Design / S line',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'led-far',
      'deri-direksiyon', 'otomatik-far', 'yagmur-sensoru', 'tavan-rayi', 'ambiyans-isik'
    ],
    excludes: [],
    optional: ['geri-kamera', 'panoramik-tavan', 'dijital-gosterge', 'elektrikli-bagaj', 'kor-nokta', 'deri-doseme'],
    extras: ['S line paketinde gövde kiti ve spor koltuk']
  },

  // ==========================================================================
  // BMW
  // ==========================================================================
  {
    brand: 'BMW',
    model: '1 Serisi',
    years: '2011-2019',
    bodyTypes: ['Hatchback'],
    name: 'Joy',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'halojen-far', 'deri-direksiyon', 'celik-jant'],
    excludes: ['led-far', 'geri-kamera', 'navigasyon', 'otomatik-klima'],
    optional: ['park-sensoru', 'alasim-jant', 'hiz-sabitleyici'],
    extras: ['iDrive çevirmeli kumanda (küçük ekran)']
  },
  {
    brand: 'BMW',
    model: '1 Serisi',
    years: '2011-2019',
    bodyTypes: ['Hatchback'],
    name: 'Sport Line / Urban Line',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'yagmur-sensoru', 'otomatik-far', 'hiz-sabitleyici', 'led-gunduz'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['navigasyon', 'geri-kamera', 'koltuk-isitma', 'xenon', 'sunroof'],
    extras: ['Renkli iç detay kuşakları (Sport: kırmızı, Urban: beyaz)']
  },
  {
    brand: 'BMW',
    model: '1 Serisi',
    years: '2011-2019',
    bodyTypes: ['Hatchback'],
    name: 'M Sport',
    tier: 'spor',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'yagmur-sensoru', 'otomatik-far', 'led-gunduz', 'ambiyans-isik'
    ],
    excludes: [],
    optional: ['navigasyon', 'geri-kamera', 'koltuk-isitma', 'xenon', 'sunroof', 'hud'],
    extras: ['M aerodinamik paket', 'M spor süspansiyon', '17-18 inç M jant', 'M deri direksiyon']
  },
  {
    brand: 'BMW',
    model: '3 Serisi',
    years: '2012-2019',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Standart / Joy Plus',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix', 'cift-bolge-klima', 'bluetooth', 'deri-direksiyon', 'halojen-far', 'park-sensoru'],
    excludes: ['led-far', 'geri-kamera', 'panoramik-tavan'],
    optional: ['alasim-jant', 'navigasyon', 'hiz-sabitleyici'],
    extras: ['Kumaş döşeme']
  },
  {
    brand: 'BMW',
    model: '3 Serisi',
    years: '2012-2019',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Sport Line',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'yagmur-sensoru', 'otomatik-far', 'hiz-sabitleyici', 'led-gunduz', 'ambiyans-isik'
    ],
    excludes: [],
    optional: ['navigasyon', 'geri-kamera', 'xenon', 'led-far', 'koltuk-isitma', 'sunroof', 'elektrikli-koltuk'],
    extras: ['Yüksek parlak siyah dış detaylar', 'Kırmızı iç kuşak']
  },
  {
    brand: 'BMW',
    model: '3 Serisi',
    years: '2012-2019',
    bodyTypes: ['Sedan'],
    name: 'Luxury Line',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'yagmur-sensoru', 'otomatik-far', 'ambiyans-isik', 'yarim-deri-doseme', 'elektrikli-katlanir-ayna'
    ],
    excludes: [],
    optional: ['navigasyon', 'geri-kamera', 'xenon', 'led-far', 'koltuk-isitma', 'sunroof', 'hud', 'elektrikli-koltuk'],
    extras: ['Krom dış çerçeveler', 'Ahşap iç dekor', 'Dakota deri (opsiyon)']
  },
  {
    brand: 'BMW',
    model: '3 Serisi',
    years: '2012-2019',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'M Sport',
    tier: 'spor',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'yagmur-sensoru', 'otomatik-far', 'ambiyans-isik'
    ],
    excludes: [],
    optional: ['navigasyon', 'geri-kamera', 'led-far', 'koltuk-isitma', 'sunroof', 'hud', 'elektrikli-koltuk'],
    extras: ['M aerodinamik paket', 'M spor süspansiyon (10 mm alçak)', '18-19 inç M jant', 'Anthracite tavan döşemesi']
  },
  {
    brand: 'BMW',
    model: '3 Serisi',
    years: '2019-2024',
    bodyTypes: ['Sedan'],
    name: 'First Edition Sport Line',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'geri-kamera',
      'led-far', 'dokunmatik-ekran', 'apple-android', 'dijital-gosterge', 'ambiyans-isik',
      'serit-takip', 'acil-frenleme', 'anahtarsiz-giris'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'hud', 'kor-nokta', 'adaptif-hiz', 'koltuk-isitma', 'elektrikli-koltuk'],
    extras: ['Live Cockpit Professional']
  },
  {
    brand: 'BMW',
    model: '5 Serisi',
    years: '2017-2023',
    bodyTypes: ['Sedan'],
    name: 'Standart / Comfort',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'on-park-sensoru',
      'led-far', 'deri-direksiyon', 'navigasyon', 'ambiyans-isik', 'elektrikli-koltuk',
      'yagmur-sensoru', 'otomatik-far', 'arka-klima-menfezi'
    ],
    excludes: [],
    optional: ['geri-kamera', 'hud', 'panoramik-tavan', 'koltuk-isitma', 'kor-nokta', 'adaptif-hiz'],
    extras: ['Dakota deri döşeme']
  },
  {
    brand: 'BMW',
    model: '5 Serisi',
    years: '2017-2023',
    bodyTypes: ['Sedan'],
    name: 'M Sport',
    tier: 'spor',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'on-park-sensoru',
      'geri-kamera', 'led-far', 'deri-direksiyon', 'navigasyon', 'ambiyans-isik',
      'elektrikli-koltuk', 'dijital-gosterge', 'anahtarsiz-giris'
    ],
    excludes: [],
    optional: ['hud', 'panoramik-tavan', '360-kamera', 'koltuk-isitma', 'koltuk-havalandirma', 'kor-nokta', 'adaptif-hiz'],
    extras: ['M aerodinamik paket', 'M spor süspansiyon', '19 inç M jant']
  },
  {
    brand: 'BMW',
    model: 'X1',
    years: '2015-2022',
    bodyTypes: ['SUV'],
    name: 'Joy Plus / xLine',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'yagmur-sensoru', 'otomatik-far', 'tavan-rayi', 'hiz-sabitleyici'
    ],
    excludes: [],
    optional: ['led-far', 'geri-kamera', 'navigasyon', 'panoramik-tavan', 'koltuk-isitma', 'elektrikli-bagaj'],
    extras: []
  },

  // ==========================================================================
  // MERCEDES-BENZ
  // ==========================================================================
  {
    brand: 'Mercedes-Benz',
    model: 'A Serisi',
    years: '2012-2018',
    bodyTypes: ['Hatchback'],
    name: 'Style',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'manuel-klima', 'alasim-jant', 'bluetooth', 'deri-direksiyon',
      'park-sensoru', 'halojen-far', 'hiz-sabitleyici'
    ],
    excludes: ['led-far', 'geri-kamera', 'panoramik-tavan'],
    optional: ['navigasyon', 'otomatik-klima', 'koltuk-isitma', 'xenon'],
    extras: ['Kumaş/suni deri karışık döşeme']
  },
  {
    brand: 'Mercedes-Benz',
    model: 'A Serisi',
    years: '2012-2018',
    bodyTypes: ['Hatchback'],
    name: 'Urban',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'yagmur-sensoru', 'otomatik-far', 'ambiyans-isik', 'led-gunduz'
    ],
    excludes: [],
    optional: ['navigasyon', 'geri-kamera', 'panoramik-tavan', 'koltuk-isitma', 'xenon', 'yarim-deri-doseme'],
    extras: ['Krom iç detaylar', '17 inç jant']
  },
  {
    brand: 'Mercedes-Benz',
    model: 'A Serisi',
    years: '2012-2018',
    bodyTypes: ['Hatchback'],
    name: 'AMG',
    tier: 'spor',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'yagmur-sensoru', 'otomatik-far', 'ambiyans-isik', 'led-gunduz'
    ],
    excludes: [],
    optional: ['navigasyon', 'geri-kamera', 'panoramik-tavan', 'koltuk-isitma', 'xenon', 'hud'],
    extras: ['AMG gövde kiti', 'AMG spor süspansiyon (sert)', '18 inç AMG jant', 'Kırmızı dikişli spor koltuk']
  },
  {
    brand: 'Mercedes-Benz',
    model: 'A Serisi',
    years: '2018-2024',
    bodyTypes: ['Hatchback', 'Sedan'],
    name: 'Style / Progressive',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'alasim-jant', 'park-sensoru', 'led-far',
      'dokunmatik-ekran', 'apple-android', 'dijital-gosterge', 'ambiyans-isik',
      'acil-frenleme', 'lastik-basinc', 'deri-direksiyon'
    ],
    excludes: [],
    optional: ['geri-kamera', 'panoramik-tavan', 'kor-nokta', 'adaptif-hiz', 'koltuk-isitma', 'kablosuz-sarj'],
    extras: ['MBUX "Hey Mercedes" sesli asistan']
  },
  {
    brand: 'Mercedes-Benz',
    model: 'C Serisi',
    years: '2014-2021',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Comfort',
    tier: 'giriş',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'bluetooth',
      'deri-direksiyon', 'led-gunduz', 'hiz-sabitleyici', 'arka-klima-menfezi'
    ],
    excludes: ['led-far', 'geri-kamera', 'panoramik-tavan'],
    optional: ['navigasyon', 'koltuk-isitma', 'yarim-deri-doseme'],
    extras: ['Artico suni deri döşeme']
  },
  {
    brand: 'Mercedes-Benz',
    model: 'C Serisi',
    years: '2014-2021',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Avantgarde',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'on-park-sensoru',
      'deri-direksiyon', 'ambiyans-isik', 'yagmur-sensoru', 'otomatik-far', 'led-far',
      'elektrikli-katlanir-ayna', 'arka-klima-menfezi'
    ],
    excludes: [],
    optional: ['geri-kamera', 'navigasyon', 'panoramik-tavan', 'koltuk-isitma', 'elektrikli-koltuk', 'hud', 'deri-doseme'],
    extras: ['Ortadan yıldızlı ön ızgara', 'Krom dış çerçeveler']
  },
  {
    brand: 'Mercedes-Benz',
    model: 'C Serisi',
    years: '2014-2021',
    bodyTypes: ['Sedan'],
    name: 'Exclusive',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'on-park-sensoru',
      'deri-direksiyon', 'ambiyans-isik', 'yagmur-sensoru', 'otomatik-far', 'led-far',
      'elektrikli-koltuk', 'arka-klima-menfezi'
    ],
    excludes: [],
    optional: ['geri-kamera', 'navigasyon', 'panoramik-tavan', 'koltuk-isitma', 'hud', 'deri-doseme', 'kor-nokta'],
    extras: ['Kaputta ayakta yıldız amblem', 'Ahşap iç dekor']
  },
  {
    brand: 'Mercedes-Benz',
    model: 'C Serisi',
    years: '2014-2021',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'AMG',
    tier: 'spor',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'on-park-sensoru',
      'deri-direksiyon', 'ambiyans-isik', 'led-far', 'otomatik-far', 'yagmur-sensoru'
    ],
    excludes: [],
    optional: ['geri-kamera', 'navigasyon', 'panoramik-tavan', 'koltuk-isitma', 'hud', 'kor-nokta', 'adaptif-hiz'],
    extras: ['AMG gövde kiti', 'AMG spor süspansiyon', '18-19 inç AMG jant', 'Alcantara/deri spor koltuk']
  },
  {
    brand: 'Mercedes-Benz',
    model: 'E Serisi',
    years: '2016-2023',
    bodyTypes: ['Sedan'],
    name: 'Edition E',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'on-park-sensoru',
      'geri-kamera', 'led-far', 'navigasyon', 'ambiyans-isik', 'elektrikli-koltuk',
      'deri-direksiyon', 'arka-klima-menfezi', 'anahtarsiz-giris'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'hud', 'koltuk-isitma', 'kor-nokta', 'adaptif-hiz', 'dijital-gosterge'],
    extras: ['Artico/deri döşeme']
  },
  {
    brand: 'Mercedes-Benz',
    model: 'E Serisi',
    years: '2016-2023',
    bodyTypes: ['Sedan'],
    name: 'Exclusive / Avantgarde',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'alasim-jant', 'park-sensoru', 'on-park-sensoru',
      'geri-kamera', 'led-far', 'navigasyon', 'ambiyans-isik', 'elektrikli-koltuk',
      'dijital-gosterge', 'deri-doseme', 'koltuk-isitma', 'anahtarsiz-giris', 'arka-klima-menfezi'
    ],
    excludes: [],
    optional: ['matris-far', 'panoramik-tavan', 'hud', '360-kamera', 'koltuk-havalandirma', 'kor-nokta', 'adaptif-hiz'],
    extras: ['Multibeam LED far (opsiyon)', 'Burmester ses sistemi (opsiyon)']
  },
  {
    brand: 'Mercedes-Benz',
    model: 'CLA',
    years: '2013-2019',
    bodyTypes: ['Sedan'],
    name: 'Style / Urban',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'led-gunduz', 'yagmur-sensoru', 'otomatik-far', 'hiz-sabitleyici'
    ],
    excludes: [],
    optional: ['navigasyon', 'geri-kamera', 'panoramik-tavan', 'koltuk-isitma', 'xenon'],
    extras: ['Çerçevesiz kapı camları']
  },
  {
    brand: 'Mercedes-Benz',
    model: 'GLA',
    years: '2014-2020',
    bodyTypes: ['SUV'],
    name: 'Style / Urban',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'led-gunduz', 'yagmur-sensoru', 'otomatik-far', 'tavan-rayi'
    ],
    excludes: [],
    optional: ['navigasyon', 'geri-kamera', 'panoramik-tavan', 'koltuk-isitma', 'xenon', 'elektrikli-bagaj'],
    extras: []
  },

  // ==========================================================================
  // SKODA
  // ==========================================================================
  {
    brand: 'Skoda',
    model: 'Octavia',
    years: '2013-2020',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Active',
    tier: 'giriş',
    confidence: 'dogrulanmis',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'halojen-far', 'lastik-basinc'],
    excludes: ['navigasyon', 'geri-kamera', 'led-far', 'park-sensoru', 'alasim-jant', 'otomatik-klima'],
    optional: ['hiz-sabitleyici'],
    extras: ['Kumaş döşeme', 'Elektrikli ön camlar']
  },
  {
    brand: 'Skoda',
    model: 'Octavia',
    years: '2013-2020',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Ambition',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'alasim-jant', 'park-sensoru',
      'deri-direksiyon', 'hiz-sabitleyici', 'sis-far', 'lastik-basinc'
    ],
    excludes: ['geri-kamera', 'led-far', 'panoramik-tavan'],
    optional: ['navigasyon', 'koltuk-isitma', 'yagmur-sensoru', 'on-park-sensoru'],
    extras: ['Simply Clever çözümleri (şemsiye yuvası, bagaj ağı)']
  },
  {
    brand: 'Skoda',
    model: 'Octavia',
    years: '2013-2020',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Elegance / Style',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'alasim-jant', 'park-sensoru',
      'deri-direksiyon', 'hiz-sabitleyici', 'yagmur-sensoru', 'otomatik-far', 'led-gunduz',
      'elektrikli-katlanir-ayna', 'koltuk-isitma'
    ],
    excludes: [],
    optional: ['geri-kamera', 'navigasyon', 'led-far', 'panoramik-tavan', 'kor-nokta', 'deri-doseme'],
    extras: ['Krom dış detaylar']
  },
  {
    brand: 'Skoda',
    model: 'Octavia',
    years: '2013-2020',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Premium',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'navigasyon', 'alasim-jant',
      'park-sensoru', 'on-park-sensoru', 'geri-kamera', 'led-far', 'deri-direksiyon',
      'yagmur-sensoru', 'otomatik-far', 'koltuk-isitma', 'anahtarsiz-giris', 'elektrikli-katlanir-ayna'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'kor-nokta', 'adaptif-hiz', 'deri-doseme', 'elektrikli-koltuk'],
    extras: ['Canton ses sistemi (opsiyon)']
  },
  {
    brand: 'Skoda',
    model: 'Octavia',
    years: '2020-2024',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Premium',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'navigasyon',
      'alasim-jant', 'park-sensoru', 'geri-kamera', 'led-far', 'dijital-gosterge',
      'serit-takip', 'acil-frenleme', 'ambiyans-isik', 'anahtarsiz-giris', 'lastik-basinc'
    ],
    excludes: [],
    optional: ['matris-far', 'panoramik-tavan', 'kor-nokta', 'adaptif-hiz', 'koltuk-isitma', 'kablosuz-sarj'],
    extras: ['Virtual Cockpit']
  },
  {
    brand: 'Skoda',
    model: 'Superb',
    years: '2015-2023',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Ambition',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'alasim-jant', 'park-sensoru',
      'deri-direksiyon', 'hiz-sabitleyici', 'arka-klima-menfezi', 'lastik-basinc'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['geri-kamera', 'navigasyon', 'koltuk-isitma', 'led-far'],
    extras: ['Sınıfının en geniş arka diz mesafesi']
  },
  {
    brand: 'Skoda',
    model: 'Superb',
    years: '2015-2023',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Premium / L&K',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'navigasyon', 'alasim-jant',
      'park-sensoru', 'on-park-sensoru', 'geri-kamera', 'led-far', 'koltuk-isitma',
      'elektrikli-koltuk', 'anahtarsiz-giris', 'ambiyans-isik', 'arka-klima-menfezi', 'elektrikli-bagaj'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'kor-nokta', 'adaptif-hiz', 'deri-doseme', '360-kamera', 'koltuk-havalandirma'],
    extras: ['L&K paketinde deri döşeme standart']
  },
  {
    brand: 'Skoda',
    model: 'Fabia',
    years: '2015-2021',
    bodyTypes: ['Hatchback'],
    name: 'Ambition / Style',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'manuel-klima', 'dokunmatik-ekran', 'alasim-jant', 'deri-direksiyon',
      'hiz-sabitleyici', 'bluetooth', 'lastik-basinc'
    ],
    excludes: ['geri-kamera', 'led-far', 'panoramik-tavan'],
    optional: ['park-sensoru', 'otomatik-klima', 'sis-far'],
    extras: []
  },

  // ==========================================================================
  // SEAT
  // ==========================================================================
  {
    brand: 'Seat',
    model: 'Leon',
    years: '2013-2020',
    bodyTypes: ['Hatchback', 'Station Wagon'],
    name: 'Reference',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'halojen-far'],
    excludes: ['navigasyon', 'geri-kamera', 'led-far', 'park-sensoru', 'alasim-jant'],
    optional: ['hiz-sabitleyici'],
    extras: ['Kumaş döşeme']
  },
  {
    brand: 'Seat',
    model: 'Leon',
    years: '2013-2020',
    bodyTypes: ['Hatchback', 'Station Wagon'],
    name: 'Style',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'alasim-jant', 'park-sensoru',
      'deri-direksiyon', 'hiz-sabitleyici', 'sis-far', 'led-gunduz'
    ],
    excludes: ['geri-kamera', 'panoramik-tavan'],
    optional: ['navigasyon', 'koltuk-isitma', 'yagmur-sensoru', 'led-far'],
    extras: []
  },
  {
    brand: 'Seat',
    model: 'Leon',
    years: '2013-2020',
    bodyTypes: ['Hatchback'],
    name: 'FR',
    tier: 'spor',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'alasim-jant', 'park-sensoru',
      'deri-direksiyon', 'led-far', 'ambiyans-isik', 'yagmur-sensoru', 'otomatik-far'
    ],
    excludes: [],
    optional: ['navigasyon', 'geri-kamera', 'koltuk-isitma', 'panoramik-tavan', 'dijital-gosterge'],
    extras: ['FR gövde kiti', 'Spor süspansiyon', 'Sürüş modu seçici', '17-18 inç jant', 'Spor koltuk']
  },
  {
    brand: 'Seat',
    model: 'Ibiza',
    years: '2017-2023',
    bodyTypes: ['Hatchback'],
    name: 'Style / FR',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'manuel-klima', 'dokunmatik-ekran', 'apple-android', 'alasim-jant',
      'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz', 'lastik-basinc'
    ],
    excludes: ['geri-kamera', 'panoramik-tavan'],
    optional: ['park-sensoru', 'otomatik-klima', 'led-far', 'kablosuz-sarj'],
    extras: ['FR paketinde spor süspansiyon ve gövde kiti']
  },

  // ==========================================================================
  // TOYOTA
  // ==========================================================================
  {
    brand: 'Toyota',
    model: 'Corolla',
    years: '2013-2018',
    bodyTypes: ['Sedan'],
    name: 'Life',
    tier: 'giriş',
    confidence: 'dogrulanmis',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'halojen-far'],
    excludes: ['navigasyon', 'geri-kamera', 'led-far', 'park-sensoru', 'alasim-jant'],
    optional: [],
    extras: ['Kumaş döşeme', 'Elektrikli ön camlar']
  },
  {
    brand: 'Toyota',
    model: 'Corolla',
    years: '2013-2018',
    bodyTypes: ['Sedan'],
    name: 'Active / Advance',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'geri-kamera', 'alasim-jant',
      'deri-direksiyon', 'hiz-sabitleyici', 'bluetooth', 'led-gunduz'
    ],
    excludes: ['led-far', 'panoramik-tavan'],
    optional: ['park-sensoru', 'navigasyon', 'sis-far'],
    extras: []
  },
  {
    brand: 'Toyota',
    model: 'Corolla',
    years: '2013-2018',
    bodyTypes: ['Sedan'],
    name: 'Premium',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'geri-kamera', 'park-sensoru',
      'alasim-jant', 'deri-direksiyon', 'navigasyon', 'anahtarsiz-giris', 'otomatik-far',
      'yagmur-sensoru', 'elektrikli-katlanir-ayna'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['deri-doseme', 'koltuk-isitma', 'xenon'],
    extras: []
  },
  {
    brand: 'Toyota',
    model: 'Corolla',
    years: '2019-2024',
    bodyTypes: ['Sedan', 'Hatchback'],
    name: 'Dream',
    tier: 'giriş',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'manuel-klima', 'dokunmatik-ekran', 'geri-kamera', 'led-far',
      'serit-takip', 'acil-frenleme', 'adaptif-hiz', 'lastik-basinc', 'celik-jant'
    ],
    excludes: ['navigasyon', 'alasim-jant', 'panoramik-tavan'],
    optional: ['park-sensoru', 'apple-android'],
    extras: ['Toyota Safety Sense paketi standart']
  },
  {
    brand: 'Toyota',
    model: 'Corolla',
    years: '2019-2024',
    bodyTypes: ['Sedan', 'Hatchback'],
    name: 'Vision',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'led-far', 'alasim-jant', 'serit-takip', 'acil-frenleme', 'adaptif-hiz',
      'deri-direksiyon', 'otomatik-far', 'yagmur-sensoru'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['koltuk-isitma', 'kor-nokta', 'anahtarsiz-giris'],
    extras: ['Toyota Safety Sense paketi']
  },
  {
    brand: 'Toyota',
    model: 'Corolla',
    years: '2019-2024',
    bodyTypes: ['Sedan', 'Hatchback'],
    name: 'Passion / Flame',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'on-park-sensoru', 'led-far', 'alasim-jant', 'koltuk-isitma',
      'adaptif-hiz', 'serit-takip', 'acil-frenleme', 'kor-nokta', 'anahtarsiz-giris',
      'elektrikli-katlanir-ayna', 'otomatik-far'
    ],
    excludes: [],
    optional: ['deri-doseme', 'hud', 'kablosuz-sarj', 'panoramik-tavan', 'dijital-gosterge'],
    extras: ['Flame paketinde çift renk gövde seçeneği']
  },
  {
    brand: 'Toyota',
    model: 'Corolla Hybrid',
    years: '2019-2024',
    bodyTypes: ['Sedan', 'Hatchback'],
    name: 'Vision',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'led-far', 'alasim-jant', 'serit-takip', 'acil-frenleme', 'adaptif-hiz',
      'deri-direksiyon', 'otomatik-far'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['koltuk-isitma', 'kor-nokta', 'anahtarsiz-giris'],
    extras: ['Hibrit sistem göstergesi', 'EV modu tuşu']
  },
  {
    brand: 'Toyota',
    model: 'Corolla Hybrid',
    years: '2019-2024',
    bodyTypes: ['Sedan', 'Hatchback'],
    name: 'Passion / Flame X',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'on-park-sensoru', 'led-far', 'alasim-jant', 'koltuk-isitma',
      'adaptif-hiz', 'serit-takip', 'acil-frenleme', 'kor-nokta', 'anahtarsiz-giris', 'kablosuz-sarj'
    ],
    excludes: [],
    optional: ['deri-doseme', 'hud', 'panoramik-tavan', 'dijital-gosterge', '360-kamera'],
    extras: ['JBL ses sistemi (bazı araçlarda)']
  },
  {
    brand: 'Toyota',
    model: 'Yaris',
    years: '2014-2020',
    bodyTypes: ['Hatchback'],
    name: 'Cool',
    tier: 'giriş',
    confidence: 'dogrulanmis',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'halojen-far'],
    excludes: ['navigasyon', 'geri-kamera', 'led-far', 'alasim-jant', 'park-sensoru'],
    optional: [],
    extras: ['Kumaş döşeme']
  },
  {
    brand: 'Toyota',
    model: 'Yaris',
    years: '2014-2020',
    bodyTypes: ['Hatchback'],
    name: 'Fun / Flame',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'manuel-klima', 'dokunmatik-ekran', 'geri-kamera', 'alasim-jant',
      'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz'
    ],
    excludes: ['panoramik-tavan', 'led-far'],
    optional: ['otomatik-klima', 'park-sensoru', 'navigasyon', 'sis-far'],
    extras: []
  },
  {
    brand: 'Toyota',
    model: 'C-HR',
    years: '2017-2023',
    bodyTypes: ['SUV'],
    name: 'Dynamic',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'geri-kamera', 'park-sensoru',
      'led-far', 'alasim-jant', 'serit-takip', 'acil-frenleme', 'adaptif-hiz', 'deri-direksiyon'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['kor-nokta', 'koltuk-isitma', 'apple-android', 'anahtarsiz-giris'],
    extras: ['Toyota Safety Sense paketi']
  },
  {
    brand: 'Toyota',
    model: 'C-HR',
    years: '2017-2023',
    bodyTypes: ['SUV'],
    name: 'Passion / Flame',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'led-far', 'alasim-jant', 'koltuk-isitma', 'kor-nokta', 'adaptif-hiz',
      'serit-takip', 'acil-frenleme', 'anahtarsiz-giris', 'elektrikli-katlanir-ayna'
    ],
    excludes: [],
    optional: ['deri-doseme', 'kablosuz-sarj', 'hud', '360-kamera'],
    extras: ['JBL ses sistemi (opsiyon)']
  },
  {
    brand: 'Toyota',
    model: 'RAV4',
    years: '2019-2024',
    bodyTypes: ['SUV'],
    name: 'Passion / Flame',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'on-park-sensoru', 'led-far', 'alasim-jant', 'koltuk-isitma',
      'adaptif-hiz', 'serit-takip', 'acil-frenleme', 'kor-nokta', 'anahtarsiz-giris',
      'elektrikli-bagaj', 'tavan-rayi', 'arka-klima-menfezi'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'deri-doseme', 'hud', '360-kamera', 'kablosuz-sarj'],
    extras: ['Hibrit sürüş modu göstergeleri']
  },
  {
    brand: 'Toyota',
    model: 'Auris',
    years: '2013-2018',
    bodyTypes: ['Hatchback'],
    name: 'Active / Advance',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'geri-kamera', 'alasim-jant',
      'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz', 'bluetooth'
    ],
    excludes: ['led-far', 'panoramik-tavan'],
    optional: ['park-sensoru', 'navigasyon', 'koltuk-isitma'],
    extras: []
  },

  // ==========================================================================
  // HONDA
  // ==========================================================================
  {
    brand: 'Honda',
    model: 'Civic',
    years: '2016-2021',
    bodyTypes: ['Sedan'],
    name: 'Eco Elegance',
    tier: 'giriş',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'geri-kamera', 'bluetooth',
      'alasim-jant', 'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz', 'lastik-basinc'
    ],
    excludes: ['navigasyon', 'led-far', 'panoramik-tavan', 'koltuk-isitma'],
    optional: ['park-sensoru', 'sis-far'],
    extras: ['Kumaş döşeme']
  },
  {
    brand: 'Honda',
    model: 'Civic',
    years: '2016-2021',
    bodyTypes: ['Sedan'],
    name: 'Elegance',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'alasim-jant', 'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz',
      'otomatik-far', 'yagmur-sensoru', 'elektrikli-katlanir-ayna'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['led-far', 'koltuk-isitma', 'anahtarsiz-giris', 'kor-nokta'],
    extras: []
  },
  {
    brand: 'Honda',
    model: 'Civic',
    years: '2016-2021',
    bodyTypes: ['Sedan'],
    name: 'Executive / Executive+',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'navigasyon',
      'geri-kamera', 'park-sensoru', 'on-park-sensoru', 'led-far', 'alasim-jant',
      'koltuk-isitma', 'deri-doseme', 'anahtarsiz-giris', 'elektrikli-koltuk',
      'kor-nokta', 'adaptif-hiz', 'serit-takip', 'acil-frenleme', 'sunroof'
    ],
    excludes: [],
    optional: ['hud', 'elektrikli-bagaj'],
    extras: ['Honda SENSING güvenlik paketi', 'LaneWatch yan kamera']
  },
  {
    brand: 'Honda',
    model: 'Civic',
    years: '2012-2016',
    bodyTypes: ['Sedan'],
    name: 'Elegance / Premium',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'bluetooth', 'alasim-jant', 'deri-direksiyon',
      'hiz-sabitleyici', 'park-sensoru', 'halojen-far'
    ],
    excludes: ['led-far', 'panoramik-tavan', 'apple-android'],
    optional: ['geri-kamera', 'navigasyon', 'sunroof', 'deri-doseme', 'koltuk-isitma'],
    extras: ['İki katlı dijital gösterge']
  },
  {
    brand: 'Honda',
    model: 'CR-V',
    years: '2018-2023',
    bodyTypes: ['SUV'],
    name: 'Executive / Executive+',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'navigasyon',
      'geri-kamera', 'park-sensoru', 'on-park-sensoru', 'led-far', 'alasim-jant',
      'koltuk-isitma', 'deri-doseme', 'anahtarsiz-giris', 'elektrikli-koltuk', 'elektrikli-bagaj',
      'kor-nokta', 'adaptif-hiz', 'serit-takip', 'acil-frenleme', 'tavan-rayi', 'arka-klima-menfezi'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'sunroof', 'hud', 'koltuk-hafiza'],
    extras: ['Honda SENSING güvenlik paketi']
  },

  // ==========================================================================
  // RENAULT
  // ==========================================================================
  {
    brand: 'Renault',
    model: 'Megane',
    years: '2016-2023',
    bodyTypes: ['Sedan', 'Hatchback'],
    name: 'Joy',
    tier: 'giriş',
    confidence: 'dogrulanmis',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'halojen-far', 'lastik-basinc'],
    excludes: ['navigasyon', 'geri-kamera', 'led-far', 'park-sensoru', 'alasim-jant'],
    optional: ['hiz-sabitleyici'],
    extras: ['Kumaş döşeme', 'Elektrikli ön camlar']
  },
  {
    brand: 'Renault',
    model: 'Megane',
    years: '2016-2023',
    bodyTypes: ['Sedan', 'Hatchback'],
    name: 'Touch',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'geri-kamera', 'park-sensoru',
      'alasim-jant', 'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz', 'anahtarsiz-giris'
    ],
    excludes: ['matris-far', 'panoramik-tavan'],
    optional: ['navigasyon', 'koltuk-isitma', 'on-park-sensoru', 'led-far'],
    extras: ['Renault kart ile anahtarsız çalıştırma']
  },
  {
    brand: 'Renault',
    model: 'Megane',
    years: '2016-2023',
    bodyTypes: ['Sedan', 'Hatchback'],
    name: 'Icon',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'navigasyon', 'geri-kamera',
      'park-sensoru', 'on-park-sensoru', 'led-far', 'alasim-jant', 'kor-nokta',
      'anahtarsiz-giris', 'ambiyans-isik', 'otomatik-far', 'yagmur-sensoru', 'elektrikli-katlanir-ayna'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['koltuk-isitma', 'deri-doseme', 'dijital-gosterge', 'adaptif-hiz'],
    extras: ['Renk seçilebilir ambiyans aydınlatma', 'Bose ses sistemi (bazı araçlarda)']
  },
  {
    brand: 'Renault',
    model: 'Megane',
    years: '2010-2016',
    bodyTypes: ['Sedan', 'Hatchback'],
    name: 'Expression',
    tier: 'giriş',
    confidence: 'dogrulanmis',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'halojen-far'],
    excludes: ['navigasyon', 'geri-kamera', 'alasim-jant', 'park-sensoru'],
    optional: ['hiz-sabitleyici'],
    extras: ['Kumaş döşeme']
  },
  {
    brand: 'Renault',
    model: 'Megane',
    years: '2010-2016',
    bodyTypes: ['Sedan', 'Hatchback'],
    name: 'Privilege / Icon',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'hiz-sabitleyici', 'anahtarsiz-giris', 'otomatik-far', 'yagmur-sensoru', 'sis-far'
    ],
    excludes: ['led-far', 'panoramik-tavan'],
    optional: ['navigasyon', 'geri-kamera', 'deri-doseme', 'koltuk-isitma'],
    extras: ['Renault kart']
  },
  {
    brand: 'Renault',
    model: 'Clio',
    years: '2019-2024',
    bodyTypes: ['Hatchback'],
    name: 'Joy',
    tier: 'giriş',
    confidence: 'dogrulanmis',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'led-far', 'lastik-basinc', 'acil-frenleme'],
    excludes: ['geri-kamera', 'navigasyon', 'alasim-jant', 'park-sensoru'],
    optional: ['hiz-sabitleyici', 'dokunmatik-ekran'],
    extras: ['LED far tüm donanımlarda standart']
  },
  {
    brand: 'Renault',
    model: 'Clio',
    years: '2019-2024',
    bodyTypes: ['Hatchback'],
    name: 'Touch',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'alasim-jant', 'led-far', 'deri-direksiyon', 'hiz-sabitleyici', 'acil-frenleme'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['navigasyon', 'kor-nokta', 'anahtarsiz-giris', 'koltuk-isitma'],
    extras: []
  },
  {
    brand: 'Renault',
    model: 'Clio',
    years: '2019-2024',
    bodyTypes: ['Hatchback'],
    name: 'Icon',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'apple-android', 'navigasyon',
      'geri-kamera', 'park-sensoru', 'on-park-sensoru', 'alasim-jant', 'led-far',
      'anahtarsiz-giris', 'kor-nokta', 'ambiyans-isik', 'dijital-gosterge', 'otomatik-far'
    ],
    excludes: [],
    optional: ['koltuk-isitma', 'yarim-deri-doseme', 'adaptif-hiz', 'kablosuz-sarj'],
    extras: ['Bose ses sistemi (Icon Bose)']
  },
  {
    brand: 'Renault',
    model: 'Clio',
    years: '2012-2019',
    bodyTypes: ['Hatchback'],
    name: 'Touch / Icon',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'alasim-jant', 'deri-direksiyon',
      'hiz-sabitleyici', 'led-gunduz', 'anahtarsiz-giris'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['geri-kamera', 'navigasyon', 'park-sensoru', 'led-far'],
    extras: ['R-Link multimedya (bazı araçlarda)']
  },
  {
    brand: 'Renault',
    model: 'Fluence',
    years: '2010-2016',
    bodyTypes: ['Sedan'],
    name: 'Expression',
    tier: 'giriş',
    confidence: 'dogrulanmis',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'halojen-far'],
    excludes: ['navigasyon', 'geri-kamera', 'alasim-jant', 'park-sensoru'],
    optional: ['hiz-sabitleyici'],
    extras: ['Kumaş döşeme', 'Geniş bagaj hacmi']
  },
  {
    brand: 'Renault',
    model: 'Fluence',
    years: '2010-2016',
    bodyTypes: ['Sedan'],
    name: 'Icon / Privilege',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'hiz-sabitleyici', 'anahtarsiz-giris', 'otomatik-far', 'yagmur-sensoru', 'sis-far'
    ],
    excludes: ['led-far', 'panoramik-tavan'],
    optional: ['navigasyon', 'geri-kamera', 'deri-doseme', 'koltuk-isitma'],
    extras: ['Renault kart']
  },
  {
    brand: 'Renault',
    model: 'Captur',
    years: '2013-2019',
    bodyTypes: ['SUV'],
    name: 'Touch / Icon',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'geri-kamera', 'park-sensoru',
      'alasim-jant', 'deri-direksiyon', 'hiz-sabitleyici', 'anahtarsiz-giris', 'led-gunduz'
    ],
    excludes: ['panoramik-tavan', 'led-far'],
    optional: ['navigasyon', 'koltuk-isitma', 'kor-nokta'],
    extras: ['Çift renk gövde seçeneği', 'Çıkarılabilir koltuk kılıfı']
  },
  {
    brand: 'Renault',
    model: 'Symbol',
    years: '2013-2021',
    bodyTypes: ['Sedan'],
    name: 'Joy / Touch',
    tier: 'giriş',
    confidence: 'dogrulanmis',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'halojen-far'],
    excludes: ['navigasyon', 'led-far', 'alasim-jant'],
    optional: ['geri-kamera', 'dokunmatik-ekran', 'park-sensoru', 'alasim-jant'],
    extras: ['Kumaş döşeme', 'Düşük işletme maliyeti']
  },

  // ==========================================================================
  // FORD
  // ==========================================================================
  {
    brand: 'Ford',
    model: 'Focus',
    years: '2018-2024',
    bodyTypes: ['Hatchback', 'Sedan', 'Station Wagon'],
    name: 'Trend X',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'dokunmatik-ekran', 'apple-android', 'park-sensoru', 'manuel-klima',
      'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz', 'lastik-basinc'
    ],
    excludes: ['geri-kamera', 'led-far', 'panoramik-tavan'],
    optional: ['alasim-jant', 'sis-far', 'otomatik-klima'],
    extras: ['SYNC 3 multimedya']
  },
  {
    brand: 'Ford',
    model: 'Focus',
    years: '2018-2024',
    bodyTypes: ['Hatchback', 'Sedan', 'Station Wagon'],
    name: 'Titanium',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'led-far', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'cift-bolge-klima', 'alasim-jant', 'deri-direksiyon', 'otomatik-far',
      'yagmur-sensoru', 'anahtarsiz-giris', 'serit-takip'
    ],
    excludes: [],
    optional: ['kor-nokta', 'adaptif-hiz', 'panoramik-tavan', 'koltuk-isitma', 'on-park-sensoru', 'dijital-gosterge'],
    extras: ['SYNC 3 navigasyon (bazı araçlarda)']
  },
  {
    brand: 'Ford',
    model: 'Focus',
    years: '2018-2024',
    bodyTypes: ['Hatchback'],
    name: 'ST-Line',
    tier: 'spor',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'led-far', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'cift-bolge-klima', 'alasim-jant', 'deri-direksiyon', 'otomatik-far', 'serit-takip'
    ],
    excludes: [],
    optional: ['kor-nokta', 'adaptif-hiz', 'panoramik-tavan', 'koltuk-isitma', 'dijital-gosterge'],
    extras: ['ST-Line gövde kiti', 'Spor süspansiyon (10 mm alçak)', '17-18 inç jant', 'Kırmızı dikişli spor koltuk']
  },
  {
    brand: 'Ford',
    model: 'Focus',
    years: '2015-2018',
    bodyTypes: ['Hatchback', 'Sedan'],
    name: 'Trend X / Titanium',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'park-sensoru', 'alasim-jant',
      'deri-direksiyon', 'hiz-sabitleyici', 'sis-far', 'bluetooth'
    ],
    excludes: ['led-far', 'panoramik-tavan'],
    optional: ['geri-kamera', 'navigasyon', 'koltuk-isitma', 'anahtarsiz-giris'],
    extras: ['SYNC 2 multimedya']
  },
  {
    brand: 'Ford',
    model: 'Fiesta',
    years: '2017-2023',
    bodyTypes: ['Hatchback'],
    name: 'Trend / Titanium',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'manuel-klima', 'dokunmatik-ekran', 'apple-android', 'alasim-jant',
      'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz', 'lastik-basinc'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['geri-kamera', 'park-sensoru', 'otomatik-klima', 'led-far', 'koltuk-isitma'],
    extras: ['SYNC 3 multimedya']
  },
  {
    brand: 'Ford',
    model: 'Kuga',
    years: '2017-2023',
    bodyTypes: ['SUV'],
    name: 'Titanium',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'alasim-jant', 'led-far', 'deri-direksiyon', 'otomatik-far',
      'yagmur-sensoru', 'anahtarsiz-giris', 'tavan-rayi', 'elektrikli-katlanir-ayna'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'elektrikli-bagaj', 'kor-nokta', 'adaptif-hiz', 'koltuk-isitma', 'deri-doseme'],
    extras: []
  },
  {
    brand: 'Ford',
    model: 'Mondeo',
    years: '2015-2022',
    bodyTypes: ['Sedan', 'Station Wagon'],
    name: 'Titanium',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'geri-kamera', 'park-sensoru',
      'on-park-sensoru', 'alasim-jant', 'deri-direksiyon', 'otomatik-far', 'yagmur-sensoru',
      'anahtarsiz-giris', 'arka-klima-menfezi', 'elektrikli-katlanir-ayna'
    ],
    excludes: [],
    optional: ['led-far', 'panoramik-tavan', 'kor-nokta', 'adaptif-hiz', 'deri-doseme', 'elektrikli-koltuk'],
    extras: ['Arka koltuk hava yastıklı emniyet kemeri (opsiyon)']
  },

  // ==========================================================================
  // PEUGEOT
  // ==========================================================================
  {
    brand: 'Peugeot',
    model: '308',
    years: '2013-2021',
    bodyTypes: ['Hatchback', 'Station Wagon'],
    name: 'Access',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'halojen-far'],
    excludes: ['navigasyon', 'geri-kamera', 'led-far', 'alasim-jant', 'park-sensoru'],
    optional: ['hiz-sabitleyici'],
    extras: ['i-Cockpit küçük direksiyon', 'Kumaş döşeme']
  },
  {
    brand: 'Peugeot',
    model: '308',
    years: '2013-2021',
    bodyTypes: ['Hatchback', 'Station Wagon'],
    name: 'Active',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'alasim-jant', 'park-sensoru',
      'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz', 'bluetooth'
    ],
    excludes: ['panoramik-tavan', 'led-far'],
    optional: ['geri-kamera', 'navigasyon', 'yagmur-sensoru', 'otomatik-far'],
    extras: ['i-Cockpit yüksek gösterge']
  },
  {
    brand: 'Peugeot',
    model: '308',
    years: '2013-2021',
    bodyTypes: ['Hatchback', 'Station Wagon'],
    name: 'Allure / GT Line',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'navigasyon', 'geri-kamera',
      'park-sensoru', 'on-park-sensoru', 'alasim-jant', 'led-far', 'deri-direksiyon',
      'otomatik-far', 'yagmur-sensoru', 'ambiyans-isik', 'elektrikli-katlanir-ayna'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'kor-nokta', 'adaptif-hiz', 'koltuk-isitma', 'yarim-deri-doseme'],
    extras: ['GT Line paketinde gövde kiti ve spor koltuk', 'Panoramik cam tavan (opsiyon)']
  },
  {
    brand: 'Peugeot',
    model: '3008',
    years: '2017-2023',
    bodyTypes: ['SUV'],
    name: 'Active',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'alasim-jant',
      'park-sensoru', 'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz', 'dijital-gosterge',
      'tavan-rayi', 'lastik-basinc'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['geri-kamera', 'navigasyon', 'led-far', 'koltuk-isitma'],
    extras: ['i-Cockpit dijital gösterge']
  },
  {
    brand: 'Peugeot',
    model: '3008',
    years: '2017-2023',
    bodyTypes: ['SUV'],
    name: 'Allure / GT Line',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'navigasyon',
      'geri-kamera', 'park-sensoru', 'on-park-sensoru', 'alasim-jant', 'led-far',
      'dijital-gosterge', 'ambiyans-isik', 'anahtarsiz-giris', 'tavan-rayi',
      'elektrikli-katlanir-ayna', 'otomatik-far', 'yagmur-sensoru'
    ],
    excludes: [],
    optional: ['panoramik-tavan', '360-kamera', 'elektrikli-bagaj', 'kor-nokta', 'adaptif-hiz', 'koltuk-isitma'],
    extras: ['Focal ses sistemi (opsiyon)', 'Masaj fonksiyonlu koltuk (opsiyon)']
  },
  {
    brand: 'Peugeot',
    model: '208',
    years: '2019-2024',
    bodyTypes: ['Hatchback'],
    name: 'Active / Allure',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'apple-android', 'alasim-jant',
      'park-sensoru', 'led-far', 'deri-direksiyon', 'hiz-sabitleyici', 'lastik-basinc', 'acil-frenleme'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['geri-kamera', 'navigasyon', 'dijital-gosterge', 'kablosuz-sarj', 'kor-nokta'],
    extras: ['3D i-Cockpit (GT donanımında)']
  },

  // ==========================================================================
  // OPEL
  // ==========================================================================
  {
    brand: 'Opel',
    model: 'Astra',
    years: '2015-2021',
    bodyTypes: ['Hatchback', 'Station Wagon'],
    name: 'Essentia',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'halojen-far', 'lastik-basinc'],
    excludes: ['navigasyon', 'geri-kamera', 'led-far', 'alasim-jant', 'park-sensoru'],
    optional: ['hiz-sabitleyici'],
    extras: ['Kumaş döşeme']
  },
  {
    brand: 'Opel',
    model: 'Astra',
    years: '2015-2021',
    bodyTypes: ['Hatchback', 'Station Wagon'],
    name: 'Enjoy / Design',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'apple-android', 'alasim-jant',
      'park-sensoru', 'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz'
    ],
    excludes: ['panoramik-tavan', 'led-far'],
    optional: ['geri-kamera', 'navigasyon', 'koltuk-isitma', 'on-park-sensoru'],
    extras: ['IntelliLink multimedya', 'OnStar (bazı araçlarda, servis kapandı)']
  },
  {
    brand: 'Opel',
    model: 'Astra',
    years: '2015-2021',
    bodyTypes: ['Hatchback', 'Station Wagon'],
    name: 'Excellence / Dynamic',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'on-park-sensoru', 'alasim-jant', 'led-far', 'deri-direksiyon',
      'koltuk-isitma', 'direksiyon-isitma', 'otomatik-far', 'yagmur-sensoru', 'elektrikli-katlanir-ayna'
    ],
    excludes: [],
    optional: ['matris-far', 'navigasyon', 'kor-nokta', 'adaptif-hiz', 'deri-doseme', 'panoramik-tavan'],
    extras: ['IntelliLux LED matris far (opsiyon)', 'AGR sertifikalı ergonomik koltuk (opsiyon)']
  },
  {
    brand: 'Opel',
    model: 'Corsa',
    years: '2014-2019',
    bodyTypes: ['Hatchback'],
    name: 'Enjoy / Design',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'manuel-klima', 'dokunmatik-ekran', 'apple-android', 'alasim-jant',
      'deri-direksiyon', 'hiz-sabitleyici', 'bluetooth'
    ],
    excludes: ['led-far', 'panoramik-tavan', 'geri-kamera'],
    optional: ['park-sensoru', 'otomatik-klima', 'koltuk-isitma', 'direksiyon-isitma'],
    extras: ['IntelliLink multimedya']
  },
  {
    brand: 'Opel',
    model: 'Corsa',
    years: '2019-2024',
    bodyTypes: ['Hatchback'],
    name: 'Edition / Elegance',
    tier: 'orta',
    confidence: 'kismi',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'apple-android', 'alasim-jant',
      'park-sensoru', 'led-far', 'deri-direksiyon', 'hiz-sabitleyici', 'lastik-basinc', 'acil-frenleme'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['geri-kamera', 'navigasyon', 'koltuk-isitma', 'kor-nokta', 'matris-far'],
    extras: []
  },

  // ==========================================================================
  // HYUNDAI
  // ==========================================================================
  {
    brand: 'Hyundai',
    model: 'i20',
    years: '2020-2024',
    bodyTypes: ['Hatchback'],
    name: 'Jump',
    tier: 'giriş',
    confidence: 'dogrulanmis',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'halojen-far', 'lastik-basinc'],
    excludes: ['geri-kamera', 'navigasyon', 'led-far', 'alasim-jant', 'park-sensoru'],
    optional: ['dokunmatik-ekran', 'hiz-sabitleyici'],
    extras: ['Kumaş döşeme']
  },
  {
    brand: 'Hyundai',
    model: 'i20',
    years: '2020-2024',
    bodyTypes: ['Hatchback'],
    name: 'Style',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'manuel-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'alasim-jant', 'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz'
    ],
    excludes: ['panoramik-tavan', 'led-far'],
    optional: ['otomatik-klima', 'kor-nokta', 'koltuk-isitma'],
    extras: []
  },
  {
    brand: 'Hyundai',
    model: 'i20',
    years: '2020-2024',
    bodyTypes: ['Hatchback'],
    name: 'Elite',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'alasim-jant', 'led-far', 'deri-direksiyon', 'anahtarsiz-giris',
      'koltuk-isitma', 'direksiyon-isitma', 'otomatik-far', 'dijital-gosterge'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['kor-nokta', 'adaptif-hiz', 'navigasyon', 'kablosuz-sarj', 'sunroof'],
    extras: ['Bose ses sistemi (bazı araçlarda)']
  },
  {
    brand: 'Hyundai',
    model: 'i20',
    years: '2014-2020',
    bodyTypes: ['Hatchback'],
    name: 'Style / Elite',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'alasim-jant', 'deri-direksiyon', 'hiz-sabitleyici',
      'bluetooth', 'park-sensoru', 'sis-far'
    ],
    excludes: ['led-far', 'panoramik-tavan'],
    optional: ['geri-kamera', 'dokunmatik-ekran', 'koltuk-isitma', 'sunroof'],
    extras: []
  },
  {
    brand: 'Hyundai',
    model: 'Tucson',
    years: '2015-2020',
    bodyTypes: ['SUV'],
    name: 'Style',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'geri-kamera', 'park-sensoru',
      'alasim-jant', 'deri-direksiyon', 'hiz-sabitleyici', 'tavan-rayi', 'led-gunduz'
    ],
    excludes: ['panoramik-tavan', 'led-far'],
    optional: ['navigasyon', 'koltuk-isitma', 'kor-nokta', 'anahtarsiz-giris'],
    extras: []
  },
  {
    brand: 'Hyundai',
    model: 'Tucson',
    years: '2015-2020',
    bodyTypes: ['SUV'],
    name: 'Elite / Elite Plus',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'navigasyon', 'geri-kamera',
      'park-sensoru', 'on-park-sensoru', 'alasim-jant', 'led-far', 'koltuk-isitma',
      'direksiyon-isitma', 'anahtarsiz-giris', 'elektrikli-koltuk', 'tavan-rayi',
      'kor-nokta', 'elektrikli-katlanir-ayna', 'arka-klima-menfezi'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'deri-doseme', 'adaptif-hiz', 'elektrikli-bagaj', 'koltuk-havalandirma'],
    extras: []
  },
  {
    brand: 'Hyundai',
    model: 'Tucson',
    years: '2021-2024',
    bodyTypes: ['SUV'],
    name: 'Elite / Prime',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'on-park-sensoru', 'alasim-jant', 'led-far', 'dijital-gosterge',
      'koltuk-isitma', 'direksiyon-isitma', 'anahtarsiz-giris', 'kor-nokta', 'adaptif-hiz',
      'serit-takip', 'acil-frenleme', 'tavan-rayi', 'arka-klima-menfezi'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'deri-doseme', '360-kamera', 'elektrikli-bagaj', 'koltuk-havalandirma', 'kablosuz-sarj'],
    extras: ['Krell ses sistemi (bazı araçlarda)']
  },
  {
    brand: 'Hyundai',
    model: 'i10',
    years: '2020-2024',
    bodyTypes: ['Hatchback'],
    name: 'Style / Elite',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'manuel-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'alasim-jant', 'deri-direksiyon', 'hiz-sabitleyici', 'lastik-basinc'
    ],
    excludes: ['led-far', 'panoramik-tavan', 'navigasyon'],
    optional: ['park-sensoru', 'otomatik-klima', 'koltuk-isitma', 'direksiyon-isitma'],
    extras: []
  },

  // ==========================================================================
  // KIA
  // ==========================================================================
  {
    brand: 'Kia',
    model: 'Sportage',
    years: '2016-2021',
    bodyTypes: ['SUV'],
    name: 'Cool / Comfort',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'geri-kamera', 'park-sensoru',
      'alasim-jant', 'deri-direksiyon', 'hiz-sabitleyici', 'tavan-rayi', 'led-gunduz', 'lastik-basinc'
    ],
    excludes: ['panoramik-tavan', 'led-far'],
    optional: ['navigasyon', 'apple-android', 'koltuk-isitma', 'anahtarsiz-giris'],
    extras: ['7 yıl fabrika garantisi (ilk sahibinden devrolur)']
  },
  {
    brand: 'Kia',
    model: 'Sportage',
    years: '2016-2021',
    bodyTypes: ['SUV'],
    name: 'Prestige / Elegance',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'navigasyon',
      'geri-kamera', 'park-sensoru', 'on-park-sensoru', 'alasim-jant', 'led-far',
      'koltuk-isitma', 'direksiyon-isitma', 'anahtarsiz-giris', 'elektrikli-koltuk',
      'kor-nokta', 'tavan-rayi', 'elektrikli-katlanir-ayna', 'arka-klima-menfezi'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'deri-doseme', 'adaptif-hiz', 'elektrikli-bagaj', 'koltuk-havalandirma'],
    extras: ['JBL ses sistemi (bazı araçlarda)']
  },
  {
    brand: 'Kia',
    model: 'Sportage',
    years: '2022-2024',
    bodyTypes: ['SUV'],
    name: 'Prestige',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'cift-bolge-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'on-park-sensoru', 'alasim-jant', 'led-far', 'dijital-gosterge',
      'koltuk-isitma', 'direksiyon-isitma', 'anahtarsiz-giris', 'kor-nokta', 'adaptif-hiz',
      'serit-takip', 'acil-frenleme', 'tavan-rayi', 'arka-klima-menfezi', 'ambiyans-isik'
    ],
    excludes: [],
    optional: ['panoramik-tavan', 'deri-doseme', '360-kamera', 'elektrikli-bagaj', 'koltuk-havalandirma', 'kablosuz-sarj'],
    extras: ['Panoramik çift ekran gösterge']
  },
  {
    brand: 'Kia',
    model: 'Ceed',
    years: '2018-2023',
    bodyTypes: ['Hatchback', 'Station Wagon'],
    name: 'Comfort / Elegance',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'alasim-jant', 'deri-direksiyon', 'hiz-sabitleyici', 'led-gunduz', 'lastik-basinc'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['led-far', 'navigasyon', 'koltuk-isitma', 'kor-nokta', 'anahtarsiz-giris'],
    extras: ['7 yıl fabrika garantisi']
  },
  {
    brand: 'Kia',
    model: 'Rio',
    years: '2017-2022',
    bodyTypes: ['Hatchback', 'Sedan'],
    name: 'Comfort / Elegance',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'manuel-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'alasim-jant', 'deri-direksiyon', 'hiz-sabitleyici', 'bluetooth'
    ],
    excludes: ['led-far', 'panoramik-tavan', 'navigasyon'],
    optional: ['park-sensoru', 'otomatik-klima', 'koltuk-isitma', 'kor-nokta'],
    extras: []
  },

  // ==========================================================================
  // FIAT
  // ==========================================================================
  {
    brand: 'Fiat',
    model: 'Egea',
    years: '2015-2024',
    bodyTypes: ['Sedan', 'Hatchback', 'Station Wagon'],
    name: 'Easy',
    tier: 'giriş',
    confidence: 'dogrulanmis',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'celik-jant', 'halojen-far', 'lastik-basinc'],
    excludes: ['navigasyon', 'geri-kamera', 'alasim-jant', 'park-sensoru', 'led-far'],
    optional: ['hiz-sabitleyici'],
    extras: ['Kumaş döşeme', 'Türkiye üretimi — parça bulunabilirliği yüksek']
  },
  {
    brand: 'Fiat',
    model: 'Egea',
    years: '2015-2024',
    bodyTypes: ['Sedan', 'Hatchback', 'Station Wagon'],
    name: 'Urban',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'manuel-klima', 'dokunmatik-ekran', 'park-sensoru', 'alasim-jant',
      'deri-direksiyon', 'hiz-sabitleyici', 'bluetooth'
    ],
    excludes: ['geri-kamera', 'led-far', 'panoramik-tavan'],
    optional: ['sis-far', 'otomatik-klima', 'apple-android'],
    extras: ['Uconnect multimedya']
  },
  {
    brand: 'Fiat',
    model: 'Egea',
    years: '2015-2024',
    bodyTypes: ['Sedan', 'Hatchback', 'Station Wagon'],
    name: 'Lounge',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'apple-android', 'navigasyon',
      'geri-kamera', 'park-sensoru', 'alasim-jant', 'sis-far', 'deri-direksiyon',
      'otomatik-far', 'yagmur-sensoru', 'led-gunduz'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['yarim-deri-doseme', 'koltuk-isitma', 'anahtarsiz-giris', 'kor-nokta'],
    extras: ['Uconnect 7" navigasyonlu multimedya']
  },
  {
    brand: 'Fiat',
    model: 'Egea',
    years: '2020-2024',
    bodyTypes: ['SUV', 'Hatchback'],
    name: 'Mirror',
    tier: 'üst',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'dokunmatik-ekran', 'apple-android', 'geri-kamera',
      'park-sensoru', 'alasim-jant', 'sis-far', 'deri-direksiyon', 'led-gunduz',
      'otomatik-far', 'yagmur-sensoru', 'lastik-basinc'
    ],
    excludes: ['panoramik-tavan'],
    optional: ['navigasyon', 'kor-nokta', 'koltuk-isitma'],
    extras: ['Mirror özel gövde renkleri ve jant tasarımı']
  },
  {
    brand: 'Fiat',
    model: 'Linea',
    years: '2007-2016',
    bodyTypes: ['Sedan'],
    name: 'Active / Actual',
    tier: 'giriş',
    confidence: 'dogrulanmis',
    includes: ['esp', 'isofix', 'manuel-klima', 'celik-jant', 'halojen-far', 'bluetooth'],
    excludes: ['navigasyon', 'geri-kamera', 'alasim-jant', 'park-sensoru', 'led-far'],
    optional: [],
    extras: ['Kumaş döşeme', 'Blue&Me multimedya (bazı araçlarda)']
  },
  {
    brand: 'Fiat',
    model: 'Linea',
    years: '2007-2016',
    bodyTypes: ['Sedan'],
    name: 'Urban / Emotion',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'otomatik-klima', 'alasim-jant', 'park-sensoru', 'deri-direksiyon',
      'sis-far', 'bluetooth', 'hiz-sabitleyici'
    ],
    excludes: ['led-far', 'geri-kamera', 'panoramik-tavan'],
    optional: ['navigasyon', 'koltuk-isitma'],
    extras: ['Blue&Me TomTom (bazı araçlarda)']
  },
  {
    brand: 'Fiat',
    model: 'Panda',
    years: '2012-2020',
    bodyTypes: ['Hatchback'],
    name: 'Easy / Lounge',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: ['esp', 'isofix', 'manuel-klima', 'bluetooth', 'deri-direksiyon', 'halojen-far'],
    excludes: ['navigasyon', 'geri-kamera', 'led-far', 'panoramik-tavan'],
    optional: ['alasim-jant', 'park-sensoru', 'dokunmatik-ekran'],
    extras: ['Yüksek oturuş, dar şehir içi kullanım için elverişli']
  },
  {
    brand: 'Fiat',
    model: 'Doblo',
    years: '2015-2022',
    bodyTypes: ['MPV', 'Panelvan'],
    name: 'Easy / Lounge',
    tier: 'orta',
    confidence: 'dogrulanmis',
    includes: [
      'esp', 'isofix', 'manuel-klima', 'bluetooth', 'deri-direksiyon', 'halojen-far',
      'park-sensoru', 'hiz-sabitleyici'
    ],
    excludes: ['led-far', 'panoramik-tavan', 'navigasyon'],
    optional: ['alasim-jant', 'geri-kamera', 'dokunmatik-ekran', 'otomatik-klima', 'arka-klima-menfezi'],
    extras: ['Sürgülü yan kapılar', 'Yüksek bagaj hacmi']
  }
]

/** Yıl aralığı metnini sayısal aralığa çevirir ("2013-2020" → [2013, 2020]). */
function yearRange(text) {
  const match = String(text || '').match(/(\d{4})\s*-\s*(\d{4})/)
  return match ? [Number(match[1]), Number(match[2])] : null
}

function normalize(text) {
  return String(text || '')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .trim()
}

/**
 * Kasa tipi eşleşmesi.
 *
 * Kullanıcı kasa yazmamışsa daraltma YAPILMAZ — eldeki tüm paketler gösterilir.
 * Yanlış daraltma, paket bölümünün sessizce boş kalmasına yol açar ki bu, en
 * kötü sonuçtur: kullanıcı "bu araç için veri yok" sanır.
 */
function bodyMatches(pkg, bodyType) {
  if (!bodyType) return true
  if (!Array.isArray(pkg.bodyTypes) || !pkg.bodyTypes.length) return true
  const wanted = normalize(bodyType)
  return pkg.bodyTypes.some((b) => {
    const known = normalize(b)
    return known === wanted || known.includes(wanted) || wanted.includes(known)
  })
}

/**
 * Bir marka/model (ve varsa yıl, kasa) için paketleri döner.
 * Kayıt yoksa boş dizi döner ve ekran bu bölümü hiç göstermez.
 */
export function getPackagesFor(brand, model, year, bodyType) {
  const b = normalize(brand)
  const m = normalize(model)
  if (!b) return []

  const list = PACKAGES.filter(
    (p) => normalize(p.brand) === b && (m ? normalize(p.model) === m : true)
  )

  const y = Number(year)
  const byYear = y
    ? list.filter((p) => {
        const span = yearRange(p.years)
        return !span || (y >= span[0] && y <= span[1])
      })
    : list

  const byBody = byYear.filter((p) => bodyMatches(p, bodyType))
  // Kasa filtresi her şeyi elediyse kasa bilgisi güvenilmez demektir; yıl
  // süzgecinden geçen liste yine de gösterilir.
  return byBody.length ? byBody : byYear
}

/**
 * Paket adından kaydı bulur (ilan metninde "Comfortline" geçiyorsa).
 * Kısmi eşleşme kabul edilir çünkü ilanlarda "Comfortline Plus" gibi
 * varyantlar yazılır.
 */
export function matchPackage(brand, model, year, packageName, bodyType) {
  if (!packageName) return null
  const candidates = getPackagesFor(brand, model, year, bodyType)
  if (!candidates.length) return null

  const needle = normalize(packageName)
  return (
    candidates.find((p) => normalize(p.name) === needle) ||
    candidates.find((p) => {
      // "Ambition / Sport" gibi çift adlarda her parçayı ayrı dene
      return normalize(p.name)
        .split('/')
        .some((part) => {
          const trimmed = part.trim()
          return trimmed && (needle.includes(trimmed) || trimmed.includes(needle))
        })
    }) ||
    null
  )
}

/**
 * Bir marka için paketleri model → yıl → kasa sırasıyla gruplar.
 * "2017 Audi A3 Dynamic pakette ne var?" sorusunu ekranda gezinerek yanıtlamak
 * isteyen kullanıcı için gereklidir.
 */
export function groupPackagesByModel(brand) {
  const b = normalize(brand)
  const groups = new Map()
  PACKAGES.filter((p) => !b || normalize(p.brand) === b).forEach((pkg) => {
    const key = `${pkg.brand}|${pkg.model}|${pkg.years}`
    if (!groups.has(key)) {
      groups.set(key, {
        brand: pkg.brand,
        model: pkg.model,
        years: pkg.years,
        bodyTypes: [...new Set(pkg.bodyTypes || [])],
        packages: []
      })
    }
    const group = groups.get(key)
    ;(pkg.bodyTypes || []).forEach((body) => {
      if (!group.bodyTypes.includes(body)) group.bodyTypes.push(body)
    })
    group.packages.push(pkg)
  })

  return [...groups.values()].map((group) => ({
    ...group,
    packages: group.packages.sort(
      (a, c) => PACKAGE_TIERS.indexOf(a.tier) - PACKAGE_TIERS.indexOf(c.tier)
    )
  }))
}

/** Katalogda paketi bulunan markalar. */
export function getPackageBrands() {
  return [...new Set(PACKAGES.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, 'tr'))
}

export function getPackageCount() {
  return PACKAGES.length
}

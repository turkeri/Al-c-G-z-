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
 * VERİ YAPISI
 * ============================================================================
 *   brand      : marka
 *   model      : model (models.js ile aynı yazım)
 *   years      : paketin geçerli olduğu yıl aralığı
 *   name       : paket adı
 *   tier       : giriş | orta | üst | spor  (karşılaştırma sıralaması için)
 *   includes   : bu pakette standart gelen donanım kimlikleri
 *   excludes   : bu pakette OLMAYAN, alıcının sıkça beklediği donanımlar
 *   optional   : bu pakette OPSİYONEL olabilen donanımlar — "olabilir de olmayabilir de"
 *   confidence : 'dogrulanmis' | 'kismi'  — kısmi olanlar ekranda uyarıyla gösterilir
 */

export const PACKAGE_TIERS = ['giriş', 'orta', 'üst', 'spor']

export const PACKAGES = [
  // ------------------------------------------------------------- VOLKSWAGEN
  {
    brand: 'Volkswagen',
    model: 'Golf',
    years: '2013-2020',
    name: 'Trendline',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix'],
    excludes: ['led-far', 'navigasyon', 'geri-kamera', 'park-sensoru'],
    optional: [],
    extras: ['Manuel klima', 'Hız sabitleyici']
  },
  {
    brand: 'Volkswagen',
    model: 'Golf',
    years: '2013-2020',
    name: 'Comfortline',
    tier: 'orta',
    confidence: 'kismi',
    includes: ['otomatik-klima', 'park-sensoru', 'alasim-jant', 'esp', 'isofix'],
    excludes: ['matris-far', 'geri-kamera', 'elektrikli-koltuk'],
    optional: ['dokunmatik-ekran', 'sis-far'],
    extras: ['Deri direksiyon', 'Yağmur sensörü']
  },
  {
    brand: 'Volkswagen',
    model: 'Golf',
    years: '2013-2020',
    name: 'Highline',
    tier: 'üst',
    confidence: 'kismi',
    includes: ['cift-bolge-klima', 'park-sensoru', 'alasim-jant', 'dokunmatik-ekran', 'esp'],
    excludes: ['panoramik-tavan', 'hud'],
    optional: ['led-far', 'geri-kamera', 'koltuk-isitma'],
    extras: ['Alcantara/deri döşeme', 'LED gündüz farı']
  },
  {
    brand: 'Volkswagen',
    model: 'Passat',
    years: '2015-2023',
    name: 'Impression',
    tier: 'orta',
    confidence: 'kismi',
    includes: ['cift-bolge-klima', 'park-sensoru', 'dokunmatik-ekran', 'alasim-jant', 'esp'],
    excludes: ['panoramik-tavan'],
    optional: ['geri-kamera', 'koltuk-isitma', 'led-far'],
    extras: []
  },
  {
    brand: 'Volkswagen',
    model: 'Passat',
    years: '2015-2023',
    name: 'Highline',
    tier: 'üst',
    confidence: 'kismi',
    includes: ['cift-bolge-klima', 'park-sensoru', 'geri-kamera', 'led-far', 'dokunmatik-ekran', 'alasim-jant'],
    excludes: [],
    optional: ['panoramik-tavan', 'hud', 'elektrikli-koltuk', 'kor-nokta'],
    extras: ['Deri döşeme']
  },

  // -------------------------------------------------------------------- AUDI
  {
    brand: 'Audi',
    model: 'A3',
    years: '2013-2020',
    name: 'Attraction',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix'],
    excludes: ['led-far', 'navigasyon', 'geri-kamera'],
    optional: ['park-sensoru'],
    extras: ['Manuel klima', 'Hız sabitleyici']
  },
  {
    brand: 'Audi',
    model: 'A3',
    years: '2013-2020',
    name: 'Ambition / Sport',
    tier: 'orta',
    confidence: 'kismi',
    includes: ['otomatik-klima', 'alasim-jant', 'park-sensoru', 'esp'],
    excludes: ['geri-kamera', 'panoramik-tavan'],
    optional: ['dokunmatik-ekran', 'koltuk-isitma'],
    extras: ['Spor koltuk', 'Deri direksiyon']
  },
  {
    brand: 'Audi',
    model: 'A3',
    years: '2013-2020',
    name: 'Dynamic / S line',
    tier: 'spor',
    confidence: 'kismi',
    includes: ['led-far', 'alasim-jant', 'otomatik-klima', 'esp'],
    excludes: [],
    optional: ['geri-kamera', 'navigasyon', 'panoramik-tavan'],
    extras: ['Spor süspansiyon', 'Spor koltuk', '17-18 inç jant']
  },

  // ----------------------------------------------------------------- RENAULT
  {
    brand: 'Renault',
    model: 'Megane',
    years: '2016-2023',
    name: 'Joy',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix'],
    excludes: ['navigasyon', 'geri-kamera', 'led-far', 'park-sensoru'],
    optional: [],
    extras: ['Manuel klima', 'Elektrikli ön camlar']
  },
  {
    brand: 'Renault',
    model: 'Megane',
    years: '2016-2023',
    name: 'Touch',
    tier: 'orta',
    confidence: 'kismi',
    includes: ['dokunmatik-ekran', 'geri-kamera', 'park-sensoru', 'alasim-jant', 'esp'],
    excludes: ['matris-far'],
    optional: ['navigasyon', 'koltuk-isitma'],
    extras: ['Dijital klima']
  },
  {
    brand: 'Renault',
    model: 'Megane',
    years: '2016-2023',
    name: 'Icon',
    tier: 'üst',
    confidence: 'kismi',
    includes: ['led-far', 'navigasyon', 'geri-kamera', 'cift-bolge-klima', 'kor-nokta', 'dokunmatik-ekran'],
    excludes: ['panoramik-tavan'],
    optional: ['koltuk-isitma', 'deri-doseme'],
    extras: []
  },
  {
    brand: 'Renault',
    model: 'Clio',
    years: '2019-2024',
    name: 'Joy',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix'],
    excludes: ['geri-kamera', 'navigasyon', 'led-far'],
    optional: ['park-sensoru'],
    extras: ['Manuel klima']
  },
  {
    brand: 'Renault',
    model: 'Clio',
    years: '2019-2024',
    name: 'Icon',
    tier: 'üst',
    confidence: 'kismi',
    includes: ['led-far', 'dokunmatik-ekran', 'geri-kamera', 'park-sensoru', 'alasim-jant', 'esp'],
    excludes: [],
    optional: ['kor-nokta', 'navigasyon'],
    extras: []
  },

  // -------------------------------------------------------------------- FIAT
  {
    brand: 'Fiat',
    model: 'Egea',
    years: '2015-2024',
    name: 'Easy',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix'],
    excludes: ['navigasyon', 'geri-kamera', 'alasim-jant', 'park-sensoru'],
    optional: [],
    extras: ['Manuel klima', 'Elektrikli ön camlar']
  },
  {
    brand: 'Fiat',
    model: 'Egea',
    years: '2015-2024',
    name: 'Urban',
    tier: 'orta',
    confidence: 'kismi',
    includes: ['dokunmatik-ekran', 'park-sensoru', 'alasim-jant', 'esp'],
    excludes: ['geri-kamera', 'led-far'],
    optional: ['sis-far'],
    extras: ['Dijital klima', 'Deri direksiyon']
  },
  {
    brand: 'Fiat',
    model: 'Egea',
    years: '2015-2024',
    name: 'Lounge',
    tier: 'üst',
    confidence: 'kismi',
    includes: ['otomatik-klima', 'navigasyon', 'geri-kamera', 'alasim-jant', 'sis-far', 'dokunmatik-ekran'],
    excludes: ['panoramik-tavan'],
    optional: ['deri-doseme', 'koltuk-isitma'],
    extras: []
  },

  // ------------------------------------------------------------------ TOYOTA
  {
    brand: 'Toyota',
    model: 'Corolla',
    years: '2019-2024',
    name: 'Vision',
    tier: 'orta',
    confidence: 'kismi',
    includes: ['led-far', 'dokunmatik-ekran', 'geri-kamera', 'park-sensoru', 'esp', 'isofix', 'serit-takip'],
    excludes: ['panoramik-tavan'],
    optional: ['koltuk-isitma', 'kor-nokta'],
    extras: ['Toyota Safety Sense paketi']
  },
  {
    brand: 'Toyota',
    model: 'Corolla',
    years: '2019-2024',
    name: 'Passion / Flame',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'led-far', 'dokunmatik-ekran', 'geri-kamera', 'park-sensoru', 'cift-bolge-klima',
      'koltuk-isitma', 'adaptif-hiz', 'serit-takip', 'esp'
    ],
    excludes: [],
    optional: ['kor-nokta', 'deri-doseme', 'anahtarsiz-giris'],
    extras: []
  },

  // ----------------------------------------------------------------- HYUNDAI
  {
    brand: 'Hyundai',
    model: 'i20',
    years: '2020-2024',
    name: 'Jump',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['esp', 'isofix'],
    excludes: ['geri-kamera', 'navigasyon', 'led-far'],
    optional: ['dokunmatik-ekran'],
    extras: ['Manuel klima']
  },
  {
    brand: 'Hyundai',
    model: 'i20',
    years: '2020-2024',
    name: 'Elite',
    tier: 'üst',
    confidence: 'kismi',
    includes: ['dokunmatik-ekran', 'geri-kamera', 'park-sensoru', 'otomatik-klima', 'alasim-jant', 'esp'],
    excludes: ['panoramik-tavan'],
    optional: ['led-far', 'apple-android', 'kor-nokta'],
    extras: []
  },

  // -------------------------------------------------------------------- FORD
  {
    brand: 'Ford',
    model: 'Focus',
    years: '2018-2024',
    name: 'Trend X',
    tier: 'orta',
    confidence: 'kismi',
    includes: ['dokunmatik-ekran', 'park-sensoru', 'esp', 'isofix', 'apple-android'],
    excludes: ['geri-kamera', 'led-far'],
    optional: ['alasim-jant', 'sis-far'],
    extras: ['Dijital klima']
  },
  {
    brand: 'Ford',
    model: 'Focus',
    years: '2018-2024',
    name: 'Titanium',
    tier: 'üst',
    confidence: 'kismi',
    includes: [
      'led-far', 'dokunmatik-ekran', 'apple-android', 'geri-kamera', 'park-sensoru',
      'cift-bolge-klima', 'alasim-jant', 'esp'
    ],
    excludes: [],
    optional: ['kor-nokta', 'adaptif-hiz', 'panoramik-tavan'],
    extras: []
  }
]

/**
 * Bir marka/model (ve varsa yıl) için paketleri döner.
 * Kayıt yoksa boş dizi döner ve ekran bu bölümü hiç göstermez.
 */
export function getPackagesFor(brand, model, year) {
  const list = PACKAGES.filter(
    (p) => p.brand === brand && (model ? p.model === model : true)
  )
  if (!year) return list

  const y = Number(year)
  if (!y) return list

  return list.filter((p) => {
    const match = String(p.years).match(/(\d{4})\s*-\s*(\d{4})/)
    if (!match) return true
    return y >= Number(match[1]) && y <= Number(match[2])
  })
}

/**
 * Paket adından kaydı bulur (ilan metninde "Comfortline" geçiyorsa).
 * Kısmi eşleşme kabul edilir çünkü ilanlarda "Comfortline Plus" gibi
 * varyantlar yazılır.
 */
export function matchPackage(brand, model, year, packageName) {
  if (!packageName) return null
  const candidates = getPackagesFor(brand, model, year)
  if (!candidates.length) return null

  const needle = String(packageName).toLocaleLowerCase('tr').trim()
  return (
    candidates.find((p) => p.name.toLocaleLowerCase('tr') === needle) ||
    candidates.find((p) => {
      const name = p.name.toLocaleLowerCase('tr')
      // "Ambition / Sport" gibi çift adlarda her parçayı ayrı dene
      return name.split('/').some((part) => {
        const trimmed = part.trim()
        return trimmed && (needle.includes(trimmed) || trimmed.includes(needle))
      })
    }) ||
    null
  )
}

export function getPackageCount() {
  return PACKAGES.length
}

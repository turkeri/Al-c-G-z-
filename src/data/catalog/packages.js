/**
 * DONANIM PAKETİ VERİTABANI
 *
 * ============================================================================
 * DÜRÜST NOT — BU DOSYA BİLEREK KÜÇÜK BAŞLIYOR
 * ============================================================================
 * Donanım paketleri, bu projedeki en zor veri türüdür. Bir paketin içeriği
 * markadan markaya, yıldan yıla, hatta aynı yıl içinde pazardan pazara
 * değişir: Türkiye'ye gelen "Audi A3 Dynamic" ile Almanya'daki aynı paket
 * farklı donanımlar taşır.
 *
 * Bu bilgiyi tahminle doldurmak, kullanıcıyı doğrudan yanıltır: adam "bu
 * pakette geri görüş kamerası var" diye alır, aracında çıkmaz. Bu yüzden
 * burada YALNIZCA doğrulanabilir olduğundan emin olunan paketler bulunur ve
 * her kaydın bir `confidence` (güven) alanı vardır.
 *
 * Yapı, binlerce paket eklenecek şekilde tasarlanmıştır; dolduruluşu
 * kaynak doğrulamasıyla kademeli yapılmalıdır. Uygulama, paketi bilinmeyen
 * bir araçta bu bölümü hiç göstermez — yanlış bilgi vermektense hiç
 * göstermemek tercih edilir.
 *
 * ============================================================================
 * VERİ YAPISI
 * ============================================================================
 *   brand      : marka
 *   model      : model (vehicles.json ile aynı yazım)
 *   years      : paketin geçerli olduğu yıl aralığı
 *   name       : paket adı
 *   tier       : giriş | orta | üst | spor  (karşılaştırma sıralaması için)
 *   includes   : bu pakette standart gelen donanımlar
 *   excludes   : bu pakette OLMAYAN, alıcının sıkça beklediği donanımlar
 *   confidence : 'dogrulanmis' | 'kismi'  — kısmi olanlar ekranda uyarıyla gösterilir
 */

export const PACKAGE_TIERS = ['giriş', 'orta', 'üst', 'spor']

export const PACKAGES = [
  {
    brand: 'Volkswagen',
    model: 'Golf',
    years: '2013-2020',
    name: 'Trendline',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['Manuel klima', 'Elektrikli ön camlar', 'ABS/ESP', 'Isofix', 'Hız sabitleyici'],
    excludes: ['LED far', 'Navigasyon', 'Geri görüş kamerası', 'Park sensörü']
  },
  {
    brand: 'Volkswagen',
    model: 'Golf',
    years: '2013-2020',
    name: 'Comfortline',
    tier: 'orta',
    confidence: 'kismi',
    includes: ['Dijital/otomatik klima', 'Ön park sensörü', 'Deri direksiyon', 'Yağmur sensörü', 'Alaşım jant'],
    excludes: ['LED matris far', 'Geri görüş kamerası', 'Elektrikli koltuk']
  },
  {
    brand: 'Volkswagen',
    model: 'Golf',
    years: '2013-2020',
    name: 'Highline',
    tier: 'üst',
    confidence: 'kismi',
    includes: ['Çift bölgeli klima', 'Alcantara/deri döşeme', 'LED gündüz farı', 'Ön-arka park sensörü', 'Alaşım jant'],
    excludes: ['Panoramik cam tavan', 'Head-up gösterge']
  },
  {
    brand: 'Audi',
    model: 'A3',
    years: '2013-2020',
    name: 'Attraction',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['Manuel klima', 'Hız sabitleyici', 'Isofix', 'ABS/ESP'],
    excludes: ['LED far', 'Navigasyon', 'Geri görüş kamerası', 'Spor koltuk']
  },
  {
    brand: 'Audi',
    model: 'A3',
    years: '2013-2020',
    name: 'Ambition / Sport',
    tier: 'orta',
    confidence: 'kismi',
    includes: ['Otomatik klima', 'Spor koltuk', 'Alaşım jant', 'Deri direksiyon', 'Park sensörü'],
    excludes: ['Geri görüş kamerası', 'Panoramik tavan']
  },
  {
    brand: 'Audi',
    model: 'A3',
    years: '2013-2020',
    name: 'Dynamic / S line',
    tier: 'spor',
    confidence: 'kismi',
    includes: ['LED far', '17-18 inç jant', 'Spor süspansiyon', 'Spor koltuk', 'Hız sabitleyici'],
    excludes: ['Geri görüş kamerası', 'Navigasyon (opsiyon)']
  },
  {
    brand: 'Renault',
    model: 'Megane',
    years: '2016-2023',
    name: 'Joy',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['Manuel klima', 'Elektrikli ön camlar', 'ABS/ESP', 'Isofix'],
    excludes: ['Navigasyon', 'Geri görüş kamerası', 'LED far', 'Park sensörü']
  },
  {
    brand: 'Renault',
    model: 'Megane',
    years: '2016-2023',
    name: 'Touch',
    tier: 'orta',
    confidence: 'kismi',
    includes: ['Dijital klima', 'Dokunmatik ekran', 'Geri görüş kamerası', 'Park sensörü', 'Alaşım jant'],
    excludes: ['LED matris far', 'Deri döşeme']
  },
  {
    brand: 'Renault',
    model: 'Megane',
    years: '2016-2023',
    name: 'Icon',
    tier: 'üst',
    confidence: 'kismi',
    includes: ['LED far', 'Navigasyon', 'Geri görüş kamerası', 'Çift bölgeli klima', 'Kör nokta uyarısı'],
    excludes: ['Panoramik tavan']
  },
  {
    brand: 'Fiat',
    model: 'Egea',
    years: '2015-2024',
    name: 'Easy',
    tier: 'giriş',
    confidence: 'kismi',
    includes: ['Manuel klima', 'Elektrikli ön camlar', 'ABS/ESP', 'Isofix'],
    excludes: ['Navigasyon', 'Geri görüş kamerası', 'Alaşım jant', 'Park sensörü']
  },
  {
    brand: 'Fiat',
    model: 'Egea',
    years: '2015-2024',
    name: 'Urban',
    tier: 'orta',
    confidence: 'kismi',
    includes: ['Dijital klima', 'Dokunmatik ekran', 'Park sensörü', 'Alaşım jant', 'Deri direksiyon'],
    excludes: ['Geri görüş kamerası', 'LED far']
  },
  {
    brand: 'Fiat',
    model: 'Egea',
    years: '2015-2024',
    name: 'Lounge',
    tier: 'üst',
    confidence: 'kismi',
    includes: ['Otomatik klima', 'Navigasyon', 'Geri görüş kamerası', 'Alaşım jant', 'Sis farı'],
    excludes: ['Panoramik tavan', 'Deri döşeme (opsiyon)']
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

/**
 * BAKIM VERİTABANI
 *
 * ============================================================================
 * NE İŞE YARAR
 * ============================================================================
 * "Bu aracı alırsam bakımı bana ne yakar?" sorusunun cevabı. Kronik arızalardan
 * ayrı bir konudur: kronik arıza ÇIKABİLİR, bakım MUTLAKA yapılır.
 *
 * Alıcı çoğu zaman sadece ilan fiyatına bakar; oysa bir sonraki 20.000 km'de
 * ödeyeceği bakım parası, iki araç arasındaki fiyat farkını kolayca kapatır.
 *
 * ============================================================================
 * VERİ NASIL KURULU
 * ============================================================================
 * Her bakım kalemi bir ARALIK ve bir SEGMENT çarpanıyla tanımlıdır. Segment
 * çarpanı gerekli çünkü aynı işlem farklı araçta farklı tutar: kompakt bir
 * araçta fren balatası ile bir SUV'unki aynı fiyat değildir.
 *
 * Rakamlar Türkiye piyasası için kaba tahmindir; şehir, servis tercihi (yetkili
 * / özel) ve parça tercihi (orijinal / yan sanayi) ciddi fark yaratır. Bu
 * yüzden hep aralık verilir, tek sayı verilmez.
 */

export const MAINTENANCE_BASELINE_LABEL = 'Ağustos 2026'

/** Segment çarpanları — kompakt araç 1.0 kabul edilir. */
export const SEGMENTS = {
  mini: { label: 'Mini / A segment', factor: 0.8 },
  kompakt: { label: 'Kompakt / C segment', factor: 1 },
  sedan: { label: 'Orta sınıf sedan / D segment', factor: 1.25 },
  suv: { label: 'SUV / crossover', factor: 1.4 },
  premium: { label: 'Premium / üst sınıf', factor: 1.9 }
}

/**
 * Marka + gövde tipinden segment tahmini.
 * Kesin sınıflandırma değil; maliyet ölçeğini belirlemeye yeter.
 */
const PREMIUM_BRANDS = ['bmw', 'mercedes-benz', 'mercedes', 'audi', 'volvo', 'jaguar', 'land rover', 'mini', 'porsche', 'lexus']

export function guessSegment(brand, model = '', bodyType = '') {
  const b = String(brand || '').toLocaleLowerCase('tr')
  const text = `${model} ${bodyType}`.toLocaleLowerCase('tr')

  if (/suv|crossover|4x4|kodiaq|tiguan|qashqai|tucson|sportage|duster|captur|3008|5008|x1|x3|x5|gla|glc|q3|q5|rav4|c-hr|kuga|karoq/.test(text)) {
    return PREMIUM_BRANDS.includes(b) ? 'premium' : 'suv'
  }
  if (PREMIUM_BRANDS.includes(b)) return 'premium'
  if (/passat|superb|insignia|mondeo|talisman|camry|accord|508|a4|a6|serisi/.test(text)) return 'sedan'
  if (/polo|clio|corsa|i20|picanto|aygo|swift|panda|500|up|fabia|sandero/.test(text)) return 'mini'
  return 'kompakt'
}

/**
 * Bakım kalemleri.
 *
 *   everyKm    kaç km'de bir yapılır (null = kilometreye bağlı değil)
 *   everyYears kaç yılda bir (kilometre azsa süre belirleyicidir)
 *   min/max    kompakt araç için TL aralığı
 *   fuel       yalnızca bu yakıt tipinde geçerliyse
 *   note       alıcının bilmesi gereken şey
 */
export const MAINTENANCE_ITEMS = [
  {
    id: 'yag-filtre',
    label: 'Motor yağı ve filtre',
    everyKm: 15000,
    everyYears: 1,
    min: 3500,
    max: 9000,
    note: 'Aralık motora göre değişir; turbolu ve zincirli motorlarda kısa tutmak ömrü belirgin uzatır.'
  },
  {
    id: 'hava-polen',
    label: 'Hava ve polen filtresi',
    everyKm: 20000,
    everyYears: 1,
    min: 1200,
    max: 3500,
    note: ''
  },
  {
    id: 'yakit-filtresi',
    label: 'Yakıt filtresi',
    everyKm: 40000,
    everyYears: 2,
    min: 1500,
    max: 5000,
    fuel: 'Dizel',
    note: 'Dizelde ihmal edilirse enjektörlere zarar verir; enjektör onarımı filtrenin on katıdır.'
  },
  {
    id: 'buji',
    label: 'Buji',
    everyKm: 40000,
    everyYears: 3,
    min: 1800,
    max: 6000,
    fuel: 'Benzin',
    note: 'Turbolu benzinlilerde daha sık değişir.'
  },
  {
    id: 'fren-balata-on',
    label: 'Ön fren balatası',
    everyKm: 40000,
    everyYears: null,
    min: 3000,
    max: 9000,
    note: 'Şehir içi kullanımda daha erken biter.'
  },
  {
    id: 'fren-disk-on',
    label: 'Ön fren diski',
    everyKm: 80000,
    everyYears: null,
    min: 5000,
    max: 15000,
    note: 'Genelde ikinci balata değişiminde birlikte yapılır.'
  },
  {
    id: 'fren-hidroligi',
    label: 'Fren hidroliği',
    everyKm: null,
    everyYears: 2,
    min: 1200,
    max: 3500,
    note: 'Kilometreden bağımsızdır; nem çeker ve fren performansını düşürür. En çok atlanan kalemdir.'
  },
  {
    id: 'triger-kayis',
    label: 'Triger kayışı seti + devirdaim',
    everyKm: 150000,
    everyYears: 6,
    min: 9000,
    max: 30000,
    note:
      'Zincirli motorlarda bu kalem yoktur. Kayışlı motorda atlanırsa kayış kopar ve supaplar eğilir — motor komple açılır. Bu listedeki en pahalı ihmaldir.'
  },
  {
    id: 'debriyaj',
    label: 'Debriyaj seti (manuel)',
    everyKm: 150000,
    everyYears: null,
    min: 12000,
    max: 40000,
    note: 'Çift kütleli volanla birlikte yapılırsa üst sınıra yaklaşır.'
  },
  {
    id: 'sanziman-yagi',
    label: 'Otomatik şanzıman yağı ve filtresi',
    everyKm: 70000,
    everyYears: 5,
    min: 7000,
    max: 22000,
    note:
      'Üretici "ömürlük" dese de yapılması ömrü belirgin uzatır. Yapılmamış bir otomatikte mekatronik riski artar.'
  },
  {
    id: 'aku',
    label: 'Akü',
    everyKm: null,
    everyYears: 4,
    min: 3500,
    max: 12000,
    note: 'Start-stop sistemli araçlarda AGM akü gerekir ve fiyatı yaklaşık iki katıdır.'
  },
  {
    id: 'lastik',
    label: 'Lastik (4 adet)',
    everyKm: 50000,
    everyYears: 5,
    min: 12000,
    max: 40000,
    note: 'Üretim tarihi (DOT) 5 yılı geçmiş lastik, dişi olsa bile sertleşir ve yol tutuşu düşer.'
  },
  {
    id: 'dpf-temizlik',
    label: 'DPF temizliği',
    everyKm: 120000,
    everyYears: null,
    min: 5000,
    max: 20000,
    fuel: 'Dizel',
    note:
      'Şehir içi kısa mesafede çok daha erken gerekir. Değişim gerekirse maliyet 40.000 TL üzerine çıkabilir.'
  },
  {
    id: 'klima-bakim',
    label: 'Klima gazı ve bakımı',
    everyKm: null,
    everyYears: 2,
    min: 1500,
    max: 4500,
    note: ''
  }
]

/**
 * Bir araç için önümüzdeki dönemde beklenen bakım kalemlerini hesaplar.
 *
 * @param {object} vehicle  { brand, model, year, km, fuelType, transmission, bodyType }
 * @param {number} horizonKm  kaç km ileriye bakılacak (varsayılan 30.000)
 */
export function upcomingMaintenance(vehicle, horizonKm = 30000) {
  if (!vehicle?.brand) return null

  const km = Number(vehicle.km) || 0
  const year = Number(vehicle.year) || null
  const age = year ? Math.max(0, new Date().getFullYear() - year) : null

  const segmentId = guessSegment(vehicle.brand, vehicle.model, vehicle.bodyType)
  const segment = SEGMENTS[segmentId]

  const isAutomatic = /otomatik|dsg|dct|cvt|tronic|edc|eat|powershift|automatic/i.test(
    vehicle.transmission || ''
  )

  const due = []
  let min = 0
  let max = 0

  MAINTENANCE_ITEMS.forEach((item) => {
    // Yakıta özgü kalemler elenir
    if (item.fuel && vehicle.fuelType && item.fuel !== vehicle.fuelType) return
    if (item.id === 'sanziman-yagi' && !isAutomatic) return
    if (item.id === 'debriyaj' && isAutomatic) return

    let reason = null

    if (item.everyKm && km) {
      // Bir sonraki bakım kilometresi ufuk içinde mi?
      const next = Math.ceil(km / item.everyKm) * item.everyKm
      if (next - km <= horizonKm) {
        reason = `${next.toLocaleString('tr-TR')} km'de sırada`
      }
    }

    // Kilometre az olsa da süre dolmuş olabilir (fren hidroliği, akü, lastik)
    if (!reason && item.everyYears && age !== null) {
      const cycles = Math.floor(age / item.everyYears)
      if (cycles >= 1) reason = `${item.everyYears} yılda bir — araç ${age} yaşında`
    }

    if (!reason) return

    const itemMin = Math.round((item.min * segment.factor) / 100) * 100
    const itemMax = Math.round((item.max * segment.factor) / 100) * 100
    min += itemMin
    max += itemMax

    due.push({ ...item, reason, min: itemMin, max: itemMax })
  })

  /*
   * Pahalıdan ucuza sıralanır. Kullanıcının ilk göreceği kalem, pazarlıkta
   * en çok işine yarayacak kalem olmalı; 1.200 TL'lik polen filtresi değil,
   * 30.000 TL'lik triger seti.
   */
  due.sort((a, b) => b.max - a.max)

  return {
    segment: segment.label,
    horizonKm,
    items: due,
    total: { min, max },
    /*
     * ÖNEMLİ: bu toplam "kesin ödeyeceğin para" DEĞİLDİR. Listedeki kalemlerin
     * bir kısmı satıcı tarafından yakın zamanda yapılmış olabilir. Toplamın
     * asıl işlevi, hangi kalemler için FATURA İSTENECEĞİNİ göstermektir.
     */
    basis: 'yapilmadiysa',
    baseline: MAINTENANCE_BASELINE_LABEL
  }
}

export function getMaintenanceItemCount() {
  return MAINTENANCE_ITEMS.length
}

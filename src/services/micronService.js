/**
 * Ekspertiz raporundaki boya kalınlığı (mikron) ölçümlerini yorumlar.
 *
 * Alıcı ekspertizden elinde mikron değerleri yazılı bir kağıtla çıkar ve
 * genellikle hiçbirini okuyamaz. Burada iki katmanlı bir değerlendirme yapılır:
 *
 *   1. Mutlak eşikler: fabrika boyası belirli bir aralıkta olur, üzerine
 *      atılan her kat ölçümü yukarı taşır.
 *   2. Araca göre göreli karşılaştırma: aynı aracın orijinal panelleri
 *      birbirine yakın çıkar. Fabrika ortalaması 105 olan bir araçta 175
 *      mikron mutlak eşiği geçmese bile o panel şüphelidir.
 *
 * Bu yüzden tek bir panelin değeri değil, panellerin birbirine göre dağılımı
 * da hesaba katılır.
 */

/** Ölçüm yapılabilen metal paneller. Tamponlar plastiktir, mikron ölçümü anlam taşımaz. */
export const MICRON_PANELS = [
  { id: 'kaput', label: 'Kaput', structural: false },
  { id: 'tavan', label: 'Tavan', structural: true },
  { id: 'bagaj', label: 'Bagaj Kapağı', structural: false },
  { id: 'sol-on-camurluk', label: 'Sol Ön Çamurluk', structural: false },
  { id: 'sag-on-camurluk', label: 'Sağ Ön Çamurluk', structural: false },
  { id: 'sol-arka-camurluk', label: 'Sol Arka Çamurluk', structural: true },
  { id: 'sag-arka-camurluk', label: 'Sağ Arka Çamurluk', structural: true },
  { id: 'sol-on-kapi', label: 'Sol Ön Kapı', structural: false },
  { id: 'sag-on-kapi', label: 'Sağ Ön Kapı', structural: false },
  { id: 'sol-arka-kapi', label: 'Sol Arka Kapı', structural: false },
  { id: 'sag-arka-kapi', label: 'Sağ Arka Kapı', structural: false },
  { id: 'sol-marspiyel', label: 'Sol Marşpiyel', structural: true },
  { id: 'sag-marspiyel', label: 'Sağ Marşpiyel', structural: true },
  { id: 'arka-panel', label: 'Arka Panel', structural: true }
]

/** Mutlak eşikler (mikron). Çelik panel, tek kat fabrika boyası varsayımı. */
const THRESHOLD_THIN = 60
const THRESHOLD_ORIGINAL_MAX = 130
const THRESHOLD_SUSPECT_MAX = 200
const THRESHOLD_PAINTED_MAX = 350

/** Aracın kendi ortalamasına göre sapma eşiği (kat olarak). */
const RELATIVE_SUSPECT_RATIO = 1.45

export const MICRON_VERDICTS = {
  ince: {
    key: 'ince',
    label: 'İnce - şüpheli',
    tone: 'warning',
    note: 'Fabrika boyası için fazla ince. Panel değişmiş ve tek kat ince boyanmış olabilir; alüminyum veya plastik panelse normal olabilir.'
  },
  orijinal: {
    key: 'orijinal',
    label: 'Orijinal',
    tone: 'excellent',
    note: 'Fabrika boyası aralığında. Bu panele boya yapılmamış görünüyor.'
  },
  supheli: {
    key: 'supheli',
    label: 'Şüpheli',
    tone: 'warning',
    note: 'Fabrika üst sınırının üzerinde. Kalın orijinal boya da olabilir, ince bir rötuş da. Panel kenarlarını ve fitil altını gözle kontrol ettir.'
  },
  boyali: {
    key: 'boyali',
    label: 'Boyalı',
    tone: 'warning',
    note: 'Üzerine boya atılmış. Tek başına ciddi değildir ama neden boyandığını satıcıya sor.'
  },
  macun: {
    key: 'macun',
    label: 'Macunlu / değişen',
    tone: 'danger',
    note: 'Bu kalınlık dolgu (macun) işaretidir. Panel ya ağır onarım görmüş ya da değişmiştir.'
  }
}

function verdictFor(micron, reference) {
  if (micron < THRESHOLD_THIN) return MICRON_VERDICTS.ince
  if (micron > THRESHOLD_PAINTED_MAX) return MICRON_VERDICTS.macun
  if (micron > THRESHOLD_SUSPECT_MAX) return MICRON_VERDICTS.boyali
  if (micron > THRESHOLD_ORIGINAL_MAX) return MICRON_VERDICTS.supheli

  // Mutlak olarak orijinal aralıkta olsa bile aracın kendi ortalamasından
  // belirgin sapıyorsa şüpheli sayılır.
  if (reference && micron > reference * RELATIVE_SUSPECT_RATIO) return MICRON_VERDICTS.supheli
  return MICRON_VERDICTS.orijinal
}

function median(values) {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

/**
 * @param {object} readings { panelId: mikron } — boş bırakılanlar atlanır
 * @returns {object|null}
 */
export function evaluateMicronReport(readings = {}) {
  const entries = MICRON_PANELS.map((panel) => {
    const raw = readings[panel.id]
    const value = raw === '' || raw === null || raw === undefined ? null : Number(raw)
    return { panel, micron: Number.isFinite(value) && value > 0 ? value : null }
  }).filter((item) => item.micron !== null)

  if (entries.length < 3) return null

  // Referans, mutlak olarak orijinal aralığa düşen panellerin ortancasıdır.
  const originalCandidates = entries
    .map((e) => e.micron)
    .filter((m) => m >= THRESHOLD_THIN && m <= THRESHOLD_ORIGINAL_MAX)
  const reference = median(originalCandidates)

  const panels = entries.map((entry) => ({
    id: entry.panel.id,
    label: entry.panel.label,
    structural: entry.panel.structural,
    micron: entry.micron,
    verdict: verdictFor(entry.micron, reference)
  }))

  const counts = panels.reduce((acc, p) => {
    acc[p.verdict.key] = (acc[p.verdict.key] || 0) + 1
    return acc
  }, {})

  const painted = (counts.boyali || 0) + (counts.macun || 0)
  const suspect = counts.supheli || 0
  const heavy = counts.macun || 0
  const structuralHits = panels.filter(
    (p) => p.structural && (p.verdict.key === 'macun' || p.verdict.key === 'boyali')
  )

  let overall
  if (heavy > 0 || structuralHits.length > 0) {
    overall = {
      tone: 'danger',
      label: 'Ağır kaporta işlemi var',
      text:
        'En az bir panelde dolgu seviyesinde kalınlık ya da taşıyıcı bölgede boya tespit edildi. Bu araç ciddi bir darbe almış olabilir; fiyatın bunu yansıtması gerekir.'
    }
  } else if (painted >= 3) {
    overall = {
      tone: 'danger',
      label: 'Çok sayıda boyalı panel',
      text:
        painted +
        ' panel boyalı görünüyor. Tek taraflı yoğunlaşma varsa yandan ciddi bir darbe almış olma ihtimali yüksektir.'
    }
  } else if (painted > 0) {
    overall = {
      tone: 'warning',
      label: 'Kısmi boya var',
      text:
        painted +
        ' panelde boya tespit edildi. Yaygın ve kabul edilebilir bir durumdur, ancak değer kaybı hesabına dahil et ve pazarlıkta kullan.'
    }
  } else if (suspect > 0) {
    overall = {
      tone: 'warning',
      label: 'Sınırda değerler var',
      text:
        suspect +
        ' panel fabrika aralığının hemen üzerinde. Kesin karar için o panellerin fitil altını ve kaporta cıvatalarını gözle kontrol ettir.'
    }
  } else {
    overall = {
      tone: 'excellent',
      label: 'Tamamı orijinal görünüyor',
      text:
        'Ölçülen panellerin tamamı fabrika boyası aralığında ve birbirleriyle tutarlı. Kaporta açısından temiz bir araç.'
    }
  }

  return {
    panels,
    reference: reference ? Math.round(reference) : null,
    measuredCount: panels.length,
    originalCount: counts.orijinal || 0,
    suspectCount: suspect,
    paintedCount: counts.boyali || 0,
    heavyCount: heavy,
    thinCount: counts.ince || 0,
    structuralHits: structuralHits.map((p) => p.label),
    overall
  }
}

/**
 * Mikron sonucunu değer kaybı hesabının parça sayılarına çevirir.
 * Böylece kullanıcı aynı bilgiyi iki kez girmek zorunda kalmaz.
 */
export function toDamageParts(report) {
  if (!report) return {}
  const parts = {}
  report.panels.forEach((panel) => {
    if (panel.verdict.key === 'macun') {
      const key = panel.structural ? 'degisen-kaynakli' : 'degisen-civatali'
      parts[key] = (parts[key] || 0) + 1
    } else if (panel.verdict.key === 'boyali') {
      const key = panel.structural ? 'boyali-kaynakli' : 'boyali-civatali'
      parts[key] = (parts[key] || 0) + 1
    }
  })
  return parts
}

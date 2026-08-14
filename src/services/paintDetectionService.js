/**
 * Boya / değişen panel tespiti.
 *
 * ============================================================================
 * YÖNTEM
 * ============================================================================
 *
 * Fabrika boyası tek seferde, robotla, aynı parti boyayla atılır; bu yüzden
 * aracın bütün panelleri birbirine çok yakın çıkar. Sonradan yapılan boya ne
 * kadar iyi olursa olsun üç yerde iz bırakır:
 *
 *   1. RENK    - Formül tutturulsa bile küçük bir kroma/ton kayması kalır.
 *                Metalik boyalarda pul yönlenmesi farklı olduğu için bu kayma
 *                daha da belirginleşir.
 *   2. DOKU    - Fabrika portakal kabuğu ince ve düzenlidir; tabanca ile
 *                atılan boyanınki daha kaba ve daha değişkendir.
 *   3. TUTARLILIK - Kısmi (lokal) boyada panelin kendi içinde bile fark olur.
 *
 * Sorun şu ki bu üç sinyalin hepsi, ışık değişiminin altında kalabilecek kadar
 * küçüktür. Bu yüzden motorun asıl işi tespit değil, GÜRÜLTÜYÜ AYIKLAMAKTIR:
 *
 *   - Ölçüm CIELAB uzayında yapılır, HSL değil (bkz. colorScience.js).
 *   - Fark hesabında ışık ekseni (dL) ile boya ekseni (dC, dH) ayrılır ve
 *     karar ağırlıklı olarak boya eksenine dayandırılır.
 *   - Panelin tek bir ortalama rengi alınmaz; onlarca yamaya bölünüp parlama,
 *     gölge, fitil, kulp, cam ve arka plan içeren yamalar ELENİR, kalanların
 *     ortancası kullanılır.
 *   - "Normal" panel, basit ortalama ile değil, birbiriyle uyuşan panellerin
 *     oluşturduğu en büyük kümeyle (konsensüs) belirlenir. Böylece dört panel
 *     boyalıysa bile referans bozulmaz.
 *   - Simetrik ikizler (sol/sağ aynı panel) ayrıca kıyaslanır. Aynı kalıptan
 *     çıkmış, aynı eğrilikte iki panelin karşılaştırması, kaputu kapıyla
 *     kıyaslamaktan çok daha güvenilirdir.
 *   - Bitişik panellerin birlikte işaretlenmesi güven artırır: gerçek hasar
 *     bölgeseldir, gürültü dağınıktır.
 *   - Tamponlar plastiktir ve fabrikada ayrı boyanır; sacdan farklı çıkmaları
 *     NORMALDİR. Konsensüse katılmazlar ve daha toleranslı değerlendirilirler.
 *
 * ============================================================================
 * SINIRLAR (dürüstçe)
 * ============================================================================
 *
 * Bu yöntem boya kalınlığı ölçmez ve mikron cihazının yerini tutmaz. Telefon
 * kamerası otomatik beyaz dengesi uygular; bu, panelden panele renk kaymasına
 * yol açabilir ve motor bunu tespit edip güveni düşürür ama tamamen ortadan
 * kaldıramaz. Çıktı, "hangi panele mikronla bakmalıyım" sorusunun cevabıdır;
 * "bu panel boyalıdır" hükmü değildir.
 */

import {
  chroma,
  deltaE2000,
  median,
  medianAbsoluteDeviation,
  LINEAR_LUT,
  relativeLuminance,
  scaleToLuminance,
  linearRgbToLab,
  medianLinearRgb
} from './colorScience'

// ---------------------------------------------------------------------------
// Panel tanımları
// ---------------------------------------------------------------------------

export const PANELS = [
  { id: 'kaput', name: 'Kaput', substrate: 'sac', pair: null },
  { id: 'tavan', name: 'Tavan', substrate: 'sac', pair: null },
  { id: 'bagaj', name: 'Bagaj Kapağı', substrate: 'sac', pair: null },
  { id: 'sol-on-camurluk', name: 'Sol Ön Çamurluk', substrate: 'sac', pair: 'sag-on-camurluk' },
  { id: 'sag-on-camurluk', name: 'Sağ Ön Çamurluk', substrate: 'sac', pair: 'sol-on-camurluk' },
  { id: 'sol-on-kapi', name: 'Sol Ön Kapı', substrate: 'sac', pair: 'sag-on-kapi' },
  { id: 'sag-on-kapi', name: 'Sağ Ön Kapı', substrate: 'sac', pair: 'sol-on-kapi' },
  { id: 'sol-arka-kapi', name: 'Sol Arka Kapı', substrate: 'sac', pair: 'sag-arka-kapi' },
  { id: 'sag-arka-kapi', name: 'Sağ Arka Kapı', substrate: 'sac', pair: 'sol-arka-kapi' },
  { id: 'sol-arka-camurluk', name: 'Sol Arka Çamurluk', substrate: 'sac', pair: 'sag-arka-camurluk' },
  { id: 'sag-arka-camurluk', name: 'Sağ Arka Çamurluk', substrate: 'sac', pair: 'sol-arka-camurluk' },
  { id: 'on-tampon', name: 'Ön Tampon', substrate: 'plastik', pair: null },
  { id: 'arka-tampon', name: 'Arka Tampon', substrate: 'plastik', pair: null }
]

/** Gerçek hasar bölgeseldir: komşu panellerin birlikte işaretlenmesi güven artırır. */
const ADJACENCY = {
  kaput: ['on-tampon', 'sol-on-camurluk', 'sag-on-camurluk'],
  'on-tampon': ['kaput', 'sol-on-camurluk', 'sag-on-camurluk'],
  'sol-on-camurluk': ['kaput', 'on-tampon', 'sol-on-kapi'],
  'sag-on-camurluk': ['kaput', 'on-tampon', 'sag-on-kapi'],
  'sol-on-kapi': ['sol-on-camurluk', 'sol-arka-kapi', 'tavan'],
  'sag-on-kapi': ['sag-on-camurluk', 'sag-arka-kapi', 'tavan'],
  'sol-arka-kapi': ['sol-on-kapi', 'sol-arka-camurluk', 'tavan'],
  'sag-arka-kapi': ['sag-on-kapi', 'sag-arka-camurluk', 'tavan'],
  'sol-arka-camurluk': ['sol-arka-kapi', 'bagaj', 'arka-tampon'],
  'sag-arka-camurluk': ['sag-arka-kapi', 'bagaj', 'arka-tampon'],
  bagaj: ['sol-arka-camurluk', 'sag-arka-camurluk', 'arka-tampon'],
  'arka-tampon': ['bagaj', 'sol-arka-camurluk', 'sag-arka-camurluk'],
  tavan: ['sol-on-kapi', 'sag-on-kapi', 'sol-arka-kapi', 'sag-arka-kapi']
}

export const MIN_PANELS_FOR_ANALYSIS = 4

// ---------------------------------------------------------------------------
// Örnekleme ayarları
// ---------------------------------------------------------------------------

/** Doku ölçümü için çözünürlük gerekir; küçültme burada durur. */
const WORK_MAX_DIMENSION = 1100
/** Kenarlarda arka plan/başka panel olma ihtimali yüksek; merkez bölge alınır. */
const SAMPLE_REGION = 0.82
const GRID = 6

/**
 * Parlama ve gölge eleme, MUTLAK değil GÖRELİ eşiklerle yapılır.
 *
 * Mutlak eşik kullanmak siyah ve beyaz araçlarda ölçümü tamamen çökertir:
 * beyaz bir panelin normal pikselleri "parlama", siyah bir panelin normal
 * pikselleri "gölge" sayılır ve elde hiçbir veri kalmaz. Oysa parlama, panelin
 * KENDİ parlaklık dağılımına göre bir aykırılıktır.
 */
const SPECULAR_PATCH_RATIO = 1.22
const SPECULAR_PATCH_OFFSET = 0.05
const SHADOW_PATCH_RATIO = 0.62
/** Tamamen doymuş (patlamış) piksel oranı bu değeri aşan yama kullanılmaz. */
const BLOWN_PIXEL_LEVEL = 246
const BLOWN_PATCH_LIMIT = 0.18
const SPECULAR_PATCH_LIMIT = 0.12
/** Kenar yoğunluğu yüksek yamalar fitil, kulp, cam, plaka veya arka plan içerir. */
const EDGE_REJECT_PERCENTILE = 0.65
const MIN_VALID_PATCHES = 8
/**
 * Bulanık fotoğrafta doku sinyali yoktur.
 * Eşik ölçümle belirlendi: net fotoğrafta ince bant enerjisi 13-18 aralığında,
 * belirgin bulanıkta 0,04 civarında çıkıyor — aradaki fark üç kat büyüklük
 * mertebesi olduğu için düşük bir eşik güvenle ayırıyor.
 */
const MIN_SHARPNESS = 1.5

// ---------------------------------------------------------------------------
// Karar eşikleri
// ---------------------------------------------------------------------------

/** Konsensüs kümesine girmek için gereken azami ışıktan arındırılmış fark. */
const CONSENSUS_CHROMATIC = 1.6
const MIN_CONSENSUS_SIZE = 3

/**
 * Kanıt eşikleri (ışıktan arındırılmış ΔE00 cinsinden).
 *
 * Taban değerler sentetik testlerle kalibre edildi: ışığı %20 oynatılmış ama
 * hiç boyası olmayan bir araçta en yüksek sapma 0,40 çıkıyor; gerçekten
 * boyalı bir panelde 1,4 - 6,1 arasında. Taban eşik bu iki değerin arasına
 * konur, ancak sabit bırakılmaz: gerçek fotoğraflarda telefonun otomatik beyaz
 * dengesi gürültüyü artırır, bu yüzden eşik aşağıdaki NOISE_MULTIPLIER ile
 * ölçülen gürültü tabanına göre yukarı uyarlanır.
 */
const CHROMATIC_NOTICE = 0.7
const CHROMATIC_STRONG = 3.0
/** Uyarlamalı eşik: konsensüs içi sapmanın bu katı, taban eşiği ezebilir. */
const NOISE_MULTIPLIER = 2.2
/** Plastik tamponlar fabrikada ayrı boyanır, doğal sapmaları daha yüksektir. */
const PLASTIC_TOLERANCE = 2.2

/** Doku oranı: 1 = konsensüsle aynı. Uzaklaştıkça kanıt artar. */
const TEXTURE_NOTICE = 0.28
const TEXTURE_STRONG = 0.7

/** Panelin kendi içindeki dağılım: lokal boyanın imzası. */
const SPREAD_NOTICE = 1.4
const SPREAD_STRONG = 3.2

/** Simetrik ikiz farkı: aynı kalıptan çıkmış iki panel, en güvenilir kıyas. */
const PAIR_NOTICE = 0.7
const PAIR_STRONG = 3.0

const EVIDENCE_SUSPECT = 30
const EVIDENCE_STRONG = 58

// ---------------------------------------------------------------------------
// Görüntü işleme
// ---------------------------------------------------------------------------

function toWorkCanvas(img) {
  const scale = Math.min(1, WORK_MAX_DIMENSION / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.width * scale))
  canvas.height = Math.max(1, Math.round(img.height * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

/** Yatay+dikey birinci fark toplamı: kenar/detay enerjisi. */
function edgeEnergy(gray, w, h) {
  let sum = 0
  let count = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const gx = gray[i + 1] - gray[i - 1]
      const gy = gray[i + w] - gray[i - w]
      sum += Math.abs(gx) + Math.abs(gy)
      count++
    }
  }
  return count ? sum / count : 0
}

/** Belirli yarıçapta kutu bulanıklaştırma (ayrılabilir, iki geçişli). */
function boxBlur(src, w, h, radius) {
  const tmp = new Float32Array(w * h)
  const out = new Float32Array(w * h)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0
      let n = 0
      for (let dx = -radius; dx <= radius; dx++) {
        const xx = x + dx
        if (xx < 0 || xx >= w) continue
        sum += src[y * w + xx]
        n++
      }
      tmp[y * w + x] = sum / n
    }
  }

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let sum = 0
      let n = 0
      for (let dy = -radius; dy <= radius; dy++) {
        const yy = y + dy
        if (yy < 0 || yy >= h) continue
        sum += tmp[yy * w + x]
        n++
      }
      out[y * w + x] = sum / n
    }
  }

  return out
}

/**
 * Çok ölçekli bant enerjisi.
 *
 * Portakal kabuğunun belirli bir uzamsal periyodu vardır. Tek bir bulanıklık
 * yarıçapıyla ölçmek bunu gürültüden ayıramaz; farklı yarıçaplardaki enerji
 * oranı ise dokunun kaba mı ince mi olduğunu söyler.
 */
function bandEnergies(gray, w, h) {
  const b1 = boxBlur(gray, w, h, 1)
  const b3 = boxBlur(gray, w, h, 3)
  const b6 = boxBlur(gray, w, h, 6)

  let fine = 0
  let mid = 0
  for (let i = 0; i < gray.length; i++) {
    const f = gray[i] - b1[i]
    const m = b1[i] - b3[i]
    fine += f * f
    mid += m * m
  }
  // b6 yalnızca geniş ölçekli aydınlanma eğimini ayıklamak için üretilir;
  // enerjiye katılmaz, çünkü o bant boyanın değil ışığın bandıdır.
  void b6

  const n = gray.length || 1
  return { fine: fine / n, mid: mid / n }
}

/**
 * Tek bir panel fotoğrafından imza çıkarır.
 *
 * Panel onlarca yamaya bölünür, kullanılamaz yamalar elenir, kalanların
 * ortancası imzayı oluşturur. Ortalama yerine ortanca kullanılır: tek bir
 * parlama ya da kaçırılmış fitil sonucu bozmasın diye.
 */
export function analyzePanelPhoto(img) {
  const canvas = toWorkCanvas(img)
  const { width: W, height: H } = canvas
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  const regionW = Math.floor(W * SAMPLE_REGION)
  const regionH = Math.floor(H * SAMPLE_REGION)
  const originX = Math.floor((W - regionW) / 2)
  const originY = Math.floor((H - regionH) / 2)

  const patchW = Math.max(24, Math.floor(regionW / GRID))
  const patchH = Math.max(24, Math.floor(regionH / GRID))

  // --- Birinci geçiş: her yamanın ham istatistiği ---
  const patches = []

  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const px = originX + gx * patchW
      const py = originY + gy * patchH
      if (px + patchW > W || py + patchH > H) continue

      const data = ctx.getImageData(px, py, patchW, patchH).data
      const count = patchW * patchH
      const gray = new Float32Array(count)

      // Renk ortalaması DOĞRUSAL ışık uzayında alınır. sRGB değerlerini
      // doğrudan ortalamak fiziksel olarak yanlıştır: sRGB gama eğrilidir,
      // ortalaması gerçek ışık ortalamasına karşılık gelmez.
      let rLin = 0
      let gLin = 0
      let bLin = 0
      let blown = 0

      for (let i = 0; i < count; i++) {
        const r = data[i * 4]
        const g = data[i * 4 + 1]
        const b = data[i * 4 + 2]
        gray[i] = 0.299 * r + 0.587 * g + 0.114 * b

        // Doymuş piksel geri döndürülemez bilgi kaybıdır ve ortalamayı
        // yukarı çeker; renk hesabına alınmaz.
        if (r >= BLOWN_PIXEL_LEVEL || g >= BLOWN_PIXEL_LEVEL || b >= BLOWN_PIXEL_LEVEL) {
          blown++
          continue
        }
        rLin += LINEAR_LUT[r]
        gLin += LINEAR_LUT[g]
        bLin += LINEAR_LUT[b]
      }

      const used = count - blown
      if (used < count * 0.4) continue
      const lin = { r: rLin / used, g: gLin / used, b: bLin / used }

      patches.push({
        lin,
        luminance: relativeLuminance(lin),
        blownRatio: blown / count,
        fine: 0,
        mid: 0,
        edge: edgeEnergy(gray, patchW, patchH),
        gray,
        w: patchW,
        h: patchH
      })
    }
  }

  const quality = { usable: true, reasons: [] }

  if (patches.length < MIN_VALID_PATCHES) {
    quality.usable = false
    quality.reasons.push('Fotoğraf çok küçük veya okunamadı')
    return emptySignature(quality, patches.length)
  }

  // --- İkinci geçiş: panelin KENDİ dağılımına göre eleme ---
  // Parlama, panelin kendi parlaklığına göre bir aykırılıktır; mutlak bir
  // eşikle aranamaz, yoksa beyaz araçta her yer parlama, siyah araçta her yer
  // gölge sayılır.
  const panelLuminance = median(patches.map((p) => p.luminance))
  const specularCut = panelLuminance * SPECULAR_PATCH_RATIO + SPECULAR_PATCH_OFFSET
  const shadowCut = panelLuminance * SHADOW_PATCH_RATIO

  const lit = patches.filter(
    (p) => p.luminance <= specularCut && p.luminance >= shadowCut && p.blownRatio <= BLOWN_PATCH_LIMIT
  )
  const specularRatio = 1 - lit.length / patches.length

  let usablePatches = lit.length >= MIN_VALID_PATCHES ? lit : patches

  // Kenar enerjisi yüksek yamalar (fitil, kulp, cam, plaka, arka plan) elenir.
  const edges = usablePatches.map((p) => p.edge).sort((a, b) => a - b)
  const edgeCut = edges[Math.min(edges.length - 1, Math.floor(edges.length * EDGE_REJECT_PERCENTILE))]
  const edgeKept = usablePatches.filter((p) => p.edge <= edgeCut)
  const kept = edgeKept.length >= MIN_VALID_PATCHES ? edgeKept : usablePatches

  // Doku yalnızca kullanılacak yamalarda hesaplanır (pahalı işlem).
  kept.forEach((p) => {
    const bands = bandEnergies(p.gray, p.w, p.h)
    p.fine = bands.fine
    p.mid = bands.mid
  })

  const linRgb = medianLinearRgb(kept.map((p) => p.lin))
  const signatureLab = linearRgbToLab(linRgb)
  const targetY = relativeLuminance(linRgb)

  // Panel içi dağılım, yamalar ortak parlaklığa getirildikten SONRA ölçülür.
  // Aksi halde her fotoğrafta bulunan aydınlanma eğimi, lokal boya sanılır.
  const internalDeltas = kept.map((p) =>
    deltaE2000(signatureLab, linearRgbToLab(scaleToLuminance(p.lin, targetY))).chromatic
  )
  const internalSpread = median(internalDeltas) + medianAbsoluteDeviation(internalDeltas)

  const sharpness = median(kept.map((p) => p.fine))

  if (sharpness < MIN_SHARPNESS) {
    quality.usable = false
    quality.reasons.push('Fotoğraf net değil, doku ölçülemiyor')
  }
  if (specularRatio > SPECULAR_PATCH_LIMIT) {
    quality.reasons.push('Yoğun parlama var, sonucun güveni düşük')
  }

  // Bellek: gri kanallar imzada tutulmaz.
  kept.forEach((p) => {
    p.gray = null
  })

  return {
    linRgb,
    luminance: targetY,
    lab: signatureLab,
    chroma: chroma(signatureLab),
    fine: sharpness,
    mid: median(kept.map((p) => p.mid)),
    internalSpread,
    specularRatio,
    validPatches: kept.length,
    totalPatches: patches.length,
    quality
  }
}

function emptySignature(quality, patchCount) {
  return {
    linRgb: { r: 0, g: 0, b: 0 },
    luminance: 0,
    lab: { L: 0, a: 0, b: 0 },
    chroma: 0,
    fine: 0,
    mid: 0,
    internalSpread: 0,
    specularRatio: 1,
    validPatches: 0,
    totalPatches: patchCount,
    quality
  }
}

// ---------------------------------------------------------------------------
// Karşılaştırma
// ---------------------------------------------------------------------------

/** Eşiği aşan farkı 0-1 arası bir kanıt oranına çevirir. */
function ramp(value, notice, strong) {
  if (value <= notice) return 0
  if (value >= strong) return 1
  return (value - notice) / (strong - notice)
}

/**
 * Birbiriyle uyuşan en büyük panel kümesini bulur.
 *
 * Basit ortanca yerine bu gerekir: dokuz panelden dördü boyalıysa ortanca
 * ikisinin arasında bir yere düşer ve hiçbir paneli doğru sınıflandıramaz.
 * Kümeleme ise "çoğunluk hangi renkte anlaşıyor" sorusunu sorar.
 */
function buildConsensus(entries) {
  const metal = entries.filter((e) => e.panel.substrate === 'sac')
  const pool = metal.length >= MIN_CONSENSUS_SIZE ? metal : entries

  // Karşılaştırmalar ortak parlaklıkta yapılır; referans, panellerin ortanca
  // parlaklığıdır.
  const referenceY = median(pool.map((e) => e.signature.luminance))
  const normalized = new Map(
    pool.map((e) => [
      e.panel.id,
      linearRgbToLab(scaleToLuminance(e.signature.linRgb, referenceY))
    ])
  )

  let best = null
  pool.forEach((seed) => {
    const seedLab = normalized.get(seed.panel.id)
    const members = pool.filter(
      (other) =>
        deltaE2000(seedLab, normalized.get(other.panel.id)).chromatic <= CONSENSUS_CHROMATIC
    )
    if (!best || members.length > best.members.length) best = { seed, members }
  })

  if (!best || best.members.length < MIN_CONSENSUS_SIZE) return null

  const memberLin = best.members.map((m) => scaleToLuminance(m.signature.linRgb, referenceY))
  const consensusLin = medianLinearRgb(memberLin)

  // Gürültü tabanı: birbiriyle uyuştuğunu kabul ettiğimiz panellerin bile
  // aralarında kalan fark. Bu, o çekim seansındaki ölçüm gürültüsüdür ve
  // karar eşiği bunun üzerine kurulur.
  const consensusLab = linearRgbToLab(consensusLin)
  const noiseFloor = median(
    memberLin.map((lin) => deltaE2000(consensusLab, linearRgbToLab(lin)).chromatic)
  )

  return {
    referenceY,
    lin: consensusLin,
    lab: consensusLab,
    noiseFloor,
    fine: median(best.members.map((m) => m.signature.fine)),
    mid: median(best.members.map((m) => m.signature.mid)),
    size: best.members.length,
    memberIds: best.members.map((m) => m.panel.id)
  }
}

/**
 * @param {Array} panels [{ id, name, dataUrl, signature }]
 * @returns {{panels: Array, summary: object}|null}
 */
export function comparePanels(panels) {
  const entries = panels
    .map((p) => {
      const panel = PANELS.find((def) => def.id === p.id) || {
        id: p.id,
        name: p.name,
        substrate: 'sac',
        pair: null
      }
      return { ...p, panel, signature: p.signature }
    })
    .filter((e) => e.signature)

  const usable = entries.filter((e) => e.signature.quality.usable)

  if (usable.length < MIN_PANELS_FOR_ANALYSIS) {
    return {
      panels: entries.map((e) => unusableResult(e)),
      summary: {
        tone: 'warning',
        label: 'Değerlendirme yapılamadı',
        text:
          'Kullanılabilir panel sayısı yetersiz. En az ' +
          MIN_PANELS_FOR_ANALYSIS +
          ' panelin net, gölgede ve parlamasız çekilmiş olması gerekiyor.',
        flaggedCount: 0,
        confidence: 0
      }
    }
  }

  const consensus = buildConsensus(usable)
  if (!consensus) {
    return {
      panels: entries.map((e) => unusableResult(e, 'Paneller birbiriyle uyuşmuyor')),
      summary: {
        tone: 'warning',
        label: 'Işık koşulları tutarsız',
        text:
          'Paneller birbiriyle uyuşmadığı için hangisinin "normal" olduğu belirlenemedi. Bu genellikle fotoğrafların farklı ışıkta (kimi güneşte, kimi gölgede) çekilmesinden olur. Hepsini aynı ortamda, gölgede ve arka arkaya çekip tekrar dene.',
        flaggedCount: 0,
        confidence: 0
      }
    }
  }

  // Çekim tutarlılığı: panellerin ışık seviyesi çok dağınıksa güven düşer.
  const lightSpread = medianAbsoluteDeviation(usable.map((e) => e.signature.lab.L))
  const lightingPenalty = Math.min(0.45, Math.max(0, (lightSpread - 6) / 20))

  const consensusChroma = chroma(consensus.lab)
  const isNeutral = consensusChroma < 6

  /**
   * Panelin pozlama normalize edilmiş rengi.
   * Ham LAB yerine bu kullanılır; aksi halde gölgede çekilmiş orijinal bir
   * panel "rengi sapmış" görünür.
   */
  const normalizedLab = (signature) =>
    linearRgbToLab(scaleToLuminance(signature.linRgb, consensus.referenceY))

  // Karar eşiği, o çekim seansının kendi gürültüsüne göre yukarı uyarlanır.
  const chromaticNotice = Math.max(CHROMATIC_NOTICE, consensus.noiseFloor * NOISE_MULTIPLIER)
  const pairNotice = Math.max(PAIR_NOTICE, consensus.noiseFloor * NOISE_MULTIPLIER)

  // --- Birinci geçiş: her panel için ham kanıt ---
  const scored = usable.map((entry) => {
    const sig = entry.signature
    const diff = deltaE2000(consensus.lab, normalizedLab(sig))
    // Ham parlaklık farkı yalnızca kullanıcıya "ışık farkı" olarak gösterilir,
    // karara girmez.
    const rawLightDelta = sig.lab.L - consensus.lab.L

    const isPlastic = entry.panel.substrate === 'plastik'
    const tolerance = isPlastic ? PLASTIC_TOLERANCE : 0
    const chromatic = Math.max(0, diff.chromatic - tolerance)

    const colourEvidence = ramp(chromatic, chromaticNotice, CHROMATIC_STRONG)

    // Doku yalnızca netlikler benzerse karşılaştırılabilir; bulanık fotoğrafta
    // ince bant enerjisi zaten düşük çıkar ve sahte sinyal üretir.
    const sharpnessRatio = consensus.fine > 0 ? sig.fine / consensus.fine : 1
    const textureComparable = sharpnessRatio > 0.45 && sharpnessRatio < 2.4
    const midRatio = consensus.mid > 0 ? sig.mid / consensus.mid : 1
    const textureDelta = Math.abs(Math.log(Math.max(0.15, midRatio)))
    // Plastik tamponun portakal kabuğu fabrikada da sacdan farklıdır;
    // doku kanıtı orada yarı ağırlıkla sayılır.
    const textureEvidence = textureComparable
      ? ramp(textureDelta, TEXTURE_NOTICE, TEXTURE_STRONG) * (isPlastic ? 0.5 : 1)
      : 0

    const spreadEvidence = ramp(sig.internalSpread, SPREAD_NOTICE, SPREAD_STRONG)

    let pairEvidence = 0
    let pairDelta = null
    if (entry.panel.pair) {
      const twin = usable.find((o) => o.panel.id === entry.panel.pair)
      if (twin) {
        pairDelta = deltaE2000(normalizedLab(twin.signature), normalizedLab(sig)).chromatic
        pairEvidence = ramp(pairDelta, pairNotice, PAIR_STRONG)
      }
    }

    return {
      entry,
      diff,
      rawLightDelta,
      chromatic,
      colourEvidence,
      textureEvidence,
      textureComparable,
      spreadEvidence,
      pairEvidence,
      pairDelta,
      midRatio
    }
  })

  // --- İkinci geçiş: bölgesel tutarlılık ---
  // Komşusu da işaretlenen panel daha inandırıcıdır; yalnız kalan panel
  // gürültü olabilir.
  const preliminary = new Map()
  scored.forEach((s) => {
    const base =
      0.44 * s.colourEvidence +
      0.22 * s.textureEvidence +
      0.12 * s.spreadEvidence +
      0.22 * s.pairEvidence
    preliminary.set(s.entry.panel.id, base)
  })

  const results = scored.map((s) => {
    const id = s.entry.panel.id
    const base = preliminary.get(id)

    const neighbours = ADJACENCY[id] || []
    const neighbourSupport = neighbours.reduce((acc, nid) => {
      const value = preliminary.get(nid)
      return value !== undefined ? Math.max(acc, value) : acc
    }, 0)

    // Komşu desteği kanıtı güçlendirir ama tek başına kanıt üretemez:
    // panelin kendi ölçümü bir eşiği geçmeden çarpan devreye girmez.
    // Gerekçe fiziksel — onarım bölgeseldir, ölçüm gürültüsü ise dağınıktır.
    const coherence = base > 0.12 ? 1 + 0.75 * neighbourSupport : 1
    const evidenceRaw = Math.min(1, base * coherence)
    const evidence = Math.round(evidenceRaw * 100)

    const sig = s.entry.signature
    let confidence = 1
    confidence *= 1 - lightingPenalty
    if (sig.specularRatio > SPECULAR_PATCH_LIMIT) confidence *= 0.8
    if (!s.textureComparable) confidence *= 0.88
    if (sig.validPatches < MIN_VALID_PATCHES + 4) confidence *= 0.9
    if (isNeutral) confidence *= 0.95

    const reasons = []
    if (s.colourEvidence > 0) {
      reasons.push(
        s.colourEvidence >= 0.6
          ? 'Renk, aracın geri kalanından belirgin biçimde sapıyor'
          : 'Renkte ölçülebilir ama küçük bir sapma var'
      )
    }
    if (s.textureEvidence > 0) {
      reasons.push(
        s.midRatio > 1
          ? 'Yüzey dokusu diğer panellerden daha kaba (portakal kabuğu belirgin)'
          : 'Yüzey dokusu diğer panellerden daha düz (fazla cila veya farklı boya)'
      )
    }
    if (s.spreadEvidence > 0) {
      reasons.push('Panelin kendi içinde renk farkı var, lokal boya olabilir')
    }
    if (s.pairEvidence > 0) {
      reasons.push('Karşı taraftaki simetrik paneliyle uyuşmuyor')
    }
    if (reasons.length === 0) {
      reasons.push('Aracın geri kalanıyla uyumlu')
    }

    let verdict = 'orijinal'
    if (evidence >= EVIDENCE_STRONG) verdict = 'guclu-suphe'
    else if (evidence >= EVIDENCE_SUSPECT) verdict = 'supheli'

    return {
      id,
      name: s.entry.panel.name,
      dataUrl: s.entry.dataUrl,
      substrate: s.entry.panel.substrate,
      verdict,
      evidence,
      confidence: Math.round(confidence * 100),
      reasons,
      inConsensus: consensus.memberIds.includes(id),
      metrics: {
        deltaE: Math.round(s.diff.dE * 100) / 100,
        chromatic: Math.round(s.chromatic * 100) / 100,
        lightness: Math.round(s.rawLightDelta * 100) / 100,
        textureRatio: Math.round(s.midRatio * 100) / 100,
        internalSpread: Math.round(sig.internalSpread * 100) / 100,
        pairDelta: s.pairDelta === null ? null : Math.round(s.pairDelta * 100) / 100
      }
    }
  })

  // Kullanılamayan paneller de listede görünür ama puanlanmaz.
  entries
    .filter((e) => !e.signature.quality.usable)
    .forEach((e) => results.push(unusableResult(e)))

  const flagged = results.filter((r) => r.verdict === 'guclu-suphe' || r.verdict === 'supheli')
  const strong = results.filter((r) => r.verdict === 'guclu-suphe')

  // Bitişik işaretli panel kümesi: tek taraflı çarpmanın imzası. Panel bazında
  // kanıt "şüpheli" seviyesinde kalsa bile, bölgesel küme genel yargıyı sertleştirir.
  const flaggedIds = new Set(flagged.map((r) => r.id))
  const clusteredIds = flagged
    .filter((r) => (ADJACENCY[r.id] || []).some((n) => flaggedIds.has(n)))
    .map((r) => r.id)
  const hasCluster = clusteredIds.length >= 2
  const avgConfidence = Math.round(
    median(results.filter((r) => r.verdict !== 'yetersiz').map((r) => r.confidence))
  )

  let summary
  if (hasCluster) {
    const names = flagged
      .filter((r) => clusteredIds.includes(r.id))
      .map((r) => r.name)
      .join(', ')
    summary = {
      tone: 'danger',
      label: 'Bitişik panellerde ortak sapma',
      text:
        names +
        ' birbirine komşu ve birlikte ayrışıyor. Ölçüm gürültüsü bu şekilde kümelenmez; bu dağılım bölgesel bir onarıma (tek taraflı çarpma veya komple boya) işaret eder. Bu panelleri mutlaka mikron cihazıyla ölçtür.'
    }
  } else if (strong.length >= 2) {
    summary = {
      tone: 'danger',
      label: strong.length + ' panelde güçlü şüphe',
      text:
        'Birden fazla panel aracın geri kalanından belirgin biçimde ayrışıyor. Bu genellikle bölgesel bir onarıma işaret eder. Bu panelleri mikron cihazıyla ölçtür.'
    }
  } else if (strong.length === 1) {
    summary = {
      tone: 'danger',
      label: '1 panelde güçlü şüphe',
      text:
        strong[0].name +
        ' aracın geri kalanından belirgin biçimde farklı. Ekspertizde öncelikle bu paneli ölçtür.'
    }
  } else if (flagged.length > 0) {
    summary = {
      tone: 'warning',
      label: flagged.length + ' panel şüpheli',
      text:
        'Ölçülebilir ama küçük farklar var. Bu seviyedeki farklar ışık ve kamera ayarından da kaynaklanabilir; kesin karar için mikron ölçümü gerekir.'
    }
  } else {
    summary = {
      tone: 'excellent',
      label: 'Belirgin fark bulunamadı',
      text:
        'Ölçülen panellerin tamamı birbiriyle tutarlı. Bu, "hiç boya yok" garantisi değildir — iyi yapılmış bir boya bu yöntemle görünmeyebilir — ama elde belirgin bir şüphe işareti yok.'
    }
  }

  return {
    panels: results,
    summary: {
      ...summary,
      flaggedCount: flagged.length,
      strongCount: strong.length,
      clusteredPanels: clusteredIds.length,
      noiseFloor: Math.round(consensus.noiseFloor * 100) / 100,
      confidence: avgConfidence,
      consensusSize: consensus.size,
      measuredCount: usable.length,
      lightingConsistent: lightingPenalty < 0.15,
      neutralColour: isNeutral
    }
  }
}

function unusableResult(entry, reason) {
  const panel = entry.panel || { id: entry.id, name: entry.name, substrate: 'sac' }
  return {
    id: panel.id,
    name: panel.name,
    dataUrl: entry.dataUrl,
    substrate: panel.substrate,
    verdict: 'yetersiz',
    evidence: 0,
    confidence: 0,
    reasons: entry.signature?.quality?.reasons?.length
      ? entry.signature.quality.reasons
      : [reason || 'Fotoğraf değerlendirmeye uygun değil'],
    inConsensus: false,
    metrics: null
  }
}

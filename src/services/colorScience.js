/**
 * Renk bilimi yardımcıları.
 *
 * Boya karşılaştırmasında HSL kullanmak temel bir hatadır: HSL'de "ton" (hue),
 * kırmızı-yeşil-mavi kanalları arasındaki farktan hesaplanır. Beyaz, gri ve
 * siyah araçlarda bu fark birkaç birimdir, dolayısıyla ton değeri gürültüdür —
 * tek bir gölge tonu 40 derece oynatabilir. Türkiye pazarının yarısından
 * fazlası beyaz/gri/siyah olduğu için bu, ölçümün büyük kısmını çöpe atar.
 *
 * Bu yüzden ölçüm CIELAB uzayında yapılır. CIELAB algısal olarak düzgündür:
 * iki renk arasındaki sayısal mesafe, insan gözünün gördüğü farkla orantılıdır.
 * Farklar da CIEDE2000 ile hesaplanır — endüstride boya eşleştirmesi için
 * kullanılan standart budur.
 *
 * Referans beyaz: D65 (gün ışığı).
 */

const D65 = { x: 95.047, y: 100.0, z: 108.883 }

/** sRGB kanalını (0-255) ışık şiddetiyle doğrusal hale getirir. */
function linearize(channel) {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/**
 * 0-255 sRGB değerlerini doğrusal ışığa çeviren arama tablosu.
 * Piksel piksel dolaşılan döngülerde pow() çağrısı pahalıdır.
 */
export const LINEAR_LUT = (() => {
  const table = new Float32Array(256)
  for (let i = 0; i < 256; i++) table[i] = linearize(i)
  return table
})()

/** Doğrusal RGB'nin bağıl parlaklığı (Y). */
export function relativeLuminance(lin) {
  return 0.2126729 * lin.r + 0.7151522 * lin.g + 0.072175 * lin.b
}

/**
 * Pozlama normalizasyonu.
 *
 * Aynı boyanın güneşte ve gölgede çekilmiş hâli, doğrusal ışık uzayında
 * birbirinin sabit katıdır. Bu yüzden karşılaştırmadan önce her panel ortak
 * bir parlaklığa ölçeklenir; böylece geriye kalan fark ışıktan değil boyadan
 * gelir. Bu adım olmadan gölgedeki orijinal panel, "rengi sapmış" görünür —
 * çünkü CIELAB'da parlaklık düştükçe kroma da düşer.
 */
export function scaleToLuminance(lin, targetY) {
  const y = relativeLuminance(lin)
  if (y <= 0.0001 || targetY <= 0) return lin
  const k = targetY / y
  return { r: lin.r * k, g: lin.g * k, b: lin.b * k }
}

/** Doğrusal RGB (0-1) -> CIELAB */
export function linearRgbToLab(lin) {
  const r = Math.max(0, Math.min(1, lin.r))
  const g = Math.max(0, Math.min(1, lin.g))
  const b = Math.max(0, Math.min(1, lin.b))

  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100
  const y = (r * 0.2126729 + g * 0.7151522 + b * 0.072175) * 100
  const z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) * 100

  const fx = labPivot(x / D65.x)
  const fy = labPivot(y / D65.y)
  const fz = labPivot(z / D65.z)

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  }
}

/** Doğrusal RGB listesinin kanal bazında ortancası. */
export function medianLinearRgb(values) {
  return {
    r: median(values.map((v) => v.r)),
    g: median(values.map((v) => v.g)),
    b: median(values.map((v) => v.b))
  }
}

function labPivot(t) {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
}

/** sRGB (0-255) -> CIELAB */
export function rgbToLab(r, g, b) {
  const rl = linearize(r)
  const gl = linearize(g)
  const bl = linearize(b)

  const x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) * 100
  const y = (rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175) * 100
  const z = (rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041) * 100

  const fx = labPivot(x / D65.x)
  const fy = labPivot(y / D65.y)
  const fz = labPivot(z / D65.z)

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  }
}

/** Renk doygunluğu (kroma): merkeze uzaklık. Nötr renklerde sıfıra yaklaşır. */
export function chroma(lab) {
  return Math.sqrt(lab.a * lab.a + lab.b * lab.b)
}

const deg = (rad) => (rad * 180) / Math.PI
const rad = (d) => (d * Math.PI) / 180

/**
 * CIEDE2000 renk farkı.
 *
 * Toplam farkın yanında bileşenleri de döner. Bu ayrım kritiktir:
 *   - dL bileşeni ışık farkından gelir (aynı boya, güneş/gölge).
 *   - dC ve dH bileşenleri boyanın kendisinden gelir.
 * Işığı boyadan ayırmanın tek yolu bu bileşenlere ayrı ayrı bakmaktır.
 */
export function deltaE2000(lab1, lab2) {
  const { L: L1, a: a1, b: b1 } = lab1
  const { L: L2, a: a2, b: b2 } = lab2

  const C1 = Math.sqrt(a1 * a1 + b1 * b1)
  const C2 = Math.sqrt(a2 * a2 + b2 * b2)
  const Cbar = (C1 + C2) / 2

  const Cbar7 = Math.pow(Cbar, 7)
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + Math.pow(25, 7))))

  const a1p = a1 * (1 + G)
  const a2p = a2 * (1 + G)
  const C1p = Math.sqrt(a1p * a1p + b1 * b1)
  const C2p = Math.sqrt(a2p * a2p + b2 * b2)

  const h1p = C1p === 0 ? 0 : (deg(Math.atan2(b1, a1p)) + 360) % 360
  const h2p = C2p === 0 ? 0 : (deg(Math.atan2(b2, a2p)) + 360) % 360

  const dLp = L2 - L1
  const dCp = C2p - C1p

  let dhp = 0
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p
    if (dhp > 180) dhp -= 360
    else if (dhp < -180) dhp += 360
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp) / 2)

  const Lbarp = (L1 + L2) / 2
  const Cbarp = (C1p + C2p) / 2

  let hbarp = h1p + h2p
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) > 180) hbarp += h1p + h2p < 360 ? 360 : -360
    hbarp /= 2
  }

  const T =
    1 -
    0.17 * Math.cos(rad(hbarp - 30)) +
    0.24 * Math.cos(rad(2 * hbarp)) +
    0.32 * Math.cos(rad(3 * hbarp + 6)) -
    0.2 * Math.cos(rad(4 * hbarp - 63))

  const dTheta = 30 * Math.exp(-Math.pow((hbarp - 275) / 25, 2))
  const Cbarp7 = Math.pow(Cbarp, 7)
  const Rc = 2 * Math.sqrt(Cbarp7 / (Cbarp7 + Math.pow(25, 7)))

  const Sl = 1 + (0.015 * Math.pow(Lbarp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbarp - 50, 2))
  const Sc = 1 + 0.045 * Cbarp
  const Sh = 1 + 0.015 * Cbarp * T
  const Rt = -Math.sin(rad(2 * dTheta)) * Rc

  const termL = dLp / Sl
  const termC = dCp / Sc
  const termH = dHp / Sh

  const dE = Math.sqrt(termL * termL + termC * termC + termH * termH + Rt * termC * termH)

  return {
    dE,
    termL,
    termC,
    termH,
    /**
     * Işıktan arındırılmış fark: yalnızca kroma ve ton bileşenleri.
     * Aynı boyanın güneşte ve gölgede çekilmiş iki fotoğrafında bu değer
     * küçük kalır; farklı boyada ise büyür. Kararın asıl dayanağı budur.
     */
    chromatic: Math.sqrt(termC * termC + termH * termH + Rt * termC * termH)
  }
}

/** Değer listesinin ortancası. */
export function median(values) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

/**
 * Ortancadan mutlak sapmaların ortancası (MAD).
 * Ortalama ve standart sapmanın aksine, birkaç aykırı değerden etkilenmez —
 * panellerin bir kısmı boyalıyken "normal"i bulmak tam olarak bunu gerektirir.
 */
export function medianAbsoluteDeviation(values) {
  if (!values.length) return 0
  const med = median(values)
  return median(values.map((v) => Math.abs(v - med)))
}

/** Panel imzalarının ortanca LAB değeri. */
export function medianLab(labs) {
  return {
    L: median(labs.map((l) => l.L)),
    a: median(labs.map((l) => l.a)),
    b: median(labs.map((l) => l.b))
  }
}

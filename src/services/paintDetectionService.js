export const PANELS = [
  'Ön Tampon',
  'Arka Tampon',
  'Kaput',
  'Tavan',
  'Bagaj Kapağı',
  'Sol Ön Çamurluk',
  'Sağ Ön Çamurluk',
  'Sol Arka Çamurluk',
  'Sağ Arka Çamurluk',
  'Sol Ön Kapı',
  'Sağ Ön Kapı',
  'Sol Arka Kapı',
  'Sağ Arka Kapı'
]

const MIN_PANELS_FOR_ANALYSIS = 4
const CROP_SIZE = 220

const HUE_FLAG_DEGREES = 12
const SATURATION_FLAG = 14
const LIGHTNESS_CAUTION = 16
const TEXTURE_FLAG_RATIO_LOW = 0.55
const TEXTURE_FLAG_RATIO_HIGH = 1.8

function centerCrop(img, size = CROP_SIZE) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const shortSide = Math.min(img.width, img.height)
  const sx = (img.width - shortSide) / 2
  const sy = (img.height - shortSide) / 2
  ctx.drawImage(img, sx, sy, shortSide, shortSide, 0, 0, size, size)
  return canvas
}

function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h *= 60
  }

  return { h, s: s * 100, l: l * 100 }
}

function boxBlurGray(gray, width, height, radius = 2) {
  const out = new Float32Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0
      let count = 0
      for (let dy = -radius; dy <= radius; dy++) {
        const yy = y + dy
        if (yy < 0 || yy >= height) continue
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = x + dx
          if (xx < 0 || xx >= width) continue
          sum += gray[yy * width + xx]
          count++
        }
      }
      out[y * width + x] = sum / count
    }
  }
  return out
}

function extractPanelSignature(canvas) {
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const { data } = imageData

  let rSum = 0
  let gSum = 0
  let bSum = 0
  const gray = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    rSum += r
    gSum += g
    bSum += b
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b
  }
  const pixelCount = width * height
  const avgR = rSum / pixelCount
  const avgG = gSum / pixelCount
  const avgB = bSum / pixelCount
  const hsl = rgbToHsl(avgR, avgG, avgB)

  const blurred = boxBlurGray(gray, width, height, 2)
  let residualSumSq = 0
  for (let i = 0; i < gray.length; i++) {
    const residual = gray[i] - blurred[i]
    residualSumSq += residual * residual
  }
  const textureScore = residualSumSq / gray.length

  return {
    hue: hsl.h,
    saturation: hsl.s,
    lightness: hsl.l,
    textureScore
  }
}

export function analyzePanelPhoto(img) {
  const canvas = centerCrop(img)
  return extractPanelSignature(canvas)
}

function hueDistance(a, b) {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

export function comparePanels(panels) {
  if (panels.length < MIN_PANELS_FOR_ANALYSIS) {
    return null
  }

  const medianHue = median(panels.map((p) => p.signature.hue))
  const medianSaturation = median(panels.map((p) => p.signature.saturation))
  const medianLightness = median(panels.map((p) => p.signature.lightness))
  const medianTexture = median(panels.map((p) => p.signature.textureScore))

  return panels.map((panel) => {
    const { signature } = panel
    const hueDiff = hueDistance(signature.hue, medianHue)
    const satDiff = Math.abs(signature.saturation - medianSaturation)
    const lightDiff = Math.abs(signature.lightness - medianLightness)
    const textureRatio = medianTexture > 0 ? signature.textureScore / medianTexture : 1

    const colorFlag = hueDiff > HUE_FLAG_DEGREES || satDiff > SATURATION_FLAG
    const textureFlag = textureRatio < TEXTURE_FLAG_RATIO_LOW || textureRatio > TEXTURE_FLAG_RATIO_HIGH
    const lightingUncertain = lightDiff > LIGHTNESS_CAUTION

    const reasons = []
    if (colorFlag) reasons.push('renk tonu diğer panellerden belirgin farklı')
    if (textureFlag) reasons.push('yüzey dokusu diğer panellerden belirgin farklı')

    let verdict = 'orijinal'
    if ((colorFlag || textureFlag) && !lightingUncertain) {
      verdict = 'incele'
    } else if ((colorFlag || textureFlag) && lightingUncertain) {
      verdict = 'belirsiz'
    }

    return {
      name: panel.name,
      id: panel.id,
      dataUrl: panel.dataUrl,
      verdict,
      lightingUncertain,
      reasons
    }
  })
}

export { MIN_PANELS_FOR_ANALYSIS }

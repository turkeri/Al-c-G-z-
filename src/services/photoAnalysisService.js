const BLUR_VARIANCE_THRESHOLD = 120
const DARK_BRIGHTNESS_THRESHOLD = 60
const BRIGHT_BRIGHTNESS_THRESHOLD = 205
const TEXTURE_OUTLIER_MULTIPLIER = 2.2
const MAX_DIMENSION = 800
const JPEG_QUALITY = 0.65

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export function drawToCanvas(img, maxDimension = MAX_DIMENSION) {
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.width * scale))
  canvas.height = Math.max(1, Math.round(img.height * scale))
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

export function canvasToJpeg(canvas, quality = JPEG_QUALITY) {
  return canvas.toDataURL('image/jpeg', quality)
}

function toGrayscale(imageData) {
  const { data, width, height } = imageData
  const gray = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b
  }
  return gray
}

function laplacianVariance(gray, width, height) {
  const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0]
  let sum = 0
  let sumSq = 0
  let count = 0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let value = 0
      let k = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          value += gray[(y + dy) * width + (x + dx)] * kernel[k]
          k++
        }
      }
      sum += value
      sumSq += value * value
      count++
    }
  }
  const mean = count ? sum / count : 0
  return count ? sumSq / count - mean * mean : 0
}

function analyzeBlur(gray, width, height) {
  const variance = laplacianVariance(gray, width, height)
  return { variance: Math.round(variance), isBlurry: variance < BLUR_VARIANCE_THRESHOLD }
}

function analyzeExposure(gray) {
  let sum = 0
  for (let i = 0; i < gray.length; i++) sum += gray[i]
  const brightness = gray.length ? sum / gray.length : 0
  return {
    brightness: Math.round(brightness),
    isDark: brightness < DARK_BRIGHTNESS_THRESHOLD,
    isBright: brightness > BRIGHT_BRIGHTNESS_THRESHOLD
  }
}

function analyzeTextureRegions(gray, width, height, gridSize = 4) {
  const cellW = Math.floor(width / gridSize) || 1
  const cellH = Math.floor(height / gridSize) || 1
  const cellVariances = []

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      let sum = 0
      let sumSq = 0
      let count = 0
      const yEnd = Math.min((gy + 1) * cellH, height)
      const xEnd = Math.min((gx + 1) * cellW, width)
      for (let y = gy * cellH; y < yEnd; y++) {
        for (let x = gx * cellW; x < xEnd; x++) {
          const v = gray[y * width + x]
          sum += v
          sumSq += v * v
          count++
        }
      }
      if (count > 0) {
        const mean = sum / count
        cellVariances.push(sumSq / count - mean * mean)
      }
    }
  }

  const avgVariance = cellVariances.length
    ? cellVariances.reduce((a, b) => a + b, 0) / cellVariances.length
    : 0
  const flaggedCells = cellVariances.filter((v) => v > avgVariance * TEXTURE_OUTLIER_MULTIPLIER).length

  return { avgVariance: Math.round(avgVariance), flaggedCells, totalCells: cellVariances.length }
}

export function analyzePhoto(canvas) {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const gray = toGrayscale(imageData)

  const blur = analyzeBlur(gray, canvas.width, canvas.height)
  const exposure = analyzeExposure(gray)
  const texture = analyzeTextureRegions(gray, canvas.width, canvas.height)

  const warnings = []
  if (blur.isBlurry) {
    warnings.push('Fotoğraf bulanık görünüyor, daha net bir çekim dene.')
  }
  if (exposure.isDark) {
    warnings.push('Fotoğraf karanlık çekilmiş, daha aydınlık bir ortamda tekrar çek.')
  }
  if (exposure.isBright) {
    warnings.push('Fotoğraf aşırı parlak/flaş yansımalı olabilir, detaylar seçilmeyebilir.')
  }
  if (texture.flaggedCells > 0) {
    warnings.push(
      `${texture.flaggedCells} bölgede belirgin doku farkı tespit edildi — bu kesin bir hasar/boya tespiti DEĞİLDİR, sadece o bölgeye yakından bakmanı öneren kaba bir ipucudur.`
    )
  }

  return { blur, exposure, texture, warnings }
}

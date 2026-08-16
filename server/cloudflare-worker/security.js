/** Worker giriş sınırları — istemciye güvenmeyen, bağımsız yardımcılar. */
export const MAX_REQUEST_BODY_BYTES = 10 * 1024 * 1024

/**
 * Content-Length mevcutsa sınırı aşan gövdeleri JSON ayrıştırmadan reddeder.
 * Aktarım uzunluğu bilinmiyorsa platformun kendi üst sınırları devrededir;
 * görev bazlı fotoğraf/metin sınırları ayrıştırma sonrasında yine uygulanır.
 */
export function hasAcceptableBodySize(request, maxBytes = MAX_REQUEST_BODY_BYTES) {
  const raw = request.headers.get('Content-Length')
  if (raw == null) return true
  if (!/^\d+$/.test(raw.trim())) return false
  return Number(raw) <= maxBytes
}

/**
 * Yönetici token'ı için uzunluktan bağımsız karşılaştırma. Web Crypto'nun
 * taşınabilir sabit-süre eşitlik API'si olmadığı için iki girdinin en uzunu
 * boyunca XOR uygulanır; doğrudan `===` kullanılmaz.
 */
export function constantTimeEqual(left, right) {
  const encoder = new TextEncoder()
  const a = encoder.encode(String(left ?? ''))
  const b = encoder.encode(String(right ?? ''))
  const length = Math.max(a.length, b.length)
  let difference = a.length ^ b.length

  for (let i = 0; i < length; i++) {
    difference |= (a[i] || 0) ^ (b[i] || 0)
  }
  return difference === 0
}

/**
 * HESAP VE KOTA (istemci tarafı)
 *
 * ============================================================================
 * BU DOSYA KOTA UYGULAMAZ — SADECE GÖSTERİR
 * ============================================================================
 * Kalan hak burada tutulan bir sayıya göre değil, sunucudaki kayda göre
 * belirlenir. Buradaki değerler yalnızca kullanıcıya "kaç hakkın kaldı"
 * yazabilmek içindir. İstemcide tutulan bir sayaç, uygulama verisini silmek
 * kadar kolay sıfırlanacağı için hiçbir koruma sağlamaz; asıl kontrol
 * Cloudflare Worker içinde, istek yapay zekâya gitmeden önce yapılır.
 *
 * ============================================================================
 * CİHAZ KİMLİĞİ
 * ============================================================================
 * Kullanıcıdan e-posta/şifre istemiyoruz; hesap, cihazda üretilen bir UUID'ye
 * bağlıdır. Bu bilinçli bir tercihtir: kayıt zorunluluğu, uygulamayı ilk kez
 * deneyen kullanıcının çoğunu kaybettirir.
 *
 * Bunun bedeli açıktır ve kullanıcıdan saklanmaz: uygulama verisi silinirse
 * kimlik de silinir, ücretsiz hak sıfırlanır. Gerçek kimlik doğrulama
 * gerektiğinde (ödeme alınacaksa) bu kimliğin üzerine e-posta doğrulaması
 * eklenecek şekilde tasarlandı — plan alanı sunucuda zaten hesaba bağlı.
 */

const DEVICE_KEY = 'arac-dedektifi:device-id'
const CACHE_KEY = 'arac-dedektifi:account'

/** UUID üretimi; crypto yoksa (çok eski tarayıcı) elle üretilir. */
function newUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = newUuid()
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    // Depolama kapalıysa (gizli sekme) her oturum yeni kimlik alır.
    return newUuid()
  }
}

/** Sunucuya gönderilecek başlıklar. */
export function accountHeaders() {
  return { 'X-Device-Id': getDeviceId() }
}

/** Son bilinen hesap durumu (çevrimdışıyken de gösterilebilsin diye saklanır). */
export function getCachedAccount() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setCachedAccount(account) {
  if (!account) return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(account))
  } catch {
    // Depolama doluysa önemsiz; bir sonraki istekte sunucudan gelir.
  }
}

/**
 * Hesap durumunu sunucudan tazeler. Hak DÜŞMEZ, sadece okur.
 * Sunucuya ulaşılamazsa null döner ve uygulama önbellekteki değeri kullanır.
 */
export async function fetchAccount(proxyUrl) {
  if (!proxyUrl) return null
  try {
    const response = await fetch(proxyUrl.replace(/\/$/, '') + '/account', {
      headers: accountHeaders()
    })
    if (!response.ok) return null
    const data = await response.json()
    if (data?.account) {
      setCachedAccount(data.account)
      return data.account
    }
    // Sunucuda veritabanı bağlı değilse kota takibi yoktur.
    return null
  } catch {
    return null
  }
}

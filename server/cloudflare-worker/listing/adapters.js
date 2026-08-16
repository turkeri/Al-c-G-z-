/**
 * PLATFORM ADAPTÖRLERİ
 *
 * ============================================================================
 * MİMARİ
 * ============================================================================
 * Her ilan sitesi için bir adaptör tanımlanır. Adaptör üç şey bilir:
 *
 *   match(input)   — bu girdi (link ya da ilan no) bu platforma ait mi
 *   buildUrl(id)   — ilan numarasından adres üretir
 *   parse(html)    — sayfadan araç alanlarını çıkarır
 *
 * Yeni bir site eklemek, bu dosyaya bir nesne eklemekten ibarettir; çağıran
 * taraf (fetcher.js) hiç değişmez.
 *
 * ============================================================================
 * ÖNEMLİ GERÇEK — OTOMATİK ÇEKME ŞU AN ÇALIŞMIYOR
 * ============================================================================
 * sahibinden.com ve arabam.com sunucu taraflı isteklere bot koruması uygular;
 * her ikisi de 403 döner (robots.txt dahil). Ayrıca her iki sitenin kullanım
 * şartları otomatik veri çekmeyi açıkça yasaklar.
 *
 * Bu yüzden bu adaptörler ÇALIŞIR HALDE ama devre dışı olarak durur:
 * `fetchable: false` işaretli bir adaptöre istek gönderilmez; çağıran tarafa
 * "bu platform çekilemiyor, kullanıcıdan ekran görüntüsü iste" cevabı döner.
 *
 * Parser kodu yine de yazılıdır ve test edilebilir; ileride resmî bir API,
 * iş ortaklığı ya da kullanıcının kendi oturumuyla erişim mümkün olursa tek
 * yapılacak şey `fetchable` bayrağını açmaktır.
 */

/** HTML varlıklarını çözer (&amp; &quot; &#39; ...). */
function decodeEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function stripTags(html) {
  return decodeEntities(String(html || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

/**
 * Sayfadaki JSON-LD (schema.org) bloklarını toplar.
 *
 * İlan siteleri arama motorları için bu bloğu koyar; içinde marka, model, yıl,
 * kilometre ve fiyat yapısal olarak bulunur. HTML sınıf adlarına bakmaktan çok
 * daha dayanıklıdır — site tasarımını değiştirse de bu blok kalır.
 */
export function extractJsonLd(html) {
  const out = []
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  for (const match of String(html || '').matchAll(pattern)) {
    try {
      const parsed = JSON.parse(decodeEntities(match[1].trim()))
      if (Array.isArray(parsed)) out.push(...parsed)
      else out.push(parsed)
    } catch {
      // Bozuk JSON-LD yoksayılır; diğer yöntemler devreye girer.
    }
  }
  return out
}

/** Open Graph / meta etiketleri — JSON-LD yoksa ikinci kaynak. */
export function extractMeta(html) {
  const out = {}
  const pattern = /<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]+content=["']([^"']*)["']/gi
  for (const match of String(html || '').matchAll(pattern)) {
    out[match[1].toLowerCase()] = decodeEntities(match[2])
  }
  return out
}

/**
 * "Etiket: Değer" biçimindeki özellik tablolarını çıkarır.
 *
 * İlan sitelerinde teknik özellikler <li><strong>Yakıt</strong><span>Dizel</span></li>
 * gibi yapılarda durur. Sınıf adına bağlanmak kırılgan olduğu için, komşu iki
 * metin düğümünü eşleştiren genel bir yaklaşım kullanılır.
 */
export function extractPairs(html) {
  const out = {}
  const source = String(html || '')

  // <li> / <div> içinde ardışık iki etiketli metin
  const pattern = /<(?:li|div|tr)[^>]*>\s*<[^>]+>([^<]{2,40})<\/[^>]+>\s*<[^>]+>([^<]{1,60})<\/[^>]+>/gi
  for (const match of source.matchAll(pattern)) {
    const key = stripTags(match[1]).replace(/\s*:\s*$/, '')
    const value = stripTags(match[2])
    if (key && value) out[key.toLocaleLowerCase('tr')] = value
  }
  return out
}

/** Türkçe alan adlarını uygulamanın alan adlarına eşler. */
const FIELD_MAP = {
  marka: 'brand',
  seri: 'series',
  model: 'model',
  yıl: 'year',
  'model yılı': 'year',
  paket: 'packageName',
  'donanım paketi': 'packageName',
  'yakıt': 'fuelType',
  'yakit': 'fuelType',
  'yakıt tipi': 'fuelType',
  vites: 'transmission',
  'vites tipi': 'transmission',
  'araç durumu': 'condition',
  'kilometre': 'km',
  'km': 'km',
  'kasa tipi': 'bodyType',
  'motor gücü': 'power',
  'motor hacmi': 'displacement',
  'çekiş': 'drivetrain',
  renk: 'color',
  il: 'city',
  şehir: 'city',
  sehir: 'city',
  fiyat: 'price',
  'garanti': 'warranty',
  'ağır hasar kayıtlı': 'heavyDamage',
  'plaka / uyruk': 'plate',
  'kimden': 'sellerType',
  'takas': 'trade',
  'boya-değişen': 'paintInfo'
}

function normalizeNumber(value) {
  const digits = String(value || '').replace(/[^\d]/g, '')
  return digits ? Number(digits) : null
}

/**
 * Bir ilan sayfasının HTML'inden ortak araç alanlarını çıkarır.
 * Platformdan bağımsızdır: önce JSON-LD, sonra meta, sonra özellik tablosu.
 */
export function parseGenericListing(html) {
  const result = { fields: {}, photos: [], description: '', source: [] }

  // --- 1) JSON-LD ---------------------------------------------------------
  for (const node of extractJsonLd(html)) {
    const type = String(node['@type'] || '').toLowerCase()
    if (!['product', 'vehicle', 'car', 'offer'].includes(type)) continue
    result.source.push('json-ld')

    if (node.brand) result.fields.brand = typeof node.brand === 'string' ? node.brand : node.brand.name
    if (node.model) result.fields.model = String(node.model)
    if (node.vehicleModelDate || node.modelDate) {
      result.fields.year = String(node.vehicleModelDate || node.modelDate)
    }
    if (node.mileageFromOdometer) {
      result.fields.km = String(normalizeNumber(node.mileageFromOdometer.value ?? node.mileageFromOdometer))
    }
    if (node.fuelType) result.fields.fuelType = String(node.fuelType)
    if (node.vehicleTransmission) result.fields.transmission = String(node.vehicleTransmission)
    if (node.color) result.fields.color = String(node.color)
    if (node.description) result.description = stripTags(node.description)

    const offer = node.offers || node.offer
    if (offer) {
      const price = Array.isArray(offer) ? offer[0]?.price : offer.price
      if (price) result.fields.price = String(normalizeNumber(price))
    }

    const image = node.image
    if (image) {
      const list = Array.isArray(image) ? image : [image]
      list.forEach((img) => {
        const url = typeof img === 'string' ? img : img?.url
        if (url) result.photos.push(url)
      })
    }
  }

  // --- 2) Meta etiketleri --------------------------------------------------
  const meta = extractMeta(html)
  if (Object.keys(meta).length) {
    if (!result.description && meta['og:description']) {
      result.description = meta['og:description']
      result.source.push('meta')
    }
    if (!result.photos.length && meta['og:image']) {
      result.photos.push(meta['og:image'])
    }
    if (!result.fields.title && meta['og:title']) result.fields.title = meta['og:title']
  }

  // --- 3) Özellik tablosu ---------------------------------------------------
  const pairs = extractPairs(html)
  let pairHits = 0
  for (const [key, value] of Object.entries(pairs)) {
    const field = FIELD_MAP[key]
    if (!field || result.fields[field]) continue
    result.fields[field] = field === 'km' || field === 'price' ? String(normalizeNumber(value)) : value
    pairHits++
  }
  if (pairHits) result.source.push('ozellik-tablosu')

  return result
}

// ============================================================================
// ADAPTÖRLER
// ============================================================================

export const ADAPTERS = [
  {
    id: 'sahibinden',
    label: 'sahibinden.com',
    /*
     * Kapalı: sunucu taraflı isteklere bot koruması uygulanıyor (403) ve
     * kullanım şartları otomatik veri çekmeyi yasaklıyor. Bayrak açılmadıkça
     * bu adaptöre istek gönderilmez.
     */
    fetchable: false,
    blockedReason:
      'sahibinden.com sunucu taraflı isteklere izin vermiyor ve kullanım şartları otomatik veri çekmeyi yasaklıyor.',
    hostPattern: /(^|\.)sahibinden\.com$/i,
    idPattern: /\b(\d{9,12})\b/,
    buildUrl: (id) => `https://www.sahibinden.com/ilan/${id}/detay`,
    parse: parseGenericListing
  },
  {
    id: 'arabam',
    label: 'arabam.com',
    fetchable: false,
    blockedReason: 'arabam.com sunucu taraflı isteklere bot koruması uyguluyor.',
    hostPattern: /(^|\.)arabam\.com$/i,
    idPattern: /\b(\d{7,10})\b/,
    buildUrl: (id) => `https://www.arabam.com/ilan/${id}`,
    parse: parseGenericListing
  },
  {
    id: 'letgo',
    label: 'letgo',
    fetchable: false,
    blockedReason: 'letgo ilan sayfaları sunucu taraflı okumaya kapalı.',
    hostPattern: /(^|\.)letgo\.com$/i,
    idPattern: /\b(\d{6,12})\b/,
    buildUrl: (id) => `https://www.letgo.com/item/${id}`,
    parse: parseGenericListing
  }
]

export function adapterById(id) {
  return ADAPTERS.find((a) => a.id === id) || null
}

/**
 * Kullanıcının yazdığı şeyi çözer.
 *
 * Kabul edilenler:
 *   tam link            https://www.sahibinden.com/ilan/.../1234567890/detay
 *   çıplak ilan numarası 1234567890  (platform belirtilmemişse sahibinden varsayılır)
 */
export function resolveInput(raw, defaultPlatform = 'sahibinden') {
  const input = String(raw || '').trim()
  if (!input) return { ok: false, error: 'Boş girdi' }

  // Link mi?
  if (/^https?:\/\//i.test(input)) {
    let url
    try {
      url = new URL(input)
    } catch {
      return { ok: false, error: 'Bağlantı okunamadı' }
    }
    // Adaptörler yalnızca açıkça tanımlı HTTPS platformlarına gider. Bu
    // sınır, ileride bir adaptör açıldığında kullanıcı girdisinin yerel ağ
    // veya düz HTTP uçlarına yönelmesini engeller.
    if (url.protocol !== 'https:') {
      return { ok: false, error: 'Yalnızca HTTPS ilan bağlantıları kabul edilir' }
    }
    const adapter = ADAPTERS.find((a) => a.hostPattern.test(url.hostname))
    if (!adapter) {
      return { ok: false, error: 'Bu site desteklenmiyor: ' + url.hostname }
    }
    const idMatch = url.pathname.match(adapter.idPattern)
    return {
      ok: true,
      adapter,
      listingId: idMatch ? idMatch[1] : null,
      url: input
    }
  }

  // Çıplak numara
  const digits = input.replace(/\D/g, '')
  if (digits.length >= 6 && digits.length <= 12) {
    const adapter = adapterById(defaultPlatform) || ADAPTERS[0]
    return { ok: true, adapter, listingId: digits, url: adapter.buildUrl(digits) }
  }

  return { ok: false, error: 'İlan numarası ya da bağlantı gibi görünmüyor' }
}

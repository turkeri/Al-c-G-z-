import { FUEL_TYPES } from '../utils/constants'
import { getBrands, getModelsByBrand, getEngineNames } from './catalogAdapter'
import { getPackagesFor } from '../data/catalog'

/**
 * İLAN METNİ AYRIŞTIRICI
 *
 * İlan başlığı/açıklaması serbest metindir; buradan marka, model, motor, yıl,
 * kilometre ve fiyat çıkarılır.
 *
 * ============================================================================
 * NEDEN BASİT "includes" YETMİYOR
 * ============================================================================
 * Marka adları kısa olabilir ve başka kelimelerin İÇİNDE geçer:
 *
 *   "DS"  -> "DSG" şanzıman adının içinde
 *   "MG"  -> başka kelimelerde
 *   "Seat"-> İngilizce açıklamalarda
 *
 * Bu yüzden eşleşme KELİME SINIRI ile yapılır ve birden fazla aday varsa en
 * uzun olan kazanır ("Mercedes-Benz", "Mercedes"ten önce gelir). Aksi halde
 * "Volkswagen Golf 1.6 TDI DSG" ilanı DS marka olarak okunuyordu.
 */

const TRANSMISSION_KEYWORDS = [
  'DSG',
  'S tronic',
  'Tiptronic',
  'Multitronic',
  '7G-DCT',
  'CVT',
  'e-CVT',
  'Yarı Otomatik',
  'Otomatik',
  'Manuel'
]

/** İlanlarda sık kullanılan kısaltmalar. */
const BRAND_ALIASES = [
  ['vw', 'Volkswagen'],
  ['mercedes', 'Mercedes-Benz'],
  ['merc', 'Mercedes-Benz'],
  ['citroen', 'Citroën'],
  ['alfa', 'Alfa Romeo'],
  ['range rover', 'Land Rover']
]

function normalize(text) {
  return String(text || '').toLocaleLowerCase('tr')
}

function parseNumber(raw) {
  return Number(String(raw).replace(/[.,]/g, ''))
}

/** Regex'te özel anlamı olan karakterleri kaçırır (örn. "C-HR", "A3"). */
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Adayı metinde KELİME OLARAK arar.
 *
 * Sınır olarak \b kullanılmaz: "Citroën" gibi aksanlı ve "C-HR" gibi tireli
 * adlarda \b beklenmedik yerlerde eşleşir. Onun yerine adayın önünde ve
 * ardında harf/rakam olmaması şart koşulur.
 */
function matchesAsWord(haystack, candidate) {
  const value = normalize(candidate).trim()
  if (!value) return false
  const pattern = new RegExp(`(^|[^0-9a-zçğıöşü])${escapeRegex(value)}([^0-9a-zçğıöşü]|$)`, 'i')
  return pattern.test(haystack)
}

/** Adaylar içinde metinde geçen EN UZUN olanı döner (en belirgin eşleşme). */
function findLongestMatch(haystack, candidates) {
  return (
    candidates
      .slice()
      .sort((a, b) => b.length - a.length)
      .find((candidate) => matchesAsWord(haystack, candidate)) || null
  )
}

/*
 * Motor adında geçen yaygın son ekler. Liste uzun tutulur çünkü buradaki bir
 * eksik, o motorun kronik arızalarının analize hiç girmemesi demektir.
 */
const ENGINE_SUFFIXES =
  'tdi|tsi|tfsi|fsi|dci|cdi|cgi|hdi|bluehdi|crdi|tdci|ecoboost|ecoblue|vti|thp|puretech|gdi|mpi|' +
  't-gdi|tgdi|vvt-i|dual vvt-i|valvematic|d-4d|skyactiv|jtd|jtdm|multijet|cdti|vcdi|ddis|di-d|' +
  'sce|tce|dig-t|ig-t|i-vtec|vtec|i-ctdi|i-dtec|kompressor|hybrid|hibrit|e-tech|blue dci|xdi|ed4|td4'

/**
 * Serbest metinden motor adı ya da ticari kod çıkarır.
 * Bulamazsa null döner; uydurma yapılmaz.
 */
export function extractEngineHint(text) {
  const source = String(text || '')

  // 1) Hacim + son ek — en güvenilir biçim ("1.6 TDI", "2.0 Multijet")
  const volume = source.match(new RegExp(`\\b(\\d\\.\\d)\\s*(${ENGINE_SUFFIXES})\\b`, 'i'))
  if (volume) return `${volume[1]} ${volume[2]}`.replace(/\s+/g, ' ')

  /*
   * 2) Ticari kod — BMW/Mercedes ilanlarının standardı.
   *    Kodun önünde seri harfi olabilir: "C200 CDI", "E220d", "A180d".
   *    Bu yüzden rakamdan önce isteğe bağlı bir harf kabul edilir; yoksa
   *    "C200" içindeki "200" kelime sınırı olmadığı için hiç yakalanmıyordu.
   */
  const designation = source.match(/\b([a-z]?)(\d{3})\s?(d|i|cdi|cgi|dci)\b/i)
  if (designation) {
    const suffix = designation[3].toLowerCase()
    const joiner = suffix === 'd' || suffix === 'i' ? '' : ' '
    return `${designation[2]}${joiner}${designation[3]}`
  }

  // 3) Yalnız hacim + yakıt sözcüğü ("1.6 dizel")
  const plain = source.match(/\b(\d\.\d)\s*(dizel|benzin|hibrit)\b/i)
  if (plain) return `${plain[1]} ${plain[2]}`

  return null
}

export function parseListingText(text) {
  const found = {}
  if (!text || !text.trim()) return found

  const normalized = normalize(text)

  // --- Marka ---------------------------------------------------------------
  let brand = findLongestMatch(normalized, getBrands())

  if (!brand) {
    const alias = BRAND_ALIASES.find(([key]) => matchesAsWord(normalized, key))
    // Takma ad ancak karşılığı veritabanında varsa kabul edilir.
    if (alias && getBrands().includes(alias[1])) brand = alias[1]
  }

  if (brand) {
    found.brand = brand

    const model = findLongestMatch(normalized, getModelsByBrand(brand))
    if (model) {
      found.model = model

      const engine = findLongestMatch(normalized, getEngineNames(brand, model))
      if (engine) found.engine = engine
    }
  }

  /*
   * --- Motor ipucu ---------------------------------------------------------
   *
   * Yukarıdaki motor eşleşmesi yalnızca marka VE model bulunduğunda çalışır.
   * Oysa ilanların çoğu modeli katalogdaki adıyla yazmaz: "BMW 320d 2012"
   * ilanında model "3 Serisi" diye geçmez, bu yüzden motor da boş kalırdı ve
   * o aracın en bilinen riski (N47 zincir sorunu) analize hiç girmezdi.
   *
   * Bu yüzden motor adı metinden bağımsız olarak da aranır:
   *   hacim + son ek   "1.6 TDI", "2.0 dCi", "1.5 EcoBoost"
   *   ticari kod       "320d", "220 CDI", "118i"
   */
  if (!found.engine) {
    const hint = extractEngineHint(text)
    if (hint) found.engine = hint
  }

  // --- Sayısal alanlar ------------------------------------------------------
  const yearMatch = text.match(/\b(19[5-9]\d|20[0-4]\d)\b/)
  if (yearMatch) found.year = yearMatch[1]

  /*
   * --- Donanım paketi ------------------------------------------------------
   *
   * Paket adı ilan başlığında geçer ("Golf 1.6 TDI Comfortline") ve donanım
   * beklentisini doğrudan belirler. Yıl bu noktada okunmuş olduğu için paket
   * adayları yıla göre daraltılabilir.
   *
   * Yalnızca katalogda KAYITLI paket adları aranır; serbest bir kelimeyi paket
   * sanıp kullanıcıya olmayan donanım listesi göstermek en kötü sonuçtur.
   */
  if (found.brand) {
    const packages = getPackagesFor(found.brand, found.model, found.year)
    const names = packages.flatMap((p) => p.name.split('/').map((n) => n.trim())).filter(Boolean)
    const match = findLongestMatch(normalized, names)
    if (match) found.packageName = match
  }

  const kmMatch = text.match(/(\d{1,3}(?:[.,]\d{3})+|\d{4,6})\s*km\b/i)
  if (kmMatch) found.km = String(parseNumber(kmMatch[1]))

  const priceMatch = text.match(/(\d{1,3}(?:[.,]\d{3})+|\d{5,9})\s*(?:TL|₺)/i)
  if (priceMatch) found.price = String(parseNumber(priceMatch[1]))

  const fuelType = FUEL_TYPES.find((f) => matchesAsWord(normalized, f))
  if (fuelType) found.fuelType = fuelType

  const transmission = findLongestMatch(normalized, TRANSMISSION_KEYWORDS)
  if (transmission) found.transmission = transmission

  return found
}

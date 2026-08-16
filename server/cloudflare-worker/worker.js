/**
 * Araç Dedektifi — AI analiz proxy'si (Cloudflare Worker)
 *
 * Bu worker, uygulamanın arıza analizi isteklerini Google Gemini API'sine iletir.
 * API anahtarı YALNIZCA burada (Cloudflare secret olarak) durur; mobil uygulamanın
 * içine gömülmez. APK açılıp anahtar çalınamaz.
 *
 * Kurulum için: server/README.md
 */

import { fetchListing, listPlatforms } from './listing/fetcher.js'
import { constantTimeEqual, hasAcceptableBodySize } from './security.js'
import { authenticateRequest } from './auth.js'
import { findUserForAuth, linkDeviceData } from './ownership.js'
import { pullSync, pushSync, syncUserId } from './sync.js'
import { adminActor, announcementDates, audit, SETTINGS, textSafe } from './admin.js'
import { handlePublicCatalog } from './catalog/public.js'
import { handleAdminCatalog } from './catalog/admin.js'

/**
 * Google zaman zaman model adlarını değiştirip eskilerini kapatıyor.
 * Bu yüzden tek bir isme bağlı kalmıyoruz: aşağıdaki adaylar sırayla denenir,
 * çalışan ilk model bulunup hafızada tutulur. Böylece bir model kapansa bile
 * servis kendiliğinden diğerine geçer ve uygulama bozulmaz.
 */
// Hızlı ("lite") modeller başta: yeni nesil modellerde varsayılan "düşünme"
// modu yanıtı çok yavaşlatıyor, bu kullanımda gerekmiyor.
// Not: Bu liste, hesapta gerçekten kullanılabilir olduğu doğrulanan modellerden
// oluşur (GET ?debug=models ile listelenebilir). Hızlı "lite" modeller başta;
// biri yoğunsa (503) sıradaki denenir, böylece tek bir modelin yoğunluğu
// servisi durdurmaz.
const MODEL_CANDIDATES = [
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-3.5-flash'
]

// Sürüm damgası: doğru kodun yayına alınıp alınmadığını kontrol etmek için.
// Tarayıcıdan worker adresini açınca bu numara görünür.
const VERSION = 9

// Çalıştığı doğrulanan model (worker örneği hayatta olduğu sürece hatırlanır)
let cachedWorkingModel = null

const MAX_COMPLAINT_LENGTH = 1200
const REQUEST_TIMEOUT_MS = 30000

// Basit hız limiti: aynı IP için dakikada kaç istek
const RATE_LIMIT_PER_MINUTE = 12

// Görsel inceleme sınırları. İstemci fotoğrafı 800 piksele küçültüp
// JPEG'e çevirir; bu boyutta bir fotoğraf base64 olarak ~150-250 KB tutar.
const MAX_PHOTOS = 6
const MAX_PHOTO_BYTES = 900000

const STR = { type: 'string' }
const STR_LIST = { type: 'array', items: STR }

const ORTAK_KURALLAR = `
KURALLAR:
- Emin olmadığın şeyi kesinmiş gibi söyleme; "olası", "kontrol edilmeli" gibi ifadeler kullan.
- Güvenlik riski varsa (fren, direksiyon, yangın, hararet, şasi) açıkça uyar.
- Maliyet aralıklarını Türkiye 2026 fiyatlarıyla ve gerçekçi ver, abartma.
- Kısa, sade ve anlaşılır Türkçe yaz; teknik terimi kullanırsan parantezle açıkla.
- Yanıtın sadece istenen JSON şemasında olsun.`

function vehicleLine(v) {
  if (!v?.brand) return 'Araç bilgisi verilmedi'
  return `${v.brand} ${v.model || ''} ${v.year || ''} ${v.engine || ''} ${v.fuelType || ''} ${v.transmission || ''} ${v.km ? v.km + ' km' : ''}`
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Her görev kendi şeması ve kendi istemiyle tanımlanır.
 * Uygulama isteğinde "task" alanıyla hangisinin çalışacağını belirtir.
 */
const TASKS = {
  /* Şikayetten arıza teşhisi */
  diagnosis: {
    schema: {
      type: 'object',
      properties: {
        summary: STR,
        causes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              cause: STR, likelihood: STR, solution: STR, estimatedCost: STR, urgency: STR
            },
            required: ['cause', 'likelihood', 'solution', 'urgency']
          }
        },
        checks: STR_LIST,
        askMechanic: STR_LIST
      },
      required: ['summary', 'causes']
    },
    prompt: (b) => {
      const known = (b.localFindings?.knownProblems || [])
        .map((p) => `- ${p.title} (${p.risk} risk, ${p.checkKm} km)`).join('\n')
      const matched = (b.localFindings?.matchedSymptoms || []).map((s) => `- ${s}`).join('\n')
      return `Sen Türkiye'de çalışan, deneyimli bir oto ustasısın. Kullanıcı aracındaki şikayeti anlatıyor.

ARAÇ: ${vehicleLine(b.vehicle)}

ŞİKAYET: "${b.complaint}"
${known ? `\nBU MOTORDA BİLİNEN KRONİK SORUNLAR:\n${known}` : ''}
${matched ? `\nÖN ANALİZDE EŞLEŞEN BELİRTİLER:\n${matched}` : ''}

GÖREVİN:
1. En olası nedenleri sırala (en fazla 5, en olasıdan başla). Her biri için olasılık ("Yüksek"/"Orta"/"Düşük"), çözüm, tahmini maliyet ve aciliyet ("Yüksek"/"Orta"/"Düşük") ver.
2. Ustada baktırılacak kontrol maddelerini listele.
3. Kullanıcının ustaya sorması gereken soruları listele.
${ORTAK_KURALLAR}`
    }
  },

  /* Veritabanımızda olmayan araç hakkında bilgi */
  'vehicle-info': {
    schema: {
      type: 'object',
      properties: {
        overview: STR,
        reliability: STR,
        commonProblems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: STR, risk: STR, description: STR, solution: STR, estimatedCost: STR, checkKm: STR
            },
            required: ['title', 'risk', 'description']
          }
        },
        inspectionChecklist: STR_LIST,
        avgFuelConsumption: STR,
        buyAdvice: STR,
        verdict: STR
      },
      required: ['overview', 'commonProblems', 'buyAdvice', 'verdict']
    },
    prompt: (b) => `Sen Türkiye ikinci el piyasasını iyi bilen bir oto uzmanısın.

SORULAN ARAÇ: ${vehicleLine(b.vehicle)}

GÖREVİN:
1. Bu araç hakkında kısa bir genel değerlendirme yaz (overview).
2. Güvenilirliğini yorumla (reliability) — Türkiye şartlarında, yedek parça bulunabilirliği ve servis maliyeti dahil.
3. Bu model ve motorun BİLİNEN KRONİK SORUNLARINI listele (commonProblems). Her biri için: başlık, risk seviyesi ("Yüksek"/"Orta"/"Düşük"), açıklama, çözüm önerisi, tahmini maliyet ve hangi kilometrede kontrol edilmeli.
4. Satın almadan önce mutlaka kontrol edilecekleri listele (inspectionChecklist).
5. Ortalama yakıt tüketimini yaz (avgFuelConsumption, örn. "5.2 L/100km").
6. Alınır mı, kime tavsiye edilir, neye dikkat edilmeli (buyAdvice).
7. verdict alanına sadece şunlardan biri: "al" / "dikkatli" / "alma"

Bu araç hakkında gerçekten bilgin yoksa bunu overview içinde açıkça belirt, uydurma bilgi verme.
${ORTAK_KURALLAR}`
  },

  /* Analiz sonucu üzerine yorum ve alım tavsiyesi */
  verdict: {
    schema: {
      type: 'object',
      properties: {
        opinion: STR,
        problemAssessment: STR,
        buyAdvice: STR,
        negotiationTips: STR_LIST,
        redFlags: STR_LIST
      },
      required: ['opinion', 'buyAdvice']
    },
    prompt: (b) => {
      const a = b.analysis || {}
      const problems = (a.knownProblems || [])
        .map((p) => `- ${p.title} (${p.risk} risk, ${p.checkKm} km, tahmini ${p.estimatedCost || '?'})`).join('\n')
      return `Sen ikinci el araç alımında danışmanlık yapan bir uzmansın. Kullanıcı bir aracı incelemiş, elindeki verilere göre ona yorum yapacaksın.

ARAÇ: ${vehicleLine(b.vehicle)}
İLAN FİYATI: ${b.vehicle?.price || 'belirtilmedi'} TL
RİSK SKORU: ${a.score ?? '?'}/100 (${a.bandLabel || ''})
PİYASA DURUMU: ${a.marketLabel || 'hesaplanamadı'}${a.marketDiffPercent != null ? ` (piyasaya göre %${a.marketDiffPercent})` : ''}
ORTALAMA YAKIT: ${a.avgFuelConsumption ? a.avgFuelConsumption + ' L/100km' : 'bilinmiyor'}
${problems ? `\nBU MOTORUN BİLİNEN KRONİK SORUNLARI:\n${problems}` : ''}

GÖREVİN:
1. opinion: Bu araç bu fiyata, bu kilometrede, bu yaşta mantıklı mı? Genel yorumun.
2. problemAssessment: Yukarıdaki kronik sorunlar ne kadar ciddi? Hangileri gerçekten korkutucu, hangileri normal bakım kalemi? Kullanıcı bunlardan hangisine öncelik vermeli?
3. buyAdvice: Net tavsiyen — alsın mı, neye bakıp alsın, hangi durumda vazgeçsin.
4. negotiationTips: Pazarlıkta kullanabileceği somut argümanlar (madde madde).
5. redFlags: Bu aracı görmeye gittiğinde görürse HEMEN vazgeçmesi gereken durumlar (madde madde).
${ORTAK_KURALLAR}`
    }
  },

  /* İlan ekran görüntüsünden alanları okuma (OCR + anlama) */
  'listing-vision': {
    /*
     * Otomatik çekme kapalı olduğu için asıl çalışan yol budur: kullanıcı ilan
     * sayfasının ekran görüntüsünü yükler, model görseldeki metni okuyup
     * yapılandırılmış alanlara çevirir.
     *
     * Kritik kural: görselde OLMAYAN alanı doldurmaz. Boş bırakır. Uydurulmuş
     * bir kilometre ya da fiyat, tüm analizi sessizce bozar.
     */
    schema: {
      type: 'object',
      properties: {
        brand: STR, model: STR, packageName: STR, year: STR, bodyType: STR,
        km: STR, engine: STR, displacement: STR, power: STR, fuelType: STR,
        transmission: STR, color: STR, price: STR, city: STR, sellerType: STR,
        damageRecord: STR, paintInfo: STR, description: STR,
        readFields: STR_LIST,
        missingFields: STR_LIST
      },
      required: ['readFields', 'missingFields']
    },
    parts: (b) => {
      const text = `Sen bir ilan sayfası ekran görüntüsünü okuyup yapılandırılmış veriye çeviren bir okuyucusun.

GÖREVİN: Görseldeki ikinci el araç ilanından aşağıdaki alanları OKU.

MUTLAK KURAL: Görselde AÇIKÇA YAZMAYAN hiçbir alanı doldurma, boş bırak.
Tahmin yürütme, akıl yürütme, "muhtemelen" deme. Uydurulmuş tek bir kilometre
ya da fiyat, sonraki tüm analizi sessizce bozar. Emin değilsen boş bırak.

ALANLAR:
- brand: marka (örn. Volkswagen)
- model: model (örn. Golf)
- packageName: donanım paketi / versiyon (örn. Comfortline, Dynamic)
- year: model yılı (4 hane)
- bodyType: kasa tipi (Sedan, Hatchback, SUV...)
- km: kilometre, SADECE rakam (nokta/virgül olmadan)
- engine: motor adı (örn. 1.6 TDI)
- displacement: motor hacmi (örn. 1598 cc)
- power: beygir gücü (örn. 110 hp)
- fuelType: yakıt (Benzin/Dizel/LPG/Hibrit/Elektrik)
- transmission: şanzıman (Manuel/Otomatik/DSG/...)
- color: renk
- price: fiyat, SADECE rakam
- city: şehir/ilçe
- sellerType: Sahibinden / Galeriden / Yetkili bayiden
- damageRecord: hasar kaydı / tramer ile ilgili yazan her şey (aynen aktar)
- paintInfo: boya-değişen ile ilgili yazan her şey (aynen aktar)
- description: satıcı açıklamasından okunabilen kısım

Ayrıca:
- readFields: gerçekten okuyabildiğin alan adlarının listesi
- missingFields: görselde bulunmayan, bu yüzden boş bıraktığın alan adları

Yanıtın sadece istenen JSON şemasında olsun.`

      const parts = [{ text }]
      ;(b.photos || []).forEach((photo) => {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: photo.data } })
      })
      return parts
    }
  },

  /* Fotoğraflardan görsel inceleme (Gemini Vision) */
  'photo-inspect': {
    /*
     * ============================================================
     * BU GÖREVİN EN ÖNEMLİ KURALI
     * ============================================================
     * Fotoğraftan "bu panel boyalıdır" DENEMEZ. Boya tespiti mikron
     * (kalınlık) ölçümüyle yapılır; fotoğraf bunu ölçemez. Model
     * yalnızca GÖRDÜĞÜNÜ anlatır, bir ŞÜPHE SEVİYESİ verir ve
     * doğrulanması gerekenleri söyler.
     *
     * Bu sınır hem istemde, hem şemada (suspicion alanı "kesin"
     * değerini kabul etmez), hem de ekranda tekrarlanır.
     */
    schema: {
      type: 'object',
      properties: {
        summary: STR,
        panels: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              panel: STR,
              suspicion: STR,        // "düşük" | "orta" | "yüksek" | "değerlendirilemedi"
              observations: STR_LIST,
              photoQuality: STR
            },
            required: ['panel', 'suspicion', 'observations']
          }
        },
        recommendations: STR_LIST,
        limitations: STR
      },
      required: ['summary', 'panels', 'recommendations', 'limitations']
    },
    parts: (b) => {
      const panels = (b.photos || []).map((p) => p.panel).join(', ')
      const local = (b.localFindings || []).map((f) => `- ${f.panel}: ${f.note}`).join('\n')

      const text = `Sen boya ve kaporta işlerinden anlayan, dikkatli bir oto ekspertiz teknisyenisin.
Kullanıcı bir aracın panellerinin fotoğraflarını gönderdi.

ARAÇ: ${vehicleLine(b.vehicle)}
GÖNDERİLEN PANELLER: ${panels || 'belirtilmedi'}
${local ? `\nCİHAZDAKİ ÖLÇÜM MOTORUNUN BULGULARI:\n${local}` : ''}

MUTLAK KURAL — BUNU ÇİĞNEME:
Fotoğrafa bakarak "bu panel boyalıdır", "bu parça değişmiştir" DEME. Boya tespiti
mikron (kalınlık) ölçüm cihazıyla yapılır; fotoğraf kalınlık ölçemez. Işık, gölge,
kamera beyaz dengesi ve yansıma, boya farkından daha büyük görsel fark yaratır.
Senin işin hüküm vermek değil, NEYE BAKILMASI GEREKTİĞİNİ söylemek.

GÖREVİN:
1. summary: Fotoğrafların genel olarak ne gösterdiğini 2-3 cümleyle anlat.
2. panels: Her panel için:
   - panel: panelin adı
   - suspicion: sadece şunlardan biri -> "düşük" / "orta" / "yüksek" / "değerlendirilemedi"
     (fotoğraf bulanık, karanlık, aşırı yansımalı veya panel çerçeveye sığmamışsa
      "değerlendirilemedi" yaz; tahmin yürütme)
   - observations: SADECE GÖRDÜĞÜN somut şeyler. Örnekler: renk tonu komşu panelden
     farklı görünüyor, yüzeyde portakal kabuğu dokusu var, fitil/conta kenarında
     boya taşması izlenimi var, panel arası boşluk eşit değil, yansıma çizgisi
     panelde kırılıyor, yüzeyde toz/çapak izi var. Gördüğün bir şey yoksa bunu yaz.
   - photoQuality: fotoğrafın değerlendirmeye uygun olup olmadığı ve neden.
3. recommendations: Kullanıcının araç başında YAPMASI gerekenler (mikron ölçümü nereden
   alınmalı, hangi panelin hangi noktasına bakılmalı, satıcıya ne sorulmalı).
4. limitations: Bu incelemenin neden kesin sonuç OLMADIĞINI kullanıcıya açıkla.
${ORTAK_KURALLAR}`

      const parts = [{ text }]
      ;(b.photos || []).forEach((photo) => {
        parts.push({ text: `PANEL: ${photo.panel}` })
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: photo.data } })
      })
      return parts
    }
  },

  /* İki araç arasında tercih */
  compare: {
    schema: {
      type: 'object',
      properties: {
        winner: STR,
        recommendation: STR,
        reasoning: STR_LIST,
        firstSuitableFor: STR,
        secondSuitableFor: STR,
        watchOut: STR_LIST
      },
      required: ['winner', 'recommendation', 'reasoning']
    },
    prompt: (b) => {
      const side = (s, label) => {
        const problems = (s.knownProblems || []).map((p) => `  - ${p.title} (${p.risk})`).join('\n')
        return `${label}: ${vehicleLine(s)}
  İlan fiyatı: ${s.price || '?'} TL
  Risk skoru: ${s.score ?? '?'}/100
  Piyasa durumu: ${s.marketLabel || '?'}
  Ortalama yakıt: ${s.avgFuelConsumption ? s.avgFuelConsumption + ' L/100km' : '?'}
  Kasa/segment: ${s.bodyType || '?'} / ${s.segment || '?'}
${problems ? `  Kronik sorunlar:\n${problems}` : '  Kronik sorun kaydı yok'}`
      }
      return `Sen ikinci el araç alımında danışmanlık yapan bir uzmansın. Kullanıcı iki araç arasında kalmış.

${side(b.first || {}, 'BİRİNCİ ARAÇ')}

${side(b.second || {}, 'İKİNCİ ARAÇ')}

GÖREVİN:
1. winner: Genel olarak hangisi daha mantıklı? Sadece aracın adını yaz (örn. "${b.first?.brand || ''} ${b.first?.model || ''}").
2. recommendation: Tercihini bir paragrafta gerekçelendir.
3. reasoning: Kararının somut nedenlerini madde madde yaz (fiyat, güvenilirlik, masraf, yakıt, kullanım amacı).
4. firstSuitableFor: Birinci araç kime/hangi kullanıma daha uygun?
5. secondSuitableFor: İkinci araç kime/hangi kullanıma daha uygun?
6. watchOut: Hangisini alırsa alsın dikkat etmesi gereken ortak noktalar.

Not: Fiyat ve skor bilgileri uygulamanın kendi hesabıdır, onları değiştirme; yorumunu bunlar üzerine kur.
${ORTAK_KURALLAR}`
    }
  }
}

function corsHeaders(origin, allowedOrigins, env = {}) {
  const production = String(env.APP_ENV || '').toLowerCase() === 'production'
  const allowAll = !production && (!allowedOrigins || allowedOrigins.trim() === '' || allowedOrigins.trim() === '*')
  const list = allowAll ? [] : allowedOrigins.split(',').map((o) => o.trim())
  const allow = allowAll ? '*' : list.includes(origin) ? origin : null
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    // X-Device-Id frontend'in kota/geçmiş için gönderdiği zorunlu başlıktır.
    'Access-Control-Allow-Headers': 'Content-Type, X-Device-Id, Authorization',
    'Access-Control-Max-Age': '86400'
  }
  if (allow) headers['Access-Control-Allow-Origin'] = allow
  if (!allowAll) headers.Vary = 'Origin'
  return headers
}

function isAllowedOrigin(origin, allowedOrigins, env = {}) {
  const production = String(env.APP_ENV || '').toLowerCase() === 'production'
  if (!origin) return true
  if (!allowedOrigins || allowedOrigins.trim() === '' || allowedOrigins.trim() === '*') return !production
  return allowedOrigins.split(',').map((o) => o.trim()).includes(origin)
}

function requestIp(request) {
  return request.headers.get('CF-Connecting-IP') || 'bilinmeyen'
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  })
}

async function checkRateLimit(env, ip) {
  // KV bağlı değilse hız limiti atlanır (opsiyonel özellik)
  if (!env.RATE_LIMIT_KV) return true
  const key = `rl:${ip}:${Math.floor(Date.now() / 60000)}`
  const current = Number((await env.RATE_LIMIT_KV.get(key)) || 0)
  if (current >= RATE_LIMIT_PER_MINUTE) return false
  await env.RATE_LIMIT_KV.put(key, String(current + 1), { expirationTtl: 120 })
  return true
}

// ============================================================================
// KULLANIM KOTASI (sunucu tarafında zorunlu)
// ============================================================================
/*
 * Her yapay zekâ çağrısı gerçek para maliyetidir. Kota istemcide TUTULMAZ:
 * istemcideki bir sayaç, uygulama verisini silmek kadar kolay sıfırlanır ve
 * hiçbir koruma sağlamaz. Sayaç burada, D1'de tutulur ve istek Gemini'ye
 * gitmeden ÖNCE kontrol edilir.
 *
 * DÜRÜST SINIR — bu gerçek bir kimlik doğrulama değildir:
 * Cihaz kimliğini istemci üretir. Kullanıcı uygulama verisini silerse yeni
 * kimlik oluşur ve ücretsiz hakkı sıfırlanır. Amaç, kötü niyetli bir saldırıyı
 * durdurmak değil, sıradan aşırı kullanımın maliyeti patlatmasını önlemektir.
 * Bunu bir miktar dengelemek için IP başına aylık ikinci bir tavan uygulanır.
 * Gerçek koruma için e-posta/telefon doğrulamalı hesap gerekir.
 */
const PLANS = {
  ucretsiz: { label: 'Ücretsiz', aylikHak: 5 },
  premium: { label: 'Premium', aylikHak: 100 }
}

// Tek bir IP'nin ayda üretebileceği toplam analiz. Ev/işyeri paylaşımlı
// bağlantıları mağdur etmeyecek kadar geniş, kötüye kullanımı sınırlayacak
// kadar dar tutulmuştur.
const IP_MONTHLY_CAP = 40

/** '2026-08' — ay değişince sayaçlar kendiliğinden sıfırlanır. */
function periodKey(now = new Date()) {
  return now.getUTCFullYear() + '-' + String(now.getUTCMonth() + 1).padStart(2, '0')
}

/** Ayın sonu (ISO) — istemci "hak ne zaman yenilenir" diye gösterebilsin. */
function periodResetAt(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString()
}

/** Cihaz kimliği yalnızca UUID biçiminde kabul edilir. */
function readDeviceId(request) {
  const raw = String(request.headers.get('X-Device-Id') || '').trim()
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw) ? raw.toLowerCase() : null
}

/** Hesabı okur, yoksa oluşturur; ay değiştiyse sayacı sıfırlar. */
async function loadAccount(env, deviceId) {
  const now = Date.now()
  const period = periodKey()

  let row = await env.DB.prepare('SELECT * FROM accounts WHERE id = ?1').bind(deviceId).first()

  if (!row) {
    await env.DB.prepare(
      `INSERT INTO accounts (id, plan, created_at, last_seen_at, period_key, used_count, total_count)
       VALUES (?1, 'ucretsiz', ?2, ?2, ?3, 0, 0)`
    )
      .bind(deviceId, now, period)
      .run()
    row = { id: deviceId, plan: 'ucretsiz', created_at: now, last_seen_at: now, period_key: period, used_count: 0, total_count: 0 }
  } else if (row.period_key !== period) {
    // Yeni ay: kullanım sayacı sıfırlanır, toplam korunur.
    await env.DB.prepare('UPDATE accounts SET period_key = ?2, used_count = 0, last_seen_at = ?3 WHERE id = ?1')
      .bind(deviceId, period, now)
      .run()
    row = { ...row, period_key: period, used_count: 0 }
  }

  const plan = PLANS[row.plan] || PLANS.ucretsiz
  return {
    id: row.id,
    plan: row.plan,
    planLabel: plan.label,
    limit: plan.aylikHak,
    used: Number(row.used_count) || 0,
    remaining: Math.max(0, plan.aylikHak - (Number(row.used_count) || 0)),
    total: Number(row.total_count) || 0,
    resetAt: periodResetAt()
  }
}

/**
 * Bir analiz hakkı düşer.
 * @returns {{ok: true, account}|{ok: false, reason: string, account}}
 */
async function consumeQuota(env, deviceId, ip) {
  const account = await loadAccount(env, deviceId)

  if (account.remaining <= 0) {
    return { ok: false, reason: 'kota', account }
  }

  // IP tavanı ikinci savunma hattıdır; kişisel kotadan bağımsız işler.
  const period = periodKey()
  const ipRow = await env.DB.prepare('SELECT used_count FROM ip_quota WHERE ip = ?1 AND period_key = ?2')
    .bind(ip, period)
    .first()
  if (Number(ipRow?.used_count || 0) >= IP_MONTHLY_CAP) {
    return { ok: false, reason: 'ip', account }
  }

  const now = Date.now()
  await env.DB.batch([
    env.DB.prepare(
      'UPDATE accounts SET used_count = used_count + 1, total_count = total_count + 1, last_seen_at = ?2 WHERE id = ?1'
    ).bind(deviceId, now),
    env.DB.prepare(
      `INSERT INTO ip_quota (ip, period_key, used_count) VALUES (?1, ?2, 1)
       ON CONFLICT(ip, period_key) DO UPDATE SET used_count = used_count + 1`
    ).bind(ip, period)
  ])

  return {
    ok: true,
    account: { ...account, used: account.used + 1, remaining: account.remaining - 1 }
  }
}

/**
 * `parts` bir metin dizesi ya da Gemini'nin beklediği parça listesi olabilir.
 * Görsel inceleme için parça listesi gerekir: [{text}, {inlineData:{...}}].
 */
// ============================================================================
// ANALİZ GEÇMİŞİ
// ============================================================================
/*
 * Kullanıcı baktığı araçları sonradan görebilsin diye özet kaydedilir.
 *
 * SAKLANMAYAN ŞEYLER: ilan metni, fotoğraflar, kullanıcının notları. Bunlar
 * cihazda kalır. Sunucuda yalnızca listelenebilir bir künye (marka, model,
 * yıl, km, fiyat, skor) durur — hem gizlilik hem depolama maliyeti için.
 */
const HISTORY_LIMIT = 50

function historyRow(body) {
  const num = (v) => {
    const n = Number(String(v ?? '').replace(/[^\d]/g, ''))
    return Number.isFinite(n) && n > 0 ? n : null
  }
  const text = (v, max = 60) => (typeof v === 'string' ? v.slice(0, max) : null)

  return {
    brand: text(body?.brand, 40),
    model: text(body?.model, 60),
    year: text(body?.year, 4),
    km: num(body?.km),
    price: num(body?.price),
    score: num(body?.score),
    trustScore: num(body?.trustScore),
    verdict: ['al', 'dikkatli', 'alma', 'belirsiz'].includes(body?.verdict) ? body.verdict : null,
    source: ['ilan-link', 'ekran-goruntusu', 'metin', 'form'].includes(body?.source)
      ? body.source
      : 'form'
  }
}

async function handleHistorySave(env, deviceId, body, cors) {
  const row = historyRow(body)
  if (!row.brand) return json({ error: 'Marka gerekli' }, 400, cors)

  // Hesap yoksa oluşturulur; geçmiş kaydı hesaba bağlıdır.
  await loadAccount(env, deviceId)

  const id = crypto.randomUUID()
  await env.DB.prepare(
    `INSERT INTO analysis_history
       (id, account_id, created_at, brand, model, year, km, price, score, trust_score, verdict, source)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`
  )
    .bind(
      id, deviceId, Date.now(), row.brand, row.model, row.year, row.km,
      row.price, row.score, row.trustScore, row.verdict, row.source
    )
    .run()

  /*
   * Sınırsız büyümesin: en yeni HISTORY_LIMIT kayıt tutulur, eskiler silinir.
   * Kullanıcı zaten 50 kayıttan eskisine bakmaz ve depolama bedavaya gelmez.
   */
  await env.DB.prepare(
    `DELETE FROM analysis_history
      WHERE account_id = ?1
        AND id NOT IN (
          SELECT id FROM analysis_history
           WHERE account_id = ?1
           ORDER BY created_at DESC
           LIMIT ?2
        )`
  )
    .bind(deviceId, HISTORY_LIMIT)
    .run()

  return json({ ok: true, id }, 200, cors)
}

async function handleHistoryList(env, deviceId, cors) {
  const result = await env.DB.prepare(
    `SELECT id, created_at, brand, model, year, km, price, score, trust_score, verdict, source
       FROM analysis_history
      WHERE account_id = ?1
        AND NOT EXISTS (SELECT 1 FROM history_owners ho WHERE ho.history_id = analysis_history.id)
      ORDER BY created_at DESC
      LIMIT ?2`
  )
    .bind(deviceId, HISTORY_LIMIT)
    .all()

  return json({ items: result.results || [] }, 200, cors)
}

async function handleUserHistoryList(env, userId, cors) {
  const result = await env.DB.prepare(
    `SELECT h.id, h.created_at, h.brand, h.model, h.year, h.km, h.price, h.score, h.trust_score, h.verdict, h.source
       FROM analysis_history h JOIN history_owners ho ON ho.history_id = h.id
      WHERE ho.user_id = ?1 ORDER BY h.created_at DESC LIMIT ?2`
  ).bind(userId, HISTORY_LIMIT).all()
  return json({ items: result.results || [] }, 200, cors)
}

async function requireAuth(request, env, cors) {
  const result = await authenticateRequest(request, env)
  if (result.ok) return result.auth
  return json(
    { error: result.status === 503 ? 'Kimlik doğrulama servisi geçici olarak kullanılamıyor' : 'Kimlik doğrulaması gerekli' },
    result.status,
    { ...cors, 'Cache-Control': 'no-store' }
  )
}

/** Kullanıcının yalnızca kendi cihaz kimliğine bağlı sunucu geçmişini siler. */
async function handleHistoryClear(env, deviceId, cors) {
  await env.DB.prepare('DELETE FROM analysis_history WHERE account_id = ?1').bind(deviceId).run()
  return json({ ok: true }, 200, cors)
}

async function tryModel(env, model, prompt, schema, { disableThinking = true } = {}) {
  const parts = typeof prompt === 'string' ? [{ text: prompt }] : prompt
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`

  const generationConfig = {
    temperature: 0.3,
    maxOutputTokens: 1600,
    responseMimeType: 'application/json',
    responseSchema: schema
  }
  // Yeni nesil modellerde "düşünme" varsayılan açık; kapatmak yanıtı çok hızlandırır.
  if (disableThinking) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig
      })
    })

    if (!res.ok) {
      const detail = await res.text()

      // Model "thinkingConfig" desteklemiyorsa, aynı modeli o ayar olmadan bir kez daha dene
      if (res.status === 400 && disableThinking && /thinking/i.test(detail)) {
        clearTimeout(timer)
        return tryModel(env, model, prompt, schema, { disableThinking: false })
      }

      // Sıradaki modeli denemeye değer durumlar:
      //  404/400 -> model yok veya desteklenmiyor
      //  503     -> model o an aşırı yoğun (Google'da sık görülür)
      //  429     -> bu model için kota/hız sınırı doldu
      //  500/502 -> geçici sunucu hatası
      const retryable = [400, 404, 429, 500, 502, 503].includes(res.status)
      return { ok: false, status: res.status, detail: detail.slice(0, 400), retryable }
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return { ok: false, status: 502, detail: 'Boş yanıt', retryable: false }

    try {
      return { ok: true, result: JSON.parse(text) }
    } catch {
      return { ok: false, status: 502, detail: 'JSON ayrıştırılamadı', retryable: false }
    }
  } catch (err) {
    return {
      ok: false,
      status: 504,
      detail: err?.name === 'AbortError' ? 'Zaman aşımı' : String(err).slice(0, 200),
      retryable: false
    }
  } finally {
    clearTimeout(timer)
  }
}

async function callGemini(env, prompt, schema) {
  // Elde çalıştığı bilinen model varsa önce onu dene
  const candidates = []
  if (cachedWorkingModel) candidates.push(cachedWorkingModel)
  if (env.GEMINI_MODEL) candidates.push(env.GEMINI_MODEL)
  MODEL_CANDIDATES.forEach((m) => candidates.push(m))

  const tried = new Set()
  let lastFailure = null

  for (const model of candidates) {
    if (tried.has(model)) continue
    tried.add(model)

    const outcome = await tryModel(env, model, prompt, schema)
    if (outcome.ok) {
      cachedWorkingModel = model
      return { ...outcome, model }
    }

    lastFailure = { ...outcome, model }

    // Bu model şu an kullanılamıyor: hatırlanan modeli temizle ki
    // sonraki isteklerde ilk sırada tekrar denenmesin
    if (cachedWorkingModel === model) cachedWorkingModel = null

    // Zaman aşımı da olsa sıradaki (daha hızlı) modeli denemeye değer
    if (!outcome.retryable && outcome.status !== 504) break
  }

  // Hepsi başarısızsa kullanıcıya anlaşılır bir neden ver
  if (lastFailure && [429, 503].includes(lastFailure.status)) {
    return {
      ...lastFailure,
      status: 503,
      userMessage: 'Değerlendirme servisi şu an yoğun. Birkaç dakika sonra tekrar deneyin.'
    }
  }

  return lastFailure || { ok: false, status: 502, detail: 'Model bulunamadı' }
}

/** Tanılama: hangi modellerin kullanılabilir olduğunu listeler */
async function listModels(env) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${env.GEMINI_API_KEY}&pageSize=100`
  )
  if (!res.ok) {
    return { ok: false, detail: (await res.text()).slice(0, 400) }
  }
  const data = await res.json()
  const usable = (data.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m) => m.name.replace('models/', ''))
  return { ok: true, models: usable }
}

/* ============================================================
   ARAÇ VERİTABANI (D1)
   ============================================================
   Veri, uygulamanın içine gömülü olmaktan çıkıp buraya taşınır. İstemcide
   çekirdek bir kopya kalmaya devam eder (internetsiz çalışabilsin diye);
   buradan yalnızca DEĞİŞENLER indirilir.

   D1 bağlı değilse uçlar 503 döner ve uygulama gömülü veriyle çalışmaya
   devam eder — yani veritabanı kurulmadan da hiçbir şey bozulmaz.
   ============================================================ */

const DATA_PAGE_LIMIT = 60
const IMPORT_BATCH = 40

async function handleDataVersion(env, cors) {
  const meta = await env.DB.prepare("SELECT value FROM meta WHERE key = 'data_revision'").first()
  const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM vehicles WHERE deleted = 0').first()
  return json(
    {
      revision: Number(meta?.value || 0),
      count: Number(count?.n || 0)
    },
    200,
    cors
  )
}

async function handleDataVehicles(env, url, cors) {
  const since = Math.max(0, Number(url.searchParams.get('since') || 0))
  const limit = Math.min(DATA_PAGE_LIMIT, Math.max(1, Number(url.searchParams.get('limit') || DATA_PAGE_LIMIT)))

  const result = await env.DB.prepare(
    'SELECT id, revision, deleted, payload FROM vehicles WHERE revision > ?1 ORDER BY revision, id LIMIT ?2'
  )
    .bind(since, limit + 1)
    .all()

  const rows = result.results || []
  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows

  return json(
    {
      rows: page.map((row) => ({
        id: row.id,
        revision: Number(row.revision),
        deleted: Number(row.deleted) === 1,
        // payload zaten JSON metni; burada tekrar ayrıştırıp birleştirmeye gerek yok
        vehicle: Number(row.deleted) === 1 ? null : JSON.parse(row.payload)
      })),
      hasMore,
      nextSince: page.length ? Number(page[page.length - 1].revision) : since
    },
    200,
    cors
  )
}

/** "Volkswagen|Golf (Mk7)" — istemcideki kuralla birebir aynı olmalı. */
function vehicleKey(brand, model) {
  return (String(brand) + '|' + String(model)).toLowerCase().replace(/\s+/g, ' ').trim()
}

/**
 * Veri yükleme ucu.
 *
 * Komut satırı (wrangler) her ortamda kullanılamıyor — tablet gibi cihazlarda
 * hiç yok. Bu yüzden veri, tarayıcıdan çalışan küçük bir sayfayla parça parça
 * gönderilebiliyor (server/d1/import.html). Uç, ADMIN_TOKEN gizli anahtarıyla
 * korunur; anahtar tanımlı değilse uç tamamen kapalıdır.
 */
async function handleDataImport(env, body, cors) {
  if (!env.ADMIN_TOKEN) {
    return json({ error: 'Yukleme kapali: ADMIN_TOKEN tanimlanmamis' }, 503, cors)
  }
  if (!body?.token || !constantTimeEqual(body.token, env.ADMIN_TOKEN)) {
    return json({ error: 'Yetkisiz' }, 401, cors)
  }

  const vehicles = Array.isArray(body.vehicles) ? body.vehicles : []
  if (vehicles.length === 0) {
    return json({ error: 'Gonderilen kayit yok' }, 400, cors)
  }
  if (vehicles.length > IMPORT_BATCH) {
    return json({ error: 'Tek seferde en fazla ' + IMPORT_BATCH + ' kayit' }, 400, cors)
  }

  const revision = Math.max(1, Number(body.revision) || 1)
  const now = Date.now()

  if (body.reset) {
    await env.DB.prepare('DELETE FROM vehicles').run()
  }

  const statement = env.DB.prepare(
    `INSERT INTO vehicles (id, brand, model, year_range, revision, deleted, updated_at, payload)
     VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, ?7)
     ON CONFLICT(id) DO UPDATE SET
       brand = excluded.brand,
       model = excluded.model,
       year_range = excluded.year_range,
       revision = excluded.revision,
       deleted = 0,
       updated_at = excluded.updated_at,
       payload = excluded.payload`
  )

  const batch = vehicles
    .filter((v) => v && v.brand && v.model)
    .map((v) =>
      statement.bind(
        vehicleKey(v.brand, v.model),
        String(v.brand),
        String(v.model),
        String(v.yearRange || ''),
        revision,
        now,
        JSON.stringify(v)
      )
    )

  await env.DB.batch(batch)

  if (body.final) {
    await env.DB.prepare(
      "INSERT INTO meta (key, value) VALUES ('data_revision', ?1) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
      .bind(String(revision))
      .run()
  }

  const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM vehicles WHERE deleted = 0').first()
  return json({ written: batch.length, total: Number(count?.n || 0), revision }, 200, cors)
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const cors = corsHeaders(origin, env.ALLOWED_ORIGINS, env)
    const url = new URL(request.url)

    if (!isAllowedOrigin(origin, env.ALLOWED_ORIGINS, env)) {
      return json({ error: 'Bu kaynak için erişim izni yok' }, 403, cors)
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    if (url.pathname === '/health' && request.method === 'GET') {
      const auth = Boolean(env.SUPABASE_URL && env.SUPABASE_JWT_ISSUER && env.SUPABASE_JWT_AUDIENCE)
      let database = 'unavailable'
      try { if (env.DB) { await env.DB.prepare('SELECT 1 AS ok').first(); database = 'reachable' } } catch { database = 'unavailable' }
      return json({ ok: database === 'reachable', environment: String(env.APP_ENV || 'development'), database, auth: auth ? 'configured' : 'unconfigured', version: VERSION }, database === 'reachable' ? 200 : 503, { ...cors, 'Cache-Control': 'no-store' })
    }

    if (request.method === 'POST' && !hasAcceptableBodySize(request)) {
      return json({ error: 'İstek gövdesi işleme sınırını aşıyor' }, 413, cors)
    }

    // Bu endpoint sadece JWKS ile doğrulanmış Supabase tokenındaki güvenli
    // özet bilgiyi döndürür. İstek gövdesindeki user/plan/role alanları yok sayılır.
    if (url.pathname === '/auth/me') {
      if (request.method !== 'GET') return json({ error: 'Sadece GET destekleniyor' }, 405, { ...cors, 'Cache-Control': 'no-store' })
      const auth = await requireAuth(request, env, cors)
      if (auth instanceof Response) return auth
      return json(
        { user: { id: auth.userId, email: auth.email, provider: auth.provider } },
        200,
        { ...cors, 'Cache-Control': 'no-store' }
      )
    }

    if (url.pathname === '/announcements/active' && request.method === 'GET') {
      if (!env.DB) return json({ items: [] }, 200, { ...cors, 'Cache-Control': 'public, max-age=60' })
      const now = Date.now()
      const rows = await env.DB.prepare("SELECT id,title,message,starts_at,ends_at,updated_at,version FROM announcements WHERE status='published' AND (starts_at IS NULL OR starts_at<=?1) AND (ends_at IS NULL OR ends_at>?1) ORDER BY starts_at DESC LIMIT 20").bind(now).all()
      return json({ items: rows.results || [] }, 200, { ...cors, 'Cache-Control': 'public, max-age=60' })
    }

    if (url.pathname.startsWith('/catalog/')) {
      try {
        const response = await handlePublicCatalog(request, env, url, cors)
        if (response) return response
        return json({ error: 'Bulunamadı' }, 404, cors)
      } catch {
        return json({ error: 'Katalog şu anda kullanılamıyor', available: false, source: 'legacy-fallback-required' }, 503, { ...cors, 'Cache-Control': 'no-store' })
      }
    }

    if (url.pathname.startsWith('/admin')) {
      if (!env.DB) return json({ error: 'Yönetim servisi kullanılamıyor' }, 503, { ...cors, 'Cache-Control': 'no-store' })
      const auth = await requireAuth(request, env, cors); if (auth instanceof Response) return auth
      const needed = url.pathname.includes('/audit') ? 'audit:read' : url.pathname.includes('/settings') ? (request.method === 'GET' ? 'settings:read' : 'settings:write') : url.pathname.includes('/announcements') ? (request.method === 'GET' ? 'announcement:read' : url.pathname.endsWith('/publish') ? 'announcement:publish' : 'announcement:write') : 'admin:access'
      const actor = await adminActor(env, auth, needed)
      if (!actor) return json({ error: 'Bu alana erişim yetkiniz yok' }, 403, { ...cors, 'Cache-Control': 'no-store' })
      if (url.pathname.startsWith('/admin/catalog')) {
        try {
          const response = await handleAdminCatalog(request, env, url, actor)
          if (response) return new Response(response.body, { status: response.status, headers: { ...Object.fromEntries(response.headers), ...cors, 'Cache-Control': 'no-store' } })
        } catch {
          return json({ error: 'Katalog işlemi tamamlanamadı' }, 500, { ...cors, 'Cache-Control': 'no-store' })
        }
      }
      if (url.pathname === '/admin/me' && request.method === 'GET') return json({ roles: actor.roles, permissions: actor.permissions }, 200, { ...cors, 'Cache-Control': 'no-store' })
      if (url.pathname === '/admin/announcements' && request.method === 'GET') { const rows = await env.DB.prepare('SELECT id,title,message,status,starts_at,ends_at,version,updated_at FROM announcements ORDER BY updated_at DESC LIMIT 100').all(); return json({ items: rows.results || [] }, 200, { ...cors, 'Cache-Control': 'no-store' }) }
      if (url.pathname === '/admin/announcements' && request.method === 'POST') { const body = await request.json().catch(() => null); const dates=announcementDates(body); if (!textSafe(body?.title, 120) || !textSafe(body?.message, 2000) || !dates) return json({ error: 'Geçersiz duyuru' }, 400, cors); const now = Date.now(); const id = crypto.randomUUID(); await env.DB.prepare("INSERT INTO announcements (id,title,message,status,starts_at,ends_at,created_at,updated_at,created_by,updated_by) VALUES (?1,?2,?3,'draft',?4,?5,?6,?6,?7,?7)").bind(id, body.title.trim(), body.message.trim(), dates.startsAt, dates.endsAt, now, actor.userId).run(); await audit(env, actor, 'announcement.create', 'announcement', id); return json({ id, status: 'draft' }, 201, { ...cors, 'Cache-Control': 'no-store' }) }
      if (url.pathname.startsWith('/admin/announcements/') && !/^\/admin\/announcements\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:\/(publish|archive|unpublish))?$/i.test(url.pathname)) return json({ error: 'Geçersiz duyuru kimliği' }, 400, cors)
      const announcement = /^\/admin\/announcements\/([0-9a-f-]{36})(?:\/(publish|archive|unpublish))?$/.exec(url.pathname)
      if (announcement) { const [, id, action] = announcement; const current = await env.DB.prepare('SELECT status FROM announcements WHERE id=?1').bind(id).first(); if (!current) return json({ error: 'Duyuru bulunamadı' }, 404, cors); if (request.method === 'PUT' && !action) { const body = await request.json().catch(() => null); const dates=announcementDates(body); if (!textSafe(body?.title, 120) || !textSafe(body?.message, 2000) || !dates) return json({ error: 'Geçersiz duyuru' }, 400, cors); const now=Date.now(); await env.DB.prepare('UPDATE announcements SET title=?1,message=?2,starts_at=?3,ends_at=?4,version=version+1,updated_at=?5,updated_by=?6 WHERE id=?7').bind(body.title.trim(),body.message.trim(),dates.startsAt,dates.endsAt,now,actor.userId,id).run(); await audit(env,actor,'announcement.update','announcement',id); return json({ ok:true },200,{...cors,'Cache-Control':'no-store'}) } if (request.method === 'POST' && action) { const next = action === 'publish' ? 'published' : action === 'archive' ? 'archived' : 'draft'; if (current.status === 'archived' && next !== 'archived') return json({ error: 'Arşivlenmiş duyuru yeniden yayınlanamaz' }, 400, cors); if (current.status !== next) { await env.DB.prepare('UPDATE announcements SET status=?1,version=version+1,updated_at=?2,updated_by=?3 WHERE id=?4').bind(next,Date.now(),actor.userId,id).run(); await audit(env,actor,`announcement.${action}`,'announcement',id) } return json({ id,status:next },200,{...cors,'Cache-Control':'no-store'}) } }
      if (url.pathname === '/admin/settings' && request.method === 'GET') { const rows = await env.DB.prepare('SELECT key,value,updated_at FROM app_settings').all(); return json({ items: (rows.results || []).filter((r) => SETTINGS.has(r.key)) }, 200, { ...cors, 'Cache-Control': 'no-store' }) }
      const setting = /^\/admin\/settings\/([a-z_]+)$/.exec(url.pathname)
      if (setting && request.method === 'PUT') { if (!SETTINGS.has(setting[1])) return json({ error: 'Bu ayar değiştirilemez' }, 400, cors); const body = await request.json().catch(() => null); if (typeof body?.value !== 'string' || body.value.length > 1000) return json({ error: 'Geçersiz ayar' }, 400, cors); const now = Date.now(); await env.DB.prepare('INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?1,?2,?3,?4) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at,updated_by=excluded.updated_by').bind(setting[1], body.value, now, actor.userId).run(); await audit(env, actor, 'setting.update', 'setting', setting[1]); return json({ ok: true }, 200, { ...cors, 'Cache-Control': 'no-store' }) }
      if (url.pathname === '/admin/audit' && request.method === 'GET') { const limit=Math.min(100,Math.max(1,Number(url.searchParams.get('limit'))||50)); let cursor={createdAt:Number.MAX_SAFE_INTEGER,id:'~'}; const raw=url.searchParams.get('cursor'); if(raw){try{const text=atob(raw.replace(/-/g,'+').replace(/_/g,'/')); cursor=JSON.parse(text); if(!Number.isSafeInteger(cursor.createdAt)||typeof cursor.id!=='string') throw new Error()}catch{return json({error:'Geçersiz cursor'},400,cors)}} const rows=await env.DB.prepare('SELECT id,actor_user_id,action,target_type,target_id,created_at FROM admin_audit_logs WHERE created_at<?1 OR (created_at=?1 AND id<?2) ORDER BY created_at DESC,id DESC LIMIT ?3').bind(cursor.createdAt,cursor.id,limit).all(); const items=rows.results||[]; const last=items.at(-1); const nextCursor=last?btoa(JSON.stringify({createdAt:last.created_at,id:last.id})).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''):null; return json({items,nextCursor},200,{...cors,'Cache-Control':'no-store'}) }
      return json({ error: 'Bulunamadı' }, 404, cors)
    }

    if (url.pathname === '/auth/link-device') {
      if (request.method !== 'POST') return json({ error: 'Sadece POST destekleniyor' }, 405, { ...cors, 'Cache-Control': 'no-store' })
      if (!env.DB) return json({ error: 'Veritabani baglanmamis' }, 503, { ...cors, 'Cache-Control': 'no-store' })
      const auth = await requireAuth(request, env, cors)
      if (auth instanceof Response) return auth
      let body
      try {
        body = await request.json()
      } catch {
        return json({ error: 'Geçersiz istek' }, 400, { ...cors, 'Cache-Control': 'no-store' })
      }
      try {
        const outcome = await linkDeviceData(env, auth, body)
        if (!outcome.ok) return json({ error: outcome.error }, outcome.status, { ...cors, 'Cache-Control': 'no-store' })
        return json({ linked: outcome.linked, idempotent: outcome.idempotent, counts: outcome.counts }, 200, { ...cors, 'Cache-Control': 'no-store' })
      } catch {
        return json({ error: 'Cihaz verileri eşleştirilemedi' }, 500, { ...cors, 'Cache-Control': 'no-store' })
      }
    }

    if (url.pathname === '/sync') {
      if (!env.DB) return json({ error: 'Veritabani baglanmamis' }, 503, { ...cors, 'Cache-Control': 'no-store' })
      const auth = await requireAuth(request, env, cors)
      if (auth instanceof Response) return auth
      const userId = await syncUserId(env, auth)
      if (!userId) return json({ error: 'Cihaz eşleştirmesi gerekli' }, 409, { ...cors, 'Cache-Control': 'no-store' })
      try {
        if (request.method === 'GET') return json(await pullSync(env, userId, url.searchParams.get('cursor'), url.searchParams.get('limit')), 200, { ...cors, 'Cache-Control': 'no-store' })
        if (request.method === 'POST') {
          const outcome = await pushSync(env, userId, (await request.json()).operations)
          return json(outcome, outcome.status || 200, { ...cors, 'Cache-Control': 'no-store' })
        }
        return json({ error: 'Desteklenmeyen yontem' }, 405, cors)
      } catch { return json({ error: 'Senkronizasyon basarisiz' }, 400, { ...cors, 'Cache-Control': 'no-store' }) }
    }

    // Veri uçları API anahtarından bağımsızdır: yapay zekâ kapalıyken de
    // veritabanı güncellemesi çalışmalıdır.
    if (request.method === 'GET' && url.pathname.startsWith('/data/')) {
      if (!env.DB) {
        return json({ error: 'Veritabani baglanmamis' }, 503, cors)
      }
      try {
        if (url.pathname === '/data/version') return await handleDataVersion(env, cors)
        if (url.pathname === '/data/vehicles') return await handleDataVehicles(env, url, cors)
        return json({ error: 'Bilinmeyen uc' }, 404, cors)
      } catch {
        return json({ error: 'Veritabani hatasi' }, 500, cors)
      }
    }

    // Veri yükleme de anahtardan bağımsızdır.
    if (request.method === 'POST' && url.pathname === '/data/import') {
      if (!env.DB) return json({ error: 'Veritabani baglanmamis' }, 503, cors)
      try {
        const body = await request.json()
        return await handleDataImport(env, body, cors)
      } catch {
        return json({ error: 'Yukleme hatasi' }, 500, cors)
      }
    }

    // Hesap durumu: istemci kalan hakkını gösterebilsin diye ayrı bir uçtur.
    // Hak DÜŞMEZ, sadece okur.
    if (request.method === 'GET' && url.pathname === '/account') {
      const deviceId = readDeviceId(request)
      if (!deviceId) return json({ error: 'Cihaz kimligi gerekli' }, 400, cors)
      if (!env.DB) {
        return json({ error: 'Kota takibi kapali', enforced: false }, 200, cors)
      }
      try {
        return json({ account: await loadAccount(env, deviceId), enforced: true }, 200, cors)
      } catch {
        return json({ error: 'Hesap okunamadi' }, 500, cors)
      }
    }

    /*
     * İLAN ÇEKME UCU
     *
     * Frontend hiçbir zaman ilan sitesine doğrudan gitmez; istek buradan
     * çıkar. Böylece önbellek, zaman aşımı ve hata yönetimi tek yerde durur.
     * Yapay zekâ anahtarından bağımsızdır: AI kapalıyken de çalışır.
     */
    if (url.pathname === '/listing/platforms' && request.method === 'GET') {
      return json({ platforms: listPlatforms() }, 200, cors)
    }

    if (url.pathname === '/listing/fetch' && request.method === 'POST') {
      if (!(await checkRateLimit(env, requestIp(request)))) {
        return json({ error: 'Çok fazla istek gönderildi, biraz bekleyin' }, 429, cors)
      }
      let body
      try {
        body = await request.json()
      } catch {
        return json({ error: 'Geçersiz istek' }, 400, cors)
      }
      if (typeof body?.input !== 'string' || body.input.trim().length === 0 || body.input.length > 2000) {
        return json({ error: 'Geçerli ve en fazla 2000 karakterlik ilan bağlantısı/numarası gerekli' }, 400, cors)
      }
      try {
        const outcome = await fetchListing(body?.input, {
          platform: body?.platform,
          // KV bağlıysa önbellek kullanılır; yoksa her istek siteye gider.
          cache: env.RATE_LIMIT_KV || null
        })
        // 'engelli' bir hata değil, beklenen bir durumdur: 200 ile döner ve
        // arayüz kullanıcıyı çalışan yola (ekran görüntüsü) yönlendirir.
        return json(outcome, 200, cors)
      } catch {
        return json({ status: 'hata', error: 'İlan alınamadı' }, 500, cors)
      }
    }

    /*
     * Analiz geçmişi uçları. Yapay zekâ anahtarından bağımsızdır — AI kapalıyken
     * de kullanıcı geçmişini görebilmeli.
     */
    if (url.pathname === '/history') {
      const deviceId = readDeviceId(request)
      if (!deviceId) return json({ error: 'Cihaz kimligi gerekli' }, 400, cors)
      if (!env.DB) return json({ items: [], enabled: false }, 200, cors)

      try {
        const hasAuthorization = request.headers.has('Authorization')
        if (hasAuthorization) {
          const auth = await requireAuth(request, env, cors)
          if (auth instanceof Response) return auth
          const userId = await findUserForAuth(env, auth)
          if (!userId) return json({ items: [] }, 200, { ...cors, 'Cache-Control': 'no-store' })
          if (request.method === 'GET') return await handleUserHistoryList(env, userId, cors)
        }
        if (request.method === 'GET') return await handleHistoryList(env, deviceId, cors)
        if (request.method === 'POST') {
          const body = await request.json().catch(() => null)
          return await handleHistorySave(env, deviceId, body, cors)
        }
        if (request.method === 'DELETE') return await handleHistoryClear(env, deviceId, cors)
        return json({ error: 'Desteklenmeyen yontem' }, 405, cors)
      } catch {
        return json({ error: 'Gecmis islemi basarisiz' }, 500, cors)
      }
    }

    if (!env.GEMINI_API_KEY) {
      return json({ error: 'Sunucu yapılandırılmamış' }, 503, cors)
    }

    // Tanılama: tarayıcıdan .../?debug=models açılırsa kullanılabilir modelleri listeler
    if (request.method === 'GET') {
      if (url.searchParams.get('debug') === 'models') {
        const outcome = await listModels(env)
        return json(outcome, outcome.ok ? 200 : 502, cors)
      }
      return json(
        {
          status: 'calisiyor',
          version: VERSION,
          activeModel: cachedWorkingModel || '(henuz belirlenmedi)',
          tasks: Object.keys(TASKS),
          database: env.DB ? 'bagli' : 'bagli degil',
          // Kota yalnızca veritabanı bağlıyken zorunlu tutulabilir.
          kota: env.DB ? `zorunlu (ucretsiz ${PLANS.ucretsiz.aylikHak}/ay)` : 'kapali'
        },
        200,
        cors
      )
    }

    if (request.method !== 'POST') {
      return json({ error: 'Sadece POST destekleniyor' }, 405, cors)
    }

    const ip = requestIp(request)
    if (!(await checkRateLimit(env, ip))) {
      return json({ error: 'Çok fazla istek gönderildi, biraz bekleyin' }, 429, cors)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Geçersiz istek' }, 400, cors)
    }

    // Geriye dönük uyumluluk: "task" yoksa eski davranış (teşhis) uygulanır
    const taskName = String(body?.task || 'diagnosis')
    const task = TASKS[taskName]
    if (!task) {
      return json({ error: 'Bilinmeyen görev: ' + taskName }, 400, cors)
    }

    if (taskName === 'diagnosis') {
      const complaint = String(body?.complaint || '').trim().slice(0, MAX_COMPLAINT_LENGTH)
      if (complaint.length < 3) {
        return json({ error: 'Şikayet metni çok kısa' }, 400, cors)
      }
      body.complaint = complaint
    }

    if (taskName === 'vehicle-info' && !body?.vehicle?.brand) {
      return json({ error: 'Araç bilgisi gerekli' }, 400, cors)
    }
    if (taskName === 'compare' && (!body?.first?.brand || !body?.second?.brand)) {
      return json({ error: 'İki araç bilgisi de gerekli' }, 400, cors)
    }

    /*
     * Görsel inceleme, metin görevlerinden çok daha pahalıdır (her görsel
     * ciddi miktarda jeton harcar). Bu yüzden adet ve boyut burada,
     * sunucuda sınırlanır; istemciye güvenilmez.
     */
    if (taskName === 'photo-inspect' || taskName === 'listing-vision') {
      const photos = Array.isArray(body?.photos) ? body.photos : []
      if (photos.length === 0) {
        return json({ error: 'En az bir fotoğraf gerekli' }, 400, cors)
      }
      if (photos.length > MAX_PHOTOS) {
        return json({ error: `Tek seferde en fazla ${MAX_PHOTOS} fotoğraf` }, 400, cors)
      }
      for (const photo of photos) {
        if (typeof photo?.data !== 'string' || photo.data.length > MAX_PHOTO_BYTES) {
          return json({ error: 'Fotoğraf çok büyük veya okunamadı' }, 400, cors)
        }
      }
    }

    /*
     * KOTA — istek Gemini'ye gitmeden ÖNCE düşülür.
     *
     * Sonradan düşmek, hata durumunda hakkın iade edilip edilmeyeceği gibi
     * bir soru doğurur ve asıl amacı (maliyet kontrolü) zayıflatır. Yanıt
     * alınamazsa kullanıcı bir hakkını kaybeder; bunun karşılığında sunucu
     * kendini sınırsız çağrıya açmamış olur.
     */
    let quota = null
    if (env.DB) {
      const deviceId = readDeviceId(request)
      if (!deviceId) {
        return json({ error: 'Cihaz kimliği gerekli. Uygulamayı güncelleyin.' }, 400, cors)
      }
      try {
        const outcome = await consumeQuota(env, deviceId, ip)
        if (!outcome.ok) {
          const message =
            outcome.reason === 'ip'
              ? 'Bu bağlantı için aylık analiz sınırına ulaşıldı.'
              : `Bu ay için ${outcome.account.limit} analiz hakkının tamamını kullandın. Hakkın ayın başında yenilenir.`
          return json({ error: message, account: outcome.account, reason: outcome.reason }, 402, cors)
        }
        quota = outcome.account
      } catch (err) {
        // Kota tablosu okunamıyorsa servis durdurulmaz; IP hız limiti
        // devrede kalır ve durum yanıtta bildirilir.
        quota = null
      }
    }

    // Görsel içeren görevler `parts`, metin görevleri `prompt` tanımlar.
    const payload = task.parts ? task.parts(body) : task.prompt(body)
    const outcome = await callGemini(env, payload, task.schema)
    if (!outcome.ok) {
      return json(
        {
          error: outcome.userMessage || 'Analiz alınamadı',
          model: outcome.model
        },
        outcome.status || 502,
        cors
      )
    }

    return json({ result: outcome.result, model: outcome.model, account: quota }, 200, {
      ...cors,
      'Cache-Control': 'no-store'
    })
  }
}

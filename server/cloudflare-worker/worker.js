/**
 * Araç Dedektifi — AI analiz proxy'si (Cloudflare Worker)
 *
 * Bu worker, uygulamanın arıza analizi isteklerini Google Gemini API'sine iletir.
 * API anahtarı YALNIZCA burada (Cloudflare secret olarak) durur; mobil uygulamanın
 * içine gömülmez. APK açılıp anahtar çalınamaz.
 *
 * Kurulum için: server/README.md
 */

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
const VERSION = 5

// Çalıştığı doğrulanan model (worker örneği hayatta olduğu sürece hatırlanır)
let cachedWorkingModel = null

const MAX_COMPLAINT_LENGTH = 1200
const REQUEST_TIMEOUT_MS = 30000

// Basit hız limiti: aynı IP için dakikada kaç istek
const RATE_LIMIT_PER_MINUTE = 12

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

function corsHeaders(origin, allowedOrigins) {
  const allowAll = !allowedOrigins || allowedOrigins.trim() === '' || allowedOrigins.trim() === '*'
  const list = allowAll ? [] : allowedOrigins.split(',').map((o) => o.trim())
  const allow = allowAll ? '*' : list.includes(origin) ? origin : list[0] || 'null'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  }
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

async function tryModel(env, model, prompt, schema, { disableThinking = true } = {}) {
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
        contents: [{ parts: [{ text: prompt }] }],
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
  if (!body?.token || body.token !== env.ADMIN_TOKEN) {
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
    const cors = corsHeaders(origin, env.ALLOWED_ORIGINS)
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
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
      } catch (err) {
        return json({ error: 'Veritabani hatasi', detail: String(err).slice(0, 200) }, 500, cors)
      }
    }

    // Veri yükleme de anahtardan bağımsızdır.
    if (request.method === 'POST' && url.pathname === '/data/import') {
      if (!env.DB) return json({ error: 'Veritabani baglanmamis' }, 503, cors)
      try {
        const body = await request.json()
        return await handleDataImport(env, body, cors)
      } catch (err) {
        return json({ error: 'Yukleme hatasi', detail: String(err).slice(0, 200) }, 500, cors)
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
          database: env.DB ? 'bagli' : 'bagli degil'
        },
        200,
        cors
      )
    }

    if (request.method !== 'POST') {
      return json({ error: 'Sadece POST destekleniyor' }, 405, cors)
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'bilinmeyen'
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

    const prompt = task.prompt(body)
    const outcome = await callGemini(env, prompt, task.schema)
    if (!outcome.ok) {
      return json(
        {
          error: outcome.userMessage || 'Analiz alınamadı',
          model: outcome.model,
          detail: outcome.detail
        },
        outcome.status || 502,
        cors
      )
    }

    return json({ result: outcome.result, model: outcome.model }, 200, {
      ...cors,
      'Cache-Control': 'no-store'
    })
  }
}

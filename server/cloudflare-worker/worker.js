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
const MODEL_CANDIDATES = [
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash'
]

// Çalıştığı doğrulanan model (worker örneği hayatta olduğu sürece hatırlanır)
let cachedWorkingModel = null

const MAX_COMPLAINT_LENGTH = 1200
const REQUEST_TIMEOUT_MS = 30000

// Basit hız limiti: aynı IP için dakikada kaç istek
const RATE_LIMIT_PER_MINUTE = 12

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    causes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          cause: { type: 'string' },
          likelihood: { type: 'string' },
          solution: { type: 'string' },
          estimatedCost: { type: 'string' },
          urgency: { type: 'string' }
        },
        required: ['cause', 'likelihood', 'solution', 'urgency']
      }
    },
    checks: { type: 'array', items: { type: 'string' } },
    askMechanic: { type: 'array', items: { type: 'string' } }
  },
  required: ['summary', 'causes']
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

function buildPrompt({ vehicle, complaint, localFindings }) {
  const vehicleLine = vehicle?.brand
    ? `${vehicle.brand} ${vehicle.model || ''} ${vehicle.year || ''} ${vehicle.engine || ''} ${vehicle.fuelType || ''} ${vehicle.transmission || ''} ${vehicle.km ? vehicle.km + ' km' : ''}`.replace(/\s+/g, ' ').trim()
    : 'Araç bilgisi verilmedi'

  const known = (localFindings?.knownProblems || [])
    .map((p) => `- ${p.title} (${p.risk} risk, ${p.checkKm} km aralığı)`)
    .join('\n')

  const matched = (localFindings?.matchedSymptoms || []).map((s) => `- ${s}`).join('\n')

  return `Sen Türkiye'de çalışan, ikinci el araç ve arıza teşhisi konusunda uzman bir oto ustasısın.
Kullanıcı aracındaki şikayeti anlatıyor. Türkçe, sade ve net cevap ver.

ARAÇ: ${vehicleLine}

KULLANICININ ŞİKAYETİ:
"${complaint}"

${known ? `BU MOTORDA BİLİNEN KRONİK SORUNLAR (uygulama veritabanından):\n${known}\n` : ''}
${matched ? `UYGULAMANIN ÖN ANALİZİNDE EŞLEŞEN BELİRTİLER:\n${matched}\n` : ''}
GÖREVİN:
1. Şikayeti değerlendirip en olası nedenleri sırala (en olasıdan başlayarak, en fazla 5 tane).
2. Her neden için: olasılık ("Yüksek"/"Orta"/"Düşük"), somut çözüm önerisi, tahmini onarım maliyeti (Türkiye 2026 fiyatlarıyla TL aralığı, örn. "5.000 - 15.000 TL"), aciliyet ("Yüksek"/"Orta"/"Düşük").
3. Ustaya götürüldüğünde baktırılması gereken kontrol maddelerini listele.
4. Kullanıcının ustaya sorması gereken soruları listele.

KURALLAR:
- Emin olmadığın şeyi kesinmiş gibi söyleme; "olası", "kontrol edilmeli" gibi ifadeler kullan.
- Güvenlik riski varsa (fren, direksiyon, yangın, hararet) aciliyeti "Yüksek" yap ve özet kısmında açıkça uyar.
- Maliyet aralıklarını gerçekçi tut, abartma.
- Kısa ve anlaşılır yaz, teknik jargonu açıkla.
- Yanıtın sadece istenen JSON şemasında olsun.`
}

async function tryModel(env, model, prompt, { disableThinking = true } = {}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`

  const generationConfig = {
    temperature: 0.3,
    maxOutputTokens: 1600,
    responseMimeType: 'application/json',
    responseSchema: RESPONSE_SCHEMA
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
        return tryModel(env, model, prompt, { disableThinking: false })
      }

      // 404 / 400 -> model yok veya desteklenmiyor, sıradakini dene
      const retryable = res.status === 404 || res.status === 400
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

async function callGemini(env, prompt) {
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

    const outcome = await tryModel(env, model, prompt)
    if (outcome.ok) {
      cachedWorkingModel = model
      return { ...outcome, model }
    }

    lastFailure = { ...outcome, model }
    // Zaman aşımı da olsa sıradaki (daha hızlı) modeli denemeye değer
    if (!outcome.retryable && outcome.status !== 504) break

    // Bu model kapanmışsa önbelleği temizle ki bir dahakine boşuna denenmesin
    if (cachedWorkingModel === model) cachedWorkingModel = null
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

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const cors = corsHeaders(origin, env.ALLOWED_ORIGINS)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    if (!env.GEMINI_API_KEY) {
      return json({ error: 'Sunucu yapılandırılmamış' }, 503, cors)
    }

    // Tanılama: tarayıcıdan .../?debug=models açılırsa kullanılabilir modelleri listeler
    if (request.method === 'GET') {
      const url = new URL(request.url)
      if (url.searchParams.get('debug') === 'models') {
        const outcome = await listModels(env)
        return json(outcome, outcome.ok ? 200 : 502, cors)
      }
      return json({ status: 'calisiyor', activeModel: cachedWorkingModel || '(henuz belirlenmedi)' }, 200, cors)
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

    const complaint = String(body?.complaint || '').trim().slice(0, MAX_COMPLAINT_LENGTH)
    if (complaint.length < 3) {
      return json({ error: 'Şikayet metni çok kısa' }, 400, cors)
    }

    const prompt = buildPrompt({
      vehicle: body?.vehicle,
      complaint,
      localFindings: body?.localFindings
    })

    const outcome = await callGemini(env, prompt)
    if (!outcome.ok) {
      return json(
        { error: 'Analiz alınamadı', model: outcome.model, detail: outcome.detail },
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

/**
 * Yerinde kontrol oturumu.
 *
 * Alıcı aracın başında ayakta duruyor. Kontrol listesi, mikron raporu, boya
 * karşılaştırması, hasar kaydı ve notlar ayrı ayrı ekranlarda toplanıyor ama
 * hepsi TEK bir araca ait. Bu servis o tek aracın durumunu bir arada tutar;
 * böylece adımlar arasında gezinirken hiçbir şey kaybolmaz ve sonunda tek bir
 * rapor çıkarılabilir.
 *
 * Fotoğraflar bilerek burada saklanmaz: base64 görseller localStorage'ı
 * doldurup diğer verilerin yazılamamasına yol açar. Fotoğraflar kendi
 * ekranlarında kalır.
 */

const STORAGE_KEY = 'arac-dedektifi:inspection-session'

export const STEPS = [
  { id: 'arac', label: 'Araç bilgisi', path: '/analiz' },
  { id: 'checklist', label: 'Kontrol listesi', path: '/kontrol-listesi' },
  { id: 'micron', label: 'Ekspertiz raporu (mikron)', path: '/ekspertiz-raporu' },
  { id: 'paint', label: 'Boya / değişen fotoğraf kontrolü', path: '/boya-degisen' },
  { id: 'damage', label: 'Hasar kaydı ve değer kaybı', path: '/tramer' },
  { id: 'questions', label: 'Satıcıya sorulacaklar', path: '/satici-sorulari' },
  { id: 'notes', label: 'Notlar ve fotoğraflar', path: '/ekspertiz-notlari' }
]

const EMPTY_SESSION = {
  vehicle: null,
  checklist: null,
  micron: null,
  paint: null,
  damage: null,
  questions: null,
  notes: null,
  updatedAt: null
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY_SESSION }
    return { ...EMPTY_SESSION, ...JSON.parse(raw) }
  } catch {
    return { ...EMPTY_SESSION }
  }
}

function write(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Depolama doluysa oturum kaydedilemez; ekranlar yine de çalışmaya devam eder.
  }
}

export function getSession() {
  return read()
}

/** Oturumun bir bölümünü günceller ve güncel oturumu döner. */
export function updateSession(patch) {
  const next = { ...read(), ...patch, updatedAt: new Date().toISOString() }
  write(next)
  return next
}

/** Yeni bir araca geçerken önceki aracın bulgularını temizler. */
export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // yoksayılır
  }
  return { ...EMPTY_SESSION }
}

/**
 * Araç bilgisini oturuma yazar. Araç değiştiyse eski bulgular silinir,
 * çünkü başka bir aracın mikron değerleriyle karar vermek en tehlikeli hatadır.
 */
export function setSessionVehicle(vehicle) {
  const current = read()
  const sameVehicle =
    current.vehicle &&
    current.vehicle.brand === vehicle.brand &&
    current.vehicle.model === vehicle.model &&
    String(current.vehicle.year) === String(vehicle.year) &&
    String(current.vehicle.km) === String(vehicle.km)

  if (sameVehicle) return updateSession({ vehicle })

  clearSession()
  return updateSession({ vehicle })
}

export function vehicleLabel(vehicle) {
  if (!vehicle) return ''
  return [vehicle.brand, vehicle.model, vehicle.engine, vehicle.year]
    .filter(Boolean)
    .join(' ')
}

/** Her adımın tamamlanma durumu ve tek satırlık özeti. */
export function getProgress() {
  const session = read()

  const summaries = {
    arac: session.vehicle ? vehicleLabel(session.vehicle) : null,
    checklist: session.checklist
      ? session.checklist.checkedCount +
        '/' +
        session.checklist.totalCount +
        ' madde işaretlendi, ' +
        session.checklist.problemCount +
        ' sorunlu'
      : null,
    micron: session.micron
      ? session.micron.measuredCount +
        ' panel ölçüldü, ' +
        session.micron.paintedCount +
        ' boyalı'
      : null,
    paint: session.paint ? session.paint.summary : null,
    damage: session.damage ? '%' + session.damage.lossPercent + ' tahmini değer kaybı' : null,
    questions: session.questions ? session.questions.askedCount + ' soru soruldu' : null,
    notes: session.notes ? session.notes.summary : null
  }

  const steps = STEPS.map((step) => ({
    ...step,
    done: Boolean(summaries[step.id]),
    summary: summaries[step.id]
  }))

  const doneCount = steps.filter((s) => s.done).length
  return {
    steps,
    doneCount,
    totalCount: steps.length,
    percent: Math.round((doneCount / steps.length) * 100),
    vehicle: session.vehicle,
    session
  }
}

const DEVICE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_RECORDS = 100

export function validDeviceId(value) {
  const id = String(value || '').trim().toLowerCase()
  return DEVICE_ID_PATTERN.test(id) ? id : null
}

function limitedRecords(value) {
  return Array.isArray(value) ? value.filter(Boolean).slice(0, MAX_RECORDS) : []
}

function payloadRecord(record, fallbackId) {
  const sourceId = String(record?.id || fallbackId).slice(0, 160)
  return { sourceId, payload: JSON.stringify(record).slice(0, 100000) }
}

export async function ensureUserForAuth(env, auth) {
  let user = await env.DB.prepare('SELECT id FROM users WHERE auth_subject = ?1').bind(auth.userId).first()
  if (user) return user.id
  const id = crypto.randomUUID()
  const now = Date.now()
  await env.DB.prepare(
    `INSERT INTO users (id, auth_subject, email, status, plan, created_at, updated_at, last_seen_at)
     VALUES (?1, ?2, ?3, 'active', 'ucretsiz', ?4, ?4, ?4)`
  ).bind(id, auth.userId, auth.email, now).run()
  return id
}

export async function findUserForAuth(env, auth) {
  const user = await env.DB.prepare('SELECT id FROM users WHERE auth_subject = ?1').bind(auth.userId).first()
  return user?.id || null
}

function transferCounts(history, favorites, garage, expertiseNotes) {
  return { history, favorites, garage, expertiseNotes }
}

export async function linkDeviceData(env, auth, body) {
  const deviceId = validDeviceId(body?.device_id)
  if (!deviceId) return { ok: false, status: 400, error: 'Geçerli cihaz kimliği gerekli' }
  const userId = await ensureUserForAuth(env, auth)
  const active = await env.DB.prepare('SELECT user_id FROM device_links WHERE device_id = ?1 AND revoked_at IS NULL').bind(deviceId).first()
  if (active && active.user_id !== userId) return { ok: false, status: 409, error: 'Bu cihaz başka bir hesaba bağlı' }

  const prior = await env.DB.prepare('SELECT user_id, result_json FROM device_link_transfers WHERE device_id = ?1').bind(deviceId).first()
  if (prior) {
    if (prior.user_id !== userId) return { ok: false, status: 409, error: 'Bu cihaz başka bir hesaba bağlı' }
    return { ok: true, linked: true, idempotent: true, counts: JSON.parse(prior.result_json) }
  }

  const now = Date.now()
  const favorites = limitedRecords(body?.favorites)
  const garage = limitedRecords(body?.garage)
  const notes = limitedRecords(body?.expertise_notes)
  const histories = limitedRecords(body?.history)
  const serverHistory = await env.DB.prepare('SELECT id FROM analysis_history WHERE account_id = ?1').bind(deviceId).all()
  const counts = transferCounts((serverHistory.results || []).length + histories.length, favorites.length, garage.length, notes.length)
  const statements = []
  statements.push(env.DB.prepare(
    `INSERT INTO device_links (id, device_id, user_id, linked_at, last_seen_at, revoked_at)
     VALUES (?1, ?2, ?3, ?4, ?4, NULL)
     ON CONFLICT DO NOTHING`
  ).bind(crypto.randomUUID(), deviceId, userId, now))
  for (const row of serverHistory.results || []) {
    statements.push(env.DB.prepare(
      'INSERT INTO history_owners (history_id, user_id, device_id, linked_at) VALUES (?1, ?2, ?3, ?4) ON CONFLICT(history_id) DO NOTHING'
    ).bind(row.id, userId, deviceId, now))
  }
  const addRows = (table, records) => records.forEach((record, index) => {
    const entry = payloadRecord(record, `${table}-${index}`)
    statements.push(env.DB.prepare(
      `INSERT INTO ${table} (id, user_id, device_id, source_id, payload, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)
       ON CONFLICT(user_id, device_id, source_id) DO NOTHING`
    ).bind(crypto.randomUUID(), userId, deviceId, entry.sourceId, entry.payload, now))
  })
  addRows('user_favorites', favorites)
  addRows('user_garage_records', garage)
  addRows('user_expertise_notes', notes)
  statements.push(env.DB.prepare(
    'INSERT INTO device_link_transfers (device_id, user_id, result_json, completed_at) VALUES (?1, ?2, ?3, ?4)'
  ).bind(deviceId, userId, JSON.stringify(counts), now))
  await env.DB.batch(statements)
  return { ok: true, linked: true, idempotent: false, counts }
}

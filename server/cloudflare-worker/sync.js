import { findUserForAuth, validDeviceId } from './ownership.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TYPES = new Set(['favorites', 'garage', 'expertise_notes'])
const MAX_OPERATION_BYTES = 100000
const MAX_BATCH = 50
export async function syncUserId(env, auth) { return findUserForAuth(env, auth) }
export function validOperation(op) {
  return op && UUID.test(String(op.operationId || '')) && UUID.test(String(op.id || '')) && TYPES.has(op.type) && validDeviceId(op.device_id) && ['upsert', 'delete'].includes(op.action) && !Object.hasOwn(op, 'user_id')
}

function decodeCursor(cursor) {
  if (!cursor) return { updatedAt: 0, id: '' }
  try {
    const parsed = JSON.parse(atob(cursor))
    return Number.isSafeInteger(parsed.updatedAt) && typeof parsed.id === 'string'
      ? parsed
      : { updatedAt: 0, id: '' }
  } catch { return { updatedAt: 0, id: '' } }
}

function encodeCursor(updatedAt, id) {
  return btoa(JSON.stringify({ updatedAt, id }))
}

export async function pullSync(env, userId, cursor, limit) {
  const n = Math.min(100, Math.max(1, Number(limit) || 50)); const c = decodeCursor(cursor)
  const rows = await env.DB.prepare('SELECT id, record_type, payload, updated_at, deleted_at, version FROM user_sync_records WHERE user_id=?1 AND (updated_at>?2 OR (updated_at=?2 AND id>?3)) ORDER BY updated_at,id LIMIT ?4').bind(userId, c.updatedAt, c.id, n).all()
  const items = (rows.results || []).map((row) => ({ id: row.id, type: row.record_type, payload: row.deleted_at ? null : JSON.parse(row.payload), updated_at: row.updated_at, deleted_at: row.deleted_at, version: row.version }))
  return { items, nextCursor: items.length ? encodeCursor(items.at(-1).updated_at, items.at(-1).id) : cursor || null }
}
export async function pushSync(env, userId, operations) {
  if (!Array.isArray(operations) || operations.length > MAX_BATCH) return { error: 'Geçersiz işlem paketi', status: 400 }
  const results = []
  for (const op of operations) {
    if (!validOperation(op) || JSON.stringify(op).length > MAX_OPERATION_BYTES) { results.push({ operationId: op?.operationId || null, status: 'rejected' }); continue }
    const prior = await env.DB.prepare('SELECT user_id, result_json FROM user_sync_operations WHERE operation_id=?1').bind(op.operationId).first()
    if (prior?.user_id === userId) { results.push(JSON.parse(prior.result_json)); continue }
    if (prior) { results.push({ operationId: op.operationId, status: 'rejected' }); continue }
    const existing = await env.DB.prepare('SELECT user_id, version FROM user_sync_records WHERE id=?1').bind(op.id).first()
    if (existing && existing.user_id !== userId) { results.push({ operationId: op.operationId, status: 'rejected' }); continue }
    const now = Date.now(); const version = (existing?.version || 0) + 1
    const accepted = { operationId: op.operationId, status: 'accepted', updated_at: now, version }
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO user_sync_records (id,user_id,device_id,record_type,payload,created_at,updated_at,deleted_at,version) VALUES (?1,?2,?3,?4,?5,?6,?6,?7,?8) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at, deleted_at=excluded.deleted_at, version=excluded.version`).bind(op.id,userId,op.device_id,op.type,JSON.stringify(op.payload || {}),now,op.action === 'delete' ? now : null,version),
      env.DB.prepare('INSERT INTO user_sync_operations (operation_id,user_id,result_json,processed_at) VALUES (?1,?2,?3,?4)').bind(op.operationId,userId,JSON.stringify(accepted),now)
    ])
    results.push(accepted)
  }
  return { results }
}

import { PROXY_BASE_URL } from './aiService'
import { getDeviceId } from './accountService'
import { getAccessToken, getCurrentSession } from './authService'

const PREFIX = 'arac-dedektifi:sync:'
let running = null
const listeners = new Set()

function uuid() {
  return crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
function key(userId, suffix) { return `${PREFIX}${userId}:${suffix}` }
function read(userId, suffix, fallback) { try { return JSON.parse(localStorage.getItem(key(userId, suffix))) || fallback } catch { return fallback } }
function write(userId, suffix, value) { try { localStorage.setItem(key(userId, suffix), JSON.stringify(value)) } catch { /* storage may be unavailable */ } }
function publish(userId, patch) { const next = { ...read(userId, 'status', { pending: 0, lastSuccess: null, error: null }), ...patch }; write(userId, 'status', next); listeners.forEach((fn) => fn(next)); return next }

export function subscribeSync(listener) { listeners.add(listener); return () => listeners.delete(listener) }
export async function getSyncStatus() { const session = await getCurrentSession(); return session ? read(session.user.id, 'status', { pending: read(session.user.id, 'queue', []).length, lastSuccess: null, error: null }) : null }

export async function enqueueSync(type, action, record) {
  const session = await getCurrentSession()
  if (!session || !['favorites', 'garage', 'expertise_notes'].includes(type)) return false
  const id = record.syncId || record.id
  const op = { operationId: uuid(), id, type, action, device_id: getDeviceId(), payload: record }
  const queue = read(session.user.id, 'queue', [])
  write(session.user.id, 'queue', [...queue, op])
  publish(session.user.id, { pending: queue.length + 1, error: null })
  void syncNow()
  return true
}

export async function syncNow() {
  if (running) return running
  running = (async () => {
    if (!navigator.onLine || !PROXY_BASE_URL) return
    const session = await getCurrentSession(); const token = await getAccessToken()
    if (!session || !token) return
    const userId = session.user.id; const base = PROXY_BASE_URL.replace(/\/$/, '')
    publish(userId, { syncing: true, error: null })
    try {
      let queue = read(userId, 'queue', [])
      if (queue.length) {
        const response = await fetch(`${base}/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ operations: queue.slice(0, 50) }) })
        if (!response.ok) throw new Error('sync')
        const data = await response.json(); const done = new Set((data.results || []).filter((r) => r.status === 'accepted').map((r) => r.operationId))
        queue = queue.filter((op) => !done.has(op.operationId)); write(userId, 'queue', queue)
      }
      const cursor = read(userId, 'cursor', null); const response = await fetch(`${base}/sync${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw new Error('sync')
      const data = await response.json(); write(userId, 'cursor', data.nextCursor || cursor)
      if (data.items?.length) {
        const [{ applyFavoriteSync }, { applyExpertiseNoteSync }, { applyGarageSync }] = await Promise.all([
          import('./favoritesService'), import('./expertiseNotesService'), import('./inspectionSessionService')
        ])
        data.items.forEach((item) => {
          if (item.type === 'favorites') applyFavoriteSync(item)
          if (item.type === 'expertise_notes') applyExpertiseNoteSync(item)
          if (item.type === 'garage') applyGarageSync(item)
        })
      }
      publish(userId, { syncing: false, pending: queue.length, lastSuccess: Date.now(), error: null })
    } catch { publish(userId, { syncing: false, error: 'Senkronizasyon daha sonra yeniden denenecek.' }) }
  })().finally(() => { running = null })
  return running
}

export function startSync() { void syncNow(); window.addEventListener('online', syncNow, { once: true }) }

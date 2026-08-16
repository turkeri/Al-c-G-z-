import { FAVORITES_STORAGE_KEY } from '../utils/constants'

function readStore() {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Favoriler okunamadı:', err)
    return []
  }
}

function writeStore(list) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(list))
  } catch (err) {
    console.error('Favoriler kaydedilemedi:', err)
  }
}

export function getFavorites() {
  return readStore().sort((a, b) => b.savedAt - a.savedAt)
}

export function isFavorite(id) {
  return readStore().some((item) => item.id === id)
}

export function addFavorite(record) {
  const list = readStore()
  if (list.some((item) => item.id === record.id)) return list
  const next = [...list, { ...record, syncId: record.syncId || crypto.randomUUID(), savedAt: Date.now() }]
  writeStore(next)
  void import('./syncService').then(({ enqueueSync }) => enqueueSync('favorites', 'upsert', next.at(-1)))
  return next
}

export function removeFavorite(id) {
  const previous = readStore().find((item) => item.id === id)
  const next = readStore().filter((item) => item.id !== id)
  writeStore(next)
  if (previous?.syncId) void import('./syncService').then(({ enqueueSync }) => enqueueSync('favorites', 'delete', previous))
  return next
}

export function toggleFavorite(record) {
  return isFavorite(record.id) ? removeFavorite(record.id) : addFavorite(record)
}

/** Worker'dan gelen kayıtları aynı sync kimliğiyle yerel görünüme uygular. */
export function applyFavoriteSync(item) {
  const list = readStore(); const match = (entry) => (entry.syncId || entry.id) === item.id
  const next = item.deleted_at ? list.filter((entry) => !match(entry)) : [...list.filter((entry) => !match(entry)), item.payload]
  writeStore(next)
}

export function buildFavoriteId(formData) {
  const { brand, model, year, engine, km } = formData
  return [brand, model, year, engine, km].join('|')
}

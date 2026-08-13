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
  const next = [...list, { ...record, savedAt: Date.now() }]
  writeStore(next)
  return next
}

export function removeFavorite(id) {
  const next = readStore().filter((item) => item.id !== id)
  writeStore(next)
  return next
}

export function toggleFavorite(record) {
  return isFavorite(record.id) ? removeFavorite(record.id) : addFavorite(record)
}

export function buildFavoriteId(formData) {
  const { brand, model, year, engine, km } = formData
  return [brand, model, year, engine, km].join('|')
}

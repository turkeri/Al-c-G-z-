const STORAGE_KEY = 'arac-dedektifi:community-notes'

function buildKey(brand, model, engine) {
  return [brand, model, engine || ''].join('|')
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Deneyim notları okunamadı:', err)
    return []
  }
}

function writeStore(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (err) {
    console.error('Deneyim notları kaydedilemedi:', err)
  }
}

export function getNotes(brand, model, engine) {
  const key = buildKey(brand, model, engine)
  return readStore()
    .filter((note) => note.key === key)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function addNote(brand, model, engine, text) {
  const list = readStore()
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    key: buildKey(brand, model, engine),
    text,
    createdAt: Date.now()
  }
  writeStore([...list, record])
  return record
}

export function removeNote(id) {
  writeStore(readStore().filter((note) => note.id !== id))
}

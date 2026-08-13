const STORAGE_KEY = 'arac-dedektifi:paint-checks'

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Boya kontrol raporları okunamadı:', err)
    return []
  }
}

function writeStore(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return true
  } catch (err) {
    console.error('Boya kontrol raporu kaydedilemedi:', err)
    return false
  }
}

export function getPaintChecks() {
  return readStore().sort((a, b) => b.createdAt - a.createdAt)
}

export function savePaintCheck({ vehicleLabel, results }) {
  const list = readStore()
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    vehicleLabel,
    results,
    createdAt: Date.now()
  }
  const saved = writeStore([...list, record])
  return { record, saved }
}

export function removePaintCheck(id) {
  const next = readStore().filter((item) => item.id !== id)
  writeStore(next)
  return next
}

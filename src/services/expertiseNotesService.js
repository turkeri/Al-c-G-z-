const STORAGE_KEY = 'arac-dedektifi:expertise-notes'

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Ekspertiz notları okunamadı:', err)
    return []
  }
}

function writeStore(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (err) {
    console.error('Ekspertiz notları kaydedilemedi:', err)
  }
}

export function getExpertiseNotes() {
  return readStore().sort((a, b) => b.createdAt - a.createdAt)
}

export function addExpertiseNote({ vehicleLabel, flaggedItems, notes }) {
  const list = readStore()
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    vehicleLabel,
    flaggedItems,
    notes,
    createdAt: Date.now()
  }
  writeStore([...list, record])
  return record
}

export function removeExpertiseNote(id) {
  const next = readStore().filter((item) => item.id !== id)
  writeStore(next)
  return next
}

export function summarizeSeverity(flaggedItemCount) {
  if (flaggedItemCount === 0) return { tone: 'excellent', label: 'Sorun bulunamadı' }
  if (flaggedItemCount <= 2) return { tone: 'good', label: 'Az sayıda bulgu' }
  if (flaggedItemCount <= 5) return { tone: 'warning', label: 'Dikkat gerektiren bulgular' }
  return { tone: 'danger', label: 'Çok sayıda bulgu' }
}

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
    return true
  } catch (err) {
    console.error('Ekspertiz notları kaydedilemedi:', err)
    return false
  }
}

export function getExpertiseNotes() {
  return readStore().sort((a, b) => b.createdAt - a.createdAt)
}

export function addExpertiseNote({ vehicleLabel, flaggedItems, notes, photos = [] }) {
  const list = readStore()
  const record = {
    id: crypto.randomUUID(),
    syncId: crypto.randomUUID(),
    vehicleLabel,
    flaggedItems,
    notes,
    photos,
    createdAt: Date.now()
  }
  const saved = writeStore([...list, record])
  if (saved) void import('./syncService').then(({ enqueueSync }) => enqueueSync('expertise_notes', 'upsert', record))
  return { record, saved }
}

export function removeExpertiseNote(id) {
  const previous = readStore().find((item) => item.id === id)
  const next = readStore().filter((item) => item.id !== id)
  writeStore(next)
  if (previous?.syncId) void import('./syncService').then(({ enqueueSync }) => enqueueSync('expertise_notes', 'delete', previous))
  return next
}

/** Worker'dan gelen kayıtları aynı sync kimliğiyle yerel görünüme uygular. */
export function applyExpertiseNoteSync(item) {
  const list = readStore(); const match = (entry) => (entry.syncId || entry.id) === item.id
  const next = item.deleted_at ? list.filter((entry) => !match(entry)) : [...list.filter((entry) => !match(entry)), item.payload]
  writeStore(next)
}

export function summarizeSeverity(flaggedItemCount) {
  if (flaggedItemCount === 0) return { tone: 'excellent', label: 'Sorun bulunamadı' }
  if (flaggedItemCount <= 2) return { tone: 'good', label: 'Az sayıda bulgu' }
  if (flaggedItemCount <= 5) return { tone: 'warning', label: 'Dikkat gerektiren bulgular' }
  return { tone: 'danger', label: 'Çok sayıda bulgu' }
}

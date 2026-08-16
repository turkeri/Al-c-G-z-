import { PROXY_BASE_URL } from './aiService'
import { getDeviceId } from './accountService'
import { getLocalHistory } from './historyService'
import { getFavorites } from './favoritesService'
import { getExpertiseNotes } from './expertiseNotesService'
import { getSession } from './inspectionSessionService'
import { getAccessToken } from './authService'

function garagePayload() {
  const session = getSession()
  return session?.vehicle || session?.updatedAt ? [{ id: 'inspection-session', ...session }] : []
}

export async function linkCurrentDevice() {
  if (!PROXY_BASE_URL) throw new Error('Analiz sunucusu yapılandırılmadı.')
  const token = await getAccessToken()
  if (!token) throw new Error('Oturum gerekli.')
  const response = await fetch(`${PROXY_BASE_URL.replace(/\/$/, '')}/auth/link-device`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      device_id: getDeviceId(),
      history: getLocalHistory(),
      favorites: getFavorites(),
      garage: garagePayload(),
      expertise_notes: getExpertiseNotes()
    })
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || 'Cihaz verileri eşleştirilemedi.')
  return data
}

import { PROXY_BASE_URL } from './aiService'
import { getAccessToken } from './authService'

async function request(path, method = 'GET', body) {
  const token = await getAccessToken()
  if (!token) throw Object.assign(new Error('Giriş gerekli.'), { code: 'unauthenticated' })
  const response = await fetch(`${PROXY_BASE_URL.replace(/\/$/, '')}${path}`, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw Object.assign(new Error(response.status === 403 ? 'Bu alana erişim yetkiniz yok.' : response.status === 401 ? 'Oturumunuzu yenileyip tekrar giriş yapın.' : 'İşlem tamamlanamadı.'), { code: response.status, data })
  return data
}
export const getAdminMe = () => request('/admin/me')
export const getAdminSettings = () => request('/admin/settings')
export const updateAdminSetting = (key, value) => request(`/admin/settings/${encodeURIComponent(key)}`, 'PUT', { value })
export const getAdminAudit = ({ cursor, limit = 50 } = {}) => request(`/admin/audit?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`)
export { can, adminNavigation, canShowAdminLink, canSaveSettings, canLoadMoreAudit, mergeAuditItems } from './adminPermissions'

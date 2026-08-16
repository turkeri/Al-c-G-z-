export function can(permissions, permission) { return Array.isArray(permissions) && permissions.includes(permission) }
export function adminNavigation(permissions) { return [['Genel Bakış','/admin','admin:access'],['Duyurular','/admin/duyurular','announcement:read'],['Ayarlar','/admin/ayarlar','settings:read'],['Denetim Kaydı','/admin/denetim-kaydi','audit:read']].filter(([, , permission]) => can(permissions, permission)) }
export const canShowAdminLink = (permissions) => can(permissions, 'admin:access')
export const canSaveSettings = (permissions) => can(permissions, 'settings:write')
export const canLoadMoreAudit = (cursor) => Boolean(cursor)
export const mergeAuditItems = (current, incoming) => [...current, ...incoming.filter((item) => !current.some((saved) => saved.id === item.id))]

import { ensureUserForAuth } from './ownership.js'

const PERMISSIONS = { admin: ['admin:access','announcement:read','announcement:write','announcement:publish','settings:read','settings:write','audit:read','role:manage'], editor: ['admin:access','announcement:read','announcement:write','announcement:publish'], support: ['admin:access','announcement:read'] }
const SETTINGS = new Set(['maintenance_mode','maintenance_message','minimum_web_version','minimum_android_version','free_analysis_limit','support_email'])
const uuid = () => crypto.randomUUID()

export async function adminActor(env, auth, permission) {
  const userId = await ensureUserForAuth(env, auth)
  if (!userId) return null
  const rows = await env.DB.prepare("SELECT role FROM user_roles WHERE user_id=?1 AND active=1 AND role IN ('admin','editor','support')").bind(userId).all()
  const roles = (rows.results || []).map((r) => r.role)
  const permissions = [...new Set(roles.flatMap((role) => PERMISSIONS[role] || []))]
  return permissions.includes(permission) ? { userId, roles, permissions } : null
}
export function textSafe(value, max) { return typeof value === 'string' && value.trim().length > 0 && value.length <= max && !/[<>]/.test(value) }
export function announcementDates(value) { const start=value?.starts_at; const end=value?.ends_at; const startsAt=start == null || start === '' ? null : Number(start); const endsAt=end == null || end === '' ? null : Number(end); if ((startsAt !== null && !Number.isSafeInteger(startsAt)) || (endsAt !== null && !Number.isSafeInteger(endsAt)) || (startsAt !== null && endsAt !== null && endsAt <= startsAt)) return null; return { startsAt, endsAt } }
export async function audit(env, actor, action, targetType, targetId) { await env.DB.prepare('INSERT INTO admin_audit_logs (id,actor_user_id,action,target_type,target_id,payload,created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)').bind(uuid(), actor.userId, action, targetType, targetId || null, '{}', Date.now()).run() }
export { SETTINGS }

const PROXY_BASE_URL = import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_AI_PROXY_URL || 'https://arac-dedektifi-ai.turkerinurullah.workers.dev'
const KEY='arac-dedektifi:dismissed-announcements'
export function normalizeAnnouncements(value){return Array.isArray(value?.items)?value.items.filter(x=>x&&typeof x.id==='string'&&typeof x.title==='string'&&typeof x.message==='string'&&Number.isFinite(Number(x.version||x.updated_at))).map(x=>({id:x.id,title:x.title,message:x.message,starts_at:x.starts_at||null,ends_at:x.ends_at||null,version:x.version??x.updated_at,updated_at:x.updated_at??null})):[]}
export async function getActiveAnnouncements(){try{const r=await fetch(`${PROXY_BASE_URL.replace(/\/$/,'')}/announcements/active`);return r.ok?normalizeAnnouncements(await r.json()):[]}catch{return[]}}
function read(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return{}}}
export function isDismissed(item){return read()[item.id]===item.version}
export function dismiss(item){try{const current=read();current[item.id]=item.version;localStorage.setItem(KEY,JSON.stringify(current))}catch{/* storage may be disabled */}}

import{ALL_TABLES}from'./schemas.js'
export async function publishedRevision(db){return db.prepare("SELECT r.id,r.revision_number,r.published_at FROM catalog_state s JOIN catalog_revisions r ON r.id=s.published_revision_id WHERE s.singleton_key='active' AND r.status='published'").first()}
export async function revision(db,id){return db.prepare('SELECT id,revision_number,status,label,notes,created_at,validated_at,published_at,validation_error_count,validation_warning_count FROM catalog_revisions WHERE id=?1').bind(id).first()}
export async function counts(db,id){const entries=await Promise.all(Object.entries(ALL_TABLES).map(async([key,s])=>[key,Number((await db.prepare(`SELECT COUNT(*) n FROM ${s.table} WHERE revision_id=?1`).bind(id).first())?.n||0)]));return Object.fromEntries(entries)}
export function page(url){const limit=Math.min(100,Math.max(1,Number(url.searchParams.get('limit'))||50)),cursor=url.searchParams.get('cursor')||'';return{limit,cursor}}
export function nextCursor(items){return items.length?items.at(-1).id:null}

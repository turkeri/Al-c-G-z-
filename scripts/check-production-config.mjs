import { readFile, readdir } from 'node:fs/promises'

const example = await readFile(new URL('../.env.example', import.meta.url), 'utf8')
const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_API_BASE_URL', 'VITE_APP_URL', 'SUPABASE_URL', 'SUPABASE_JWT_ISSUER', 'SUPABASE_JWT_AUDIENCE', 'ALLOWED_ORIGINS', 'APP_ENV']
const mode = process.argv.includes('--example')
const values = process.env
const missing = required.filter((key) => !values[key] && !mode)
const migrations = (await readdir(new URL('../server/d1/migrations/', import.meta.url))).filter((name) => /^000[2-4]_/.test(name)).sort()
if (migrations.join(',') !== '0002_auth_identity_foundation.sql,0003_user_data_ownership.sql,0004_continuous_user_sync.sql') throw new Error('Auth/sync migration sırası geçersiz.')
if (mode) { console.log('Örnek yapılandırma doğrulandı; gerçek değerler kasıtlı olarak boş.'); process.exit(0) }
if (missing.length) throw new Error(`Production yapılandırması eksik: ${missing.join(', ')}`)
for (const key of ['VITE_SUPABASE_URL', 'VITE_API_BASE_URL', 'VITE_APP_URL', 'SUPABASE_URL', 'SUPABASE_JWT_ISSUER']) if (new URL(values[key]).protocol !== 'https:') throw new Error(`${key} HTTPS olmalı.`)
if (values.APP_ENV !== 'production') throw new Error('APP_ENV production olmalı.')
if (/service[_-]?role/i.test(example)) throw new Error('Service-role anahtarı environment örneğinde bulunamaz.')
console.log('Production yapılandırması doğrulandı.')

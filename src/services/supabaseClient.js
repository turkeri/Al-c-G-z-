import { createClient } from '@supabase/supabase-js'

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
const appUrl = String(import.meta.env.VITE_APP_URL || '').trim()

function validHttpsUrl(value) {
  try { return new URL(value).protocol === 'https:' } catch { return false }
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && (!appUrl || validHttpsUrl(appUrl)))

// Publishable/anon anahtar istemci için tasarlanmıştır; service-role anahtarı
// bu uygulamaya hiçbir zaman verilmez. Eksik config uygulamayı bozmaz.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null

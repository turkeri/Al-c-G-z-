import { isSupabaseConfigured, supabase } from './supabaseClient'

function callbackUrl() {
  return `${window.location.origin}${window.location.pathname}#/auth/callback`
}

function requireClient() {
  if (!supabase) throw new Error('Kimlik doğrulama henüz yapılandırılmadı.')
  return supabase
}

export { isSupabaseConfigured }

export async function getCurrentSession() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session || null
}

export async function getAccessToken() {
  const session = await getCurrentSession()
  return session?.access_token || null
}

export function subscribeToAuthState(listener) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => listener(session || null))
  return () => data.subscription.unsubscribe()
}

export async function signInWithGoogle() {
  const client = requireClient()
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callbackUrl() }
  })
  if (error) throw error
}

export async function sendEmailMagicLink(email) {
  const client = requireClient()
  const { error } = await client.auth.signInWithOtp({
    email: String(email || '').trim(),
    options: { emailRedirectTo: callbackUrl() }
  })
  if (error) throw error
}

export async function completeAuthCallback(search = window.location.search) {
  const client = requireClient()
  const params = new URLSearchParams(search)
  const code = params.get('code')
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code)
    if (error) throw error
    return
  }

  // PKCE e-posta şablonu token_hash ile yapılandırılırsa bu güvenli akış kullanılır.
  const tokenHash = params.get('token_hash')
  const type = params.get('type')
  if (tokenHash && type === 'email') {
    const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type: 'email' })
    if (error) throw error
  }
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

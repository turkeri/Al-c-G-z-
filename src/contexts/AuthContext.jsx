import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { completeAuthCallback, getCurrentSession, isSupabaseConfigured, subscribeToAuthState } from '../services/authService'

const AuthContext = createContext(null)

/*
 * Mobilde e-posta uygulamalarının link yönlendirmesi (Gmail'in link sarma/
 * yönlendirme zinciri gibi) bazen HashRouter'ın `#/auth/callback` yolunu
 * kaybedip kullanıcıyı başka bir hash'te (örn. `#/giris`) bırakıyor —
 * `?code=`/`?token_hash=` sorgu parametresi URL'de kalsa da AuthCallbackPage
 * hiç render olmuyor, oturum kurulamıyor. Bu yüzden kodu SADECE o sayfaya
 * değil, uygulamanın ilk açılışına (hangi hash'te olursa olsun) bağladık —
 * tek kullanımlık koddur, tüketildikten sonra URL'den temizlenir ki sayfa
 * yenilenince ikinci kez tüketilmeye çalışılıp hataya düşmesin.
 */
function hasPendingAuthCode(search) {
  const params = new URLSearchParams(search)
  return params.has('code') || (params.has('token_hash') && params.get('type') === 'email')
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState(isSupabaseConfigured ? 'loading' : 'unconfigured')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let mounted = true

    const pendingSearch = window.location.search
    const exchange = hasPendingAuthCode(pendingSearch)
      ? completeAuthCallback(pendingSearch)
          .catch(() => {
            if (mounted) setError('Giriş bağlantısı doğrulanamadı. Lütfen yeniden giriş yapın.')
          })
          .finally(() => {
            const url = new URL(window.location.href)
            url.search = ''
            window.history.replaceState(null, '', url)
          })
      : Promise.resolve()

    exchange
      .then(() => getCurrentSession())
      .then((nextSession) => {
        if (!mounted) return
        setSession(nextSession)
        setStatus(nextSession ? 'authenticated' : 'anonymous')
      })
      .catch(() => {
        if (!mounted) return
        setSession(null)
        setError('Oturum durumu okunamadı. Lütfen tekrar deneyin.')
        setStatus('anonymous')
      })

    const unsubscribe = subscribeToAuthState((nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      setStatus(nextSession ? 'authenticated' : 'anonymous')
      setError(null)
      if (nextSession) import('../services/syncService').then(({ startSync }) => startSync())
    })
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({
    configured: isSupabaseConfigured,
    status,
    loading: status === 'loading',
    session,
    user: session?.user || null,
    error
  }), [status, session, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth AuthProvider içinde kullanılmalıdır.')
  return context
}

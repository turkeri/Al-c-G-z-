import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentSession, isSupabaseConfigured, subscribeToAuthState } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState(isSupabaseConfigured ? 'loading' : 'unconfigured')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let mounted = true

    getCurrentSession()
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

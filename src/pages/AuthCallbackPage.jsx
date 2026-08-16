import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageContainer from '../components/Layout/PageContainer'
import { completeAuthCallback } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { configured } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    if (!configured) return
    completeAuthCallback(location.search)
      .then(() => navigate('/hesap', { replace: true }))
      .catch(() => setError('Giriş bağlantısı doğrulanamadı. Lütfen yeniden giriş yapın.'))
  }, [configured, location.search, navigate])

  return (
    <PageContainer>
      <section className="auth-card">
        <h1>{error ? 'Giriş tamamlanamadı' : 'Giriş doğrulanıyor…'}</h1>
        <p className={error ? 'auth-error' : 'page-intro'}>{error || 'Oturumun güvenli şekilde hazırlanıyor.'}</p>
      </section>
    </PageContainer>
  )
}

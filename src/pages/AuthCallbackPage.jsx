import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/Layout/PageContainer'
import { useAuth } from '../contexts/AuthContext'

/*
 * Kod değişimi artık AuthContext'in kök seviyesinde, uygulamanın ilk
 * açılışında tüketiliyor (bkz. AuthContext.jsx) — mobil e-posta linkleri
 * bazen bu sayfaya hiç düşmeden başka bir hash'te açılabiliyor. Bu sayfa
 * hâlâ o context'in `status`/`error` durumunu izleyip yönlendirir; normal
 * (masaüstü) akışta olduğu gibi doğrudan `/auth/callback`'e düşen istekler
 * için de aynı şekilde çalışır.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { status, error } = useAuth()

  useEffect(() => {
    if (status === 'authenticated') navigate('/', { replace: true })
  }, [status, navigate])

  return (
    <PageContainer>
      <section className="auth-card">
        <h1>{error ? 'Giriş tamamlanamadı' : 'Giriş doğrulanıyor…'}</h1>
        <p className={error ? 'auth-error' : 'page-intro'}>{error || 'Oturumun güvenli şekilde hazırlanıyor.'}</p>
      </section>
    </PageContainer>
  )
}

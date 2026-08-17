import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import PageContainer from '../components/Layout/PageContainer'
import { useAuth } from '../contexts/AuthContext'
import { sendEmailMagicLink, signInWithGoogle } from '../services/authService'

export default function LoginPage() {
  const { configured, loading, user } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user) return <Navigate to={location.state?.from || '/'} replace />

  async function handleGoogle() {
    setBusy(true); setError('')
    try { await signInWithGoogle() } catch { setError('Google ile giriş başlatılamadı. Lütfen tekrar deneyin.') } finally { setBusy(false) }
  }

  async function handleEmail(event) {
    event.preventDefault()
    setBusy(true); setError(''); setStatus('')
    try {
      await sendEmailMagicLink(email)
      setStatus('Giriş bağlantısı e-posta adresine gönderildi. Bağlantıyı bu cihazda açın.')
    } catch {
      setError('Giriş bağlantısı gönderilemedi. E-posta adresini ve yapılandırmayı kontrol edin.')
    } finally { setBusy(false) }
  }

  return (
    <PageContainer>
      <section className="auth-card">
        <p className="eyebrow">HESAP</p>
        <h1>Giriş yap</h1>
        {!configured ? (
          <p className="auth-notice">Giriş özelliği henüz yapılandırılmadı. Anonim araç analizini kullanmaya devam edebilirsin.</p>
        ) : (
          <>
            <p className="page-intro">Hesabınla ileride analizlerini cihazlar arasında taşıyabileceksin.</p>
            <button className="auth-google" type="button" onClick={handleGoogle} disabled={busy}>Google ile devam et</button>
            <div className="auth-divider"><span>veya</span></div>
            <form onSubmit={handleEmail} className="auth-form">
              <label htmlFor="login-email">E-posta adresi</label>
              <input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={busy} />
              <button className="btn btn-primary" type="submit" disabled={busy}>E-posta ile giriş bağlantısı gönder</button>
            </form>
            {status && <p className="auth-success" role="status">{status}</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
          </>
        )}
      </section>
    </PageContainer>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageContainer from '../components/Layout/PageContainer'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from '../services/authService'

export default function AccountPage() {
  const { configured, user } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const provider = user?.app_metadata?.provider || 'e-posta'

  async function handleSignOut() {
    setBusy(true); setError('')
    try { await signOut() } catch { setError('Oturum kapatılamadı. Lütfen tekrar deneyin.') } finally { setBusy(false) }
  }

  return (
    <PageContainer>
      <section className="auth-card">
        <p className="eyebrow">HESAP</p>
        <h1>Hesabım</h1>
        {!configured ? <p className="auth-notice">Giriş özelliği henüz yapılandırılmadı.</p> : !user ? <p><Link to="/giris">Giriş yap</Link></p> : <>
          <dl className="account-summary">
            <div><dt>E-posta</dt><dd>{user.email || 'Paylaşılmadı'}</dd></div>
            <div><dt>Giriş yöntemi</dt><dd>{provider === 'google' ? 'Google' : 'E-posta'}</dd></div>
          </dl>
          <p className="auth-notice">Bulut senkronizasyonu sonraki aşamada etkinleşecek. Mevcut anonim verilerin korunur.</p>
          <p className="page-intro">Hesap silme henüz hazır değil.</p>
          <button className="btn btn-secondary" type="button" onClick={handleSignOut} disabled={busy}>Oturumu kapat</button>
          {error && <p className="auth-error" role="alert">{error}</p>}
        </>}
      </section>
    </PageContainer>
  )
}

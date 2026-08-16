import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageContainer from '../components/Layout/PageContainer'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from '../services/authService'
import { linkCurrentDevice } from '../services/deviceLinkService'
import { getSyncStatus, startSync, subscribeSync, syncNow } from '../services/syncService'

export default function AccountPage() {
  const { configured, user } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [linkState, setLinkState] = useState({ status: 'idle', result: null })
  const [syncState, setSyncState] = useState(null)
  const provider = user?.app_metadata?.provider || 'e-posta'

  async function handleSignOut() {
    setBusy(true); setError('')
    try { await signOut() } catch { setError('Oturum kapatılamadı. Lütfen tekrar deneyin.') } finally { setBusy(false) }
  }

  async function handleLinkDevice() {
    setLinkState({ status: 'loading', result: null })
    try {
      const result = await linkCurrentDevice()
      setLinkState({ status: 'done', result })
      startSync()
    } catch (linkError) {
      setLinkState({ status: 'error', result: linkError.message })
    }
  }

  useEffect(() => {
    if (configured && user && linkState.status === 'idle') handleLinkDevice()
  // İlk girişte otomatik denenir; kullanıcı başarısız olursa düğmeyle yeniden dener.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, user])

  useEffect(() => {
    if (!user) return undefined
    void getSyncStatus().then(setSyncState)
    return subscribeSync(setSyncState)
  }, [user])

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
          <p className="auth-notice">Bu cihazdaki geçmiş, favoriler, devam eden kontrol ve ekspertiz notları hesabına bir kez bağlanabilir. Mevcut anonim verilerin silinmez.</p>
          <section className="account-link-status">
            <h2>Bu cihazdaki veriler</h2>
            {linkState.status === 'loading' && <p>Bu cihazdaki kayıtlar hesabınla eşleştiriliyor…</p>}
            {linkState.status === 'done' && <p className="auth-success">Eşleştirildi: {linkState.result.counts.history} geçmiş, {linkState.result.counts.favorites} favori, {linkState.result.counts.garage} garaj kaydı, {linkState.result.counts.expertiseNotes} ekspertiz notu.</p>}
            {linkState.status === 'error' && <p className="auth-error">{linkState.result}</p>}
            <button className="btn btn-secondary" type="button" onClick={handleLinkDevice} disabled={linkState.status === 'loading'}>Bu cihazdaki verileri hesabımla eşleştir</button>
          </section>
          <section className="account-link-status">
            <h2>Bulut senkronizasyonu</h2>
            <p>{syncState?.syncing ? 'Eşitleniyor…' : syncState?.error || (syncState?.lastSuccess ? `Son eşitleme: ${new Date(syncState.lastSuccess).toLocaleString('tr-TR')}` : 'Henüz eşitlenmedi.')}</p>
            <p>Bekleyen işlem: {syncState?.pending || 0}{navigator.onLine ? '' : ' · Çevrimdışı'}</p>
            <button className="btn btn-secondary" type="button" onClick={() => void syncNow()} disabled={syncState?.syncing}>Şimdi eşitle</button>
          </section>
          <p className="page-intro">Hesap silme henüz hazır değil.</p>
          <button className="btn btn-secondary" type="button" onClick={handleSignOut} disabled={busy}>Oturumu kapat</button>
          {error && <p className="auth-error" role="alert">{error}</p>}
        </>}
      </section>
    </PageContainer>
  )
}

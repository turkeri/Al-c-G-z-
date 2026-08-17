import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import { useAuth } from '../contexts/AuthContext'
import { getAccessToken } from '../services/authService'
import { PROXY_BASE_URL } from '../services/aiService'
import { adminNavigation, getAdminMe } from '../services/adminService'

async function api(path, method = 'GET', body) {
  const token = await getAccessToken()
  const res = await fetch(`${PROXY_BASE_URL.replace(/\/$/, '')}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(res.status === 403 ? 'Bu alana erişim yetkiniz yok.' : 'İşlem tamamlanamadı.')
  return data
}

export default function AdminPage() {
  const { user } = useAuth()
  const [state, setState] = useState('loading')
  const [items, setItems] = useState([])
  const [permissions, setPermissions] = useState([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = () =>
    api('/admin/announcements')
      .then((d) => {
        setItems(d.items)
        setState('ready')
      })
      .catch((e) => {
        setError(e.message)
        setState('denied')
      })

  useEffect(() => {
    if (!user) return
    getAdminMe()
      .then((m) => setPermissions(m.permissions))
      .catch(() => setPermissions([]))
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function create(event) {
    event.preventDefault()
    try {
      await api('/admin/announcements', 'POST', { title, message })
      setTitle('')
      setMessage('')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user) {
    return (
      <PageContainer>
        <p className="page-intro">Giriş yapmanız gerekiyor.</p>
      </PageContainer>
    )
  }

  return (
    <>
      <Header title="Yönetim" subtitle="Katalog, duyuru ve ayarlara buradan ulaşabilirsin." showBack />
      <PageContainer>
        {state === 'loading' && <p className="page-intro">Yetki kontrol ediliyor…</p>}

        {state === 'denied' && (
          <section className="auth-card">
            <p className="auth-error" role="alert">{error}</p>
            <Link className="btn btn-secondary" to="/">Uygulamaya dön</Link>
          </section>
        )}

        {state === 'ready' && (
          <>
            <nav className="admin-nav">
              {adminNavigation(permissions).map(([label, to]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin'}
                  className={({ isActive }) => 'admin-nav-item' + (isActive ? ' is-active' : '')}
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <section className="auth-card">
              <p className="eyebrow">DUYURULAR</p>
              <h1>Yeni duyuru</h1>
              <form className="auth-form" onSubmit={create}>
                <input
                  value={title}
                  maxLength={120}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Başlık"
                  required
                />
                <textarea
                  value={message}
                  maxLength={2000}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Duyuru metni"
                  required
                />
                <button className="btn btn-primary" type="submit">Taslak oluştur</button>
              </form>
              {error && <p className="auth-error" role="alert">{error}</p>}

              <div className="saved-list">
                {items.map((item) => (
                  <div className="saved-item" key={item.id}>
                    <span className="saved-item-body">
                      <span className="saved-item-title">{item.title}</span>
                      <span className="saved-item-meta">{item.status}</span>
                    </span>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => api(`/admin/announcements/${item.id}/publish`, 'POST').then(load)}
                    >
                      Yayınla
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => api(`/admin/announcements/${item.id}/archive`, 'POST').then(load)}
                    >
                      Arşivle
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </PageContainer>
    </>
  )
}

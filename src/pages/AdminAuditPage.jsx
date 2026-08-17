import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import PageContainer from '../components/Layout/PageContainer'
import { adminNavigation, getAdminAudit, getAdminMe } from '../services/adminService'

export default function AdminAuditPage() {
  const [permissions, setPermissions] = useState([])
  const [items, setItems] = useState([])
  const [cursor, setCursor] = useState(undefined)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const d = await getAdminAudit({ cursor })
      setItems((x) => [...x, ...d.items.filter((i) => !x.some((v) => v.id === i.id))])
      setCursor(d.nextCursor || null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAdminMe().then((m) => setPermissions(m.permissions)).catch(() => setPermissions([]))
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PageContainer>
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
        <p className="eyebrow">YÖNETİM</p>
        <h1>Denetim Kaydı</h1>
        {error && <p className="auth-error" role="alert">{error}</p>}

        <div className="saved-list">
          {items.map((item) => (
            <div className="saved-item" key={item.id}>
              <span className="saved-item-body">
                <span className="saved-item-title">{item.action}</span>
                <span className="saved-item-meta">
                  {item.target_type} · {new Date(item.created_at).toLocaleString('tr-TR')}
                </span>
              </span>
            </div>
          ))}
        </div>

        {!loading && !items.length && !error && <p className="page-intro">Kayıt yok.</p>}
        {cursor && (
          <button className="btn btn-secondary" disabled={loading} onClick={() => void load()}>
            Daha fazla yükle
          </button>
        )}
      </section>
    </PageContainer>
  )
}

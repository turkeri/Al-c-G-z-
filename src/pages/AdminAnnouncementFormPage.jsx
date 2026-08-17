import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import PageContainer from '../components/Layout/PageContainer'
import {
  createAnnouncement,
  getAdminAnnouncements,
  getAdminMe,
  updateAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
  archiveAnnouncement,
  adminNavigation
} from '../services/adminService'
import { actionsForAnnouncement, announcementPayload, epochToLocal, validAnnouncementForm } from '../services/announcementUi'

const STATUS_HANDLERS = { publish: publishAnnouncement, unpublish: unpublishAnnouncement, archive: archiveAnnouncement }
const STATUS_VERBS = { publish: 'yayınlamak', unpublish: 'yayından kaldırmak', archive: 'arşivlemek' }
const STATUS_LABELS = { publish: 'Yayınla', unpublish: 'Yayından kaldır', archive: 'Arşivle' }

export default function AdminAnnouncementFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', message: '', starts_at: '', ends_at: '' })
  const [item, setItem] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => {
    Promise.all([getAdminMe(), id ? getAdminAnnouncements() : Promise.resolve({ items: [] })])
      .then(([me, d]) => {
        setPermissions(me.permissions)
        if (!id) return
        const found = d.items.find((x) => x.id === id)
        if (!found) {
          setError('Duyuru bulunamadı.')
          return
        }
        setItem(found)
        setForm({
          title: found.title,
          message: found.message,
          starts_at: epochToLocal(found.starts_at),
          ends_at: epochToLocal(found.ends_at)
        })
      })
      .catch((e) => setError(e.message))
  }, [id])

  const actions = actionsForAnnouncement(item || { status: 'draft' }, permissions)

  async function save() {
    if (!validAnnouncementForm(form)) {
      setError('Başlık, mesaj ve tarihleri kontrol edin.')
      return
    }
    setBusy(true)
    try {
      if (id) {
        await updateAnnouncement(id, announcementPayload(form))
      } else {
        const created = await createAnnouncement(announcementPayload(form))
        navigate(`/admin/duyurular/${created.id}`, { replace: true })
      }
      setOk('Taslak kaydedildi.')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function status(action) {
    if (!window.confirm(`“${form.title}” duyurusunu ${STATUS_VERBS[action]} istiyor musunuz?`)) return
    setBusy(true)
    try {
      await STATUS_HANDLERS[action](id)
      const d = await getAdminAnnouncements()
      setItem(d.items.find((x) => x.id === id))
      setOk('Durum güncellendi.')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

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
        <h1>{id ? 'Duyuruyu düzenle' : 'Yeni duyuru'}</h1>
        <p><Link to="/admin/duyurular">Listeye dön</Link></p>
        {error && <p className="auth-error">{error}</p>}
        {ok && <p className="auth-success">{ok}</p>}

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <label>
            Başlık
            <input
              value={form.title}
              disabled={!actions.includes('save') || busy}
              maxLength={120}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            Mesaj
            <textarea
              value={form.message}
              disabled={!actions.includes('save') || busy}
              maxLength={2000}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </label>
          <label>
            Başlangıç
            <input
              type="datetime-local"
              value={form.starts_at}
              disabled={!actions.includes('save') || busy}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />
          </label>
          <label>
            Bitiş
            <input
              type="datetime-local"
              value={form.ends_at}
              disabled={!actions.includes('save') || busy}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            />
          </label>

          <div className="button-row">
            {actions.includes('save') && (
              <button className="btn btn-primary" disabled={busy} type="button" onClick={save}>
                Taslak kaydet
              </button>
            )}
            {actions
              .filter((a) => a !== 'save')
              .map((a) => (
                <button key={a} className="btn btn-secondary" disabled={busy} type="button" onClick={() => status(a)}>
                  {STATUS_LABELS[a] || a}
                </button>
              ))}
          </div>
        </form>
      </section>
    </PageContainer>
  )
}

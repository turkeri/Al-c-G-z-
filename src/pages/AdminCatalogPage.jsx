import { useEffect, useState } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom'
import PageContainer from '../components/Layout/PageContainer'
import AdminCatalogEntityForm from '../components/AdminCatalogEntityForm'
import AdminCatalogReviewPanel from '../components/AdminCatalogReviewPanel'
import AdminCatalogEntityListPanel from '../components/AdminCatalogEntityListPanel'
import { adminNavigation, getAdminMe } from '../services/adminService'
import {
  createRevision,
  getRevisionSummary,
  listRevisions,
  publishRevision,
  rollbackCatalog,
  validateRevision
} from '../services/adminCatalogService'

const sections = {
  markalar: 'brands',
  modeller: 'models',
  nesiller: 'generations',
  motorlar: 'engines',
  sanzimanlar: 'transmissions',
  paketler: 'packages',
  donanimlar: 'equipment',
  varyantlar: 'vehicleVariants',
  'sorun-arketipleri': 'problemArchetypes',
  sorunlar: 'problemApplicability',
  bakim: 'maintenanceItems',
  'bakim-kapsamlari': 'maintenanceApplicability',
  degerler: 'referenceValues',
  faktorler: 'valuationFactors'
}

export default function AdminCatalogPage() {
  const { revisionId, section, entityId } = useParams()
  const entity = sections[section]
  const [permissions, setPermissions] = useState([])
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const can = (permission) => permissions.includes(permission)

  async function load() {
    setError('')
    try {
      setPermissions((await getAdminMe()).permissions)
      if (!revisionId) setData(await listRevisions())
      else setData(await getRevisionSummary(revisionId))
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisionId, section])

  async function action(fn) {
    if (busy) return
    setBusy(true)
    try {
      await fn()
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const readOnly = Boolean(data?.revision?.status && data.revision.status !== 'draft')

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
        <p className="eyebrow">YÖNETİM · KATALOG</p>
        <h1>{entity ? `${section} yönetimi` : revisionId ? 'Katalog revizyonu' : 'Katalog revizyonları'}</h1>
        {revisionId && (
          <p>
            <Link to={`/admin/katalog/revizyonlar/${encodeURIComponent(revisionId)}`}>Özet</Link>
            {' · '}
            <Link to={`/admin/katalog/revizyonlar/${encodeURIComponent(revisionId)}/inceleme`}>İnceleme</Link>
          </p>
        )}
        {error && <p className="auth-error">{error}</p>}

        {entityId && (
          <AdminCatalogEntityForm
            revisionId={revisionId}
            entity={entity}
            id={entityId === 'yeni' ? null : entityId}
            readOnly={!can('catalog:write') || readOnly}
          />
        )}

        {!entityId && (
          <>
            {section === 'inceleme' && (
              <AdminCatalogReviewPanel revisionId={revisionId} permissions={permissions} readOnly={readOnly} />
            )}

            {section !== 'inceleme' && entity && (
              <AdminCatalogEntityListPanel
                revisionId={revisionId}
                entity={entity}
                section={section}
                permissions={permissions}
                readOnly={readOnly}
              />
            )}

            {section !== 'inceleme' && !entity && (
              <>
                {!revisionId && can('catalog:write') && (
                  <p className="button-row">
                    <button
                      disabled={busy}
                      className="btn btn-primary"
                      onClick={() => action(() => createRevision({ label: 'Yeni boş taslak' }))}
                    >
                      Yeni boş taslak
                    </button>
                    <button
                      disabled={busy}
                      className="btn btn-secondary"
                      onClick={() =>
                        action(() => createRevision({ label: 'Published kopyası', cloneFromPublished: true }))
                      }
                    >
                      Published’dan taslak oluştur
                    </button>
                  </p>
                )}
                {revisionId && (
                  <>
                    <p className="button-row">
                      {can('catalog:validate') && (
                        <button
                          disabled={busy}
                          className="btn btn-secondary"
                          onClick={() => action(() => validateRevision(revisionId))}
                        >
                          Doğrula
                        </button>
                      )}
                      {can('catalog:publish') && (
                        <button
                          disabled={busy}
                          className="btn btn-primary"
                          onClick={() => confirm('Yayınlansın mı?') && action(() => publishRevision(revisionId))}
                        >
                          Yayınla
                        </button>
                      )}
                      {can('catalog:rollback') && (
                        <button
                          disabled={busy}
                          className="btn btn-secondary"
                          onClick={() => {
                            const reason = prompt('Rollback gerekçesi')
                            if (reason) action(() => rollbackCatalog(revisionId, reason))
                          }}
                        >
                          Rollback
                        </button>
                      )}
                    </p>
                    <nav className="admin-catalog-nav">
                      {Object.keys(sections).map((key) => (
                        <Link key={key} to={`/admin/katalog/revizyonlar/${encodeURIComponent(revisionId)}/${key}`}>
                          {key}
                        </Link>
                      ))}
                    </nav>
                  </>
                )}

                <div className="saved-list">
                  {(data?.items || []).map((item) => (
                    <div className="saved-item" key={item.id}>
                      <span className="saved-item-body">
                        <span className="saved-item-title">
                          {item.display_name || item.title || item.label || item.id}
                        </span>
                        <span className="saved-item-meta">
                          {item.status || item.source_confidence || item.confidence || ''}
                        </span>
                      </span>
                      {!revisionId && (
                        <Link
                          className="btn btn-secondary"
                          to={`/admin/katalog/revizyonlar/${encodeURIComponent(item.id)}`}
                        >
                          Aç
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
                {data?.items?.length === 0 && <p className="page-intro">Kayıt bulunamadı.</p>}
                {data && !data.items && <pre className="catalog-review">{JSON.stringify(data, null, 2)}</pre>}
              </>
            )}
          </>
        )}
      </section>
    </PageContainer>
  )
}

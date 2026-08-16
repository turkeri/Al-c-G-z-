import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FIELD_OPTIONS } from '../services/adminCatalogForms'
import { archiveEntity, listEntities } from '../services/adminCatalogService'
import { buildEntityUrlParams, filterFieldMeta, filtersFor, mergeEntityItems, parseEntityFilters } from '../services/catalogEntityListUi'

/**
 * Katalog entity listeleri (marka, model, motor, paket, donanım, varyant,
 * sorun/bakım/değer kayıtları — 14 tip) için tek, şema tabanlı ekran.
 *
 * Her entity'nin filtrelenebilir alanları backend'in allowlist'inden
 * (catalogEntityListUi.ENTITY_LIST_CONFIG, entity-list.js'in birebir aynası)
 * ve widget tipleri paylaşılan form şemasından (adminCatalogForms.ENTITY_FORMS)
 * türetilir — her entity için ayrı ekran tasarlamak yerine tek bileşen, 14
 * farklı filtre setini render eder.
 *
 * Arama VE filtreler URL query parametrelerinde tutulur (React Router
 * useSearchParams): sayfa yenilenince, geri/ileri gidince ya da link
 * paylaşılınca aynı liste görünür. Tek yazma yolu vardır — hem arama kutusu
 * hem filtre seçimleri 400ms gecikmeyle URL'e yazılır; asıl veri isteği
 * yalnızca URL gerçekten değiştiğinde tetiklenir, ara tuş vuruşlarında değil.
 */
export default function AdminCatalogEntityListPanel({ revisionId, entity, section, permissions, readOnly }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [localFilters, setLocalFilters] = useState(() => parseEntityFilters(entity, searchParams))
  const [items, setItems] = useState([])
  const [cursor, setCursor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState(null)
  const [busyId, setBusyId] = useState('')
  const [parentOptions, setParentOptions] = useState({})
  const lastUrlRef = useRef(searchParams.toString())
  const requestSeq = useRef(0)
  const can = (p) => permissions.includes(p)
  const fields = filtersFor(entity)

  // Dışarıdan URL değişirse (tarayıcı geri/ileri, entity/revision değişimi,
  // paylaşılan bir link) yerel filtreler URL'den yeniden okunur.
  useEffect(() => {
    const current = searchParams.toString()
    if (current === lastUrlRef.current) return
    lastUrlRef.current = current
    setLocalFilters(parseEntityFilters(entity, searchParams))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, entity])

  // Kullanıcı yazarken/seçim yaparken yerel durum anında güncellenir; URL'e
  // (ve dolayısıyla ağ isteğine) yazım 400ms sessizlikten sonra olur.
  useEffect(() => {
    const next = buildEntityUrlParams(entity, localFilters)
    const committed = next.toString()
    if (committed === lastUrlRef.current) return
    const timer = setTimeout(() => {
      lastUrlRef.current = committed
      setSearchParams(next, { replace: true })
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters])

  async function load(nextCursor) {
    const seq = ++requestSeq.current
    setLoading(true)
    setError('')
    setErrorCode(null)
    try {
      const { q, filters } = parseEntityFilters(entity, searchParams)
      const data = await listEntities(revisionId, entity, { search: q, filters, cursor: nextCursor, limit: 50 })
      if (seq !== requestSeq.current) return
      setItems((current) => (nextCursor ? mergeEntityItems(current, data.items || []) : data.items || []))
      setCursor(data.nextCursor || '')
    } catch (e) {
      if (seq !== requestSeq.current) return
      setError(e.message)
      setErrorCode(e.code ?? null)
    } finally {
      if (seq === requestSeq.current) setLoading(false)
    }
  }

  // Asıl veri isteği yalnız gerçekten YAZILMIŞ URL değişince tetiklenir —
  // localFilters'taki her tuş vuruşunda değil. Entity/revision değişince de
  // eski liste ve cursor sıfırlanır.
  useEffect(() => {
    setItems([])
    setCursor('')
    load('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisionId, entity, searchParams.toString()])

  function setField(field, value) {
    setLocalFilters((current) => ({ ...current, filters: { ...current.filters, [field]: value } }))
  }

  function resetFilters() {
    lastUrlRef.current = ''
    setLocalFilters({ q: '', filters: {} })
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  async function loadParentOptions(parentEntity) {
    if (!parentEntity || parentOptions[parentEntity]) return
    try {
      const data = await listEntities(revisionId, parentEntity, { limit: 100 })
      setParentOptions((current) => ({ ...current, [parentEntity]: data.items || [] }))
    } catch {
      // Üst kayıt listesi yüklenemezse filtre kutusu boş kalır; arama ve
      // diğer filtreler yine de çalışmaya devam eder.
    }
  }

  async function archive(item) {
    if (busyId) return
    if (!confirm('Arşivlensin mi?')) return
    setBusyId(item.id)
    try {
      await archiveEntity(revisionId, entity, item.id)
      await load('')
    } catch (e) {
      setError(e.message)
      setErrorCode(e.code ?? null)
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="entity-list-panel">
      <div className="form-row">
        <input
          aria-label="Katalog arama"
          value={localFilters.q}
          onChange={(e) => setLocalFilters((current) => ({ ...current, q: e.target.value }))}
          placeholder="Ara…"
        />
        {fields.map((field) => {
          const meta = filterFieldMeta(entity, field)
          if (meta.type === 'boolean') {
            return (
              <select key={field} aria-label={meta.label} value={localFilters.filters[field] || ''} onChange={(e) => setField(field, e.target.value)}>
                <option value="">{meta.label} (tümü)</option>
                <option value="1">Aktif</option>
                <option value="0">Pasif</option>
              </select>
            )
          }
          if (FIELD_OPTIONS[meta.type]) {
            return (
              <select key={field} aria-label={meta.label} value={localFilters.filters[field] || ''} onChange={(e) => setField(field, e.target.value)}>
                <option value="">{meta.label} (tümü)</option>
                {FIELD_OPTIONS[meta.type].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            )
          }
          if (meta.type.startsWith('parent:')) {
            const parentEntity = meta.type.slice(7)
            return (
              <select
                key={field}
                aria-label={meta.label}
                value={localFilters.filters[field] || ''}
                onFocus={() => loadParentOptions(parentEntity)}
                onChange={(e) => setField(field, e.target.value)}
              >
                <option value="">{meta.label} (tümü)</option>
                {(parentOptions[parentEntity] || []).map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.display_name || row.title || row.id}
                  </option>
                ))}
              </select>
            )
          }
          return (
            <input
              key={field}
              aria-label={meta.label}
              value={localFilters.filters[field] || ''}
              onChange={(e) => setField(field, e.target.value)}
              placeholder={meta.label}
            />
          )
        })}
        <button type="button" className="btn btn-secondary" onClick={resetFilters}>
          Filtreleri temizle
        </button>
      </div>

      {can('catalog:write') && !readOnly && (
        <p>
          <Link className="btn btn-primary" to={`/admin/katalog/revizyonlar/${encodeURIComponent(revisionId)}/${section}/yeni`}>
            Yeni kayıt
          </Link>
        </p>
      )}

      {errorCode === 401 && (
        <p className="auth-error">
          {error} <Link to="/giris">Giriş yap</Link>
        </p>
      )}
      {error && errorCode !== 401 && (
        <p className="auth-error">
          {error}{' '}
          <button type="button" className="btn btn-secondary" onClick={() => load(cursor)}>
            Tekrar dene
          </button>
        </p>
      )}
      {loading && !items.length && <p>Yükleniyor…</p>}
      {!loading && !items.length && !error && <p>Kayıt bulunamadı.</p>}

      <div className="saved-list">
        {items.map((item) => (
          <div className="saved-item" key={item.id}>
            <span className="saved-item-body">
              <b>{item.display_name || item.title || item.id}</b>
              <span>{item.status || item.source_confidence || item.confidence || ''}</span>
            </span>
            <Link to={`/admin/katalog/revizyonlar/${encodeURIComponent(revisionId)}/${section}/${encodeURIComponent(item.id)}`}>
              {can('catalog:write') && !readOnly ? 'Düzenle' : 'İncele'}
            </Link>
            {can('catalog:write') && !readOnly && item.active !== undefined && (
              <button type="button" className="btn btn-secondary" disabled={busyId === item.id} onClick={() => archive(item)}>
                Arşivle
              </button>
            )}
          </div>
        ))}
      </div>

      {cursor && (
        <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => load(cursor)}>
          Daha fazla yükle
        </button>
      )}
    </div>
  )
}

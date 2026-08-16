import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReview, listEntities, listReview, reviewAction } from '../services/adminCatalogService'
import {
  REVIEW_CONFIDENCES,
  REVIEW_STATUSES,
  buildReviewQuery,
  canAcceptReview,
  mergeReviewItems,
  parseSourceSummary,
  reasonCodeLabel,
  reviewActionsFor,
  statusLabel
} from '../services/catalogReviewUi'

const ENTITY_TYPES = [
  'brands', 'models', 'generations', 'engines', 'transmissions', 'packages', 'equipment',
  'vehicleVariants', 'problemArchetypes', 'problemApplicability', 'maintenanceItems',
  'maintenanceApplicability', 'referenceValues', 'valuationFactors'
]

const ACTION_LABEL = { accept: 'Kabul et', reject: 'Reddet', defer: 'Ertele' }
const CONFIRM_LABEL = { accept: 'Kabul', reject: 'Ret', defer: 'Erteleme' }

/**
 * Katalog review ekranı: pending/accepted/rejected/deferred kayıtları
 * filtreler, cursor ile sayfalar ve draft revision üzerinde accept/reject/
 * defer işlemlerini yürütür.
 *
 * Yalnız bu revision draft ise (readOnly=false) ve kullanıcı catalog:write
 * iznine sahipse aksiyon düğmeleri görünür — support salt okunur kalır.
 */
export default function AdminCatalogReviewPanel({ revisionId, permissions, readOnly }) {
  const [status, setStatus] = useState('pending')
  const [confidence, setConfidence] = useState('')
  const [type, setType] = useState('')
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [cursor, setCursor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState(null)
  const [busyId, setBusyId] = useState('')
  const [picks, setPicks] = useState({})
  const [targetOptions, setTargetOptions] = useState({})
  const requestSeq = useRef(0)

  async function load(nextCursor) {
    const seq = ++requestSeq.current
    setLoading(true)
    setError('')
    setErrorCode(null)
    try {
      const query = buildReviewQuery({ status, confidence, type, q, cursor: nextCursor, limit: 50 })
      const data = await listReview(revisionId, query)
      if (seq !== requestSeq.current) return
      setItems((current) => (nextCursor ? mergeReviewItems(current, data.items || []) : data.items || []))
      setCursor(data.nextCursor || '')
    } catch (e) {
      if (seq !== requestSeq.current) return
      setError(e.message)
      setErrorCode(e.code ?? null)
    } finally {
      if (seq === requestSeq.current) setLoading(false)
    }
  }

  // Filtre ya da revision değişince eski liste ve cursor sıfırlanır; arama
  // alanı 400 ms gecikmeyle tetiklenir, her tuşta ağ isteği atılmaz.
  useEffect(() => {
    const timer = setTimeout(() => {
      setItems([])
      setCursor('')
      load('')
    }, q ? 400 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisionId, status, confidence, type, q])

  async function loadTargetOptions(entityType) {
    if (!entityType || targetOptions[entityType]) return
    try {
      const data = await listEntities(revisionId, entityType, { limit: 100 })
      setTargetOptions((current) => ({ ...current, [entityType]: data.items || [] }))
    } catch {
      // Hedef listesi yüklenemezse seçim kutusu boş kalır; mevcut
      // proposed_target_id varsa kabul yine de onunla denenebilir.
    }
  }

  async function act(item, action) {
    if (busyId) return
    if (!confirm(`${CONFIRM_LABEL[action]} işlemi uygulansın mı?`)) return
    setBusyId(item.id)
    setError('')
    setErrorCode(null)
    try {
      const payload = { expectedVersion: item.version }
      if (action === 'accept') payload.proposed_target_id = picks[item.id] || item.proposed_target_id
      await reviewAction(revisionId, item.id, action, payload)
      await load('')
    } catch (e) {
      setError(e.message)
      setErrorCode(e.code ?? null)
      // 409/422 sonrası kayıt başka biri tarafından değişmiş olabilir; tek
      // kaydı tazeleyip listedeki eski version/status'u günceller.
      try {
        const fresh = await getReview(revisionId, item.id)
        setItems((current) => current.map((i) => (i.id === item.id ? fresh : i)))
      } catch {
        // Tazeleme başarısız olursa liste bir sonraki filtre değişiminde düzelir.
      }
    } finally {
      setBusyId('')
    }
  }

  function resetFilters() {
    setStatus('')
    setConfidence('')
    setType('')
    setQ('')
  }

  return (
    <div className="review-panel">
      <div className="form-row">
        <select aria-label="Durum filtresi" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Durum (tümü)</option>
          {REVIEW_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
        <select aria-label="Confidence filtresi" value={confidence} onChange={(e) => setConfidence(e.target.value)}>
          <option value="">Confidence (tümü)</option>
          {REVIEW_CONFIDENCES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select aria-label="Entity tipi filtresi" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Entity tipi (tümü)</option>
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          aria-label="Review ara"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Kaynak anahtarı / gerekçe ara…"
        />
        <button type="button" className="btn btn-secondary" onClick={resetFilters}>
          Filtreleri temizle
        </button>
      </div>

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
        {items.map((item) => {
          const actions = readOnly ? [] : reviewActionsFor(item.status, permissions)
          const summary = parseSourceSummary(item.source_summary_json)
          const busy = busyId === item.id
          return (
            <div className="saved-item review-item" key={item.id}>
              <span className="saved-item-body">
                <b>
                  {item.entity_type} · {item.source_type}:{item.source_key}
                </b>
                <span>
                  {statusLabel(item.status)} · {item.confidence} · {reasonCodeLabel(item.reason_code)}
                </span>
                {summary.length > 0 && (
                  <span className="review-summary">{summary.map(([k, v]) => `${k}: ${v}`).join(' · ')}</span>
                )}
                {item.proposed_target_id && <span>Önerilen hedef: {item.proposed_target_id}</span>}
              </span>

              {actions.includes('accept') && (
                <select
                  aria-label="Canonical hedef seç"
                  value={picks[item.id] || item.proposed_target_id || ''}
                  onFocus={() => loadTargetOptions(item.entity_type)}
                  onChange={(e) => setPicks((current) => ({ ...current, [item.id]: e.target.value }))}
                >
                  <option value="">Hedef seçiniz</option>
                  {(targetOptions[item.entity_type] || []).map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.display_name || row.title || row.id}
                    </option>
                  ))}
                </select>
              )}

              {actions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className={action === 'accept' ? 'btn btn-primary' : 'btn btn-secondary'}
                  disabled={busy || (action === 'accept' && !canAcceptReview(item, picks[item.id]))}
                  onClick={() => act(item, action)}
                >
                  {ACTION_LABEL[action]}
                </button>
              ))}
            </div>
          )
        })}
      </div>

      {cursor && (
        <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => load(cursor)}>
          Daha fazla yükle
        </button>
      )}
    </div>
  )
}

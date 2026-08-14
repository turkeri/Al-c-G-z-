import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import EmptyState from '../components/EmptyState'
import Icon from '../components/icons/Icon'
import { formatKm, formatPrice } from '../utils/formatters'
import { getFavorites, removeFavorite } from '../services/favoritesService'
import { analyzeVehicle } from '../services/analysisService'
import { getExpertiseNotes } from '../services/expertiseNotesService'
import { getPaintChecks } from '../services/paintCheckStorageService'
import { getProgress, vehicleLabel } from '../services/inspectionSessionService'

const MAX_COMPARE = 3

/**
 * Garajım.
 *
 * Kullanıcının biriktirdiği her şey burada: favori araçlar, devam eden yerinde
 * kontrol, kaydedilmiş ekspertiz notları ve boya kontrolleri. Daha önce bunlar
 * dört ayrı menüdeydi ve hiçbiri diğerinden haberdar değildi.
 */
export default function GaragePage() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState(() => getFavorites())
  const [selected, setSelected] = useState([])

  const notes = useMemo(() => getExpertiseNotes(), [])
  const paintChecks = useMemo(() => getPaintChecks(), [])
  const progress = useMemo(() => getProgress(), [])

  function handleRemove(id) {
    setFavorites(removeFavorite(id))
    setSelected((prev) => prev.filter((s) => s !== id))
  }

  function handleOpen(favorite) {
    const result = analyzeVehicle(favorite.formData)
    navigate('/sonuc', { state: { formData: favorite.formData, result } })
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, id]
    })
  }

  const isEmpty =
    favorites.length === 0 && notes.length === 0 && paintChecks.length === 0 && progress.doneCount === 0

  return (
    <>
      <Header title="Garajım" subtitle="Kaydettiğin araçlar ve kontrol bulguların." />
      <PageContainer>
        {isEmpty && (
          <EmptyState
            icon="garage"
            title="Garajın henüz boş"
            description="Bir araç analiz edip favorilere ekle veya yerinde kontrole başla; hepsi burada birikecek."
          />
        )}

        {progress.doneCount > 0 && (
          <section className="result-card">
            <div className="market-row">
              <h3 style={{ margin: 0 }}>Devam eden kontrol</h3>
              <span className="market-label tone-normal">
                {progress.doneCount}/{progress.totalCount}
              </span>
            </div>
            <p className="counter-hint">
              {progress.vehicle ? vehicleLabel(progress.vehicle) : 'Araç bilgisi girilmedi'}
            </p>
            <div className="progress-track">
              <span style={{ width: progress.percent + '%' }} />
            </div>
            <Link to="/yerinde-kontrol" className="primary-button" style={{ marginTop: 12 }}>
              Kontrole Devam Et
            </Link>
          </section>
        )}

        {favorites.length > 0 && (
          <section className="result-card">
            <h3>Favori Araçlar</h3>
            {favorites.length > 1 && (
              <p className="market-disclaimer" style={{ marginTop: 0 }}>
                Karşılaştırmak için en fazla {MAX_COMPARE} araç seç.
              </p>
            )}
            <div className="favorites-list">
              {favorites.map((favorite) => (
                <div
                  className={'favorite-item' + (selected.includes(favorite.id) ? ' selected' : '')}
                  key={favorite.id}
                >
                  {favorites.length > 1 && (
                    <input
                      type="checkbox"
                      checked={selected.includes(favorite.id)}
                      onChange={() => toggleSelect(favorite.id)}
                      aria-label="Karşılaştırmaya ekle"
                    />
                  )}
                  <button
                    type="button"
                    className="favorite-item-body"
                    onClick={() => handleOpen(favorite)}
                  >
                    <span className="favorite-item-title">
                      {favorite.formData.brand} {favorite.formData.model}
                    </span>
                    <span className="favorite-item-meta">
                      {favorite.formData.year} &middot; {formatKm(favorite.formData.km)} &middot;{' '}
                      {formatPrice(favorite.formData.price)}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="favorite-item-remove"
                    onClick={() => handleRemove(favorite.id)}
                    aria-label="Favoriden çıkar"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
            {selected.length > 1 && (
              <button
                type="button"
                className="primary-button"
                style={{ marginTop: 12 }}
                onClick={() =>
                  navigate('/karsilastir', {
                    state: { items: favorites.filter((f) => selected.includes(f.id)) }
                  })
                }
              >
                Seçilenleri Karşılaştır ({selected.length})
              </button>
            )}
          </section>
        )}

        {notes.length > 0 && (
          <section className="result-card">
            <h3>Ekspertiz Notları</h3>
            <div className="saved-list">
              {notes.slice(0, 5).map((note) => (
                <div className="saved-item" key={note.id}>
                  <span className="saved-item-icon">
                    <Icon name="note" size={18} strokeWidth={1.8} />
                  </span>
                  <span className="saved-item-body">
                    <span className="saved-item-title">{note.vehicleLabel || 'Araç'}</span>
                    <span className="saved-item-meta">
                      {note.flaggedItems?.length || 0} sorunlu madde
                      {note.photos?.length ? ' · ' + note.photos.length + ' fotoğraf' : ''}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <Link to="/ekspertiz-notlari" className="favorite-button" style={{ marginTop: 12 }}>
              Tümünü Aç
            </Link>
          </section>
        )}

        {paintChecks.length > 0 && (
          <section className="result-card">
            <h3>Boya / Değişen Kontrolleri</h3>
            <div className="saved-list">
              {paintChecks.slice(0, 5).map((check) => (
                <div className="saved-item" key={check.id}>
                  <span className="saved-item-icon">
                    <Icon name="paint" size={18} strokeWidth={1.8} />
                  </span>
                  <span className="saved-item-body">
                    <span className="saved-item-title">{check.vehicleLabel || 'Araç'}</span>
                    <span className="saved-item-meta">
                      {check.results?.length || 0} panel incelendi
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <Link to="/boya-degisen" className="favorite-button" style={{ marginTop: 12 }}>
              Yeni Kontrol Başlat
            </Link>
          </section>
        )}
      </PageContainer>
    </>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import EmptyState from '../components/EmptyState'
import { formatKm, formatPrice } from '../utils/formatters'
import { getFavorites, removeFavorite } from '../services/favoritesService'
import { analyzeVehicle } from '../services/analysisService'

const MAX_COMPARE = 3

export default function FavoritesPage() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState(() => getFavorites())
  const [selected, setSelected] = useState([])

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

  function handleCompare() {
    const items = favorites.filter((f) => selected.includes(f.id))
    navigate('/karsilastir', { state: { items } })
  }

  return (
    <>
      <Header title="Favoriler" subtitle="Analiz ettiğin ve kaydettiğin araçlar." showBack />
      <PageContainer>
        {favorites.length === 0 ? (
          <EmptyState
            icon="heart"
            title="Henüz favori araç yok"
            description="Bir araç analiz edip sonuç ekranından favorilere ekleyebilirsin."
          />
        ) : (
          <>
            {favorites.length > 1 && (
              <p className="favorites-hint">
                Karşılaştırmak için en fazla {MAX_COMPARE} araç seç.
              </p>
            )}
            <div className="favorites-list">
              {favorites.map((favorite) => (
                <div className={'favorite-item' + (selected.includes(favorite.id) ? ' selected' : '')} key={favorite.id}>
                  {favorites.length > 1 && (
                    <label className="favorite-item-select">
                      <input
                        type="checkbox"
                        checked={selected.includes(favorite.id)}
                        onChange={() => toggleSelect(favorite.id)}
                        aria-label="Karşılaştırmak için seç"
                      />
                      <span className="favorite-checkbox" aria-hidden="true" />
                    </label>
                  )}
                  <button className="favorite-item-main" onClick={() => handleOpen(favorite)}>
                    <div className="favorite-item-score">{favorite.score}</div>
                    <div className="favorite-item-text">
                      <h3>
                        {favorite.formData.brand} {favorite.formData.model} {favorite.formData.year}
                      </h3>
                      <p>
                        {favorite.formData.engine || favorite.formData.fuelType} &middot; {formatKm(favorite.formData.km)}{' '}
                        &middot; {formatPrice(favorite.formData.price)}
                      </p>
                      <span className="favorite-item-band">{favorite.bandLabel}</span>
                    </div>
                  </button>
                  <button
                    className="favorite-item-remove"
                    onClick={() => handleRemove(favorite.id)}
                    aria-label="Favorilerden kaldır"
                  >
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </PageContainer>

      {selected.length >= 2 && (
        <div className="compare-bar">
          <button className="primary-button" onClick={handleCompare}>
            {selected.length} Aracı Karşılaştır
          </button>
        </div>
      )}
    </>
  )
}

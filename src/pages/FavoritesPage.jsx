import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import { formatKm, formatPrice } from '../utils/formatters'
import { getFavorites, removeFavorite } from '../services/favoritesService'
import { analyzeVehicle } from '../services/analysisService'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState(() => getFavorites())

  function handleRemove(id) {
    setFavorites(removeFavorite(id))
  }

  function handleOpen(favorite) {
    const result = analyzeVehicle(favorite.formData)
    navigate('/sonuc', { state: { formData: favorite.formData, result } })
  }

  return (
    <>
      <Header title="Favoriler" subtitle="Analiz ettiğin ve kaydettiğin araçlar." showBack />
      <PageContainer>
        {favorites.length === 0 ? (
          <p className="result-empty">
            Henüz favori araç yok. Bir araç analiz edip sonuç ekranından favorilere ekleyebilirsin.
          </p>
        ) : (
          <div className="favorites-list">
            {favorites.map((favorite) => (
              <div className="favorite-item" key={favorite.id}>
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
        )}
      </PageContainer>
    </>
  )
}

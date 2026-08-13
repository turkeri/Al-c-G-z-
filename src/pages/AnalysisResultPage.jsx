import { useMemo } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import ScoreGauge from '../components/ScoreGauge'
import RiskBadge from '../components/RiskBadge'
import FavoriteButton from '../components/FavoriteButton'
import { formatKm, formatPrice } from '../utils/formatters'
import {
  addFavorite,
  buildFavoriteId,
  isFavorite,
  removeFavorite
} from '../services/favoritesService'

export default function AnalysisResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state

  const favoriteId = useMemo(() => (state ? buildFavoriteId(state.formData) : null), [state])
  const alreadyFavorite = favoriteId ? isFavorite(favoriteId) : false

  if (!state) {
    return <Navigate to="/analiz" replace />
  }

  const { formData, result } = state
  const vehicleLabel = `${formData.brand} ${formData.model} ${formData.year}`

  function handleToggleFavorite() {
    if (!favoriteId) return
    if (alreadyFavorite) {
      removeFavorite(favoriteId)
    } else {
      addFavorite({
        id: favoriteId,
        formData,
        score: result.score,
        bandLabel: result.band.label
      })
    }
    navigate('.', { replace: true, state })
  }

  return (
    <>
      <Header title="Analiz Sonucu" subtitle={vehicleLabel} showBack />
      <PageContainer>
        <section className="result-summary">
          <ScoreGauge score={result.score} label={result.band.label} tone={result.band.tone} />
          <div className="result-summary-details">
            <h2>{vehicleLabel}</h2>
            <p className="result-summary-engine">
              {formData.engine || 'Motor belirtilmedi'} &middot; {formData.fuelType} &middot; {formData.transmission}
            </p>
            <div className="result-summary-meta">
              <span>{formatKm(formData.km)}</span>
              <span>{formatPrice(formData.price)}</span>
            </div>
            <FavoriteButton active={alreadyFavorite} onToggle={handleToggleFavorite} />
          </div>
        </section>

        <section className="result-card">
          <h3>Avantajlar</h3>
          {result.advantages.length ? (
            <ul className="result-list positive">
              {result.advantages.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="result-empty">Belirgin bir avantaj tespit edilemedi.</p>
          )}
        </section>

        <section className="result-card">
          <h3>Riskler</h3>
          {result.risks.length ? (
            <ul className="result-list negative">
              {result.risks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="result-empty">Kayıtlı belirgin bir risk bulunamadı.</p>
          )}
        </section>

        <section className="result-card">
          <h3>Kontrol Edilmesi Gerekenler</h3>
          {result.checkpoints.length ? (
            <ul className="result-list neutral">
              {result.checkpoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="result-empty">Özel bir kontrol noktası bulunamadı.</p>
          )}
        </section>

        {result.knownProblems.length > 0 && (
          <section className="result-card">
            <h3>Kronik Sorun Detayları</h3>
            <div className="problem-list">
              {result.knownProblems.map((problem) => (
                <div className="problem-item" key={problem.title}>
                  <div className="problem-item-head">
                    <span className="problem-item-title">{problem.title}</span>
                    <RiskBadge risk={problem.risk} />
                  </div>
                  <p>{problem.description}</p>
                  <span className="problem-item-km">Kontrol aralığı: {problem.checkKm} km</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </PageContainer>
    </>
  )
}

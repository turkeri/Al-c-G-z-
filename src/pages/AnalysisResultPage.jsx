import { useMemo } from 'react'
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import ScoreGauge from '../components/ScoreGauge'
import ProblemCard from '../components/ProblemCard'
import FavoriteButton from '../components/FavoriteButton'
import { formatKm, formatPrice } from '../utils/formatters'
import {
  addFavorite,
  buildFavoriteId,
  isFavorite,
  removeFavorite
} from '../services/favoritesService'
import { estimateMarketPrice } from '../services/marketService'
import { buildNegotiationAdvice } from '../services/negotiationService'
import { buildDecisionSummary } from '../services/decisionService'

const DECISION_ICON = { al: '✓', dikkatli: '!', alma: '×' }

export default function AnalysisResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state

  const favoriteId = useMemo(() => (state ? buildFavoriteId(state.formData) : null), [state])
  const alreadyFavorite = favoriteId ? isFavorite(favoriteId) : false
  const marketEstimate = useMemo(() => (state ? estimateMarketPrice(state.formData) : null), [state])
  const negotiation = useMemo(
    () => (state ? buildNegotiationAdvice(state.result, marketEstimate) : null),
    [state, marketEstimate]
  )
  const decision = useMemo(
    () => (state ? buildDecisionSummary(state.result, marketEstimate) : null),
    [state, marketEstimate]
  )

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

  function handleFindNearbyExpertise() {
    if (!navigator.geolocation) {
      window.open('https://www.google.com/maps/search/oto+ekspertiz', '_blank', 'noopener')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        window.open(
          `https://www.google.com/maps/search/oto+ekspertiz/@${latitude},${longitude},14z`,
          '_blank',
          'noopener'
        )
      },
      () => {
        window.open('https://www.google.com/maps/search/oto+ekspertiz', '_blank', 'noopener')
      }
    )
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
              {result.engineData?.avgFuelConsumption && (
                <> &middot; Ort. {result.engineData.avgFuelConsumption} L/100km</>
              )}
            </p>
            <div className="result-summary-meta">
              <span>{formatKm(formData.km)}</span>
              <span>{formatPrice(formData.price)}</span>
            </div>
            <FavoriteButton active={alreadyFavorite} onToggle={handleToggleFavorite} />
          </div>
        </section>

        <section className={'decision-card verdict-' + decision.verdict}>
          <div className="decision-icon" aria-hidden="true">
            {DECISION_ICON[decision.verdict]}
          </div>
          <div className="decision-text">
            <h3>{decision.title}</h3>
            <p>{decision.description}</p>
          </div>
        </section>

        {marketEstimate && (
          <section className="result-card">
            <div className="market-row">
              <h3 style={{ margin: 0 }}>Piyasa Fiyat Karşılaştırması</h3>
              <span className={'market-label tone-' + marketEstimate.verdict}>{marketEstimate.label}</span>
            </div>
            <div className="market-facts">
              <div>
                <span>İlan fiyatı</span>
                <strong>{formatPrice(marketEstimate.listedPrice)}</strong>
              </div>
              <div>
                <span>Tahmini piyasa değeri</span>
                <strong>{formatPrice(marketEstimate.estimatedPrice)}</strong>
              </div>
              <div>
                <span>Fark</span>
                <strong>
                  {marketEstimate.diffAmount >= 0 ? '+' : ''}
                  {marketEstimate.diffPercent}%
                </strong>
              </div>
            </div>
            <p className="market-disclaimer">
              Bu tutar, marka/model/yaş/kilometreye dayalı kaba bir amortisman hesabıdır; gerçek zamanlı piyasa
              verisi değildir, yalnızca fikir vermek içindir.
            </p>
          </section>
        )}

        <section className="result-card">
          <h3>Pazarlık Önerisi</h3>
          {negotiation.hasSuggestion && (
            <p className="negotiation-amount">~{formatPrice(negotiation.suggestedDiscount)} indirim iste</p>
          )}
          <ul className="result-list neutral">
            {negotiation.reasons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
                <ProblemCard problem={problem} key={problem.title} />
              ))}
            </div>
          </section>
        )}

        <section className="action-links">
          <Link
            className="action-link"
            to="/kredi-hesapla"
            state={{ price: formData.price }}
          >
            Kredi Hesapla
          </Link>
          <Link
            className="action-link"
            to="/ekspertiz-notlari"
            state={{ formData }}
          >
            Ekspertiz Notu Ekle
          </Link>
          <button className="action-link" onClick={handleFindNearbyExpertise} type="button">
            Yakında Ekspertiz Bul
          </button>
          <Link
            className="action-link"
            to="/kronik-sorunlar"
            state={{ brand: formData.brand, model: formData.model }}
          >
            Deneyim Notu Ekle
          </Link>
          <Link
            className="action-link"
            to="/boya-degisen"
            state={{ formData }}
          >
            Boya / Değişen Kontrolü
          </Link>
        </section>
      </PageContainer>
    </>
  )
}

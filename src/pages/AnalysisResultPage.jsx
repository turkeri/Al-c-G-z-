import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import AiPanel from '../components/AiPanel'
import { fetchVerdict, fetchVehicleInfo, isAiConfigured } from '../services/aiService'
import RiskBadge from '../components/RiskBadge'
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

const DECISION_ICON = { al: '✓', dikkatli: '!', alma: '×', belirsiz: '?' }

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

  const [ai, setAi] = useState({ status: 'idle', data: null, message: '' })
  const [lookup, setLookup] = useState({ status: 'idle', data: null, message: '' })

  if (!state) {
    return <Navigate to="/analiz" replace />
  }

  const { formData, result } = state
  const vehicleLabel = [formData.brand, formData.model, formData.year].filter(Boolean).join(' ')
  const quality = result.dataQuality

  async function handleRequestVerdict() {
    setAi({ status: 'loading', data: null, message: '' })
    const response = await fetchVerdict({
      vehicle: {
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        engine: formData.engine,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        km: formData.km,
        price: formData.price
      },
      analysis: {
        score: result.score,
        bandLabel: result.band.label,
        marketLabel: marketEstimate?.label,
        marketDiffPercent: marketEstimate?.diffPercent,
        avgFuelConsumption: result.engineData?.avgFuelConsumption,
        knownProblems: result.knownProblems
      }
    })

    if (!response) setAi({ status: 'idle', data: null, message: '' })
    else if (response.error) setAi({ status: 'error', data: null, message: response.error })
    else setAi({ status: 'ready', data: response.result, message: '' })
  }

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

  /** Veritabanında olmayan araç için bilgi araştırması. */
  async function handleLookup() {
    setLookup({ status: 'loading', data: null, message: '' })
    const response = await fetchVehicleInfo({
      brand: formData.brand,
      model: formData.model,
      year: formData.year,
      engine: formData.engine
    })
    if (!response) setLookup({ status: 'idle', data: null, message: '' })
    else if (response.error) setLookup({ status: 'error', data: null, message: response.error })
    else setLookup({ status: 'ready', data: response.result, message: '' })
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
              {[formData.engine, formData.fuelType, formData.transmission]
                .filter(Boolean)
                .join(' · ') || 'Motor bilgisi girilmedi'}
              {result.engineData?.avgFuelConsumption && (
                <> &middot; Ort. {result.engineData.avgFuelConsumption} L/100km</>
              )}
            </p>
            <div className="result-summary-meta">
              {formData.km !== '' && <span>{formatKm(formData.km)}</span>}
              {formData.price !== '' && <span>{formatPrice(formData.price)}</span>}
            </div>
            <FavoriteButton active={alreadyFavorite} onToggle={handleToggleFavorite} />
          </div>
        </section>

        {/* Eksik veri veya veritabanında olmayan araç, skorun ne kadar
            güvenilir olduğunu doğrudan belirler; karardan ÖNCE gösterilir. */}
        {quality?.warning && (
          <section className={'data-quality tone-' + (quality.completeness < 70 ? 'warning' : 'normal')}>
            <div className="data-quality-head">
              <span className="data-quality-title">
                {quality.knownVehicle ? 'Veri tamlığı' : 'Bu araç veritabanımızda yok'}
              </span>
              <span className="data-quality-value">%{quality.completeness}</span>
            </div>
            <div className="progress-track">
              <span style={{ width: quality.completeness + '%' }} />
            </div>
            <p>{quality.warning}</p>
          </section>
        )}

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
              verisi değildir, yalnızca fikir vermek içindir. Fiyat referansları {marketEstimate.baseline}{' '}
              piyasasına göredir; ilan fiyatlarıyla arada fark olabilir.
            </p>
          </section>
        )}

        {/* Veritabanında olmayan araçta kronik sorun listesi boş kalır;
            boşluğu araştırma paneli doldurur. */}
        {!quality?.knownVehicle && isAiConfigured() && (
          <AiPanel
            title="Bu Aracı Araştır"
            buttonLabel="Bu Araç Hakkında Bilgi Getir"
            hint="Bu araç kendi veritabanımızda kayıtlı değil. Bilinen sorunlarını, güvenilirliğini ve kontrol noktalarını araştırıp getirelim."
            status={lookup.status}
            message={lookup.message}
            onRequest={handleLookup}
          >
            {lookup.data && (
              <>
                <p className="ai-summary">{lookup.data.overview}</p>

                {lookup.data.reliability && (
                  <div className="ai-block">
                    <p className="expertise-category-title">Güvenilirlik</p>
                    <p className="ai-text">{lookup.data.reliability}</p>
                  </div>
                )}

                {lookup.data.commonProblems.length > 0 && (
                  <div className="ai-block">
                    <p className="expertise-category-title">Bilinen sorunlar</p>
                    <div className="problem-list">
                      {lookup.data.commonProblems.map((p) => (
                        <div className="problem-item" key={p.title}>
                          <div className="problem-item-head">
                            <span className="problem-item-title">{p.title}</span>
                            <RiskBadge risk={p.risk} />
                          </div>
                          {p.description && <p>{p.description}</p>}
                          {p.solution && (
                            <div className="problem-solution">
                              <span className="problem-solution-label">Çözüm</span>
                              <p>{p.solution}</p>
                            </div>
                          )}
                          <div className="problem-item-meta">
                            {p.checkKm && <span className="problem-item-km">Kontrol: {p.checkKm}</span>}
                            {p.estimatedCost && (
                              <span className="problem-item-cost">{p.estimatedCost}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lookup.data.inspectionChecklist.length > 0 && (
                  <div className="ai-block">
                    <p className="expertise-category-title">Almadan önce kontrol et</p>
                    <div className="check-tags">
                      {lookup.data.inspectionChecklist.map((c) => (
                        <span className="check-tag" key={c}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {lookup.data.buyAdvice && (
                  <div className="ai-block">
                    <p className="expertise-category-title">Alım tavsiyesi</p>
                    <p className="ai-text">{lookup.data.buyAdvice}</p>
                  </div>
                )}
              </>
            )}
          </AiPanel>
        )}

        {isAiConfigured() && (
          <AiPanel
            title="Uzman Yorumu"
            buttonLabel="Bu Araç İçin Yorum Al"
            hint="Skor, fiyat ve kronik sorunlar birlikte değerlendirilip alım tavsiyesi, pazarlık argümanları ve vazgeçme sinyalleri çıkarılır."
            status={ai.status}
            message={ai.message}
            onRequest={handleRequestVerdict}
          >
            {ai.data && (
              <>
                <p className="ai-summary">{ai.data.opinion}</p>

                {ai.data.problemAssessment && (
                  <div className="ai-block">
                    <p className="expertise-category-title">Sorunlar ne kadar ciddi?</p>
                    <p className="ai-text">{ai.data.problemAssessment}</p>
                  </div>
                )}

                {ai.data.buyAdvice && (
                  <div className="ai-block">
                    <p className="expertise-category-title">Alım tavsiyesi</p>
                    <p className="ai-text">{ai.data.buyAdvice}</p>
                  </div>
                )}

                {ai.data.negotiationTips.length > 0 && (
                  <div className="ai-block">
                    <p className="expertise-category-title">Pazarlıkta kullan</p>
                    <ul className="result-list neutral" style={{ fontSize: '0.84rem' }}>
                      {ai.data.negotiationTips.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                  </div>
                )}

                {ai.data.redFlags.length > 0 && (
                  <div className="ai-block">
                    <p className="expertise-category-title">Görürsen vazgeç</p>
                    <ul className="result-list negative" style={{ fontSize: '0.84rem' }}>
                      {ai.data.redFlags.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                  </div>
                )}
              </>
            )}
          </AiPanel>
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

        {/* Bu araçla ilgili devam yolları; ayrı menülerde aramak yerine
            kararın verildiği yerde toplanır. */}
        <section className="result-card">
          <h3>Bu Araçla Devam Et</h3>
          <div className="action-links">
            <Link className="action-link" to="/maliyet" state={{ formData }}>
              Yıllık Maliyeti Hesapla
            </Link>
            <Link className="action-link" to="/tramer" state={{ price: formData.price }}>
              Hasar ve Değer Kaybı
            </Link>
            <Link className="action-link" to="/satici-sorulari" state={{ formData }}>
              Satıcıya Sorulacaklar
            </Link>
            <Link className="action-link" to="/yerinde-kontrol">
              Yerinde Kontrole Başla
            </Link>
            <Link className="action-link" to="/kredi-hesapla" state={{ price: formData.price }}>
              Kredi Hesapla
            </Link>
            <Link className="action-link" to="/boya-degisen" state={{ formData }}>
              Boya / Değişen Kontrolü
            </Link>
            <Link className="action-link" to="/ekspertiz-notlari" state={{ formData }}>
              Ekspertiz Notu Ekle
            </Link>
            <button className="action-link" onClick={handleFindNearbyExpertise} type="button">
              Yakında Ekspertiz Bul
            </button>
          </div>
        </section>
      </PageContainer>
    </>
  )
}

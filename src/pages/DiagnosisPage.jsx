import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import EmptyState from '../components/EmptyState'
import RiskBadge from '../components/RiskBadge'
import HeadlightLoader from '../components/HeadlightLoader'
import QuotaNote, { useAccount } from '../components/QuotaNote'
import { getBrands, getModelsByBrand, getEngineNames, getEngineData } from '../services/catalogAdapter'
import { diagnose } from '../services/diagnosisService'
import { fetchAiAnalysis, isAiConfigured } from '../services/aiService'

const QUICK_COMPLAINTS = [
  'Soğukta zor çalışıyor',
  'Yokuşta çekmiyor, güç kaybı var',
  'Hararet yapıyor',
  'Fren yaparken titriyor',
  'Vites geçişlerinde sarsıyor',
  'Motor arıza lambası yandı'
]

const URGENCY_TONE = { Yüksek: 'danger', Orta: 'warning', Düşük: 'good' }

export default function DiagnosisPage() {
  const location = useLocation()
  const incoming = location.state?.formData

  // Aylık analiz hakkı sunucuda sayılır; burada yalnızca gösterilir.
  const account = useAccount()
  const quotaExhausted = Boolean(account && account.remaining <= 0)

  const brands = useMemo(() => getBrands(), [])
  const [brand, setBrand] = useState(incoming?.brand || '')
  const [model, setModel] = useState(incoming?.model || '')
  const [engine, setEngine] = useState(incoming?.engine || '')
  const [complaint, setComplaint] = useState('')
  const [result, setResult] = useState(null)
  const [aiState, setAiState] = useState({ status: 'idle', data: null, message: '' })

  const models = useMemo(() => (brand ? getModelsByBrand(brand) : []), [brand])
  const engines = useMemo(() => (brand && model ? getEngineNames(brand, model) : []), [brand, model])

  async function handleDiagnose(text) {
    const query = typeof text === 'string' ? text : complaint
    if (!query.trim()) return

    const engineData = brand && model && engine ? getEngineData(brand, model, engine) : null
    const formData = brand && model
      ? { brand, model, engine, fuelType: engineData?.fuelType, transmission: engineData?.transmission }
      : null

    const localResult = diagnose(query, formData)
    setResult(localResult)

    if (!isAiConfigured()) {
      setAiState({ status: 'idle', data: null, message: '' })
      return
    }

    setAiState({ status: 'loading', data: null, message: '' })
    const response = await fetchAiAnalysis({
      vehicle: formData ? { ...formData, year: undefined, km: undefined } : null,
      complaint: query,
      localFindings: {
        knownProblems: localResult.engineData?.knownProblems || [],
        matchedSymptoms: localResult.matches.map((m) => m.symptom.title)
      }
    })

    if (!response) {
      setAiState({ status: 'idle', data: null, message: '' })
    } else if (response.error) {
      setAiState({ status: 'error', data: null, message: response.error })
    } else {
      setAiState({ status: 'ready', data: response.result, message: '' })
    }
  }

  function handleQuickPick(text) {
    setComplaint(text)
    handleDiagnose(text)
  }

  return (
    <>
      <Header
        title="Aracımın Nesi Var?"
        subtitle="Şikayetini yaz, olası arızaları ve çözümlerini sıralayalım."
        showBack
      />
      <PageContainer>
        <section className="result-card">
          <h3>Araç Bilgisi (opsiyonel)</h3>
          <p className="market-disclaimer" style={{ marginTop: 0 }}>
            Aracını seçersen, o motora ait bilinen kronik sorunlar sonuçlarda öne çıkarılır.
          </p>
          <div className="form-row" style={{ marginTop: 10 }}>
            <label>
              Marka
              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value)
                  setModel('')
                  setEngine('')
                }}
              >
                <option value="">Seçiniz</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Model
              <select
                value={model}
                onChange={(e) => {
                  setModel(e.target.value)
                  setEngine('')
                }}
                disabled={!brand}
              >
                <option value="">Seçiniz</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Motor
            <select value={engine} onChange={(e) => setEngine(e.target.value)} disabled={!engines.length}>
              <option value="">{engines.length ? 'Seçiniz' : 'Önce marka/model seçin'}</option>
              {engines.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="result-card">
          <h3>Şikayetin Nedir?</h3>
          <textarea
            className="listing-textarea"
            rows={4}
            placeholder="Örn: Sabahları zor çalışıyor, çalışınca da rölantide sarsıyor ve egzozdan mavi duman geliyor..."
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
          />
          <div className="quick-chips">
            {QUICK_COMPLAINTS.map((q) => (
              <button key={q} type="button" className="quick-chip" onClick={() => handleQuickPick(q)}>
                {q}
              </button>
            ))}
          </div>
          {/* Kalan hak, butona basmadan önce görünür olmalı. */}
          <QuotaNote account={account} style={{ marginTop: 0 }} />
          <button
            type="button"
            className="primary-button"
            onClick={() => handleDiagnose()}
            disabled={!complaint.trim() || quotaExhausted}
            style={{ opacity: complaint.trim() && !quotaExhausted ? 1 : 0.5, width: '100%' }}
          >
            {quotaExhausted ? 'Analiz hakkın doldu' : 'Analiz Et'}
          </button>
        </section>

        {aiState.status === 'loading' && (
          <section className="result-card ai-card">
            <HeadlightLoader label="Detaylı analiz hazırlanıyor..." />
          </section>
        )}

        {aiState.status === 'error' && (
          <p className="market-disclaimer" style={{ marginTop: -4 }}>{aiState.message}</p>
        )}

        {aiState.status === 'ready' && aiState.data && (
          <section className="result-card ai-card">
            <div className="ai-head">
              <h3>Detaylı Analiz</h3>
              <span className="ai-tag">Otomatik değerlendirme</span>
            </div>

            {aiState.data.summary && <p className="ai-summary">{aiState.data.summary}</p>}

            {aiState.data.causes.length > 0 && (
              <div className="cause-list">
                {aiState.data.causes.map((cause) => (
                  <div className="cause-item" key={cause.cause}>
                    <div className="cause-head">
                      <span className="cause-title">{cause.cause}</span>
                      <RiskBadge risk={cause.likelihood} />
                    </div>
                    {cause.solution && <p className="cause-solution">{cause.solution}</p>}
                    <div className="cause-meta">
                      {cause.estimatedCost && <span>Tahmini maliyet: {cause.estimatedCost}</span>}
                      <span className={'cause-urgency tone-' + URGENCY_TONE[cause.urgency]}>
                        Aciliyet: {cause.urgency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {aiState.data.checks.length > 0 && (
              <div className="diagnosis-checks">
                <p className="expertise-category-title">Kontrol edilmesi gerekenler</p>
                <div className="check-tags">
                  {aiState.data.checks.map((c) => (
                    <span className="check-tag" key={c}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            {aiState.data.askMechanic.length > 0 && (
              <div className="diagnosis-checks">
                <p className="expertise-category-title">Ustaya sorman gerekenler</p>
                <ul className="result-list neutral" style={{ fontSize: '0.82rem' }}>
                  {aiState.data.askMechanic.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="market-disclaimer">
              Bu değerlendirme otomatik olarak üretilmiştir ve kesin teşhis yerine geçmez. Aracın
              bir ustaya gösterilmesi ve arıza kodlarının okutulması gerekir.
            </p>
          </section>
        )}

        {/* Seçilen motorun kendi kronik arızalarıyla doğrudan eşleşme.
            Genel semptom listesinden daha güçlü bir sinyaldir, bu yüzden üstte durur. */}
        {result?.vehicleProblemMatches?.length > 0 && (
          <section className="result-card">
            <h3>Bu Motorun Bilinen Sorunlarıyla Eşleşme</h3>
            <p className="market-disclaimer" style={{ marginTop: 0 }}>
              Yazdığın belirti, seçtiğin motorda zaten kayıtlı olan şu arızalarla örtüşüyor.
            </p>
            <div className="problem-list">
              {result.vehicleProblemMatches.map((match) => (
                <div className="problem-item" key={match.problem.title}>
                  <div className="problem-item-head">
                    <span className="problem-item-title">{match.problem.title}</span>
                    <RiskBadge risk={match.problem.risk} />
                  </div>
                  <p>{match.problem.description}</p>

                  {match.matchedSymptoms.length > 0 && (
                    <div className="check-tags" style={{ marginTop: 8 }}>
                      {match.matchedSymptoms.map((s) => (
                        <span className="check-tag" key={s}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {match.problem.solution && (
                    <div className="problem-solution">
                      <span className="problem-solution-label">Çözüm</span>
                      <p>{match.problem.solution}</p>
                    </div>
                  )}

                  {match.problem.partNote && (
                    <p className="counter-hint" style={{ marginTop: 8 }}>
                      {match.problem.partNote}
                    </p>
                  )}

                  <div className="problem-item-meta">
                    {match.problem.typicalKm && (
                      <span className="problem-item-km">{match.problem.typicalKm}</span>
                    )}
                    {match.problem.estimatedCost && (
                      <span className="problem-item-cost">{match.problem.estimatedCost}</span>
                    )}
                    {match.problem.obdCodes?.length > 0 && (
                      <span className="problem-item-km">
                        Kod: {match.problem.obdCodes.join(', ')}
                      </span>
                    )}
                    {match.problem.dealbreaker && (
                      <span className="severity-badge tone-danger">Alımdan vazgeçirebilir</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {result && result.matches.length === 0 && result.vehicleProblemMatches.length === 0 && (
          <EmptyState
            icon="search"
            title="Eşleşen bir arıza bulunamadı"
            description="Şikayetini biraz daha detaylı yazmayı dene (örn. ses mi geliyor, ne zaman oluyor, hangi durumda artıyor)."
          />
        )}

        {result && result.matches.length > 0 && (
          <>
            <p className="market-disclaimer" style={{ marginTop: -4 }}>
              {result.matches.length} olası arıza bulundu, en olasıdan başlayarak sıralandı. Bu bir ön
              değerlendirmedir; kesin teşhis için aracın bir ustaya gösterilmesi ve arıza kodlarının
              okutulması gerekir.
            </p>

            {result.matches.map((match) => (
              <section className="result-card diagnosis-card" key={match.symptom.id}>
                <div className="diagnosis-head">
                  <div>
                    <span className="diagnosis-category">{match.symptom.category}</span>
                    <h3>{match.symptom.title}</h3>
                  </div>
                  <div className="diagnosis-meta">
                    <span className={'severity-badge tone-' + URGENCY_TONE[match.urgency]}>
                      Aciliyet: {match.urgency}
                    </span>
                    <span className="diagnosis-confidence">%{match.confidence} eşleşme</span>
                  </div>
                </div>

                {match.vehicleLinks.length > 0 && (
                  <div className="diagnosis-vehicle-link">
                    <strong>Bu araçta bilinen kronik sorunla örtüşüyor:</strong>
                    {match.vehicleLinks.map((p) => (
                      <div key={p.title} className="diagnosis-vehicle-problem">
                        <RiskBadge risk={p.risk} /> <span>{p.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="cause-list">
                  {match.symptom.causes.map((cause) => (
                    <div className="cause-item" key={cause.cause}>
                      <div className="cause-head">
                        <span className="cause-title">{cause.cause}</span>
                        <RiskBadge risk={cause.likelihood} />
                      </div>
                      <p className="cause-solution">{cause.solution}</p>
                      <div className="cause-meta">
                        <span>Tahmini maliyet: {cause.estimatedCost}</span>
                        <span className={'cause-urgency tone-' + URGENCY_TONE[cause.urgency]}>
                          Aciliyet: {cause.urgency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {match.symptom.relatedChecks.length > 0 && (
                  <div className="diagnosis-checks">
                    <p className="expertise-category-title">Ustaya söyle, şunlara baksın</p>
                    <div className="check-tags">
                      {match.symptom.relatedChecks.map((c) => (
                        <span className="check-tag" key={c}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </>
        )}
      </PageContainer>
    </>
  )
}

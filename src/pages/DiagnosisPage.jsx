import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import EmptyState from '../components/EmptyState'
import RiskBadge from '../components/RiskBadge'
import { getBrands, getModelsByBrand, getEngineNames, getEngineData } from '../services/vehicleService'
import { diagnose } from '../services/diagnosisService'

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

  const brands = useMemo(() => getBrands(), [])
  const [brand, setBrand] = useState(incoming?.brand || '')
  const [model, setModel] = useState(incoming?.model || '')
  const [engine, setEngine] = useState(incoming?.engine || '')
  const [complaint, setComplaint] = useState('')
  const [result, setResult] = useState(null)

  const models = useMemo(() => (brand ? getModelsByBrand(brand) : []), [brand])
  const engines = useMemo(() => (brand && model ? getEngineNames(brand, model) : []), [brand, model])

  function handleDiagnose(text) {
    const query = typeof text === 'string' ? text : complaint
    if (!query.trim()) return
    const engineData = brand && model && engine ? getEngineData(brand, model, engine) : null
    const formData = brand && model ? { brand, model, engine, fuelType: engineData?.fuelType, transmission: engineData?.transmission } : null
    setResult(diagnose(query, formData))
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
          <button
            type="button"
            className="primary-button"
            onClick={() => handleDiagnose()}
            disabled={!complaint.trim()}
            style={{ opacity: complaint.trim() ? 1 : 0.5, width: '100%' }}
          >
            Analiz Et
          </button>
        </section>

        {result && result.matches.length === 0 && (
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

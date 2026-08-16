import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import ProblemCard from '../components/ProblemCard'
import EmptyState from '../components/EmptyState'
import { getBrands, getModelsByBrand, getVehicleEntry } from '../services/catalogAdapter'
import { getNotes, addNote, removeNote } from '../services/communityNotesService'
import AiPanel from '../components/AiPanel'
import RiskBadge from '../components/RiskBadge'
import { fetchVehicleInfo, isAiConfigured } from '../services/aiService'

const VERDICT_META = {
  al: { label: 'Alınabilir', tone: 'excellent' },
  dikkatli: { label: 'Dikkatli değerlendir', tone: 'warning' },
  alma: { label: 'Tavsiye edilmez', tone: 'danger' }
}

/** Veritabanında olmayan araçlar için serbest metinle sorgulama */
function UnknownVehicleLookup() {
  const [form, setForm] = useState({ brand: '', model: '', year: '', engine: '' })
  const [ai, setAi] = useState({ status: 'idle', data: null, message: '' })

  const canAsk = form.brand.trim() && form.model.trim()

  async function handleAsk() {
    if (!canAsk) return
    setAi({ status: 'loading', data: null, message: '' })
    const response = await fetchVehicleInfo({
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: form.year.trim(),
      engine: form.engine.trim()
    })
    if (!response) setAi({ status: 'idle', data: null, message: '' })
    else if (response.error) setAi({ status: 'error', data: null, message: response.error })
    else setAi({ status: 'ready', data: response.result, message: '' })
  }

  const verdict = ai.data ? VERDICT_META[ai.data.verdict] || VERDICT_META.dikkatli : null

  return (
    <>
      <section className="result-card">
        <h3>Aradığın araç listede yok mu?</h3>
        <p className="market-disclaimer" style={{ marginTop: 0 }}>
          Marka ve modeli buraya yaz; veritabanımızda olmasa bile o araç hakkında bilinen
          sorunları ve kontrol noktalarını araştırıp getirelim.
        </p>
        <div className="form-row" style={{ marginTop: 12 }}>
          <label className="field">
            <span className="field-label">Marka</span>
            <input
              type="text"
              placeholder="Örn. Opel"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field-label">Model</span>
            <input
              type="text"
              placeholder="Örn. Corsa"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field-label">Model Yılı</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Örn. 2015"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field-label">Motor (biliyorsan)</span>
            <input
              type="text"
              placeholder="Örn. 1.3 CDTI"
              value={form.engine}
              onChange={(e) => setForm({ ...form, engine: e.target.value })}
            />
          </label>
        </div>
      </section>

      <AiPanel
        title="Araç Değerlendirmesi"
        buttonLabel={canAsk ? 'Bu Aracı Araştır' : 'Önce marka ve model yaz'}
        status={canAsk ? ai.status : 'idle'}
        message={ai.message}
        onRequest={canAsk ? handleAsk : () => {}}
      >
        {ai.data && (
          <>
            {verdict && (
              <div style={{ marginBottom: 10 }}>
                <span className={'severity-badge tone-' + verdict.tone}>{verdict.label}</span>
              </div>
            )}

            <p className="ai-summary">{ai.data.overview}</p>

            {ai.data.reliability && (
              <div className="ai-block">
                <p className="expertise-category-title">Güvenilirlik</p>
                <p className="ai-text">{ai.data.reliability}</p>
              </div>
            )}

            {ai.data.avgFuelConsumption && (
              <div className="ai-block">
                <p className="expertise-category-title">Ortalama yakıt</p>
                <p className="ai-text">{ai.data.avgFuelConsumption}</p>
              </div>
            )}

            {ai.data.commonProblems.length > 0 && (
              <div className="ai-block">
                <p className="expertise-category-title">Bilinen sorunlar</p>
                <div className="problem-list">
                  {ai.data.commonProblems.map((p) => (
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
                        {p.estimatedCost && <span className="problem-item-cost">{p.estimatedCost}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ai.data.inspectionChecklist.length > 0 && (
              <div className="ai-block">
                <p className="expertise-category-title">Almadan önce kontrol et</p>
                <div className="check-tags">
                  {ai.data.inspectionChecklist.map((c) => (
                    <span className="check-tag" key={c}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            {ai.data.buyAdvice && (
              <div className="ai-block">
                <p className="expertise-category-title">Alım tavsiyesi</p>
                <p className="ai-text">{ai.data.buyAdvice}</p>
              </div>
            )}
          </>
        )}
      </AiPanel>
    </>
  )
}

function EngineCommunityNotes({ brand, model, engine }) {
  const [notes, setNotes] = useState(() => getNotes(brand, model, engine))
  const [draft, setDraft] = useState('')

  function handleAdd() {
    if (!draft.trim()) return
    addNote(brand, model, engine, draft.trim())
    setNotes(getNotes(brand, model, engine))
    setDraft('')
  }

  function handleRemove(id) {
    removeNote(id)
    setNotes(getNotes(brand, model, engine))
  }

  return (
    <div className="community-notes">
      <p className="expertise-category-title">Deneyim Notların</p>
      <p className="market-disclaimer" style={{ marginTop: 0 }}>
        Bu araca ait kendi gözlemlerini ekle; sadece bu cihazda saklanır.
      </p>
      {notes.length > 0 && (
        <div className="community-note-list">
          {notes.map((note) => (
            <div className="community-note-item" key={note.id}>
              <p>{note.text}</p>
              <button type="button" onClick={() => handleRemove(note.id)} aria-label="Notu sil">
                Sil
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="community-note-input">
        <input
          type="text"
          placeholder="Örn. 160.000 km'de şanzıman değişimi yaptırdım..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="button" className="favorite-button" onClick={handleAdd}>
          Ekle
        </button>
      </div>
    </div>
  )
}

export default function ChronicIssuesPage() {
  const location = useLocation()
  const brands = useMemo(() => getBrands(), [])
  const [brand, setBrand] = useState(location.state?.brand || '')
  const [model, setModel] = useState(location.state?.model || '')

  const models = useMemo(() => (brand ? getModelsByBrand(brand) : []), [brand])
  const entry = useMemo(() => (brand && model ? getVehicleEntry(brand, model) : null), [brand, model])

  return (
    <>
      <Header title="Kronik Sorunlar" subtitle="Marka ve model seçerek bilinen arızaları incele." showBack />
      <PageContainer>
        <div className="filter-row">
          <label>
            Marka
            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value)
                setModel('')
              }}
            >
              <option value="">Tümü</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label>
            Model
            <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!brand}>
              <option value="">Seçiniz</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!entry && (
          <EmptyState
            icon="search"
            title="Kronik sorunları görmek için marka ve model seçin"
            description="Seçtiğin motora göre bilinen arıza kayıtları burada listelenecek."
          />
        )}

        {entry &&
          entry.engines.map((engine) => (
            <section className="result-card" key={engine.name}>
              <h3>
                {entry.brand} {entry.model} &middot; {engine.name}
              </h3>
              <p className="result-summary-engine">
                {engine.fuelType} &middot; {engine.transmission} &middot; Güvenilirlik puanı {engine.reliabilityScore}/100
                {engine.avgFuelConsumption && <> &middot; Ort. {engine.avgFuelConsumption} L/100km</>}
              </p>
              {engine.knownProblems.length ? (
                <div className="problem-list">
                  {engine.knownProblems.map((problem) => (
                    <ProblemCard problem={problem} key={problem.title} />
                  ))}
                </div>
              ) : (
                <p className="result-empty">Bu motor için kayıtlı kronik sorun bulunmuyor.</p>
              )}

              <EngineCommunityNotes brand={entry.brand} model={entry.model} engine={engine.name} />
            </section>
          ))}

        {isAiConfigured() && <UnknownVehicleLookup />}
      </PageContainer>
    </>
  )
}

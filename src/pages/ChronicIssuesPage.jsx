import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import ProblemCard from '../components/ProblemCard'
import EmptyState from '../components/EmptyState'
import { getBrands, getModelsByBrand, getVehicleEntry } from '../services/vehicleService'
import { getNotes, addNote, removeNote } from '../services/communityNotesService'

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
      </PageContainer>
    </>
  )
}

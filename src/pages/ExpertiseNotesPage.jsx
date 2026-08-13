import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import EmptyState from '../components/EmptyState'
import { GENERAL_INSPECTION_CATEGORIES } from '../utils/constants'
import { resolveEngineData } from '../services/analysisService'
import {
  addExpertiseNote,
  getExpertiseNotes,
  removeExpertiseNote,
  summarizeSeverity
} from '../services/expertiseNotesService'

export default function ExpertiseNotesPage() {
  const location = useLocation()
  const formData = location.state?.formData

  const vehicleSpecificItems = useMemo(() => {
    if (!formData) return []
    const engineData = resolveEngineData(formData)
    return engineData?.inspectionChecklist || []
  }, [formData])

  const categories = useMemo(() => {
    if (!vehicleSpecificItems.length) return GENERAL_INSPECTION_CATEGORIES
    return [
      ...GENERAL_INSPECTION_CATEGORIES,
      { id: 'araca-ozel', title: 'Araca Özel', items: vehicleSpecificItems }
    ]
  }, [vehicleSpecificItems])

  const [vehicleLabel, setVehicleLabel] = useState(
    formData ? `${formData.brand} ${formData.model} ${formData.year}` : ''
  )
  const [flagged, setFlagged] = useState({})
  const [notes, setNotes] = useState('')
  const [savedNotes, setSavedNotes] = useState(() => getExpertiseNotes())

  const flaggedItems = Object.keys(flagged).filter((key) => flagged[key])

  function toggleFlag(item) {
    setFlagged((prev) => ({ ...prev, [item]: !prev[item] }))
  }

  function handleSave(event) {
    event.preventDefault()
    if (!vehicleLabel.trim()) return
    addExpertiseNote({ vehicleLabel: vehicleLabel.trim(), flaggedItems, notes: notes.trim() })
    setSavedNotes(getExpertiseNotes())
    setFlagged({})
    setNotes('')
  }

  function handleRemove(id) {
    setSavedNotes(removeExpertiseNote(id))
  }

  return (
    <>
      <Header
        title="Ekspertiz Notları"
        subtitle="Kontrol ettiğin kalemleri işaretle, otomatik özet oluşsun."
        showBack
      />
      <PageContainer>
        <form className="analysis-form" onSubmit={handleSave}>
          <label>
            Araç
            <input
              type="text"
              placeholder="Örn. Audi A3 2017"
              value={vehicleLabel}
              onChange={(e) => setVehicleLabel(e.target.value)}
            />
          </label>

          {categories.map((category) => (
            <div key={category.id}>
              <p className="expertise-category-title">{category.title}</p>
              <div className="checklist-group">
                {category.items.map((item) => (
                  <label
                    key={item}
                    className={'checklist-item' + (flagged[item] ? ' flagged' : '')}
                  >
                    <input type="checkbox" checked={!!flagged[item]} onChange={() => toggleFlag(item)} />
                    <span className="checklist-box" aria-hidden="true" />
                    <span className="checklist-label">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <label>
            Serbest Not
            <textarea
              rows={3}
              placeholder="Ekspertizde gözlemlediğin diğer detaylar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <button type="submit" className="primary-button">
            Notu Kaydet
          </button>
        </form>

        <h3 className="section-title">Kayıtlı Notlar</h3>
        {savedNotes.length === 0 ? (
          <EmptyState
            icon="clipboard"
            title="Henüz ekspertiz notu yok"
            description="Sorunlu bulduğun kalemleri işaretleyip kaydettiğinde burada listelenecek."
          />
        ) : (
          <div className="favorites-list">
            {savedNotes.map((note) => {
              const severity = summarizeSeverity(note.flaggedItems.length)
              return (
                <div className="expertise-note-card" key={note.id}>
                  <div className="expertise-note-head">
                    <div>
                      <h3>{note.vehicleLabel}</h3>
                      <span className={'severity-badge tone-' + severity.tone}>{severity.label}</span>
                    </div>
                    <button
                      className="favorite-item-remove"
                      onClick={() => handleRemove(note.id)}
                      aria-label="Notu sil"
                      type="button"
                    >
                      Sil
                    </button>
                  </div>
                  {note.flaggedItems.length > 0 && (
                    <p className="expertise-note-items">{note.flaggedItems.join(', ')}</p>
                  )}
                  {note.notes && <p className="expertise-note-text">{note.notes}</p>}
                </div>
              )
            })}
          </div>
        )}
      </PageContainer>
    </>
  )
}

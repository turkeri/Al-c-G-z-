import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import EmptyState from '../components/EmptyState'
import Icon from '../components/icons/Icon'
import { loadImageFromFile, drawToCanvas, canvasToJpeg } from '../services/photoAnalysisService'
import { PANELS, MIN_PANELS_FOR_ANALYSIS, analyzePanelPhoto, comparePanels } from '../services/paintDetectionService'
import { getPaintChecks, savePaintCheck, removePaintCheck } from '../services/paintCheckStorageService'

const VERDICT_LABEL = {
  orijinal: { label: 'Muhtemelen orijinal', tone: 'excellent' },
  incele: { label: 'Yakından incele', tone: 'danger' },
  belirsiz: { label: 'Belirsiz (ışık farkı)', tone: 'warning' }
}

export default function PaintCheckPage() {
  const location = useLocation()
  const formData = location.state?.formData

  const [vehicleLabel, setVehicleLabel] = useState(
    formData ? `${formData.brand} ${formData.model} ${formData.year}` : ''
  )
  const [panelPhotos, setPanelPhotos] = useState({})
  const [results, setResults] = useState(null)
  const [processing, setProcessing] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [savedReports, setSavedReports] = useState(() => getPaintChecks())

  const capturedCount = Object.keys(panelPhotos).length
  const canAnalyze = capturedCount >= MIN_PANELS_FOR_ANALYSIS

  async function handlePanelFile(panelName, file) {
    if (!file) return
    setProcessing(panelName)
    try {
      const img = await loadImageFromFile(file)
      const signature = analyzePanelPhoto(img)
      const previewCanvas = drawToCanvas(img, 400)
      const dataUrl = canvasToJpeg(previewCanvas)
      setPanelPhotos((prev) => ({ ...prev, [panelName]: { dataUrl, signature } }))
      setResults(null)
    } catch (err) {
      console.error('Panel fotoğrafı işlenemedi:', err)
    } finally {
      setProcessing('')
    }
  }

  function handleRemovePanel(panelName) {
    setPanelPhotos((prev) => {
      const next = { ...prev }
      delete next[panelName]
      return next
    })
    setResults(null)
  }

  function handleAnalyze() {
    const panels = Object.entries(panelPhotos).map(([name, data]) => ({
      name,
      id: name,
      dataUrl: data.dataUrl,
      signature: data.signature
    }))
    setResults(comparePanels(panels))
    setSaveMessage('')
  }

  function handleSaveReport() {
    if (!results) return
    const { saved } = savePaintCheck({
      vehicleLabel: vehicleLabel.trim() || 'İsimsiz araç',
      results
    })
    if (!saved) {
      setSaveMessage('Kaydedilemedi — depolama alanı dolu olabilir.')
      return
    }
    setSaveMessage('Rapor kaydedildi.')
    setSavedReports(getPaintChecks())
  }

  function handleRemoveReport(id) {
    setSavedReports(removePaintCheck(id))
  }

  const flaggedCount = useMemo(
    () => (results ? results.filter((r) => r.verdict === 'incele').length : 0),
    [results]
  )

  return (
    <>
      <Header
        title="Boya / Değişen Kontrolü"
        subtitle="Panel panel fotoğraf çek, sistem birbirleriyle karşılaştırsın."
        showBack
      />
      <PageContainer>
        <section className="result-card">
          <h3>Nasıl çalışır</h3>
          <p className="market-disclaimer" style={{ marginTop: 0, fontSize: '0.78rem' }}>
            Aşağıdaki panellerden en az {MIN_PANELS_FOR_ANALYSIS} tanesinin fotoğrafını çek — mümkünse hepsini
            aynı gün, benzer ışıkta ve panele yakından çek. Sistem panellerin renk tonunu ve yüzey dokusunu
            birbiriyle kıyaslayıp diğerlerinden belirgin şekilde farklı olanları işaretler. Bu, boya kalınlığı
            ölçüm cihazının yerini TUTMAZ; fiziksel ekspertizde hangi panellere daha dikkatli bakman gerektiğini
            gösteren kaba, kısmi bir ön tahmindir.
          </p>
          <label>
            Araç
            <input
              type="text"
              placeholder="Örn. Audi A3 2017"
              value={vehicleLabel}
              onChange={(e) => setVehicleLabel(e.target.value)}
              style={{ marginTop: 6 }}
            />
          </label>
        </section>

        <section className="result-card">
          <h3>
            Panel Fotoğrafları ({capturedCount}/{PANELS.length})
          </h3>
          <div className="panel-grid">
            {PANELS.map((panel) => {
              const captured = panelPhotos[panel]
              return (
                <div className="panel-slot" key={panel}>
                  {captured ? (
                    <div className="panel-slot-photo">
                      <img src={captured.dataUrl} alt={panel} />
                      <button
                        type="button"
                        className="photo-thumb-remove"
                        onClick={() => handleRemovePanel(panel)}
                        aria-label={`${panel} fotoğrafını kaldır`}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="panel-slot-empty">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handlePanelFile(panel, e.target.files?.[0])}
                        style={{ display: 'none' }}
                      />
                      <Icon name="camera" size={20} strokeWidth={1.7} />
                      <span>{processing === panel ? 'İşleniyor...' : 'Ekle'}</span>
                    </label>
                  )}
                  <p className="panel-slot-label">{panel}</p>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            className="primary-button"
            disabled={!canAnalyze}
            onClick={handleAnalyze}
            style={{ opacity: canAnalyze ? 1 : 0.5 }}
          >
            {canAnalyze ? 'Analiz Et' : `En az ${MIN_PANELS_FOR_ANALYSIS} panel fotoğrafı ekle`}
          </button>
        </section>

        {results && (
          <section className="result-card">
            <div className="market-row">
              <h3 style={{ margin: 0 }}>Analiz Sonucu</h3>
              <span className={'market-label tone-' + (flaggedCount > 0 ? 'pahali' : 'ucuz')}>
                {flaggedCount > 0 ? `${flaggedCount} panel incelemeli` : 'Belirgin fark yok'}
              </span>
            </div>
            <div className="panel-results">
              {results.map((panel) => {
                const verdictMeta = VERDICT_LABEL[panel.verdict]
                return (
                  <div className="panel-result-item" key={panel.id}>
                    <img src={panel.dataUrl} alt={panel.name} />
                    <div className="panel-result-text">
                      <div className="panel-result-head">
                        <span>{panel.name}</span>
                        <span className={'severity-badge tone-' + verdictMeta.tone}>{verdictMeta.label}</span>
                      </div>
                      {panel.reasons.length > 0 && (
                        <p>{panel.reasons.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <button type="button" className="favorite-button" onClick={handleSaveReport} style={{ marginTop: 12 }}>
              Raporu Kaydet
            </button>
            {saveMessage && <p className="market-disclaimer">{saveMessage}</p>}
          </section>
        )}

        <h3 className="section-title">Kayıtlı Raporlar</h3>
        {savedReports.length === 0 ? (
          <EmptyState
            icon="clipboard"
            title="Henüz kayıtlı rapor yok"
            description="Analiz ettikten sonra raporu kaydedersen burada listelenir."
          />
        ) : (
          <div className="favorites-list">
            {savedReports.map((report) => {
              const flagged = report.results.filter((r) => r.verdict === 'incele').length
              return (
                <div className="expertise-note-card" key={report.id}>
                  <div className="expertise-note-head">
                    <div>
                      <h3>{report.vehicleLabel}</h3>
                      <span className={'severity-badge tone-' + (flagged > 0 ? 'danger' : 'excellent')}>
                        {flagged > 0 ? `${flagged} panel incelemeli` : 'Belirgin fark yok'}
                      </span>
                    </div>
                    <button
                      className="favorite-item-remove"
                      onClick={() => handleRemoveReport(report.id)}
                      aria-label="Raporu sil"
                      type="button"
                    >
                      Sil
                    </button>
                  </div>
                  <p className="expertise-note-items">
                    {report.results.map((r) => r.name).join(', ')}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </PageContainer>
    </>
  )
}

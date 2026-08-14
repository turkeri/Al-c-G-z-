import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import EmptyState from '../components/EmptyState'
import Icon from '../components/icons/Icon'
import HeadlightLoader from '../components/HeadlightLoader'
import { loadImageFromFile, drawToCanvas, canvasToJpeg } from '../services/photoAnalysisService'
import { PANELS, MIN_PANELS_FOR_ANALYSIS, analyzePanelPhoto, comparePanels } from '../services/paintDetectionService'
import { getPaintChecks, savePaintCheck, removePaintCheck } from '../services/paintCheckStorageService'
import { updateSession } from '../services/inspectionSessionService'

const VERDICT_LABEL = {
  orijinal: { label: 'Uyumlu', tone: 'excellent' },
  supheli: { label: 'Şüpheli', tone: 'warning' },
  'guclu-suphe': { label: 'Güçlü şüphe', tone: 'danger' },
  yetersiz: { label: 'Ölçülemedi', tone: 'warning' }
}

/**
 * Çekim protokolü.
 *
 * Bu ekranın doğruluğunu belirleyen asıl şey algoritma değil, fotoğrafların
 * nasıl çekildiğidir. Işık farkı, boya farkından büyüktür; kullanıcıya ışığı
 * sabitletmek, motoru iyileştirmekten daha fazla kazandırır.
 */
const PROTOCOL = [
  'Aracı gölgeye çek veya bulutlu havada çek. Doğrudan güneş ışığı ölçümü bozar.',
  'Flaşı kapat. Telefonun HDR ayarı varsa onu da kapat.',
  'Her paneli aynı mesafeden çek (yaklaşık yarım metre) ve panel kareyi doldursun.',
  'Panele mümkün olduğunca dik dur; yandan açı yansımayı artırır.',
  'Fitil, kulp, cam ve arka planı olabildiğince çerçeve dışında tut.',
  'Bütün panelleri arka arkaya, aynı ışıkta çek. Yarısını sabah yarısını akşam çekme.'
]

export default function PaintCheckPage() {
  const location = useLocation()
  const formData = location.state?.formData

  const [vehicleLabel, setVehicleLabel] = useState(
    formData ? `${formData.brand} ${formData.model} ${formData.year}` : ''
  )
  const [panelPhotos, setPanelPhotos] = useState({})
  const [report, setReport] = useState(null)
  const [processing, setProcessing] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [savedReports, setSavedReports] = useState(() => getPaintChecks())

  const capturedCount = Object.keys(panelPhotos).length
  const usableCount = Object.values(panelPhotos).filter((p) => p.signature.quality.usable).length
  const canAnalyze = usableCount >= MIN_PANELS_FOR_ANALYSIS

  async function handlePanelFile(panelId, file) {
    if (!file) return
    setProcessing(panelId)
    try {
      const img = await loadImageFromFile(file)
      const signature = analyzePanelPhoto(img)
      const previewCanvas = drawToCanvas(img, 400)
      const dataUrl = canvasToJpeg(previewCanvas)
      setPanelPhotos((prev) => ({ ...prev, [panelId]: { dataUrl, signature } }))
      setReport(null)
    } catch (err) {
      console.error('Panel fotoğrafı işlenemedi:', err)
    } finally {
      setProcessing('')
    }
  }

  function handleRemovePanel(panelId) {
    setPanelPhotos((prev) => {
      const next = { ...prev }
      delete next[panelId]
      return next
    })
    setReport(null)
  }

  function handleAnalyze() {
    setAnalyzing(true)
    // Ölçüm senkron çalışıyor; far göstergesinin görünmesi için bir kare beklenir.
    setTimeout(() => {
      const panels = Object.entries(panelPhotos).map(([id, data]) => {
        const def = PANELS.find((p) => p.id === id)
        return { id, name: def?.name || id, dataUrl: data.dataUrl, signature: data.signature }
      })
      setReport(comparePanels(panels))
      setAnalyzing(false)
      setSaveMessage('')
    }, 60)
  }

  function handleSaveReport() {
    if (!report) return
    const { saved } = savePaintCheck({
      vehicleLabel: vehicleLabel.trim() || 'İsimsiz araç',
      results: report.panels,
      summary: report.summary
    })
    if (!saved) {
      setSaveMessage('Kaydedilemedi — depolama alanı dolu olabilir.')
      return
    }
    updateSession({
      paint: {
        summary:
          report.summary.measuredCount +
          ' panel ölçüldü, ' +
          report.summary.flaggedCount +
          ' şüpheli'
      }
    })
    setSaveMessage('Rapor kaydedildi.')
    setSavedReports(getPaintChecks())
  }

  function handleRemoveReport(id) {
    setSavedReports(removePaintCheck(id))
  }

  const sortedPanels = useMemo(() => {
    if (!report) return []
    const rank = { 'guclu-suphe': 0, supheli: 1, yetersiz: 2, orijinal: 3 }
    return [...report.panels].sort(
      (a, b) => rank[a.verdict] - rank[b.verdict] || b.evidence - a.evidence
    )
  }, [report])

  return (
    <>
      <Header
        title="Boya / Değişen Kontrolü"
        subtitle="Panelleri fotoğrafla, sistem renk ve dokuyu ölçüp kıyaslasın."
        showBack
      />
      <PageContainer>
        <section className="result-card">
          <h3>Doğru Sonuç İçin Çekim Kuralları</h3>
          <p className="market-disclaimer" style={{ marginTop: 0 }}>
            Bu ölçümün doğruluğunu en çok belirleyen şey fotoğrafların nasıl çekildiğidir.
            Aşağıdakilere uyarsan sonuç ciddi biçimde güvenilir olur.
          </p>
          <ol className="protocol-list">
            {PROTOCOL.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
          <label style={{ marginTop: 14 }}>
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
          <div className="market-row">
            <h3 style={{ margin: 0 }}>Panel Fotoğrafları</h3>
            <span className="market-label tone-normal">
              {capturedCount}/{PANELS.length}
            </span>
          </div>
          {capturedCount > usableCount && (
            <p className="market-disclaimer" style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
              {capturedCount - usableCount} fotoğraf ölçüme uygun değil (bulanık ya da parlama
              baskın). Kırmızı çerçeveli olanları tekrar çek.
            </p>
          )}

          <div className="panel-grid">
            {PANELS.map((panel) => {
              const captured = panelPhotos[panel.id]
              const bad = captured && !captured.signature.quality.usable
              return (
                <div className="panel-slot" key={panel.id}>
                  {captured ? (
                    <div className={'panel-slot-photo' + (bad ? ' is-bad' : '')}>
                      <img src={captured.dataUrl} alt={panel.name} />
                      <button
                        type="button"
                        className="photo-thumb-remove"
                        onClick={() => handleRemovePanel(panel.id)}
                        aria-label={`${panel.name} fotoğrafını kaldır`}
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
                        onChange={(e) => handlePanelFile(panel.id, e.target.files?.[0])}
                        style={{ display: 'none' }}
                      />
                      <Icon name="camera" size={20} strokeWidth={1.7} />
                      <span>{processing === panel.id ? 'Ölçülüyor...' : 'Ekle'}</span>
                    </label>
                  )}
                  <p className="panel-slot-label">
                    {panel.name}
                    {panel.substrate === 'plastik' && <span className="micron-tag">plastik</span>}
                  </p>
                </div>
              )
            })}
          </div>

          <p className="market-disclaimer">
            Simetrik paneller (sol/sağ çamurluk, sol/sağ kapılar) ikili olarak da kıyaslanır ve en
            güvenilir sinyali onlar verir — mümkünse ikizleri birlikte çek.
          </p>

          <button
            type="button"
            className="primary-button"
            disabled={!canAnalyze || analyzing}
            onClick={handleAnalyze}
            style={{ opacity: canAnalyze && !analyzing ? 1 : 0.5 }}
          >
            {canAnalyze
              ? 'Ölç ve Karşılaştır'
              : `Ölçüme uygun en az ${MIN_PANELS_FOR_ANALYSIS} panel gerekiyor (${usableCount} hazır)`}
          </button>
        </section>

        {analyzing && (
          <section className="result-card">
            <HeadlightLoader label="Paneller ölçülüyor..." />
          </section>
        )}

        {report && (
          <>
            <section className={'verdict-card tone-' + report.summary.tone}>
              <span className="verdict-card-label">{report.summary.label}</span>
              <p>{report.summary.text}</p>
            </section>

            {report.summary.confidence > 0 && (
              <section className="result-card">
                <h3>Ölçüm Kalitesi</h3>
                <div className="market-facts">
                  <div>
                    <span>Ölçülen panel</span>
                    <strong>{report.summary.measuredCount}</strong>
                  </div>
                  <div>
                    <span>Referans küme</span>
                    <strong>{report.summary.consensusSize}</strong>
                  </div>
                  <div>
                    <span>Güven</span>
                    <strong>%{report.summary.confidence}</strong>
                  </div>
                </div>
                {!report.summary.lightingConsistent && (
                  <p className="market-disclaimer" style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                    Fotoğraflar arasında belirgin ışık farkı var. Sonuç yine de hesaplandı ama
                    güveni düşük; hepsini aynı ortamda tekrar çekmen sonucu ciddi biçimde
                    iyileştirir.
                  </p>
                )}
                {report.summary.neutralColour && (
                  <p className="market-disclaimer">
                    Araç rengi nötr (beyaz/gri/siyah). Bu renklerde ton bilgisi zayıftır; karar
                    ağırlıklı olarak doku ve panel içi tutarlılığa dayanır.
                  </p>
                )}
              </section>
            )}

            <section className="result-card">
              <div className="market-row">
                <h3 style={{ margin: 0 }}>Panel Sonuçları</h3>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setShowDetails((prev) => !prev)}
                >
                  {showDetails ? 'Sayıları gizle' : 'Ölçüm sayılarını göster'}
                </button>
              </div>

              <div className="panel-results">
                {sortedPanels.map((panel) => {
                  const meta = VERDICT_LABEL[panel.verdict]
                  return (
                    <div className="panel-result-item" key={panel.id}>
                      <img src={panel.dataUrl} alt={panel.name} />
                      <div className="panel-result-text">
                        <div className="panel-result-head">
                          <span>{panel.name}</span>
                          <span className={'severity-badge tone-' + meta.tone}>{meta.label}</span>
                        </div>

                        {panel.verdict !== 'yetersiz' && (
                          <div className="evidence-bar">
                            <span
                              className={'evidence-fill tone-' + meta.tone}
                              style={{ width: Math.max(3, panel.evidence) + '%' }}
                            />
                          </div>
                        )}

                        <p>{panel.reasons.join('. ')}.</p>

                        {showDetails && panel.metrics && (
                          <div className="metric-grid">
                            <span>
                              Renk sapması <strong>{panel.metrics.chromatic}</strong>
                            </span>
                            <span>
                              Işık farkı <strong>{panel.metrics.lightness}</strong>
                            </span>
                            <span>
                              Doku oranı <strong>{panel.metrics.textureRatio}</strong>
                            </span>
                            <span>
                              Panel içi dağılım <strong>{panel.metrics.internalSpread}</strong>
                            </span>
                            {panel.metrics.pairDelta !== null && (
                              <span>
                                İkizinden fark <strong>{panel.metrics.pairDelta}</strong>
                              </span>
                            )}
                            <span>
                              Güven <strong>%{panel.confidence}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <p className="market-disclaimer">
              Bu ölçüm boya kalınlığı cihazının yerini tutmaz. Renk ve doku farkı, boyanın
              kalınlığını değil yalnızca panellerin birbirinden ayrışıp ayrışmadığını gösterir.
              İyi yapılmış bir boya bu yöntemle görünmeyebilir; bu yüzden &quot;fark bulunamadı&quot;
              sonucu boyasızlık garantisi değildir. Şüpheli çıkan paneller için ekspertizde mikron
              ölçümü iste.
            </p>

            <div className="button-row">
              <button type="button" className="primary-button" onClick={handleSaveReport}>
                Raporu Kaydet
              </button>
              <a className="favorite-button" href="#/ekspertiz-raporu">
                Mikron Değerlerini Gir
              </a>
            </div>
            {saveMessage && <p className="market-disclaimer">{saveMessage}</p>}
          </>
        )}

        <h3 className="section-title">Kayıtlı Raporlar</h3>
        {savedReports.length === 0 ? (
          <EmptyState
            icon="clipboard"
            title="Henüz kayıtlı rapor yok"
            description="Ölçüm yaptıktan sonra raporu kaydedersen burada listelenir."
          />
        ) : (
          <div className="favorites-list">
            {savedReports.map((saved) => {
              const flagged = saved.results.filter(
                (r) => r.verdict === 'supheli' || r.verdict === 'guclu-suphe'
              ).length
              return (
                <div className="expertise-note-card" key={saved.id}>
                  <div className="expertise-note-head">
                    <div>
                      <h3>{saved.vehicleLabel}</h3>
                      <span className={'severity-badge tone-' + (flagged > 0 ? 'danger' : 'excellent')}>
                        {flagged > 0 ? `${flagged} panel şüpheli` : 'Belirgin fark yok'}
                      </span>
                    </div>
                    <button
                      className="favorite-item-remove"
                      onClick={() => handleRemoveReport(saved.id)}
                      aria-label="Raporu sil"
                      type="button"
                    >
                      Sil
                    </button>
                  </div>
                  <p className="expertise-note-items">
                    {saved.results.map((r) => r.name).join(', ')}
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

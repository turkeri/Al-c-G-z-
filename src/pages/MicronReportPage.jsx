import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import { MICRON_PANELS, evaluateMicronReport, toDamageParts } from '../services/micronService'
import { updateSession } from '../services/inspectionSessionService'

/**
 * Ekspertiz raporundaki mikron değerlerini okunur hale getirir.
 *
 * Ekspertizden çıkan kağıtta panel panel boya kalınlığı yazar ama hiçbir
 * açıklama olmaz. Kullanıcı buraya değerleri girer, hangi panelin orijinal,
 * hangisinin boyalı, hangisinin macunlu olduğunu görür.
 */
export default function MicronReportPage() {
  const navigate = useNavigate()
  const [readings, setReadings] = useState({})
  const [saved, setSaved] = useState(false)

  const report = useMemo(() => evaluateMicronReport(readings), [readings])
  const filledCount = Object.values(readings).filter((v) => v !== '' && v != null).length

  function setPanel(id, value) {
    setReadings((prev) => ({ ...prev, [id]: value }))
    setSaved(false)
  }

  function handleSave() {
    if (!report) return
    updateSession({
      micron: {
        measuredCount: report.measuredCount,
        paintedCount: report.paintedCount + report.heavyCount,
        heavyCount: report.heavyCount,
        overall: report.overall.label,
        suggestedParts: toDamageParts(report)
      }
    })
    setSaved(true)
  }

  return (
    <>
      <Header
        title="Ekspertiz Raporu Okuyucu"
        subtitle="Mikron değerlerini gir, hangi panel orijinal hangisi boyalı gör."
        showBack
      />
      <PageContainer>
        <section className="result-card">
          <h3>Boya Kalınlığı Nasıl Okunur?</h3>
          <div className="scale-legend">
            <div className="scale-row">
              <span className="scale-chip tone-warning">60 mikron altı</span>
              <span>Fabrika boyası için ince, panel değişmiş olabilir</span>
            </div>
            <div className="scale-row">
              <span className="scale-chip tone-excellent">60 - 130</span>
              <span>Fabrika boyası aralığı, orijinal</span>
            </div>
            <div className="scale-row">
              <span className="scale-chip tone-warning">130 - 200</span>
              <span>Sınırda; kalın orijinal veya ince rötuş olabilir</span>
            </div>
            <div className="scale-row">
              <span className="scale-chip tone-warning">200 - 350</span>
              <span>Boyalı</span>
            </div>
            <div className="scale-row">
              <span className="scale-chip tone-danger">350 üzeri</span>
              <span>Macun/dolgu var, ağır onarım veya değişen</span>
            </div>
          </div>
          <p className="market-disclaimer">
            Tamponlar plastik olduğu için mikron ölçümü anlam taşımaz, listede yer almazlar.
            En az üç panel girdiğinde değerlendirme başlar.
          </p>
        </section>

        <section className="result-card">
          <h3>Panel Ölçümleri</h3>
          <div className="micron-grid">
            {MICRON_PANELS.map((panel) => {
              const found = report?.panels.find((p) => p.id === panel.id)
              return (
                <label className="micron-item" key={panel.id}>
                  <span className="micron-label">
                    {panel.label}
                    {panel.structural && <span className="micron-tag">taşıyıcı</span>}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="mikron"
                    value={readings[panel.id] ?? ''}
                    onChange={(e) => setPanel(panel.id, e.target.value)}
                  />
                  {found && (
                    <span className={'micron-verdict tone-' + found.verdict.tone}>
                      {found.verdict.label}
                    </span>
                  )}
                </label>
              )
            })}
          </div>
        </section>

        {!report && (
          <section className="result-card">
            <p className="result-empty">
              {filledCount === 0
                ? 'Raporundaki değerleri yukarıya gir.'
                : 'Değerlendirme için en az üç panel gerekiyor.'}
            </p>
          </section>
        )}

        {report && (
          <>
            <section className={'verdict-card tone-' + report.overall.tone}>
              <span className="verdict-card-label">{report.overall.label}</span>
              <p>{report.overall.text}</p>
            </section>

            <section className="result-card">
              <h3>Özet</h3>
              <div className="market-facts">
                <div>
                  <span>Ölçülen panel</span>
                  <strong>{report.measuredCount}</strong>
                </div>
                <div>
                  <span>Orijinal</span>
                  <strong>{report.originalCount}</strong>
                </div>
                <div>
                  <span>Boyalı / macunlu</span>
                  <strong>{report.paintedCount + report.heavyCount}</strong>
                </div>
              </div>
              {report.reference && (
                <p className="market-disclaimer">
                  Bu aracın fabrika boya referansı yaklaşık {report.reference} mikron olarak
                  hesaplandı; paneller bu değere göre de kıyaslandı.
                </p>
              )}
              {report.structuralHits.length > 0 && (
                <p className="market-disclaimer" style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                  Taşıyıcı bölgede işlem: {report.structuralHits.join(', ')}
                </p>
              )}
            </section>

            <div className="button-row">
              <button type="button" className="primary-button" onClick={handleSave}>
                {saved ? 'Kaydedildi' : 'Kontrol Raporuma Kaydet'}
              </button>
              <button
                type="button"
                className="favorite-button"
                onClick={() => {
                  handleSave()
                  navigate('/tramer', { state: { parts: toDamageParts(report) } })
                }}
              >
                Değer Kaybını Hesapla
              </button>
            </div>
          </>
        )}
      </PageContainer>
    </>
  )
}

import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import { GENERAL_INSPECTION_CATEGORIES } from '../utils/constants'
import { getEngineData } from '../services/catalogAdapter'
import { useVehiclePickerChain } from '../hooks/useVehiclePickerChain'
import { addExpertiseNote } from '../services/expertiseNotesService'
import { updateSession, setSessionVehicle } from '../services/inspectionSessionService'

const STATUS = { OK: 'ok', PROBLEM: 'problem' }

export default function InspectionChecklistPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [brand, setBrand] = useState(location.state?.brand || '')
  const [model, setModel] = useState(location.state?.model || '')
  const [engineName, setEngineName] = useState(location.state?.engine || '')
  const [statuses, setStatuses] = useState({})
  const [saveMessage, setSaveMessage] = useState('')

  const { brands, models, engines, loading: catalogLoading, error: catalogError, retry: retryCatalog } =
    useVehiclePickerChain(brand, model)
  const engineData = useMemo(
    () => (brand && model && engineName ? getEngineData(brand, model, engineName) : null),
    [brand, model, engineName]
  )

  const categories = useMemo(() => {
    if (!engineData?.inspectionChecklist?.length) return GENERAL_INSPECTION_CATEGORIES
    return [
      ...GENERAL_INSPECTION_CATEGORIES,
      { id: 'araca-ozel', title: 'Araca Özel Kontroller', items: engineData.inspectionChecklist }
    ]
  }, [engineData])

  // Aynı kalem adı birden fazla kategoride geçebildiği için (örn. "Turbo kontrolü"
  // hem Motor hem Araca Özel listesinde), durum anahtarı kategoriyle birlikte tutulur.
  const keyOf = (categoryId, item) => `${categoryId}::${item}`

  const allKeys = useMemo(
    () => categories.flatMap((c) => c.items.map((i) => ({ key: keyOf(c.id, i), item: i }))),
    [categories]
  )
  const checkedCount = allKeys.filter(({ key }) => statuses[key]).length
  const problemItems = allKeys.filter(({ key }) => statuses[key] === STATUS.PROBLEM).map((e) => e.item)
  const okCount = allKeys.filter(({ key }) => statuses[key] === STATUS.OK).length
  const progress = allKeys.length ? Math.round((checkedCount / allKeys.length) * 100) : 0

  function setStatus(key, status) {
    setStatuses((prev) => ({ ...prev, [key]: prev[key] === status ? undefined : status }))
    setSaveMessage('')
  }

  function categoryProgress(category) {
    const keys = category.items.map((i) => keyOf(category.id, i))
    const done = keys.filter((k) => statuses[k]).length
    const problems = keys.filter((k) => statuses[k] === STATUS.PROBLEM).length
    return { done, total: category.items.length, problems }
  }

  const verdict = useMemo(() => {
    if (checkedCount === 0) return null
    if (problemItems.length === 0) {
      return { tone: 'excellent', title: 'Sorun işaretlenmedi', text: `${okCount} kalem kontrol edildi, hepsi sorunsuz görünüyor.` }
    }
    if (problemItems.length <= 2) {
      return { tone: 'good', title: 'Az sayıda bulgu', text: `${problemItems.length} kalemde sorun var. Pazarlık gerekçesi olarak kullanabilirsin.` }
    }
    if (problemItems.length <= 5) {
      return { tone: 'warning', title: 'Dikkat gerektiren bulgular', text: `${problemItems.length} kalemde sorun var. Masraf tahmini çıkarmadan karar verme.` }
    }
    return { tone: 'danger', title: 'Çok sayıda bulgu', text: `${problemItems.length} kalemde sorun var. Bu araç ciddi masraf çıkarabilir.` }
  }, [checkedCount, problemItems.length, okCount])

  function handleSaveReport() {
    const label = brand && model ? `${brand} ${model}${engineName ? ' ' + engineName : ''}` : 'İsimsiz araç'
    const { saved } = addExpertiseNote({
      vehicleLabel: label,
      flaggedItems: problemItems,
      notes: `Kontrol listesi: ${allKeys.length} kalemden ${checkedCount} tanesi kontrol edildi, ${okCount} sorunsuz, ${problemItems.length} sorunlu.`,
      photos: []
    })

    // Yerinde kontrol akışının bu adımı tamamlandı olarak işaretlenir.
    if (brand && model) setSessionVehicle({ brand, model, engine: engineName })
    updateSession({
      checklist: {
        checkedCount,
        totalCount: allKeys.length,
        problemCount: problemItems.length,
        problemItems
      }
    })

    setSaveMessage(saved ? 'Rapor Ekspertiz Notları\'na kaydedildi.' : 'Kaydedilemedi — depolama alanı dolu olabilir.')
  }

  function handleReset() {
    setStatuses({})
    setSaveMessage('')
  }

  return (
    <>
      <Header
        title="Ekspertiz Kontrol Listesi"
        subtitle="Her kalemi kontrol et, sağlam mı sorunlu mu işaretle."
        showBack
      />
      <PageContainer>
        {catalogLoading && <p className="field-hint">Marka/model/motor listesi güncelleniyor…</p>}
        {!catalogLoading && catalogError && (
          <p className="field-hint field-hint-warning">
            Liste güncellenemedi, kayıtlı listeyle devam ediliyor.{' '}
            <button type="button" className="link-button" onClick={retryCatalog}>
              Tekrar dene
            </button>
          </p>
        )}
        <div className="filter-row">
          <label>
            Marka
            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value)
                setModel('')
                setEngineName('')
              }}
            >
              <option value="">Seçiniz (opsiyonel)</option>
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
                setEngineName('')
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
          <label>
            Motor
            <select value={engineName} onChange={(e) => setEngineName(e.target.value)} disabled={!engines.length}>
              <option value="">{engines.length ? 'Seçiniz' : 'Önce marka/model seçin'}</option>
              {engines.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="progress-card">
          <div className="progress-head">
            <span className="progress-label">İlerleme</span>
            <span className="progress-value">
              {checkedCount}/{allKeys.length}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-stats">
            <span className="stat-ok">{okCount} sağlam</span>
            <span className="stat-problem">{problemItems.length} sorunlu</span>
            <span className="stat-pending">{allKeys.length - checkedCount} bekliyor</span>
          </div>
        </section>

        {verdict && (
          <section className={'decision-card verdict-' + (verdict.tone === 'excellent' || verdict.tone === 'good' ? 'al' : verdict.tone === 'warning' ? 'dikkatli' : 'alma')}>
            <div className="decision-icon" aria-hidden="true">
              {problemItems.length === 0 ? '✓' : problemItems.length <= 5 ? '!' : '×'}
            </div>
            <div className="decision-text">
              <h3>{verdict.title}</h3>
              <p>{verdict.text}</p>
            </div>
          </section>
        )}

        {problemItems.length > 0 && (
          <section className="result-card">
            <h3>Sorunlu Bulunan Kalemler</h3>
            <ul className="result-list negative">
              {[...new Set(problemItems)].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="market-disclaimer">
              Bu listeyi ustaya veya satıcıya göstererek hem doğrulama hem pazarlık için kullanabilirsin.
            </p>
          </section>
        )}

        {categories.map((category) => {
          const cp = categoryProgress(category)
          return (
            <section className="result-card" key={category.id}>
              <div className="market-row">
                <h3 style={{ margin: 0 }}>{category.title}</h3>
                <span className={'severity-badge tone-' + (cp.problems > 0 ? 'danger' : cp.done === cp.total ? 'excellent' : 'good')}>
                  {cp.done}/{cp.total}
                  {cp.problems > 0 ? ` · ${cp.problems} sorun` : ''}
                </span>
              </div>
              <div className="checklist-group">
                {category.items.map((item) => {
                  const key = keyOf(category.id, item)
                  return (
                    <div className={'check-row' + (statuses[key] ? ' status-' + statuses[key] : '')} key={key}>
                      <span className="check-row-label">{item}</span>
                      <div className="check-row-actions">
                        <button
                          type="button"
                          className={'check-btn ok' + (statuses[key] === STATUS.OK ? ' active' : '')}
                          onClick={() => setStatus(key, STATUS.OK)}
                          aria-label={`${item} sağlam`}
                        >
                          Sağlam
                        </button>
                        <button
                          type="button"
                          className={'check-btn problem' + (statuses[key] === STATUS.PROBLEM ? ' active' : '')}
                          onClick={() => setStatus(key, STATUS.PROBLEM)}
                          aria-label={`${item} sorunlu`}
                        >
                          Sorunlu
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {checkedCount > 0 && (
          <section className="result-card">
            <h3>Raporu Kaydet</h3>
            <p className="market-disclaimer" style={{ marginTop: 0 }}>
              Bu kontrolü Ekspertiz Notları&apos;na kaydedip sonra tekrar bakabilir, fotoğraf
              ekleyebilirsin.
            </p>
            <button type="button" className="primary-button" style={{ width: '100%' }} onClick={handleSaveReport}>
              Ekspertiz Notlarına Kaydet
            </button>
            {saveMessage && (
              <p className="market-disclaimer" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                {saveMessage}
              </p>
            )}
            <div className="checklist-footer-actions">
              <button type="button" className="favorite-button" onClick={handleReset}>
                Listeyi Sıfırla
              </button>
              <button
                type="button"
                className="favorite-button"
                onClick={() => navigate('/ekspertiz-notlari')}
              >
                Notlara Git
              </button>
            </div>
          </section>
        )}
      </PageContainer>
    </>
  )
}

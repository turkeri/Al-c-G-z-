import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import Icon from '../components/icons/Icon'
import { getProgress, clearSession, vehicleLabel } from '../services/inspectionSessionService'

const STEP_ICONS = {
  arac: 'car',
  checklist: 'clipboard',
  micron: 'ruler',
  paint: 'paint',
  damage: 'crash',
  questions: 'chat',
  notes: 'note'
}

/**
 * Yerinde kontrol akışı.
 *
 * Araç başındayken yapılacak her şey tek bir sırada toplanır: kontrol listesi,
 * mikron raporu, boya karşılaştırması, hasar kaydı, satıcı soruları ve notlar.
 * Adımlar aynı araca bağlıdır ve tamamlananlar burada işaretli görünür, böylece
 * kullanıcı menüler arasında kaybolmaz.
 */
export default function InspectionHubPage() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(() => getProgress())

  const nextStep = useMemo(() => progress.steps.find((step) => !step.done), [progress])

  function handleReset() {
    clearSession()
    setProgress(getProgress())
  }

  return (
    <>
      <Header
        title="Yerinde Kontrol"
        subtitle="Aracın başındayken adım adım ilerle, hiçbir şeyi atlama."
      />
      <PageContainer>
        <section className="result-card">
          <div className="market-row">
            <h3 style={{ margin: 0 }}>
              {progress.vehicle ? vehicleLabel(progress.vehicle) : 'Kontrol edilecek araç'}
            </h3>
            <span className="market-label tone-normal">
              {progress.doneCount}/{progress.totalCount}
            </span>
          </div>
          <div className="progress-track">
            <span style={{ width: progress.percent + '%' }} />
          </div>
          {nextStep ? (
            <p className="market-disclaimer">
              Sıradaki adım: <strong>{nextStep.label}</strong>
            </p>
          ) : (
            <p className="market-disclaimer" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
              Tüm adımlar tamamlandı. Bulguları Garajım bölümünden görebilirsin.
            </p>
          )}
        </section>

        <div className="step-list">
          {progress.steps.map((step, index) => (
            <Link
              to={step.path}
              key={step.id}
              className={'step-item' + (step.done ? ' is-done' : '')}
            >
              <span className="step-index">{step.done ? '✓' : index + 1}</span>
              <span className="step-icon">
                <Icon name={STEP_ICONS[step.id]} size={20} strokeWidth={1.8} />
              </span>
              <span className="step-body">
                <span className="step-label">{step.label}</span>
                <span className="step-summary">
                  {step.summary || 'Henüz doldurulmadı'}
                </span>
              </span>
              <span className="step-arrow">&#8250;</span>
            </Link>
          ))}
        </div>

        {nextStep && (
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate(nextStep.path)}
          >
            {progress.doneCount === 0 ? 'Kontrole Başla' : 'Sıradaki Adıma Geç'}
          </button>
        )}

        <button type="button" className="favorite-button" onClick={handleReset}>
          Yeni Araç İçin Sıfırla
        </button>

        <p className="market-disclaimer">
          Bulgular yalnızca bu cihazda saklanır. Başka bir araca geçerken sıfırla, aksi halde
          iki aracın bulguları karışır.
        </p>
      </PageContainer>
    </>
  )
}

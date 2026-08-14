import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import VehiclePicker from '../components/VehiclePicker'
import EmptyState from '../components/EmptyState'
import RiskBadge from '../components/RiskBadge'
import { buildSellerQuestions } from '../services/sellerQuestionsService'
import { getSession, updateSession } from '../services/inspectionSessionService'

/**
 * Satıcıya sorulacaklar.
 *
 * Sorular veritabanındaki kronik arıza kayıtlarından üretilir: seçilen motorun
 * bilinen zayıf noktası neyse, soru da onun üzerine kurulur. Kullanıcı
 * cevapları işaretleyerek telefonda veya araç başında liste üzerinden ilerler.
 */
export default function SellerQuestionsPage() {
  const location = useLocation()
  const session = useMemo(() => getSession(), [])

  const [vehicle, setVehicle] = useState(
    location.state?.formData ||
      session.vehicle || { brand: '', model: '', engine: '', year: '', km: '' }
  )
  const [asked, setAsked] = useState({})

  const result = useMemo(() => buildSellerQuestions(vehicle), [vehicle])

  function toggle(id) {
    setAsked((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      if (!next[id]) delete next[id]
      updateSession({ questions: { askedCount: Object.keys(next).length } })
      return next
    })
  }

  const askedCount = Object.keys(asked).length

  return (
    <>
      <Header
        title="Satıcıya Sorulacaklar"
        subtitle="Seçtiğin motorun zayıf noktalarına göre üretilmiş soru listesi."
        showBack
      />
      <PageContainer>
        <section className="result-card">
          <h3>Araç</h3>
          <VehiclePicker value={vehicle} onChange={setVehicle} />
        </section>

        {!result && (
          <EmptyState
            icon="chat"
            title="Soru listesi için araç seç"
            description="Marka ve model seçtiğinde o araca özel sorular burada oluşacak."
          />
        )}

        {result && (
          <>
            <section className="result-card">
              <div className="market-row">
                <h3 style={{ margin: 0 }}>{result.vehicleLabel}</h3>
                <span className="market-label tone-normal">
                  {askedCount}/{result.questions.length}
                </span>
              </div>
              <p className="market-disclaimer" style={{ marginTop: 6 }}>
                Sorduğun soruyu işaretle. Satıcının cevabını not almayı unutma; ekspertiz
                sonucuyla çeliştiğinde bu, en güçlü pazarlık kozun olur.
              </p>
            </section>

            <div className="question-list">
              {result.questions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={'question-item' + (asked[item.id] ? ' is-done' : '')}
                  onClick={() => toggle(item.id)}
                >
                  <span className="question-head">
                    <span className="question-category">{item.category}</span>
                    {item.risk && <RiskBadge risk={item.risk} />}
                  </span>
                  <span className="question-text">{item.question}</span>
                  <span className="question-why">{item.why}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </PageContainer>
    </>
  )
}

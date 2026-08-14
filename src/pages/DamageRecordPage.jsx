import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import { formatPrice } from '../utils/formatters'
import { evaluateDamage, PART_GROUPS, RECORD_TYPES } from '../services/damageService'
import { updateSession, getSession } from '../services/inspectionSessionService'

/**
 * Hasar kaydı (tramer) ve değer kaybı ekranı.
 *
 * Kullanıcı ilandaki tramer tutarını ve ekspertizde çıkan boyalı/değişen
 * parçaları girer; karşılığında pazarlıkta kullanabileceği bir tutar ve
 * gerekçe listesi alır.
 */
export default function DamageRecordPage() {
  const location = useLocation()
  const session = useMemo(() => getSession(), [])

  const initialPrice =
    location.state?.price || session.vehicle?.price || ''

  const [price, setPrice] = useState(String(initialPrice || ''))
  const [tramerAmount, setTramerAmount] = useState('')
  const [recordType, setRecordType] = useState('yok')
  const [parts, setParts] = useState(
    location.state?.parts || session.micron?.suggestedParts || {}
  )
  const [saved, setSaved] = useState(false)

  const result = useMemo(
    () => evaluateDamage({ price, tramerAmount, recordType, parts }),
    [price, tramerAmount, recordType, parts]
  )

  function changeCount(groupId, delta) {
    setParts((prev) => {
      const next = { ...prev }
      const value = Math.max(0, (Number(next[groupId]) || 0) + delta)
      if (value === 0) delete next[groupId]
      else next[groupId] = value
      return next
    })
    setSaved(false)
  }

  function handleSave() {
    if (!result) return
    updateSession({
      damage: {
        lossPercent: result.lossPercent,
        lossAmount: result.lossAmount,
        comparablePrice: result.comparablePrice,
        tramerAmount: result.tramerAmount,
        recordType: result.recordType.id,
        parts
      }
    })
    setSaved(true)
  }

  return (
    <>
      <Header
        title="Hasar Kaydı ve Değer Kaybı"
        subtitle="Tramer tutarını ve boyalı/değişen parçaları gir, pazarlık payını gör."
        showBack
      />
      <PageContainer>
        <section className="result-card">
          <h3>Araç ve Kayıt Bilgileri</h3>
          <div className="form-row">
            <label>
              İlan Fiyatı (TL)
              <input
                type="number"
                inputMode="numeric"
                placeholder="Örn. 1420000"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value)
                  setSaved(false)
                }}
              />
            </label>
            <label>
              Tramer Tutarı (TL)
              <input
                type="number"
                inputMode="numeric"
                placeholder="Örn. 45000"
                value={tramerAmount}
                onChange={(e) => {
                  setTramerAmount(e.target.value)
                  setSaved(false)
                }}
              />
            </label>
          </div>

          <div className="field-block" style={{ marginTop: 14 }}>
            <span className="field-block-title">Ruhsat / kayıt durumu</span>
            <div className="chip-select">
              {RECORD_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={'chip' + (type.id === recordType ? ' chip-active' : '')}
                  onClick={() => {
                    setRecordType(type.id)
                    setSaved(false)
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="result-card">
          <h3>Boyalı ve Değişen Parçalar</h3>
          <p className="market-disclaimer" style={{ marginTop: 0 }}>
            Ekspertiz raporundaki sonuçları buraya adet olarak gir. Mikron ekranını
            doldurduysan parçalar buraya otomatik taşınır.
          </p>
          <div className="counter-list">
            {PART_GROUPS.map((group) => (
              <div className="counter-row" key={group.id}>
                <div className="counter-label">
                  <span className="counter-title">{group.label}</span>
                  <span className="counter-hint">{group.hint}</span>
                </div>
                <div className="counter-controls">
                  <button type="button" onClick={() => changeCount(group.id, -1)} aria-label="Azalt">
                    −
                  </button>
                  <span className="counter-value">{parts[group.id] || 0}</span>
                  <button type="button" onClick={() => changeCount(group.id, 1)} aria-label="Artır">
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {!result && (
          <section className="result-card">
            <p className="result-empty">
              Değer kaybını hesaplamak için önce ilan fiyatını gir.
            </p>
          </section>
        )}

        {result && (
          <>
            <section className="result-card">
              <div className="market-row">
                <h3 style={{ margin: 0 }}>Sonuç</h3>
                <span className={'market-label tone-' + result.severity.tone}>
                  {result.severity.label}
                </span>
              </div>
              <div className="market-facts">
                <div>
                  <span>Tahmini değer kaybı</span>
                  <strong>%{result.lossPercent}</strong>
                </div>
                <div>
                  <span>Tutar karşılığı</span>
                  <strong>{formatPrice(result.lossAmount)}</strong>
                </div>
                <div>
                  <span>Hasarsız eşdeğeri</span>
                  <strong>{formatPrice(result.comparablePrice)}</strong>
                </div>
              </div>
              {result.tramerAmount > 0 && (
                <p className="market-disclaimer">
                  Kayıtlı hasar tutarı ilan fiyatının %{result.ratioPercent} kadarı.
                </p>
              )}
            </section>

            {result.breakdown.length > 0 && (
              <section className="result-card">
                <h3>Değer Kaybı Dağılımı</h3>
                <div className="breakdown-list">
                  {result.breakdown.map((item) => (
                    <div className="breakdown-row" key={item.id}>
                      <span className="breakdown-label">
                        {item.label} <span className="breakdown-count">x{item.count}</span>
                      </span>
                      <span className="breakdown-value">%{item.lossPercent}</span>
                    </div>
                  ))}
                </div>
                <p className="market-disclaimer">
                  Aynı gruptaki ikinci ve sonraki parçaların etkisi azalarak eklenir; piyasada
                  değerleme böyle yapılır. Oranlar {result.baseline} teamülüne göredir ve
                  bilirkişi raporu yerine geçmez.
                </p>
              </section>
            )}

            {result.negotiationPoints.length > 0 && (
              <section className="result-card">
                <h3>Pazarlıkta Kullan</h3>
                <ul className="reason-list">
                  {result.negotiationPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
            )}

            {result.redFlags.length > 0 && (
              <section className="result-card">
                <h3>Dikkat Edilecekler</h3>
                <ul className="reason-list reason-list-danger">
                  {result.redFlags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              </section>
            )}

            <button type="button" className="primary-button" onClick={handleSave}>
              {saved ? 'Kontrol Raporuna Kaydedildi' : 'Kontrol Raporuma Kaydet'}
            </button>
          </>
        )}
      </PageContainer>
    </>
  )
}

import { useMemo, useState } from 'react'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import RiskBadge from '../components/RiskBadge'
import Icon from '../components/icons/Icon'
import {
  getBrands,
  getModelsByBrand,
  getEngineNames,
  getEngineData,
  getVehicleEntry
} from '../services/vehicleService'
import { compareTwoVehicles } from '../services/vehicleCompareService'
import { formatKm, formatPrice } from '../utils/formatters'
import AiPanel from '../components/AiPanel'
import { fetchComparison, isAiConfigured } from '../services/aiService'

const EMPTY_SIDE = {
  brand: '',
  model: '',
  engine: '',
  year: '',
  km: '',
  price: '',
  fuelType: '',
  transmission: ''
}

function VehicleSelector({ label, badge, side, onChange }) {
  const brands = useMemo(() => getBrands(), [])
  const models = useMemo(() => (side.brand ? getModelsByBrand(side.brand) : []), [side.brand])
  const engines = useMemo(
    () => (side.brand && side.model ? getEngineNames(side.brand, side.model) : []),
    [side.brand, side.model]
  )
  const entry = useMemo(
    () => (side.brand && side.model ? getVehicleEntry(side.brand, side.model) : null),
    [side.brand, side.model]
  )

  function update(field, value) {
    const next = { ...side, [field]: value }
    if (field === 'brand') {
      Object.assign(next, { model: '', engine: '', fuelType: '', transmission: '', year: '', km: '', price: '' })
    }
    if (field === 'model') {
      Object.assign(next, { engine: '', fuelType: '', transmission: '', year: '', km: '', price: '' })
    }
    if (field === 'engine') {
      const engineData = getEngineData(next.brand, next.model, value)
      const vehicleEntry = getVehicleEntry(next.brand, next.model)
      if (engineData) {
        next.fuelType = engineData.fuelType
        next.transmission = engineData.transmission
      }
      if (vehicleEntry) {
        next.year = String(vehicleEntry.referenceYear)
        next.km = String(vehicleEntry.referenceKm)
        next.price = String(vehicleEntry.referencePrice)
      }
    }
    onChange(next)
  }

  const isComplete = side.brand && side.model && side.engine

  return (
    <section className={'selector-card' + (isComplete ? ' complete' : '')}>
      <div className="selector-head">
        <span className="selector-badge">{badge}</span>
        <h3>{isComplete ? `${side.brand} ${side.model}` : label}</h3>
        {isComplete && <Icon name="car" size={20} className="selector-check" />}
      </div>

      <div className="selector-fields">
        <label className="field">
          <span className="field-label">Marka</span>
          <select value={side.brand} onChange={(e) => update('brand', e.target.value)}>
            <option value="">Seçiniz</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Model</span>
          <select value={side.model} onChange={(e) => update('model', e.target.value)} disabled={!side.brand}>
            <option value="">{side.brand ? 'Seçiniz' : 'Önce marka'}</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-full">
          <span className="field-label">Motor</span>
          <select value={side.engine} onChange={(e) => update('engine', e.target.value)} disabled={!engines.length}>
            <option value="">{engines.length ? 'Seçiniz' : 'Önce marka ve model'}</option>
            {engines.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isComplete && (
        <>
          <div className="selector-divider">
            <span>Değerleri düzenleyebilirsin</span>
          </div>
          <div className="selector-fields">
            <label className="field">
              <span className="field-label">Model Yılı</span>
              <input
                type="number"
                inputMode="numeric"
                value={side.year}
                onChange={(e) => onChange({ ...side, year: e.target.value })}
              />
            </label>
            <label className="field">
              <span className="field-label">Kilometre</span>
              <input
                type="number"
                inputMode="numeric"
                value={side.km}
                onChange={(e) => onChange({ ...side, km: e.target.value })}
              />
            </label>
            <label className="field field-full">
              <span className="field-label">İlan Fiyatı (TL)</span>
              <input
                type="number"
                inputMode="numeric"
                value={side.price}
                onChange={(e) => onChange({ ...side, price: e.target.value })}
              />
            </label>
          </div>
          {entry?.features && (
            <p className="selector-hint">
              {entry.features.bodyType} &middot; {entry.features.segment} segment &middot; {entry.features.driveType}
            </p>
          )}
        </>
      )}
    </section>
  )
}

function SpecRow({ label, a, b, betterSide }) {
  return (
    <div className="spec-row">
      <div className={'spec-value' + (betterSide === 'a' ? ' better' : '')}>{a}</div>
      <div className="spec-label">{label}</div>
      <div className={'spec-value' + (betterSide === 'b' ? ' better' : '')}>{b}</div>
    </div>
  )
}

function FeatureList({ title, items }) {
  if (!items?.length) return null
  return (
    <div className="feature-block">
      <p className="expertise-category-title">{title}</p>
      <ul className="feature-list">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  )
}

export default function VehicleComparePage() {
  const [sideA, setSideA] = useState(EMPTY_SIDE)
  const [sideB, setSideB] = useState(EMPTY_SIDE)
  const [comparison, setComparison] = useState(null)
  const [ai, setAi] = useState({ status: 'idle', data: null, message: '' })

  const canCompare =
    sideA.brand && sideA.model && sideA.engine && sideB.brand && sideB.model && sideB.engine

  const entryA = useMemo(
    () => (sideA.brand && sideA.model ? getVehicleEntry(sideA.brand, sideA.model) : null),
    [sideA.brand, sideA.model]
  )
  const entryB = useMemo(
    () => (sideB.brand && sideB.model ? getVehicleEntry(sideB.brand, sideB.model) : null),
    [sideB.brand, sideB.model]
  )

  function handleCompare() {
    if (!canCompare) return
    setComparison(compareTwoVehicles(sideA, sideB))
    setAi({ status: 'idle', data: null, message: '' })
  }

  function sideForAi(side, entry, result) {
    return {
      brand: side.brand,
      model: side.model,
      year: side.year,
      engine: side.engine,
      fuelType: side.fuelType,
      transmission: side.transmission,
      km: side.km,
      price: side.price,
      score: result.score,
      marketLabel: result === comparison?.resultA ? comparison?.marketA?.label : comparison?.marketB?.label,
      avgFuelConsumption: result.engineData?.avgFuelConsumption,
      bodyType: entry?.features?.bodyType,
      segment: entry?.features?.segment,
      knownProblems: result.knownProblems
    }
  }

  async function handleAskAi() {
    if (!comparison) return
    setAi({ status: 'loading', data: null, message: '' })
    const response = await fetchComparison({
      first: sideForAi(sideA, entryA, comparison.resultA),
      second: sideForAi(sideB, entryB, comparison.resultB)
    })
    if (!response) setAi({ status: 'idle', data: null, message: '' })
    else if (response.error) setAi({ status: 'error', data: null, message: response.error })
    else setAi({ status: 'ready', data: response.result, message: '' })
  }

  const labelA = `${sideA.brand} ${sideA.model}`
  const labelB = `${sideB.brand} ${sideB.model}`

  function betterNumeric(a, b, lowerIsBetter = false) {
    const na = Number(a)
    const nb = Number(b)
    if (!na || !nb || na === nb) return null
    const aWins = lowerIsBetter ? na < nb : na > nb
    return aWins ? 'a' : 'b'
  }

  return (
    <>
      <Header
        title="Araç Karşılaştır"
        subtitle="İki aracı fiyat, donanım ve risk yönünden yan yana kıyasla."
        showBack
      />
      <PageContainer>
        <VehicleSelector label="Birinci aracı seç" badge="1. ARAÇ" side={sideA} onChange={setSideA} />
        <VehicleSelector label="İkinci aracı seç" badge="2. ARAÇ" side={sideB} onChange={setSideB} />

        <button
          type="button"
          className="primary-button compare-button"
          disabled={!canCompare}
          onClick={handleCompare}
        >
          {canCompare ? 'Karşılaştır' : 'Her iki araç için marka, model ve motor seç'}
        </button>

        {comparison && (
          <>
            <section className="result-card">
              <h3>Kıyaslama Özeti</h3>
              <ul className="result-list neutral">
                {comparison.summary.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>

            {isAiConfigured() && (
              <AiPanel
                title="Hangisini Almalıyım?"
                buttonLabel="Tercih Önerisi Al"
                hint="İki aracın fiyatı, güvenilirliği, masrafı ve kronik sorunları birlikte değerlendirilip hangisinin kime uygun olduğu yorumlanır."
                status={ai.status}
                message={ai.message}
                onRequest={handleAskAi}
              >
                {ai.data && (
                  <>
                    {ai.data.winner && (
                      <div className="ai-winner">
                        <span className="ai-winner-label">Öne çıkan</span>
                        <strong>{ai.data.winner}</strong>
                      </div>
                    )}

                    <p className="ai-summary">{ai.data.recommendation}</p>

                    {ai.data.reasoning.length > 0 && (
                      <div className="ai-block">
                        <p className="expertise-category-title">Gerekçeler</p>
                        <ul className="result-list neutral" style={{ fontSize: '0.84rem' }}>
                          {ai.data.reasoning.map((r) => <li key={r}>{r}</li>)}
                        </ul>
                      </div>
                    )}

                    {(ai.data.firstSuitableFor || ai.data.secondSuitableFor) && (
                      <div className="ai-block">
                        <p className="expertise-category-title">Kime hangisi uygun?</p>
                        {ai.data.firstSuitableFor && (
                          <p className="ai-text"><strong>{labelA}:</strong> {ai.data.firstSuitableFor}</p>
                        )}
                        {ai.data.secondSuitableFor && (
                          <p className="ai-text"><strong>{labelB}:</strong> {ai.data.secondSuitableFor}</p>
                        )}
                      </div>
                    )}

                    {ai.data.watchOut.length > 0 && (
                      <div className="ai-block">
                        <p className="expertise-category-title">Hangisini alırsan al, dikkat et</p>
                        <ul className="result-list negative" style={{ fontSize: '0.84rem' }}>
                          {ai.data.watchOut.map((w) => <li key={w}>{w}</li>)}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </AiPanel>
            )}

            <section className="result-card">
              <div className="spec-header">
                <div className="spec-header-side">
                  <div className={'compare-score tone-' + comparison.resultA.band.tone}>
                    {comparison.resultA.score}
                  </div>
                  <span>{labelA}</span>
                  <small>{sideA.engine}</small>
                </div>
                <div className="spec-header-vs">VS</div>
                <div className="spec-header-side">
                  <div className={'compare-score tone-' + comparison.resultB.band.tone}>
                    {comparison.resultB.score}
                  </div>
                  <span>{labelB}</span>
                  <small>{sideB.engine}</small>
                </div>
              </div>

              <div className="spec-table">
                <SpecRow
                  label="Risk Skoru"
                  a={`${comparison.resultA.score}/100`}
                  b={`${comparison.resultB.score}/100`}
                  betterSide={betterNumeric(comparison.resultA.score, comparison.resultB.score)}
                />
                <SpecRow
                  label="Değerlendirme"
                  a={comparison.resultA.band.label}
                  b={comparison.resultB.band.label}
                />
                <SpecRow
                  label="Model Yılı"
                  a={sideA.year}
                  b={sideB.year}
                  betterSide={betterNumeric(sideA.year, sideB.year)}
                />
                <SpecRow
                  label="Kilometre"
                  a={formatKm(sideA.km)}
                  b={formatKm(sideB.km)}
                  betterSide={betterNumeric(sideA.km, sideB.km, true)}
                />
                <SpecRow
                  label="İlan Fiyatı"
                  a={formatPrice(sideA.price)}
                  b={formatPrice(sideB.price)}
                  betterSide={betterNumeric(sideA.price, sideB.price, true)}
                />
                {comparison.marketA && comparison.marketB && (
                  <SpecRow
                    label="Piyasaya Göre"
                    a={comparison.marketA.label}
                    b={comparison.marketB.label}
                    betterSide={betterNumeric(comparison.marketA.diffPercent, comparison.marketB.diffPercent, true)}
                  />
                )}
                <SpecRow
                  label="Ort. Yakıt (L/100km)"
                  a={comparison.resultA.engineData?.avgFuelConsumption ?? '-'}
                  b={comparison.resultB.engineData?.avgFuelConsumption ?? '-'}
                  betterSide={betterNumeric(
                    comparison.resultA.engineData?.avgFuelConsumption,
                    comparison.resultB.engineData?.avgFuelConsumption,
                    true
                  )}
                />
                <SpecRow
                  label="Yakıt / Şanzıman"
                  a={`${sideA.fuelType} · ${sideA.transmission}`}
                  b={`${sideB.fuelType} · ${sideB.transmission}`}
                />
                <SpecRow
                  label="Kronik Sorun Sayısı"
                  a={comparison.resultA.knownProblems.length}
                  b={comparison.resultB.knownProblems.length}
                  betterSide={betterNumeric(
                    comparison.resultA.knownProblems.length,
                    comparison.resultB.knownProblems.length,
                    true
                  )}
                />
                {entryA?.features && entryB?.features && (
                  <>
                    <SpecRow label="Kasa Tipi" a={entryA.features.bodyType} b={entryB.features.bodyType} />
                    <SpecRow label="Segment" a={entryA.features.segment} b={entryB.features.segment} />
                    <SpecRow label="Çekiş" a={entryA.features.driveType} b={entryB.features.driveType} />
                    <SpecRow
                      label="Bagaj (L)"
                      a={entryA.features.luggageLiters}
                      b={entryB.features.luggageLiters}
                      betterSide={betterNumeric(entryA.features.luggageLiters, entryB.features.luggageLiters)}
                    />
                  </>
                )}
              </div>
              <p className="market-disclaimer">
                Yeşil vurgulanan değer, o satırda daha avantajlı olan aracı gösterir. Donanım bilgileri
                segment ortalamasıdır; pakete ve model yılına göre değişir.
              </p>
            </section>

            <div className="compare-columns">
              {[
                { label: labelA, entry: entryA, result: comparison.resultA },
                { label: labelB, entry: entryB, result: comparison.resultB }
              ].map((col) => (
                <section className="result-card compare-column" key={col.label}>
                  <h3>{col.label}</h3>
                  {col.entry?.features && (
                    <>
                      <FeatureList title="Güvenlik" items={col.entry.features.typicalSafety} />
                      <FeatureList title="Konfor" items={col.entry.features.typicalComfort} />
                      <FeatureList title="Teknoloji" items={col.entry.features.typicalTech} />
                    </>
                  )}
                  {col.result.advantages.length > 0 && (
                    <div className="feature-block">
                      <p className="expertise-category-title">Avantajlar</p>
                      <ul className="result-list positive" style={{ fontSize: '0.8rem' }}>
                        {col.result.advantages.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {col.result.knownProblems.length > 0 && (
                    <div className="feature-block">
                      <p className="expertise-category-title">Kronik Sorunlar</p>
                      {col.result.knownProblems.map((p) => (
                        <div className="compare-problem" key={p.title}>
                          <RiskBadge risk={p.risk} />
                          <span>{p.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </>
        )}
      </PageContainer>
    </>
  )
}

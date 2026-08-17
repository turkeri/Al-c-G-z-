import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import RiskBadge from '../components/RiskBadge'
import Icon from '../components/icons/Icon'
import { getEngineData, getVehicleEntry } from '../services/catalogAdapter'
import { useVehiclePickerChain } from '../hooks/useVehiclePickerChain'
import { compareTwoVehicles } from '../services/vehicleCompareService'
import { describePackageWithCatalog } from '../services/catalogService'
import { assessChronicRiskWithCatalog } from '../services/chronicProblemService'
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
  transmission: '',
  variantId: ''
}

function VehicleSelector({ label, badge, side, onChange }) {
  const { brands, models, engines, variantId, loading: catalogLoading, error: catalogError, retry: retryCatalog } =
    useVehiclePickerChain(side.brand, side.model, side.engine, side.year, { resolveVariant: true })
  const entry = useMemo(
    () => (side.brand && side.model ? getVehicleEntry(side.brand, side.model) : null),
    [side.brand, side.model]
  )

  // Zincirin çözdüğü variantId, karşılaştırma canonical paket/kronik risk
  // kıyaslamasını besleyebilsin diye side state'ine yazılır (VehiclePicker'ın
  // aynı deseni — bkz. src/components/VehiclePicker.jsx).
  useEffect(() => {
    if (variantId !== (side.variantId || '')) onChange({ ...side, variantId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId])

  function update(field, value) {
    const next = { ...side, [field]: value }
    if (field === 'brand') {
      Object.assign(next, {
        model: '', engine: '', fuelType: '', transmission: '', year: '', km: '', price: '', variantId: ''
      })
    }
    if (field === 'model') {
      Object.assign(next, { engine: '', fuelType: '', transmission: '', year: '', km: '', price: '', variantId: '' })
    }
    if (field === 'engine') {
      next.variantId = ''
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

      {catalogLoading && <p className="field-hint">Liste güncelleniyor…</p>}
      {!catalogLoading && catalogError && (
        <p className="field-hint field-hint-warning">
          Liste güncellenemedi, kayıtlı listeyle devam ediliyor.{' '}
          <button type="button" className="link-button" onClick={retryCatalog}>
            Tekrar dene
          </button>
        </p>
      )}
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
  const [canonicalCompare, setCanonicalCompare] = useState({ a: null, b: null })

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

  /*
   * Canonical donanım/kronik-risk kıyaslaması: her iki tarafın seçici
   * zincirinden (VehicleSelector içindeki useVehiclePickerChain) çözülmüş
   * `variantId`si varsa denenir. Legacy `compareTwoVehicles` sonucu ASLA
   * değiştirilmez — bu ek, ayrı bir bölüm olarak eklenir; taraflardan biri
   * ya da ikisi de çözülmezse/canonical veri boş veya hatalıysa o taraf
   * (ya da bölümün tamamı) hiç görünmez.
   */
  async function resolveCanonicalSide(side) {
    if (!side.variantId) return null
    const [pkg, chronic] = await Promise.all([
      describePackageWithCatalog(side).catch(() => null),
      assessChronicRiskWithCatalog(side, { variantId: side.variantId }).catch(() => null)
    ])
    return {
      package: pkg?.source === 'canonical' ? pkg : null,
      chronic: chronic?.source === 'canonical' ? chronic : null
    }
  }

  async function handleCompare() {
    if (!canCompare) return
    setComparison(compareTwoVehicles(sideA, sideB))
    setAi({ status: 'idle', data: null, message: '' })
    setCanonicalCompare({ a: null, b: null })
    const [a, b] = await Promise.all([resolveCanonicalSide(sideA), resolveCanonicalSide(sideB)])
    setCanonicalCompare({ a, b })
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
                {canonicalCompare.a?.chronic && canonicalCompare.b?.chronic && (
                  <SpecRow
                    label="Yayınlanmış Katalog Risk Kalemi"
                    a={canonicalCompare.a.chronic.items.length}
                    b={canonicalCompare.b.chronic.items.length}
                    betterSide={betterNumeric(
                      canonicalCompare.a.chronic.items.length,
                      canonicalCompare.b.chronic.items.length,
                      true
                    )}
                  />
                )}
              </div>
              <p className="market-disclaimer">
                Yeşil vurgulanan değer, o satırda daha avantajlı olan aracı gösterir. Donanım bilgileri
                segment ortalamasıdır; pakete ve model yılına göre değişir.
              </p>
            </section>

            <div className="compare-columns">
              {[
                { side: 'a', label: labelA, entry: entryA, result: comparison.resultA, canonical: canonicalCompare.a },
                { side: 'b', label: labelB, entry: entryB, result: comparison.resultB, canonical: canonicalCompare.b }
              ].map((col) => (
                <section className="result-card compare-column" key={col.side}>
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
                  {/* Canonical (yayınlanmış katalog) bölümleri: yalnız bu
                      tarafın seçici zinciri bir variantId çözdüyse ve
                      canonical veri boş/hatalı değilse görünür — yukarıdaki
                      legacy "Kronik Sorunlar"/segment donanım listelerinin
                      YANINDA, onları değiştirmeden durur. */}
                  {col.canonical?.package?.includesDetail.length > 0 && (
                    <div className="feature-block">
                      <p className="expertise-category-title">Yayınlanmış Katalogdan Donanım</p>
                      <ul className="feature-list">
                        {col.canonical.package.includesDetail.flatMap((group) =>
                          group.items.map((item) => <li key={item.id}>{item.label}</li>)
                        )}
                      </ul>
                    </div>
                  )}
                  {col.canonical?.chronic?.items.length > 0 && (
                    <div className="feature-block">
                      <p className="expertise-category-title">Yayınlanmış Katalogdan Kronik Sorunlar</p>
                      {col.canonical.chronic.items.map((item) => (
                        <div className="compare-problem" key={item.title}>
                          <RiskBadge risk={item.risk} />
                          <span>{item.title}</span>
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

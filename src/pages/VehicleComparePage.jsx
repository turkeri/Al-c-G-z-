import { useMemo, useState } from 'react'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import RiskBadge from '../components/RiskBadge'
import {
  getBrands,
  getModelsByBrand,
  getEngineNames,
  getEngineData,
  getVehicleEntry
} from '../services/vehicleService'
import { compareTwoVehicles } from '../services/vehicleCompareService'
import { formatKm, formatPrice } from '../utils/formatters'

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

function VehicleSelector({ label, side, onChange }) {
  const brands = useMemo(() => getBrands(), [])
  const models = useMemo(() => (side.brand ? getModelsByBrand(side.brand) : []), [side.brand])
  const engines = useMemo(
    () => (side.brand && side.model ? getEngineNames(side.brand, side.model) : []),
    [side.brand, side.model]
  )

  function update(field, value) {
    const next = { ...side, [field]: value }
    if (field === 'brand') {
      next.model = ''
      next.engine = ''
      next.fuelType = ''
      next.transmission = ''
      next.year = ''
      next.km = ''
      next.price = ''
    }
    if (field === 'model') {
      next.engine = ''
      next.fuelType = ''
      next.transmission = ''
      next.year = ''
      next.km = ''
      next.price = ''
    }
    if (field === 'engine') {
      const engineData = getEngineData(next.brand, next.model, value)
      const entry = getVehicleEntry(next.brand, next.model)
      if (engineData) {
        next.fuelType = engineData.fuelType
        next.transmission = engineData.transmission
      }
      if (entry) {
        next.year = String(entry.referenceYear)
        next.km = String(entry.referenceKm)
        next.price = String(entry.referencePrice)
      }
    }
    onChange(next)
  }

  return (
    <div className="result-card">
      <h3>{label}</h3>
      <div className="form-row">
        <label>
          Marka
          <select value={side.brand} onChange={(e) => update('brand', e.target.value)}>
            <option value="">Seçiniz</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label>
          Model
          <select value={side.model} onChange={(e) => update('model', e.target.value)} disabled={!side.brand}>
            <option value="">Seçiniz</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Motor
        <select value={side.engine} onChange={(e) => update('engine', e.target.value)} disabled={!engines.length}>
          <option value="">{engines.length ? 'Seçiniz' : 'Önce marka/model seçin'}</option>
          {engines.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </label>
      {side.engine && (
        <div className="form-row">
          <label>
            Yıl
            <input type="number" value={side.year} onChange={(e) => onChange({ ...side, year: e.target.value })} />
          </label>
          <label>
            Kilometre
            <input type="number" value={side.km} onChange={(e) => onChange({ ...side, km: e.target.value })} />
          </label>
        </div>
      )}
      {side.engine && (
        <label>
          İlan Fiyatı (TL)
          <input type="number" value={side.price} onChange={(e) => onChange({ ...side, price: e.target.value })} />
        </label>
      )}
    </div>
  )
}

function ResultColumn({ label, result, market, formData }) {
  return (
    <div className="compare-card">
      <div className={'compare-score tone-' + result.band.tone}>{result.score}</div>
      <div className="compare-band">{result.band.label}</div>
      <h3>{label}</h3>
      <p className="compare-engine">{formData.engine}</p>
      <dl className="compare-facts">
        <div>
          <dt>Km / Fiyat</dt>
          <dd>
            {formatKm(formData.km)} &middot; {formatPrice(formData.price)}
          </dd>
        </div>
        {market && (
          <div>
            <dt>Piyasa</dt>
            <dd>
              <span className={'market-label tone-' + market.verdict}>{market.label}</span>
            </dd>
          </div>
        )}
        {result.engineData?.avgFuelConsumption && (
          <div>
            <dt>Ort. Yakıt</dt>
            <dd>{result.engineData.avgFuelConsumption} L/100km</dd>
          </div>
        )}
        <div>
          <dt>Kronik Sorun</dt>
          <dd>{result.knownProblems.length}</dd>
        </div>
      </dl>
      {result.advantages.length > 0 && (
        <div style={{ marginTop: 12, width: '100%', textAlign: 'left' }}>
          <p className="expertise-category-title">Avantajlar</p>
          <ul className="result-list positive" style={{ fontSize: '0.78rem' }}>
            {result.advantages.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}
      {result.knownProblems.length > 0 && (
        <div style={{ marginTop: 10, width: '100%', textAlign: 'left' }}>
          <p className="expertise-category-title">Kronik Sorunlar</p>
          {result.knownProblems.map((p) => (
            <div key={p.title} style={{ marginBottom: 6 }}>
              <RiskBadge risk={p.risk} /> <span style={{ fontSize: '0.78rem' }}>{p.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function VehicleComparePage() {
  const [sideA, setSideA] = useState(EMPTY_SIDE)
  const [sideB, setSideB] = useState(EMPTY_SIDE)
  const [comparison, setComparison] = useState(null)

  const canCompare =
    sideA.brand && sideA.model && sideA.engine && sideB.brand && sideB.model && sideB.engine

  function handleCompare() {
    if (!canCompare) return
    setComparison(compareTwoVehicles(sideA, sideB))
  }

  return (
    <>
      <Header
        title="Araç Karşılaştır"
        subtitle="İki farklı marka/modeli filtreleyip piyasa fiyatı ve artı/eksi yönlerini kıyasla."
        showBack
      />
      <PageContainer>
        <VehicleSelector label="1. Araç" side={sideA} onChange={setSideA} />
        <VehicleSelector label="2. Araç" side={sideB} onChange={setSideB} />

        <button
          type="button"
          className="primary-button"
          disabled={!canCompare}
          onClick={handleCompare}
          style={{ opacity: canCompare ? 1 : 0.5 }}
        >
          Karşılaştır
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

            <div className="compare-scroll">
              <div className="compare-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))' }}>
                <ResultColumn
                  label={`${sideA.brand} ${sideA.model}`}
                  result={comparison.resultA}
                  market={comparison.marketA}
                  formData={sideA}
                />
                <ResultColumn
                  label={`${sideB.brand} ${sideB.model}`}
                  result={comparison.resultB}
                  market={comparison.marketB}
                  formData={sideB}
                />
              </div>
            </div>
          </>
        )}
      </PageContainer>
    </>
  )
}

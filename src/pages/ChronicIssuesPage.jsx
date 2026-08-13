import { useMemo, useState } from 'react'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import RiskBadge from '../components/RiskBadge'
import EmptyState from '../components/EmptyState'
import { getBrands, getModelsByBrand, getVehicleEntry } from '../services/vehicleService'

export default function ChronicIssuesPage() {
  const brands = useMemo(() => getBrands(), [])
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')

  const models = useMemo(() => (brand ? getModelsByBrand(brand) : []), [brand])
  const entry = useMemo(() => (brand && model ? getVehicleEntry(brand, model) : null), [brand, model])

  return (
    <>
      <Header title="Kronik Sorunlar" subtitle="Marka ve model seçerek bilinen arızaları incele." showBack />
      <PageContainer>
        <div className="filter-row">
          <label>
            Marka
            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value)
                setModel('')
              }}
            >
              <option value="">Tümü</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label>
            Model
            <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!brand}>
              <option value="">Seçiniz</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!entry && (
          <EmptyState
            icon="search"
            title="Kronik sorunları görmek için marka ve model seçin"
            description="Seçtiğin motora göre bilinen arıza kayıtları burada listelenecek."
          />
        )}

        {entry &&
          entry.engines.map((engine) => (
            <section className="result-card" key={engine.name}>
              <h3>
                {entry.brand} {entry.model} &middot; {engine.name}
              </h3>
              <p className="result-summary-engine">
                {engine.fuelType} &middot; {engine.transmission} &middot; Güvenilirlik puanı {engine.reliabilityScore}/100
              </p>
              {engine.knownProblems.length ? (
                <div className="problem-list">
                  {engine.knownProblems.map((problem) => (
                    <div className="problem-item" key={problem.title}>
                      <div className="problem-item-head">
                        <span className="problem-item-title">{problem.title}</span>
                        <RiskBadge risk={problem.risk} />
                      </div>
                      <p>{problem.description}</p>
                      <span className="problem-item-km">Kontrol aralığı: {problem.checkKm} km</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="result-empty">Bu motor için kayıtlı kronik sorun bulunmuyor.</p>
              )}
            </section>
          ))}
      </PageContainer>
    </>
  )
}

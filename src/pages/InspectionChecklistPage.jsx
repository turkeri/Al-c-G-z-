import { useMemo, useState } from 'react'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import ChecklistItem from '../components/ChecklistItem'
import { GENERAL_INSPECTION_CATEGORIES } from '../utils/constants'
import { getBrands, getModelsByBrand, getEngineNames, getEngineData } from '../services/vehicleService'

export default function InspectionChecklistPage() {
  const brands = useMemo(() => getBrands(), [])
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [engineName, setEngineName] = useState('')

  const models = useMemo(() => (brand ? getModelsByBrand(brand) : []), [brand])
  const engines = useMemo(() => (brand && model ? getEngineNames(brand, model) : []), [brand, model])
  const engineData = useMemo(
    () => (brand && model && engineName ? getEngineData(brand, model, engineName) : null),
    [brand, model, engineName]
  )

  return (
    <>
      <Header title="Ekspertiz Kontrol Listesi" subtitle="Genel kontrol maddeleri ve araca özel kontrol noktaları." showBack />
      <PageContainer>
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
              <option value="">Seçiniz</option>
              {engines.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </label>
        </div>

        {GENERAL_INSPECTION_CATEGORIES.map((category) => (
          <section className="result-card" key={category.id}>
            <h3>{category.title}</h3>
            <div className="checklist-group">
              {category.items.map((item) => (
                <ChecklistItem key={item} label={item} />
              ))}
            </div>
          </section>
        ))}

        {engineData && (
          <section className="result-card">
            <h3>Araca Özel Kontrol Noktaları</h3>
            <p className="result-summary-engine">
              {brand} {model} &middot; {engineName}
            </p>
            <div className="checklist-group">
              {engineData.inspectionChecklist.map((item) => (
                <ChecklistItem key={item} label={item} />
              ))}
            </div>
          </section>
        )}
      </PageContainer>
    </>
  )
}

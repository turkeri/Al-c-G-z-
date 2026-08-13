import { useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import { formatKm, formatPrice, vehicleAge } from '../utils/formatters'
import { analyzeVehicle } from '../services/analysisService'

export default function ComparePage() {
  const location = useLocation()
  const items = location.state?.items || []

  const rows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        result: analyzeVehicle(item.formData)
      })),
    [items]
  )

  if (items.length < 2) {
    return <Navigate to="/favoriler" replace />
  }

  return (
    <>
      <Header title="Karşılaştırma" subtitle={`${rows.length} araç yan yana`} showBack />
      <PageContainer>
        <div className="compare-scroll">
          <div className="compare-grid" style={{ gridTemplateColumns: `repeat(${rows.length}, minmax(150px, 1fr))` }}>
            {rows.map((row) => (
              <div className="compare-card" key={row.id}>
                <div className={'compare-score tone-' + row.result.band.tone}>{row.result.score}</div>
                <div className="compare-band">{row.result.band.label}</div>
                <h3>
                  {row.formData.brand} {row.formData.model}
                </h3>
                <p className="compare-engine">{row.formData.engine || row.formData.fuelType}</p>

                <dl className="compare-facts">
                  <div>
                    <dt>Yıl</dt>
                    <dd>{row.formData.year} ({vehicleAge(row.formData.year)} yaş)</dd>
                  </div>
                  <div>
                    <dt>Kilometre</dt>
                    <dd>{formatKm(row.formData.km)}</dd>
                  </div>
                  <div>
                    <dt>Fiyat</dt>
                    <dd>{formatPrice(row.formData.price)}</dd>
                  </div>
                  <div>
                    <dt>Yakıt</dt>
                    <dd>{row.formData.fuelType || '-'}</dd>
                  </div>
                  <div>
                    <dt>Şanzıman</dt>
                    <dd>{row.formData.transmission || '-'}</dd>
                  </div>
                  <div>
                    <dt>Kronik sorun</dt>
                    <dd>{row.result.knownProblems.length}</dd>
                  </div>
                  <div>
                    <dt>Avantaj</dt>
                    <dd>{row.result.advantages.length}</dd>
                  </div>
                  <div>
                    <dt>Risk</dt>
                    <dd>{row.result.risks.length}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  )
}

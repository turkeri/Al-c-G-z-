import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import VehiclePicker from '../components/VehiclePicker'
import ChipSelect from '../components/ChipSelect'
import EmptyState from '../components/EmptyState'
import { formatPrice } from '../utils/formatters'
import {
  estimateOwnershipCost,
  DEFAULT_FUEL_PRICES,
  COST_BASELINE_LABEL
} from '../services/ownershipCostService'

const YEARLY_KM_OPTIONS = [
  { id: '8000', label: '8.000 km' },
  { id: '15000', label: '15.000 km' },
  { id: '25000', label: '25.000 km' },
  { id: '40000', label: '40.000 km' }
]

/**
 * "Bu araba bana yılda ne yakar?" ekranı.
 *
 * İlan fiyatı aracın maliyetinin sadece bir parçası. Burada yakıt, vergi,
 * sigorta, bakım ve bilinen arıza riski tek tabloda toplanır; iki aracı
 * fiyattan değil gerçek maliyetten kıyaslamayı mümkün kılar.
 */
export default function OwnershipCostPage() {
  const location = useLocation()
  const incoming = location.state?.formData

  const [vehicle, setVehicle] = useState(
    incoming || { brand: '', model: '', engine: '', year: '', km: '', price: '' }
  )
  const [yearlyKm, setYearlyKm] = useState('15000')
  const [includeKasko, setIncludeKasko] = useState(true)
  const [fuelPrice, setFuelPrice] = useState('')

  const result = useMemo(() => {
    if (!vehicle.brand || !vehicle.model) return null
    const overrides = {}
    if (fuelPrice) {
      Object.keys(DEFAULT_FUEL_PRICES).forEach((key) => {
        overrides[key] = Number(fuelPrice)
      })
    }
    return estimateOwnershipCost({
      formData: vehicle,
      yearlyKm: Number(yearlyKm),
      fuelPrices: fuelPrice ? overrides : undefined,
      includeKasko
    })
  }, [vehicle, yearlyKm, includeKasko, fuelPrice])

  return (
    <>
      <Header
        title="Sahip Olma Maliyeti"
        subtitle="Yakıt, vergi, sigorta, bakım ve arıza riski dahil yıllık gerçek maliyet."
        showBack
      />
      <PageContainer>
        <section className="result-card">
          <h3>Araç</h3>
          <VehiclePicker value={vehicle} onChange={setVehicle} />
          <div className="form-row form-row-single" style={{ marginTop: 12 }}>
            <label>
              Araç Değeri (TL)
              <input
                type="number"
                inputMode="numeric"
                placeholder="Kasko hesabı için"
                value={vehicle.price || ''}
                onChange={(e) => setVehicle({ ...vehicle, price: e.target.value })}
              />
            </label>
          </div>
        </section>

        <section className="result-card">
          <h3>Kullanım</h3>
          <div className="field-block">
            <span className="field-block-title">Yılda kaç kilometre yapıyorsun?</span>
            <ChipSelect
              ariaLabel="Yıllık kilometre"
              options={YEARLY_KM_OPTIONS}
              value={yearlyKm}
              onChange={setYearlyKm}
            />
          </div>

          <div className="form-row" style={{ marginTop: 14 }}>
            <label>
              Yakıt Fiyatı (TL)
              <input
                type="number"
                inputMode="decimal"
                placeholder={'Varsayılan: ' + (result?.fuelUnitPrice ?? 55)}
                value={fuelPrice}
                onChange={(e) => setFuelPrice(e.target.value)}
              />
              <span className="field-hint">
                Güncel pompa fiyatını yazarsan hesap o an geçerli olur.
              </span>
            </label>
            <label className="switch-field">
              Kasko dahil
              <button
                type="button"
                className={'chip' + (includeKasko ? ' chip-active' : '')}
                onClick={() => setIncludeKasko((prev) => !prev)}
              >
                {includeKasko ? 'Dahil' : 'Hariç'}
              </button>
            </label>
          </div>
        </section>

        {!result && (
          <EmptyState
            icon="wallet"
            title="Maliyeti görmek için araç seç"
            description="Marka ve model seçtiğinde yıllık maliyet dökümü burada oluşacak."
          />
        )}

        {result && (
          <>
            <section className="result-card cost-total-card">
              <span className="cost-total-label">Yıllık tahmini maliyet</span>
              <span className="cost-total-value">{formatPrice(result.total)}</span>
              <div className="cost-total-meta">
                <span>Aylık {formatPrice(result.monthly)}</span>
                <span>Kilometre başı {result.perKm.toLocaleString('tr-TR')} TL</span>
              </div>
            </section>

            <section className="result-card">
              <h3>Döküm</h3>
              <div className="breakdown-list">
                {result.lines.map((line) => {
                  const share = Math.round((line.amount / result.total) * 100)
                  return (
                    <div className="cost-row" key={line.id}>
                      <div className="cost-row-head">
                        <span className="breakdown-label">{line.label}</span>
                        <span className="breakdown-value">{formatPrice(line.amount)}</span>
                      </div>
                      <div className="cost-bar">
                        <span style={{ width: share + '%' }} />
                      </div>
                      <span className="counter-hint">{line.detail}</span>
                    </div>
                  )
                })}
              </div>
            </section>

            {result.lines.find((l) => l.id === 'risk')?.items?.length > 0 && (
              <section className="result-card">
                <h3>Risk Payı Neyden Geliyor?</h3>
                <p className="market-disclaimer" style={{ marginTop: 0 }}>
                  Bu motorun bilinen kronik arızalarının, çıkma olasılığıyla çarpılmış yıllık
                  karşılığı. Kesin bir gider değil, beklenen değerdir.
                </p>
                <div className="breakdown-list">
                  {result.lines
                    .find((l) => l.id === 'risk')
                    .items.map((item) => (
                      <div className="breakdown-row" key={item.title}>
                        <span className="breakdown-label">
                          {item.title}
                          <span className="breakdown-count">%{item.probabilityPercent} olasılık</span>
                        </span>
                        <span className="breakdown-value">{formatPrice(item.expected)}</span>
                      </div>
                    ))}
                </div>
              </section>
            )}

            <p className="market-disclaimer">
              Vergi, sigorta ve bakım tutarları {COST_BASELINE_LABEL} dönemine ait yaklaşık
              değerlerdir. MTV için kesin tutar Gelir İdaresi tarifesinden, kasko için gerçek
              teklif sigorta şirketinden alınmalıdır.
            </p>
          </>
        )}
      </PageContainer>
    </>
  )
}

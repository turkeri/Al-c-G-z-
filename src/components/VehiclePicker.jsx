import { useMemo } from 'react'
import ChipSelect from './ChipSelect'
import {
  getBrands,
  getModelsByBrand,
  getEngineNames,
  getVehicleEntry
} from '../services/vehicleService'
import { KM_BANDS, bandForKm, yearOptions } from '../utils/vehicleOptions'

/**
 * Marka / model / motor / yıl / kilometre seçimini tek yerde toplayan bileşen.
 * Birden fazla ekran aynı seçimi istediği için tekrar yazılmaz.
 */
export default function VehiclePicker({ value, onChange, showKm = true, showYear = true }) {
  const brands = useMemo(() => getBrands(), [])
  const models = useMemo(() => (value.brand ? getModelsByBrand(value.brand) : []), [value.brand])
  const engines = useMemo(
    () => (value.brand && value.model ? getEngineNames(value.brand, value.model) : []),
    [value.brand, value.model]
  )
  const entry = useMemo(
    () => (value.brand && value.model ? getVehicleEntry(value.brand, value.model) : null),
    [value.brand, value.model]
  )
  const years = useMemo(() => yearOptions(entry?.yearRange), [entry])
  const selectedBand = useMemo(() => bandForKm(value.km), [value.km])

  function update(patch) {
    onChange({ ...value, ...patch })
  }

  return (
    <div className="vehicle-picker">
      <div className="form-row">
        <label>
          Marka
          <select
            value={value.brand || ''}
            onChange={(e) => update({ brand: e.target.value, model: '', engine: '' })}
          >
            <option value="">Seçiniz</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>

        <label>
          Model
          <select
            value={value.model || ''}
            onChange={(e) => update({ model: e.target.value, engine: '' })}
            disabled={!value.brand}
          >
            <option value="">Seçiniz</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Motor
          <select
            value={value.engine || ''}
            onChange={(e) => update({ engine: e.target.value })}
            disabled={!engines.length}
          >
            <option value="">{engines.length ? 'Seçiniz' : 'Önce model seçin'}</option>
            {engines.map((engine) => (
              <option key={engine} value={engine}>
                {engine}
              </option>
            ))}
          </select>
        </label>

        {showYear && (
          <label>
            Model Yılı
            <select value={value.year || ''} onChange={(e) => update({ year: e.target.value })}>
              <option value="">Seçiniz</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {showKm && (
        <div className="field-block">
          <span className="field-block-title">Kilometre</span>
          <ChipSelect
            ariaLabel="Kilometre aralığı"
            options={KM_BANDS.map((band) => ({ id: band.id, label: band.label }))}
            value={selectedBand?.id || ''}
            onChange={(id) => {
              const band = KM_BANDS.find((b) => b.id === id)
              if (band) update({ km: String(band.value) })
            }}
          />
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import ChipSelect from './ChipSelect'
import { useVehiclePickerChain } from '../hooks/useVehiclePickerChain'
import { KM_BANDS, bandForKm, yearOptions } from '../utils/vehicleOptions'

/**
 * Marka / model / motor / yıl / kilometre seçimini tek yerde toplayan bileşen.
 * Birden fazla ekran aynı seçimi istediği için tekrar yazılmaz.
 *
 * Canonical-first: tüm zincir `useVehiclePickerChain`'den (`resolveVariant:
 * true` ile) gelir — yayınlanmış katalog önce, yoksa/hata olursa legacy veri
 * kümesi. Marka/model canonical ise nesil listesi de çekilir; nesil
 * bulunursa yıl aralığı o neslin GERÇEK üretim yıllarından hesaplanır
 * (legacy referans kaydının genel aralığı yerine). Motor de canonical ise,
 * aynı neslin araç varyantları içinde eşleşen bir kayıt varsa
 * `value.variantId` set edilir — bu, değerleme/kronik sorun/paket gibi
 * servislerin canonical veriye bağlanmasını sağlar; eşleşme yoksa
 * `variantId` boş kalır ve akış legacy metin tabanlı yoldan devam eder.
 */
export default function VehiclePicker({ value, onChange, showKm = true, showYear = true }) {
  // Listede olmayan araçlar için serbest giriş; analiz formundaki mantığın aynısı.
  const [manual, setManual] = useState(false)

  const {
    brands,
    models,
    engines,
    yearRange,
    generations,
    variantId,
    loading: chainLoading,
    error: chainError,
    retry: retryChain
  } = useVehiclePickerChain(value.brand, value.model, value.engine, value.year, {
    generationId: value.generationId,
    resolveVariant: true
  })

  // Zincirin çözdüğü variantId parent state'ine yazılır; üst seçim değişip
  // eşleşme kaybolursa aynı yoldan temizlenir. `value` dışarıdan kontrol
  // edildiği için doğrudan mutasyon yerine yalnız fark varsa onChange çağrılır.
  useEffect(() => {
    if (variantId !== (value.variantId || '')) onChange({ ...value, variantId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId])

  const years = useMemo(() => yearOptions(yearRange), [yearRange])
  const selectedBand = useMemo(() => bandForKm(value.km), [value.km])

  function update(patch) {
    onChange({ ...value, ...patch })
  }

  return (
    <div className="vehicle-picker">
      <div className="mode-switch">
        <span className="field-hint" style={{ flex: 1 }}>
          {manual ? 'Elle giriş açık.' : 'Aracın listede yok mu?'}
        </span>
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setManual((prev) => !prev)
            onChange({ ...value, brand: '', model: '', engine: '', generationId: '', variantId: '' })
          }}
        >
          {manual ? 'Listeden seç' : 'Elle yaz'}
        </button>
      </div>

      {!manual && chainLoading && <p className="field-hint">Katalog listesi güncelleniyor…</p>}
      {!manual && !chainLoading && chainError && (
        <p className="field-hint field-hint-warning">
          Liste güncellenemedi, kayıtlı listeyle devam ediliyor.{' '}
          <button type="button" className="link-button" onClick={retryChain}>
            Tekrar dene
          </button>
        </p>
      )}

      <div className="form-row">
        <label>
          Marka
          {manual ? (
            <input
              type="text"
              placeholder="Örn. Volvo"
              value={value.brand || ''}
              onChange={(e) => update({ brand: e.target.value })}
            />
          ) : (
            <select
              value={value.brand || ''}
              onChange={(e) =>
                update({ brand: e.target.value, model: '', generationId: '', engine: '', variantId: '' })
              }
            >
              <option value="">Seçiniz</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          )}
        </label>

        <label>
          Model
          {manual ? (
            <input
              type="text"
              placeholder="Örn. XC90"
              value={value.model || ''}
              onChange={(e) => update({ model: e.target.value })}
            />
          ) : (
            <select
              value={value.model || ''}
              onChange={(e) => update({ model: e.target.value, generationId: '', engine: '', variantId: '' })}
              disabled={!value.brand}
            >
              <option value="">Seçiniz</option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          )}
        </label>
      </div>

      {!manual && generations.length > 1 && (
        <div className="field-block">
          <label>
            Nesil
            <select
              value={value.generationId || ''}
              onChange={(e) => update({ generationId: e.target.value, engine: '', variantId: '' })}
            >
              <option value="">Seçiniz</option>
              {generations.map((generation) => (
                <option key={generation.id} value={generation.id}>
                  {generation.displayName} ({generation.yearStart}–{generation.yearEnd || '…'})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="form-row">
        <label>
          Motor <span className="field-optional">opsiyonel</span>
          {manual || (value.brand && value.model && engines.length === 0) ? (
            <input
              type="text"
              placeholder="Örn. 2.0 D5"
              value={value.engine || ''}
              onChange={(e) => update({ engine: e.target.value, variantId: '' })}
            />
          ) : (
            <select
              value={value.engine || ''}
              onChange={(e) => update({ engine: e.target.value, variantId: '' })}
              disabled={!engines.length}
            >
              <option value="">{engines.length ? 'Seçiniz' : 'Önce model seçin'}</option>
              {engines.map((engine) => (
                <option key={engine} value={engine}>
                  {engine}
                </option>
              ))}
            </select>
          )}
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

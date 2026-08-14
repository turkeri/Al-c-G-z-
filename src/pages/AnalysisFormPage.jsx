import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import ChipSelect from '../components/ChipSelect'
import { FUEL_TYPES } from '../utils/constants'
import {
  getBrands,
  getModelsByBrand,
  getEngineNames,
  getEngineData,
  getVehicleEntry
} from '../services/vehicleService'
import { analyzeVehicle } from '../services/analysisService'
import { parseListingText } from '../services/listingParserService'
import { setSessionVehicle } from '../services/inspectionSessionService'
import {
  CURRENT_YEAR,
  KM_BANDS,
  bandForKm,
  yearOptions,
  isYearOutsideRange,
  usageNote
} from '../utils/vehicleOptions'

const EMPTY_FORM = {
  brand: '',
  model: '',
  year: '',
  engine: '',
  fuelType: '',
  transmission: '',
  km: '',
  price: ''
}

export default function AnalysisFormPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [listingText, setListingText] = useState('')
  const [autoFillCount, setAutoFillCount] = useState(null)
  const [exactKm, setExactKm] = useState(false)
  /**
   * Serbest giriş.
   *
   * Veritabanı Türkiye pazarının tamamını kapsamıyor; listede olmayan bir araç
   * (örneğin Volvo XC90) girmek isteyen kullanıcı listeye mahkûm edilmemeli.
   * Bu modda marka/model/motor elle yazılır, analiz yaş ve kilometre üzerinden
   * yapılır ve eksik olan motor bilgisi sonuç ekranında açıkça belirtilir.
   */
  const [manualEntry, setManualEntry] = useState(false)

  const brands = useMemo(() => getBrands(), [])
  const models = useMemo(() => (form.brand ? getModelsByBrand(form.brand) : []), [form.brand])
  const engines = useMemo(
    () => (form.brand && form.model ? getEngineNames(form.brand, form.model) : []),
    [form.brand, form.model]
  )

  const entry = useMemo(
    () => (form.brand && form.model ? getVehicleEntry(form.brand, form.model) : null),
    [form.brand, form.model]
  )
  const years = useMemo(() => yearOptions(entry?.yearRange), [entry])
  const selectedKmBand = useMemo(() => bandForKm(form.km), [form.km])
  const usage = useMemo(() => usageNote(form.year, form.km), [form.year, form.km])
  const yearWarning = isYearOutsideRange(form.year, entry?.yearRange)

  function updateField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'brand') {
        next.model = ''
        next.engine = ''
        next.fuelType = ''
        next.transmission = ''
      }
      if (field === 'model') {
        next.engine = ''
        next.fuelType = ''
        next.transmission = ''
      }
      if (field === 'engine') {
        const engineData = getEngineData(next.brand, next.model, value)
        if (engineData) {
          next.fuelType = engineData.fuelType
          next.transmission = engineData.transmission
        }
      }
      return next
    })
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function handleAutoFill() {
    const parsed = parseListingText(listingText)
    const foundKeys = Object.keys(parsed)
    if (foundKeys.length === 0) {
      setAutoFillCount(0)
      return
    }
    setForm((prev) => ({ ...prev, ...parsed }))
    setErrors((prev) => {
      const next = { ...prev }
      foundKeys.forEach((key) => delete next[key])
      return next
    })
    setAutoFillCount(foundKeys.length)
  }

  /**
   * Yalnızca aracı tanımlayan iki alan zorunludur.
   *
   * Diğer her alan boş bırakılabilir: kullanıcı ilanda yazmayan bir bilgiyi
   * uydurmak zorunda kalmamalı. Eksik alanların karara etkisi sonuç ekranında
   * ayrıca uyarı olarak gösterilir.
   */
  function validate() {
    const nextErrors = {}
    if (!form.brand.trim()) nextErrors.brand = manualEntry ? 'Marka yazınız.' : 'Marka seçiniz.'
    if (!form.model.trim()) nextErrors.model = manualEntry ? 'Model yazınız.' : 'Model seçiniz.'
    if (form.year && (form.year < 1990 || form.year > CURRENT_YEAR + 1)) {
      nextErrors.year = `Model yılı 1990-${CURRENT_YEAR + 1} arasında olmalı.`
    }
    if (form.km !== '' && Number(form.km) < 0) nextErrors.km = 'Kilometre negatif olamaz.'
    if (form.price !== '' && Number(form.price) < 0) nextErrors.price = 'Fiyat negatif olamaz.'
    setErrors(nextErrors)
    return nextErrors
  }

  function toggleManual() {
    setManualEntry((prev) => {
      // Mod değişince marka/model/motor sıfırlanır: liste değeriyle elle
      // yazılan değer birbirine karışmasın.
      setForm((f) => ({ ...f, brand: '', model: '', engine: '' }))
      setErrors({})
      return !prev
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    const firstInvalidField = Object.keys(nextErrors)[0]
    if (firstInvalidField) {
      const el = document.querySelector(`[name="${firstInvalidField}"]`)
      el?.focus({ preventScroll: false })
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // Yerinde kontrol akışı bu araç üzerinden ilerleyecek.
    setSessionVehicle(form)

    const result = analyzeVehicle(form)
    navigate('/sonuc', { state: { formData: form, result } })
  }

  return (
    <>
      <Header
        title="Araç Analiz Formu"
        subtitle="Marka ve model yeterli. Ne kadar çok bilgi girersen sonuç o kadar isabetli olur."
        showBack
      />
      <PageContainer>
        <section className="result-card">
          <h3>İlan Metninden Otomatik Doldur</h3>
          <p className="market-disclaimer" style={{ marginTop: 0 }}>
            Sahibinden veya başka bir sitedeki ilan metnini buraya yapıştır; marka, model, yıl, km, fiyat gibi
            bilgileri saptayabildiğimiz kadarıyla otomatik dolduralım.
          </p>
          <textarea
            className="listing-textarea"
            rows={4}
            placeholder="Örn. Audi A3 2017 model 1.6 TDI dizel S tronic şanzıman 142.000 km 1.420.000 TL..."
            value={listingText}
            onChange={(e) => setListingText(e.target.value)}
          />
          <button type="button" className="favorite-button" onClick={handleAutoFill}>
            Otomatik Doldur
          </button>
          {autoFillCount !== null && (
            <p className="market-disclaimer">
              {autoFillCount > 0
                ? `${autoFillCount} alan otomatik dolduruldu, aşağıdan kontrol et.`
                : 'Metinden bilgi çıkarılamadı, formu elle doldurabilirsin.'}
            </p>
          )}
        </section>

        <form className="analysis-form" onSubmit={handleSubmit} noValidate>
          <div className="mode-switch">
            <span className="field-hint" style={{ flex: 1 }}>
              {manualEntry
                ? 'Elle giriş açık: aracını listeye bakmadan yazabilirsin.'
                : 'Aracın listede yok mu? Elle yazabilirsin.'}
            </span>
            <button type="button" className="link-button" onClick={toggleManual}>
              {manualEntry ? 'Listeden seç' : 'Elle yaz'}
            </button>
          </div>

          <div className="form-row">
            <label>
              Marka
              {manualEntry ? (
                <input
                  name="brand"
                  className={errors.brand ? 'invalid' : ''}
                  type="text"
                  placeholder="Örn. Volvo"
                  value={form.brand}
                  onChange={(e) => updateField('brand', e.target.value)}
                />
              ) : (
                <select
                  name="brand"
                  className={errors.brand ? 'invalid' : ''}
                  value={form.brand}
                  onChange={(e) => updateField('brand', e.target.value)}
                >
                  <option value="">Seçiniz</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              )}
              {errors.brand && <span className="field-error">{errors.brand}</span>}
            </label>

            <label>
              Model
              {manualEntry ? (
                <input
                  name="model"
                  className={errors.model ? 'invalid' : ''}
                  type="text"
                  placeholder="Örn. XC90"
                  value={form.model}
                  onChange={(e) => updateField('model', e.target.value)}
                />
              ) : (
                <select
                  name="model"
                  className={errors.model ? 'invalid' : ''}
                  value={form.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  disabled={!form.brand}
                >
                  <option value="">Seçiniz</option>
                  {models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              )}
              {errors.model && <span className="field-error">{errors.model}</span>}
            </label>
          </div>

          <div className="form-row">
            <label>
              Model Yılı <span className="field-optional">opsiyonel</span>
              <select
                name="year"
                className={errors.year ? 'invalid' : ''}
                value={form.year}
                onChange={(e) => updateField('year', e.target.value)}
              >
                <option value="">Seçiniz</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.year && <span className="field-error">{errors.year}</span>}
              {!errors.year && yearWarning && (
                <span className="field-hint field-hint-warning">
                  Bu model {entry.yearRange} arasında üretildi. Seçtiğin yılı ilan üzerinden doğrula.
                </span>
              )}
            </label>

            <label>
              Motor <span className="field-optional">opsiyonel</span>
              {manualEntry || (form.brand && form.model && engines.length === 0) ? (
                <input
                  type="text"
                  placeholder="Örn. 2.0 D5"
                  value={form.engine}
                  onChange={(e) => updateField('engine', e.target.value)}
                />
              ) : (
                <select
                  value={form.engine}
                  onChange={(e) => updateField('engine', e.target.value)}
                  disabled={!engines.length}
                >
                  <option value="">{engines.length ? 'Seçiniz' : 'Önce marka/model seçin'}</option>
                  {engines.map((engine) => (
                    <option key={engine} value={engine}>
                      {engine}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>

          <div className="form-row">
            <label>
              Yakıt Tipi <span className="field-optional">opsiyonel</span>
              <select
                name="fuelType"
                className={errors.fuelType ? 'invalid' : ''}
                value={form.fuelType}
                onChange={(e) => updateField('fuelType', e.target.value)}
              >
                <option value="">Seçiniz</option>
                {FUEL_TYPES.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </select>
              {errors.fuelType && <span className="field-error">{errors.fuelType}</span>}
            </label>

            <label>
              Şanzıman <span className="field-optional">opsiyonel</span>
              <input
                name="transmission"
                className={errors.transmission ? 'invalid' : ''}
                type="text"
                placeholder="Örn. S tronic, Manuel, Otomatik"
                value={form.transmission}
                onChange={(e) => updateField('transmission', e.target.value)}
              />
              {errors.transmission && <span className="field-error">{errors.transmission}</span>}
            </label>
          </div>

          <div className="field-block">
            <div className="field-block-head">
              <span className="field-block-title">Kilometre <span className="field-optional">opsiyonel</span></span>
              <button
                type="button"
                className="link-button"
                onClick={() => setExactKm((prev) => !prev)}
              >
                {exactKm ? 'Bant seç' : 'Tam km gir'}
              </button>
            </div>

            {exactKm ? (
              <input
                name="km"
                className={errors.km ? 'invalid' : ''}
                type="number"
                inputMode="numeric"
                placeholder="Örn. 142000"
                value={form.km}
                onChange={(e) => updateField('km', e.target.value)}
              />
            ) : (
              <ChipSelect
                ariaLabel="Kilometre aralığı"
                options={KM_BANDS.map((band) => ({ id: band.id, label: band.label }))}
                value={selectedKmBand?.id || ''}
                onChange={(id) => {
                  const band = KM_BANDS.find((b) => b.id === id)
                  if (band) updateField('km', String(band.value))
                }}
              />
            )}
            {errors.km && <span className="field-error">{errors.km}</span>}
            {!exactKm && selectedKmBand && (
              <span className="field-hint">
                Hesaplarda bandın orta değeri ({selectedKmBand.value.toLocaleString('tr-TR')} km)
                kullanılır. Kesin kilometreyi biliyorsan &quot;Tam km gir&quot; ile yazabilirsin.
              </span>
            )}
          </div>

          {usage && (
            <div className={'usage-note usage-note-' + usage.tone}>
              <span className="usage-note-title">{usage.title}</span>
              <p>{usage.text}</p>
            </div>
          )}

          <div className="form-row form-row-single">
            <label>
              İlan Fiyatı (TL) <span className="field-optional">opsiyonel</span>
              <input
                name="price"
                className={errors.price ? 'invalid' : ''}
                type="number"
                inputMode="numeric"
                placeholder="Örn. 1420000"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
              />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </label>
          </div>

          <button type="submit" className="primary-button">
            Analiz Et
          </button>
        </form>
      </PageContainer>
    </>
  )
}

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import PageContainer from '../components/Layout/PageContainer'
import { FUEL_TYPES } from '../utils/constants'
import {
  getBrands,
  getModelsByBrand,
  getEngineNames,
  getEngineData
} from '../services/vehicleService'
import { analyzeVehicle } from '../services/analysisService'
import { parseListingText } from '../services/listingParserService'

const CURRENT_YEAR = new Date().getFullYear()

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

  const brands = useMemo(() => getBrands(), [])
  const models = useMemo(() => (form.brand ? getModelsByBrand(form.brand) : []), [form.brand])
  const engines = useMemo(
    () => (form.brand && form.model ? getEngineNames(form.brand, form.model) : []),
    [form.brand, form.model]
  )

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

  function validate() {
    const nextErrors = {}
    if (!form.brand) nextErrors.brand = 'Marka seçiniz.'
    if (!form.model) nextErrors.model = 'Model seçiniz.'
    if (!form.year || form.year < 1990 || form.year > CURRENT_YEAR + 1) {
      nextErrors.year = `Geçerli bir model yılı giriniz (1990-${CURRENT_YEAR + 1}).`
    }
    if (!form.fuelType) nextErrors.fuelType = 'Yakıt tipi seçiniz.'
    if (!form.transmission.trim()) nextErrors.transmission = 'Şanzıman bilgisi giriniz.'
    if (form.km === '' || Number(form.km) < 0) nextErrors.km = 'Geçerli bir kilometre giriniz.'
    if (form.price === '' || Number(form.price) < 0) nextErrors.price = 'Geçerli bir fiyat giriniz.'
    setErrors(nextErrors)
    return nextErrors
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

    const result = analyzeVehicle(form)
    navigate('/sonuc', { state: { formData: form, result } })
  }

  return (
    <>
      <Header title="Araç Analiz Formu" subtitle="Bilgileri eksiksiz doldur, en doğru sonucu al." showBack />
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
          <div className="form-row">
            <label>
              Marka
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
              {errors.brand && <span className="field-error">{errors.brand}</span>}
            </label>

            <label>
              Model
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
              {errors.model && <span className="field-error">{errors.model}</span>}
            </label>
          </div>

          <div className="form-row">
            <label>
              Model Yılı
              <input
                name="year"
                className={errors.year ? 'invalid' : ''}
                type="number"
                inputMode="numeric"
                placeholder="Örn. 2017"
                value={form.year}
                onChange={(e) => updateField('year', e.target.value)}
              />
              {errors.year && <span className="field-error">{errors.year}</span>}
            </label>

            <label>
              Motor
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
            </label>
          </div>

          <div className="form-row">
            <label>
              Yakıt Tipi
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
              Şanzıman
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

          <div className="form-row">
            <label>
              Kilometre
              <input
                name="km"
                className={errors.km ? 'invalid' : ''}
                type="number"
                inputMode="numeric"
                placeholder="Örn. 142000"
                value={form.km}
                onChange={(e) => updateField('km', e.target.value)}
              />
              {errors.km && <span className="field-error">{errors.km}</span>}
            </label>

            <label>
              İlan Fiyatı (TL)
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

import { useEffect, useMemo, useState } from 'react'
import ChipSelect from './ChipSelect'
import {
  getBrands,
  getModelsByBrand,
  getEngineNames,
  getVehicleEntry
} from '../services/catalogAdapter'
import { KM_BANDS, bandForKm, yearOptions } from '../utils/vehicleOptions'
import { getPublishedBrands, getPublishedEngines, getPublishedGenerations, getPublishedModels } from '../services/publicCatalogService'

/**
 * Marka / model / motor / yıl / kilometre seçimini tek yerde toplayan bileşen.
 * Birden fazla ekran aynı seçimi istediği için tekrar yazılmaz.
 */
export default function VehiclePicker({ value, onChange, showKm = true, showYear = true }) {
  // Listede olmayan araçlar için serbest giriş; analiz formundaki mantığın aynısı.
  const [manual, setManual] = useState(false)
  const [remote,setRemote]=useState({brands:null,models:null,generations:null,engines:null})
  useEffect(()=>{let active=true;getPublishedBrands().then(items=>active&&items&&setRemote(r=>({...r,brands:items})));return()=>{active=false}},[])
  const remoteBrand=remote.brands?.find(item=>item.display_name===value.brand)
  useEffect(()=>{let active=true;if(!remoteBrand){setRemote(r=>({...r,models:null,generations:null,engines:null}));return()=>{active=false}}getPublishedModels(remoteBrand.id).then(items=>active&&setRemote(r=>({...r,models:items,generations:null,engines:null})));return()=>{active=false}},[remoteBrand?.id])
  const remoteModel=remote.models?.find(item=>item.display_name===value.model)
  useEffect(()=>{let active=true;if(!remoteModel)return;getPublishedGenerations(remoteModel.id).then(items=>active&&setRemote(r=>({...r,generations:items})));return()=>{active=false}},[remoteModel?.id])
  const remoteGeneration=remote.generations?.find(item=>item.id===value.generationId)||remote.generations?.[0]
  useEffect(()=>{let active=true;if(!remoteGeneration)return;getPublishedEngines(remoteGeneration.id).then(items=>active&&setRemote(r=>({...r,engines:items})));return()=>{active=false}},[remoteGeneration?.id])
  const brands = useMemo(() => remote.brands?.map(item=>item.display_name)||getBrands(), [remote.brands])
  const models = useMemo(() => remote.models?.map(item=>item.display_name)||(value.brand ? getModelsByBrand(value.brand) : []), [remote.models,value.brand])
  const engines = useMemo(
    () => remote.engines?.map(item=>item.display_name)||(value.brand && value.model ? getEngineNames(value.brand, value.model) : []),
    [remote.engines,value.brand, value.model]
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
      <div className="mode-switch">
        <span className="field-hint" style={{ flex: 1 }}>
          {manual ? 'Elle giriş açık.' : 'Aracın listede yok mu?'}
        </span>
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setManual((prev) => !prev)
            onChange({ ...value, brand: '', model: '', engine: '' })
          }}
        >
          {manual ? 'Listeden seç' : 'Elle yaz'}
        </button>
      </div>

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
              onChange={(e) => update({ brand: e.target.value, model: '', generationId: '', engine: '' })}
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
              onChange={(e) => update({ model: e.target.value, generationId: '', engine: '' })}
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

      {!manual && remote.generations?.length > 0 && (
        <div className="field-block"><label>Nesil<select value={value.generationId || remoteGeneration?.id || ''} onChange={(e)=>update({generationId:e.target.value,engine:''})}>{remote.generations.map((generation)=><option key={generation.id} value={generation.id}>{generation.display_name} ({generation.year_start}–{generation.year_end || '…'})</option>)}</select></label></div>
      )}

      <div className="form-row">
        <label>
          Motor <span className="field-optional">opsiyonel</span>
          {manual || (value.brand && value.model && engines.length === 0) ? (
            <input
              type="text"
              placeholder="Örn. 2.0 D5"
              value={value.engine || ''}
              onChange={(e) => update({ engine: e.target.value })}
            />
          ) : (
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

import { useCatalogList } from './useCatalogList'
import { listBrands, listEnginesForModel, listModels, yearRangeForModel } from '../services/catalogAdapter'

/**
 * Marka → model → motor seçim zincirini canonical-first + legacy-fallback
 * olarak sağlayan ortak kanca.
 *
 * Aynı desen (AnalysisForm, ChronicIssues, Diagnosis, Inspection, Compare,
 * VehiclePicker) altı ayrı yerde tekrar ediyordu — hepsi `getBrands()`/
 * `getModelsByBrand()`/`getEngineNames()`'i doğrudan çağırıyordu. Bu kanca
 * onların yerini alır: aynı arayüzü (isim dizileri) korur, ama artık
 * `catalogAdapter` üzerinden önce yayınlanmış katalog denenir, yoksa/hata
 * olursa legacy veri kümesine sessizce düşülür.
 *
 * `brandRows`/`modelRows`/`engineRows`, canonical id'ye ihtiyaç duyan
 * çağıranlar (VehiclePicker'ın varyant eşleştirmesi gibi) için ham
 * kayıtları da taşır.
 */
export function useVehiclePickerChain(brand, model) {
  const brandsList = useCatalogList(() => listBrands(), [])
  const brandRows = brandsList.data || []
  const brandObj = brandRows.find((b) => b.displayName === brand) || null

  const modelsList = useCatalogList(() => listModels(brandObj || brand), [brandObj?.id, brand], Boolean(brand))
  const modelRows = modelsList.data || []

  const enginesList = useCatalogList(
    () => listEnginesForModel(brand, model),
    [brand, model],
    Boolean(brand && model)
  )
  const engineRows = enginesList.data || []

  const yearRangeList = useCatalogList(
    () => yearRangeForModel(brand, model),
    [brand, model],
    Boolean(brand && model)
  )

  return {
    brands: brandRows.map((b) => b.displayName),
    brandRows,
    models: modelRows.map((m) => m.displayName),
    modelRows,
    engines: engineRows.map((e) => e.displayName),
    engineRows,
    yearRange: yearRangeList.data || null,
    loading: brandsList.loading || modelsList.loading || enginesList.loading || yearRangeList.loading,
    error: brandsList.error || modelsList.error || enginesList.error || yearRangeList.error || null,
    retry() {
      brandsList.retry()
      modelsList.retry()
      enginesList.retry()
      yearRangeList.retry()
    }
  }
}

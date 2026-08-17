import { useCatalogList } from './useCatalogList'
import {
  listBrands,
  listEnginesForModel,
  listGenerations,
  listModels,
  listVehicleVariants,
  yearRangeForModel
} from '../services/catalogAdapter'

const isLegacyId = (id) => !id || String(id).startsWith('legacy:')

function yearInRange(year, generation) {
  const y = Number(year)
  if (!y || !Number.isFinite(generation.yearStart)) return false
  const end = Number.isFinite(generation.yearEnd) ? generation.yearEnd : new Date().getFullYear()
  return y >= generation.yearStart && y <= end
}

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
 * çağıranlar için ham kayıtları da taşır.
 *
 * ============================================================================
 * NESİL VE VARYANT ÇÖZÜMLEMESİ (opsiyonel — `options.resolveVariant`)
 * ============================================================================
 * Yalnız `options.resolveVariant: true` veren çağıranlar (VehiclePicker,
 * AnalysisForm) nesil/varyant isteği atar; brand/model isim listesi yeten
 * sayfalar (ChronicIssues, Diagnosis, Inspection, Compare) bu ek isteklerden
 * muaftır.
 *
 * Marka/model canonical ise nesil listesi çekilir; `options.generationId`
 * yoksa nesil ya tek başına kalıyorsa ya da `year` o neslin aralığına
 * düşüyorsa otomatik seçilir (belirsizse HİÇBİRİ seçilmez — yanlış nesle
 * bağlanmaktansa boş bırakmak tercih edilir). Motor canonical ve bir nesil
 * seçiliyse, o neslin araç varyantları arasında `engine_id` eşleşen kayıt
 * aranır ve `variantId` döner.
 *
 * `variantId`, `valuateWithCatalog`/`assessChronicRiskWithCatalog`/
 * `describePackageWithCatalog`'un canonical yola girebilmesi için gereken
 * kimliktir — bu üç servis yalnızca bu değer varsa canonical'i dener.
 */
export function useVehiclePickerChain(brand, model, engine, year, options = {}) {
  const { generationId: generationIdOverride, resolveVariant = false } = options

  const brandsList = useCatalogList(() => listBrands(), [])
  const brandRows = brandsList.data || []
  const brandObj = brandRows.find((b) => b.displayName === brand) || null

  const modelsList = useCatalogList(() => listModels(brandObj || brand), [brandObj?.id, brand], Boolean(brand))
  const modelRows = modelsList.data || []
  const modelObj = modelRows.find((m) => m.displayName === model) || null
  const modelIsCanonical = Boolean(modelObj && !isLegacyId(modelObj.id))

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

  const wantsGenerations = resolveVariant && modelIsCanonical
  const generationsList = useCatalogList(
    () => (wantsGenerations ? listGenerations(modelObj) : Promise.resolve([])),
    [modelObj?.id, wantsGenerations],
    wantsGenerations
  )
  const generations = generationsList.data || []
  const selectedGeneration = resolveVariant
    ? generations.find((g) => g.id === generationIdOverride) ||
      (generations.length === 1
        ? generations[0]
        : year
          ? generations.find((g) => yearInRange(year, g)) || null
          : null)
    : null

  const engineObj = engineRows.find((e) => e.displayName === engine) || null
  const engineIsCanonical = Boolean(resolveVariant && engineObj && !isLegacyId(engineObj.id) && selectedGeneration)

  const variantsList = useCatalogList(
    () => (engineIsCanonical ? listVehicleVariants(selectedGeneration) : Promise.resolve([])),
    [selectedGeneration?.id, engineObj?.id],
    engineIsCanonical
  )
  const variant = engineIsCanonical
    ? (variantsList.data || []).find((v) => v.engine_id === engineObj.id) || null
    : null

  return {
    brands: brandRows.map((b) => b.displayName),
    brandRows,
    models: modelRows.map((m) => m.displayName),
    modelRows,
    engines: engineRows.map((e) => e.displayName),
    engineRows,
    yearRange: yearRangeList.data || null,
    generations,
    generationId: selectedGeneration?.id || '',
    variantId: variant?.id || '',
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

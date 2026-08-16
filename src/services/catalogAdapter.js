import*as legacy from'./vehicleService';import{getPublicCatalogMeta,getPublishedBrands,getPublishedEngines,getPublishedGenerations,getPublishedModels,getPublishedPackages,getPublishedTransmissions,getPublishedVariant,getPublishedVariants,getPublicMaintenance,getPublicProblems,searchPublishedCatalog}from'./publicCatalogService';
export const getBrands=legacy.getBrands,getModelsByBrand=legacy.getModelsByBrand,getEngineNames=legacy.getEngineNames,getVehicleEntry=legacy.getVehicleEntry,getEngineData=legacy.getEngineData,getAllVehicles=legacy.getAllVehicles,getEnrichedProblems=legacy.getEnrichedProblems,findMatchingEngine=legacy.findMatchingEngine,getDatabaseStats=legacy.getDatabaseStats;
const norm=(item,parentId=null,source='canonical')=>({id:item.id,label:item.display_name||item.title||item.id,displayName:item.display_name||item.title||item.id,parentId,yearStart:item.year_start??null,yearEnd:item.year_end??null,confidence:item.source_confidence||item.confidence||null,evidence:item.evidence_status||null,source,...item});
export async function getCatalogMeta(){const meta=await getPublicCatalogMeta();return meta.available?{...meta,source:'canonical',fallbackReason:null}:{available:false,source:'legacy',revision:null,fallbackReason:'published-unavailable'}}
export async function listBrands(){const rows=await getPublishedBrands();return rows?rows.map(x=>norm(x)):legacy.getBrands().map(label=>({id:`legacy:brand:${label}`,label,displayName:label,source:'legacy'}))}
export async function listModels(brand){const rows=brand?.id&&!brand.id.startsWith('legacy:')?await getPublishedModels(brand.id):null;return rows?rows.map(x=>norm(x,brand.id)):legacy.getModelsByBrand(brand.label||brand).map(label=>({id:`legacy:model:${brand.label||brand}:${label}`,label,displayName:label,parentId:brand.id||null,source:'legacy'}))}
export const listGenerations=async model=>(await getPublishedGenerations(model.id))?.map(x=>norm(x,model.id))||[];export const listEngines=async generation=>(await getPublishedEngines(generation.id))?.map(x=>norm(x,generation.id))||[];export const listTransmissions=async generation=>(await getPublishedTransmissions(generation.id))?.map(x=>norm(x,generation.id))||[];export const listPackages=async generation=>(await getPublishedPackages(generation.id))?.map(x=>norm(x,generation.id))||[];export const listVehicleVariants=async generation=>(await getPublishedVariants(generation.id))?.map(x=>norm(x,generation.id))||[];export const listProblems=async scope=>(await getPublicProblems(scope))?.map(x=>norm(x,null,'canonical'))||null;export const listMaintenance=async scope=>(await getPublicMaintenance(scope))?.map(x=>norm(x,null,'canonical'))||null;export const searchCatalog=async q=>(await searchPublishedCatalog(q))?.map(x=>norm(x))||null;export const getVehicleVariant=async id=>{const row=await getPublishedVariant(id);return row?norm(row):null};export function normalizeSelection(value){if(!value)return null;return{id:value.id||`legacy:${value.brand||''}:${value.model||''}:${value.engine||''}`,brand:value.brand||'',model:value.model||'',generation:value.generation||'',engine:value.engine||'',transmission:value.transmission||'',packageName:value.packageName||'',year:value.year||'',source:value.source||'legacy',revision:value.revision||null}}

/**
 * Bir marka+model için TÜM nesillerdeki motorları birleştirir.
 *
 * Legacy düz veri setinde (vehicleService) "nesil" kavramı yok — marka/model
 * doğrudan motor listesine bağlanır. Canonical tarafta ise motor bir nesle
 * bağlıdır. Bu köprü, nesil seçimi olmayan eski ekranların (AnalysisForm,
 * ChronicIssues, Diagnosis, Inspection, Compare) canonical motorları
 * kaybetmeden aynı düz "marka → model → motor" akışını kullanabilmesini
 * sağlar: nesiller arası motorlar id'ye göre tekilleştirilip birleştirilir.
 *
 * Canonical model yok/boşsa ya da istek başarısız olursa legacy motor
 * listesine (isimden üretilmiş sözde-id'lerle) sessizce düşülür.
 */
export async function listEnginesForModel(brandLabel, modelLabel) {
  try {
    const brand = (await listBrands()).find((b) => b.displayName === brandLabel)
    if (brand && !String(brand.id).startsWith('legacy:')) {
      const model = (await listModels(brand)).find((m) => m.displayName === modelLabel)
      if (model && !String(model.id).startsWith('legacy:')) {
        const generations = await listGenerations(model)
        if (generations.length) {
          const merged = new Map()
          for (const engines of await Promise.all(generations.map((g) => listEngines(g)))) {
            engines.forEach((e) => merged.set(e.id, e))
          }
          if (merged.size) return [...merged.values()]
        }
      }
    }
  } catch {
    // Ağ hatası ya da beklenmeyen yanıt — aşağıda legacy listesine düşülür.
  }
  return legacy.getEngineNames(brandLabel, modelLabel).map((name) => ({
    id: `legacy:engine:${brandLabel}:${modelLabel}:${name}`,
    label: name,
    displayName: name,
    source: 'legacy'
  }))
}

/**
 * Bir marka+model'in üretim yılı aralığını "YYYY-YYYY" biçiminde döner.
 * `utils/vehicleOptions.js`teki `yearOptions`/`isYearOutsideRange` bu biçimi
 * bekler; canonical nesillerin en erken başlangıcı ile en geç bitişi
 * (bitmemişse bugün) birleştirilir. Canonical veri yoksa legacy referans
 * kaydının aralığına düşülür.
 */
export async function yearRangeForModel(brandLabel, modelLabel) {
  try {
    const brand = (await listBrands()).find((b) => b.displayName === brandLabel)
    if (brand && !String(brand.id).startsWith('legacy:')) {
      const model = (await listModels(brand)).find((m) => m.displayName === modelLabel)
      if (model && !String(model.id).startsWith('legacy:')) {
        const generations = await listGenerations(model)
        const starts = generations.map((g) => Number(g.yearStart)).filter(Number.isFinite)
        const ends = generations.map((g) => Number(g.yearEnd) || new Date().getFullYear()).filter(Number.isFinite)
        if (starts.length) return `${Math.min(...starts)}-${Math.max(...ends)}`
      }
    }
  } catch {
    // Ağ hatası ya da beklenmeyen yanıt — aşağıda legacy aralığına düşülür.
  }
  return legacy.getVehicleEntry(brandLabel, modelLabel)?.yearRange || null
}

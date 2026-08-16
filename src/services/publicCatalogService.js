import { PROXY_BASE_URL } from './aiService.js'
const base=()=>PROXY_BASE_URL.replace(/\/$/,'');let cache={revision:null,meta:null,brands:null,requests:new Map()}
async function request(path){if(cache.requests.has(path))return cache.requests.get(path);const pending=fetch(`${base()}${path}`).then(async response=>{if(response.status===404)return null;if(!response.ok)throw new Error('catalog-unavailable');return response.json()}).finally(()=>cache.requests.delete(path));cache.requests.set(path,pending);return pending}
export function clearPublicCatalogCache(){cache={revision:null,meta:null,brands:null,requests:new Map()}}
export async function getPublicCatalogMeta(){try{const meta=await request('/catalog/meta');if(!meta?.available)return{available:false,source:'legacy'};if(cache.revision&&cache.revision!==meta.revision)clearPublicCatalogCache();cache.revision=meta.revision;cache.meta=meta;return meta}catch{return{available:false,source:'legacy'}}}
export async function getPublishedBrands(){const meta=await getPublicCatalogMeta();if(!meta.available)return null;if(!cache.brands)cache.brands=(await request('/catalog/brands?limit=100'))?.items||[];return cache.brands}
export async function getPublishedModels(brandId){if(!(await getPublicCatalogMeta()).available)return null;return(await request(`/catalog/models?brand_id=${encodeURIComponent(brandId)}&limit=100`))?.items||[]}
export async function getPublishedGenerations(modelId){if(!(await getPublicCatalogMeta()).available)return null;return(await request(`/catalog/generations?model_id=${encodeURIComponent(modelId)}&limit=100`))?.items||[]}
export async function getPublishedEngines(generationId){if(!(await getPublicCatalogMeta()).available)return null;return(await request(`/catalog/engines?generation_id=${encodeURIComponent(generationId)}&limit=100`))?.items||[]}
export async function getPublishedTransmissions(generationId){if(!(await getPublicCatalogMeta()).available)return null;return(await request(`/catalog/transmissions?generation_id=${encodeURIComponent(generationId)}&limit=100`))?.items||[]}
export async function getPublishedPackages(generationId){if(!(await getPublicCatalogMeta()).available)return null;return(await request(`/catalog/packages?generation_id=${encodeURIComponent(generationId)}&limit=100`))?.items||[]}
export async function getPublishedVariants(generationId){if(!(await getPublicCatalogMeta()).available)return null;return(await request(`/catalog/variants?generation_id=${encodeURIComponent(generationId)}&limit=100`))?.items||[]}
export async function getPublicProblems(scope){const query=new URLSearchParams(scope).toString();return(await request(`/catalog/problems?${query}`))?.items||null}
export async function getPublicMaintenance(scope){const query=new URLSearchParams(scope).toString();return(await request(`/catalog/maintenance?${query}`))?.items||null}
export async function searchPublishedCatalog(q){if(!(await getPublicCatalogMeta()).available)return null;return(await request(`/catalog/search?q=${encodeURIComponent(q)}`))?.items||[]}
export async function getPublishedVariant(id){if(!(await getPublicCatalogMeta()).available)return null;return await request(`/catalog/variants/${encodeURIComponent(id)}`)}
export const minorToTry=value=>Number(value||0)/100
export const tryToMinor=value=>Math.round(Number(value||0)*100)

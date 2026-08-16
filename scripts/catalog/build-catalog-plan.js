import { createHash } from 'node:crypto'
import { buildCoreDryRun } from './import-core.js'
import { buildPackagesDryRun } from './import-packages.js'
import { buildVehicleVariantsDryRun } from './import-vehicle-variants.js'
import { buildIssuesValuesDryRun } from './import-issues-values.js'
import { validateCatalogPlan } from './validate-catalog-plan.js'

const canonical = value => Array.isArray(value)?`[${value.map(canonical).join(',')}]`:value&&typeof value==='object'?`{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`:JSON.stringify(value)
const sortById = list => [...list].sort((a,b) => String(a.id || a.source_key).localeCompare(String(b.id || b.source_key)))
export async function buildCatalogPlan() {
  const [core, packages, variants, issues] = await Promise.all([buildCoreDryRun(),buildPackagesDryRun(),buildVehicleVariantsDryRun(),buildIssuesValuesDryRun()])
  const records={brands:sortById(core.records.brands),models:sortById(core.records.models),generations:sortById(core.records.generations),engines:sortById(core.records.engines),transmissions:sortById(core.records.transmissions),generationEngines:sortById(core.records.generationEngines),generationTransmissions:sortById(core.records.generationTransmissions),packages:sortById(packages.records.packages),equipment:sortById(packages.records.equipment),generationPackages:sortById(packages.records.generationPackageRelations),packageEquipment:sortById(packages.records.packageEquipmentRelations),vehicleVariants:sortById(variants.records.variants),problemArchetypes:sortById(issues.records.problemArchetypes),problemApplicability:sortById(issues.records.problemApplicability),maintenanceItems:sortById(issues.records.maintenanceItems),maintenanceApplicability:[],referenceValues:sortById(issues.records.referenceValues),valuationFactors:sortById(issues.records.valuationFactors)}
  const semantic=Object.fromEntries(Object.entries(records).map(([key,list])=>[key,list.map(item=>{const copy={...item};delete copy.created_at;delete copy.updated_at;return copy})]))
  const planHash=createHash('sha256').update(canonical(semantic)).digest('hex'), revisionId=`catalog:${planHash.slice(0,24)}`
  for(const list of Object.values(records))for(const item of list)item.revision_id=revisionId
  const integrity={blockingErrors:[...core.integrity.blockingErrors,...packages.integrity.blockingErrors,...variants.integrity.blockingErrors,...issues.integrity.blockingErrors],warnings:[...core.integrity.warnings,...packages.integrity.warnings,...variants.integrity.warnings,...issues.integrity.warnings]}
  const counts=Object.fromEntries(Object.entries(records).map(([key,list])=>[key,list.length]))
  const plan={mode:'plan',remoteAccess:false,planHash,revision:{id:revisionId,status:'draft'},canApply:integrity.blockingErrors.length===0,counts,integrity,reviewSummary:{packages:packages.reviewCandidates.length,variants:variants.reviewCandidates.length,issues:issues.reviewCandidates.length},reviewCandidates:[...packages.reviewCandidates,...variants.reviewCandidates,...issues.reviewCandidates],sourceManifest:[...core.sourceManifest,...packages.sourceManifest,...issues.sourceManifest],records};const combined=validateCatalogPlan(plan);plan.integrity={blockingErrors:[...integrity.blockingErrors,...combined.blockingErrors],warnings:integrity.warnings};plan.canApply=plan.integrity.blockingErrors.length===0;return plan
}
const cli=process.argv[1]?.endsWith('build-catalog-plan.js');if(cli){if(process.argv.includes('--remote')){console.error('Remote erişim yasaktır.');process.exitCode=2}else{const p=await buildCatalogPlan();const o=process.argv.includes('--include-records')?p:Object.fromEntries(Object.entries(p).filter(([k])=>k!=='records'));console.log(process.argv.includes('--json')?JSON.stringify(o,null,2):`Catalog plan\n${p.planHash}\ncanApply: ${p.canApply}\nrevision: ${p.revision.id}`)}}

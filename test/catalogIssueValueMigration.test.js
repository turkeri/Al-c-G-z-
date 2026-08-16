import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'

const sql = await Promise.all(['0006_catalog_foundation.sql', '0007_catalog_packages_variants.sql', '0008_catalog_issues_maintenance_values.sql'].map((name) => readFile(new URL(`../server/d1/migrations/${name}`, import.meta.url), 'utf8')))
const migration = sql[2]

function db() {
  const value = new DatabaseSync(':memory:')
  value.exec('PRAGMA foreign_keys=ON')
  sql.forEach((part) => value.exec(part))
  value.exec("INSERT INTO catalog_revisions (id,revision_number,status,created_at) VALUES ('r',1,'draft',1); INSERT INTO catalog_brands (revision_id,id,slug,display_name,normalized_name,created_at,updated_at) VALUES ('r','b','b','B','b',1,1); INSERT INTO catalog_models (revision_id,id,brand_id,slug,display_name,normalized_name,created_at,updated_at) VALUES ('r','m','b','m','M','m',1,1); INSERT INTO catalog_generations (revision_id,id,model_id,display_name,normalized_name,year_start,created_at,updated_at) VALUES ('r','g','m','G','g',2000,1,1); INSERT INTO catalog_engines (revision_id,id,display_name,normalized_name,created_at,updated_at) VALUES ('r','e','E','e',1,1); INSERT INTO catalog_packages (revision_id,id,display_name,normalized_name,created_at,updated_at) VALUES ('r','p','P','p',1,1)")
  return value
}

test('0008 is additive and creates issue maintenance and value tables', () => {
  assert.doesNotMatch(migration.replace(/^--.*$/gm, ''), /\bDROP\b|\bDELETE\s+FROM\b|\bTRUNCATE\b|\bALTER\s+TABLE\s+vehicles\b/i)
  for (const table of ['catalog_problem_archetypes','catalog_problem_applicability','catalog_maintenance_items','catalog_maintenance_applicability','catalog_reference_values','catalog_valuation_factors']) assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`))
})

test('0008 constraints protect scope, FK, ranges and factor uniqueness', () => {
  const value = db()
  assert.throws(() => value.exec("INSERT INTO catalog_problem_applicability (revision_id,id,created_at,updated_at) VALUES ('r','empty',1,1)"))
  assert.throws(() => value.exec("INSERT INTO catalog_problem_applicability (revision_id,id,engine_id,created_at,updated_at) VALUES ('r','bad','missing',1,1)"))
  assert.throws(() => value.exec("INSERT INTO catalog_maintenance_items (revision_id,id,title,normalized_title,default_interval_km,created_at,updated_at) VALUES ('r','oil','Oil','oil',0,1,1)"))
  value.exec("INSERT INTO catalog_maintenance_items (revision_id,id,title,normalized_title,created_at,updated_at) VALUES ('r','oil','Oil','oil',1,1)")
  assert.throws(() => value.exec("INSERT INTO catalog_maintenance_applicability (revision_id,id,maintenance_item_id,scope_type,created_at,updated_at) VALUES ('r','bad-scope','oil','filtered',1,1)"))
  assert.throws(() => value.exec("INSERT INTO catalog_reference_values (revision_id,id,amount_minor,value_type,effective_at,created_at,updated_at) VALUES ('r','bad',1,'reference',1,1,1)"))
  assert.throws(() => value.exec("INSERT INTO catalog_reference_values (revision_id,id,generation_id,amount_minor,currency,value_type,effective_at,created_at,updated_at) VALUES ('r','bad-currency','g',1,'TL','reference',1,1,1)"))
  assert.throws(() => value.exec("INSERT INTO catalog_reference_values (revision_id,id,generation_id,amount_minor,value_type,effective_at,mileage_min,mileage_max,created_at,updated_at) VALUES ('r','bad-range','g',1,'reference',2,100,10,1,1)"))
  value.exec("INSERT INTO catalog_valuation_factors (revision_id,id,factor_type,factor_key,display_name,numeric_value,created_at,updated_at) VALUES ('r','f1','fuel','diesel','Diesel',1.05,1,1)")
  assert.throws(() => value.exec("INSERT INTO catalog_valuation_factors (revision_id,id,factor_type,factor_key,display_name,numeric_value,created_at,updated_at) VALUES ('r','f2','fuel','diesel','Diesel',1.06,1,1)"))
  value.close()
})

test('0008 applies without seed or published catalog revision', () => {
  const value = new DatabaseSync(':memory:')
  value.exec('PRAGMA foreign_keys=ON')
  sql.forEach((part) => value.exec(part))
  assert.equal(value.prepare('SELECT COUNT(*) AS count FROM catalog_revisions').get().count, 0)
  value.close()
})

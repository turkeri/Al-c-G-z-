import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'

const migrationUrl = new URL('../server/d1/migrations/0006_catalog_foundation.sql', import.meta.url)
const migration = await readFile(migrationUrl, 'utf8')
const executableSql = migration.replace(/^--.*$/gm, '')

function dbWithFoundation() {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(migration)
  db.prepare("INSERT INTO catalog_revisions (id, revision_number, status, created_at) VALUES ('rev-1', 1, 'draft', 1)").run()
  return db
}

function insertBrand(db) {
  db.prepare("INSERT INTO catalog_brands (revision_id,id,slug,display_name,normalized_name,created_at,updated_at) VALUES ('rev-1','audi','audi','Audi','audi',1,1)").run()
}

function insertModel(db) {
  insertBrand(db)
  db.prepare("INSERT INTO catalog_models (revision_id,id,brand_id,slug,display_name,normalized_name,created_at,updated_at) VALUES ('rev-1','a3','audi','a3','A3','a3',1,1)").run()
}

function insertGeneration(db) {
  insertModel(db)
  db.prepare("INSERT INTO catalog_generations (revision_id,id,model_id,code,display_name,normalized_name,year_start,created_at,updated_at) VALUES ('rev-1','8v','a3','8V','A3 8V','a3 8v',2012,1,1)").run()
}

test('0006 catalog migration is additive and creates the canonical foundation', () => {
  assert.doesNotMatch(executableSql, /\bDROP\b|\bDELETE\s+FROM\b|\bTRUNCATE\b|\bALTER\s+TABLE\s+vehicles\b/i)
  assert.doesNotMatch(executableSql, /\bINSERT\s+INTO\s+catalog_revisions\b/i)
  for (const table of ['catalog_revisions', 'catalog_state', 'catalog_brands', 'catalog_models', 'catalog_generations', 'catalog_engines', 'catalog_transmissions', 'catalog_generation_engines', 'catalog_generation_transmissions']) assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, 'i'))
  assert.match(migration, /status\s+TEXT NOT NULL CHECK \(status IN \('draft','validating','published','failed','archived'\)\)/i)
  assert.match(migration, /active\s+INTEGER NOT NULL DEFAULT 1 CHECK \(active IN \(0,1\)\)/i)
})

test('0006 runs on an empty SQLite database and does not seed a published revision', () => {
  const db = dbWithFoundation()
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM catalog_revisions WHERE status = ?').get('published').count, 0)
  db.close()
})

test('generation, engine and transmission checks reject invalid ranges and values', () => {
  const db = dbWithFoundation()
  insertModel(db)
  assert.throws(() => db.prepare("INSERT INTO catalog_generations (revision_id,id,model_id,display_name,normalized_name,year_start,year_end,created_at,updated_at) VALUES ('rev-1','bad','a3','Bad','bad',2024,2020,1,1)").run())
  assert.throws(() => db.prepare("INSERT INTO catalog_engines (revision_id,id,display_name,normalized_name,displacement_cc,created_at,updated_at) VALUES ('rev-1','bad-engine','Bad','bad',-1,1,1)").run())
  assert.throws(() => db.prepare("INSERT INTO catalog_transmissions (revision_id,id,display_name,normalized_name,gear_count,created_at,updated_at) VALUES ('rev-1','bad-trans','Bad','bad',0,1,1)").run())
  db.close()
})

test('composite foreign keys keep entities and relations in the same revision', () => {
  const db = dbWithFoundation()
  assert.throws(() => db.prepare("INSERT INTO catalog_models (revision_id,id,brand_id,slug,display_name,normalized_name,created_at,updated_at) VALUES ('rev-1','orphan','missing','orphan','Orphan','orphan',1,1)").run())
  insertGeneration(db)
  assert.throws(() => db.prepare("INSERT INTO catalog_generations (revision_id,id,model_id,display_name,normalized_name,year_start,created_at,updated_at) VALUES ('rev-1','orphan-generation','missing','Orphan','orphan',2012,1,1)").run())
  assert.throws(() => db.prepare("INSERT INTO catalog_generation_engines (id,revision_id,generation_id,engine_id,created_at) VALUES ('relation-1','rev-1','8v','missing',1)").run())
  assert.throws(() => db.prepare("INSERT INTO catalog_generation_transmissions (id,revision_id,generation_id,transmission_id,created_at) VALUES ('relation-2','rev-1','8v','missing',1)").run())
  db.close()
})

test('migration sequence includes 0001 through 0006', async () => {
  const names = (await readdir(new URL('../server/d1/migrations/', import.meta.url))).filter((name) => /^000[1-6]_/.test(name)).sort()
  assert.deepEqual(names, ['0001_initial_schema.sql', '0002_auth_identity_foundation.sql', '0003_user_data_ownership.sql', '0004_continuous_user_sync.sql', '0005_admin_foundation.sql', '0006_catalog_foundation.sql'])
})

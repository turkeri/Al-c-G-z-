import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'

const foundation = await readFile(new URL('../server/d1/migrations/0006_catalog_foundation.sql', import.meta.url), 'utf8')
const migration = await readFile(new URL('../server/d1/migrations/0007_catalog_packages_variants.sql', import.meta.url), 'utf8')
const executableSql = migration.replace(/^--.*$/gm, '')

function dbWithMigrations() {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(foundation)
  db.exec(migration)
  db.prepare("INSERT INTO catalog_revisions (id,revision_number,status,created_at) VALUES ('rev-1',1,'draft',1)").run()
  db.prepare("INSERT INTO catalog_revisions (id,revision_number,status,created_at) VALUES ('rev-2',2,'draft',1)").run()
  db.prepare("INSERT INTO catalog_brands (revision_id,id,slug,display_name,normalized_name,created_at,updated_at) VALUES ('rev-1','audi','audi','Audi','audi',1,1)").run()
  db.prepare("INSERT INTO catalog_models (revision_id,id,brand_id,slug,display_name,normalized_name,created_at,updated_at) VALUES ('rev-1','a3','audi','a3','A3','a3',1,1)").run()
  db.prepare("INSERT INTO catalog_generations (revision_id,id,model_id,display_name,normalized_name,year_start,created_at,updated_at) VALUES ('rev-1','8v','a3','A3 8V','a3 8v',2012,1,1)").run()
  db.prepare("INSERT INTO catalog_engines (revision_id,id,display_name,normalized_name,created_at,updated_at) VALUES ('rev-1','ea288','1.6 TDI','1.6 tdi',1,1)").run()
  db.prepare("INSERT INTO catalog_transmissions (revision_id,id,display_name,normalized_name,gear_count,created_at,updated_at) VALUES ('rev-1','dq200','DQ200','dq200',7,1,1)").run()
  db.prepare("INSERT INTO catalog_packages (revision_id,id,display_name,normalized_name,created_at,updated_at) VALUES ('rev-1','dynamic','Dynamic','dynamic',1,1)").run()
  db.prepare("INSERT INTO catalog_equipment (revision_id,id,category,display_name,normalized_name,created_at,updated_at) VALUES ('rev-1','esp','guvenlik','ESP','esp',1,1)").run()
  return db
}

test('0007 is additive, leaves vehicles untouched and creates package variant tables', async () => {
  assert.doesNotMatch(executableSql, /\bDROP\b|\bDELETE\s+FROM\b|\bTRUNCATE\b|\bALTER\s+TABLE\s+vehicles\b/i)
  assert.doesNotMatch(executableSql, /\bINSERT\s+INTO\s+catalog_/i)
  for (const table of ['catalog_packages', 'catalog_equipment', 'catalog_generation_packages', 'catalog_package_equipment', 'catalog_vehicle_variants']) assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, 'i'))
})

test('package name is not global unique but package-equipment relation is unique', () => {
  const db = dbWithMigrations()
  db.prepare("INSERT INTO catalog_packages (revision_id,id,display_name,normalized_name,created_at,updated_at) VALUES ('rev-1','comfort','Dynamic','dynamic',1,1)").run()
  db.prepare("INSERT INTO catalog_package_equipment (revision_id,package_id,equipment_id,availability,standard,created_at) VALUES ('rev-1','dynamic','esp','standard',1,1)").run()
  assert.throws(() => db.prepare("INSERT INTO catalog_package_equipment (revision_id,package_id,equipment_id,availability,standard,created_at) VALUES ('rev-1','dynamic','esp','standard',1,1)").run())
  db.close()
})

test('package, equipment, generation and variant foreign keys are revision isolated', () => {
  const db = dbWithMigrations()
  assert.throws(() => db.prepare("INSERT INTO catalog_generation_packages (id,revision_id,generation_id,package_id,created_at) VALUES ('gp-1','rev-1','missing','dynamic',1)").run())
  assert.throws(() => db.prepare("INSERT INTO catalog_package_equipment (revision_id,package_id,equipment_id,availability,standard,created_at) VALUES ('rev-1','dynamic','missing','optional',0,1)").run())
  assert.throws(() => db.prepare("INSERT INTO catalog_vehicle_variants (revision_id,id,generation_id,engine_id,display_name,normalized_name,created_at,updated_at) VALUES ('rev-1','variant-1','8v','missing','A3','a3',1,1)").run())
  assert.throws(() => db.prepare("INSERT INTO catalog_vehicle_variants (revision_id,id,generation_id,display_name,normalized_name,created_at,updated_at) VALUES ('rev-2','cross-revision','8v','A3','a3',1,1)").run())
  db.close()
})

test('variant and relation constraints reject invalid values', () => {
  const db = dbWithMigrations()
  assert.throws(() => db.prepare("INSERT INTO catalog_vehicle_variants (revision_id,id,generation_id,power_hp_override,display_name,normalized_name,created_at,updated_at) VALUES ('rev-1','bad-power','8v',-1,'A3','a3',1,1)").run())
  assert.throws(() => db.prepare("INSERT INTO catalog_vehicle_variants (revision_id,id,generation_id,year_start,year_end,display_name,normalized_name,created_at,updated_at) VALUES ('rev-1','bad-year','8v',2024,2020,'A3','a3',1,1)").run())
  assert.throws(() => db.prepare("INSERT INTO catalog_packages (revision_id,id,display_name,normalized_name,active,created_at,updated_at) VALUES ('rev-1','bad-active','Bad','bad',2,1,1)").run())
  assert.throws(() => db.prepare("INSERT INTO catalog_equipment (revision_id,id,display_name,normalized_name,source_confidence,created_at,updated_at) VALUES ('rev-1','bad-source','Bad','bad','certain',1,1)").run())
  assert.throws(() => db.prepare("INSERT INTO catalog_package_equipment (revision_id,package_id,equipment_id,availability,standard,created_at) VALUES ('rev-1','dynamic','esp','optional',1,1)").run())
  db.close()
})

test('0006 then 0007 applies to a clean SQLite database without seed data', () => {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(foundation)
  db.exec(migration)
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM catalog_revisions').get().count, 0)
  db.close()
})

test('migration sequence includes 0001 through 0007', async () => {
  const names = (await readdir(new URL('../server/d1/migrations/', import.meta.url))).filter((name) => /^000[1-7]_/.test(name)).sort()
  assert.deepEqual(names, ['0001_initial_schema.sql', '0002_auth_identity_foundation.sql', '0003_user_data_ownership.sql', '0004_continuous_user_sync.sql', '0005_admin_foundation.sql', '0006_catalog_foundation.sql', '0007_catalog_packages_variants.sql'])
})

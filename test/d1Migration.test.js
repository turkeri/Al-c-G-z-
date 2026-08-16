import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('D1 migration is configured and contains no destructive SQL', async () => {
  const configText = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8')
  const config = JSON.parse(configText.replace(/^\uFEFF/, ''))
  const migration = await readFile(new URL('../server/d1/migrations/0001_initial_schema.sql', import.meta.url), 'utf8')

  assert.equal(config.d1_databases[0].migrations_dir, 'server/d1/migrations')
  assert.match(migration, /CREATE TABLE IF NOT EXISTS vehicles/i)
  assert.match(migration, /CREATE TABLE IF NOT EXISTS analysis_history/i)
  const executableSql = migration.replace(/^--.*$/gm, '')
  assert.doesNotMatch(executableSql, /\bDROP\b|\bDELETE\s+FROM\b|\bUPDATE\b|\bINSERT\s+INTO\b/i)
})

test('auth identity migration is additive and contains required ownership constraints', async () => {
  const migration = await readFile(new URL('../server/d1/migrations/0002_auth_identity_foundation.sql', import.meta.url), 'utf8')
  for (const table of ['users', 'user_identities', 'device_links', 'consent_records']) {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, 'i'))
  }
  assert.match(migration, /auth_subject\s+TEXT NOT NULL UNIQUE/i)
  assert.match(migration, /UNIQUE\(provider, provider_subject\)/i)
  assert.match(migration, /WHERE revoked_at IS NULL/i)
  const executableSql = migration.replace(/^--.*$/gm, '')
  assert.doesNotMatch(executableSql, /\bDROP\b|\bDELETE\s+FROM\b|\bUPDATE\b|\bINSERT\s+INTO\b/i)
})

test('ownership migration is additive and includes all transferred data types', async () => {
  const migration = await readFile(new URL('../server/d1/migrations/0003_user_data_ownership.sql', import.meta.url), 'utf8')
  for (const table of ['history_owners', 'user_favorites', 'user_garage_records', 'user_expertise_notes', 'device_link_transfers']) {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, 'i'))
  }
  const executableSql = migration.replace(/^--.*$/gm, '')
  assert.doesNotMatch(executableSql, /\bDROP\b|\bDELETE\s+FROM\b/i)
})

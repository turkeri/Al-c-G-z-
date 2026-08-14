/**
 * vehicles.json -> D1 tohum SQL dosyası üretir.
 *
 * Kullanım (proje kökünden):
 *   node server/d1/generate-seed.mjs
 *
 * Çıktı: server/d1/seed.sql
 * Ardından:
 *   npx wrangler d1 execute arac-dedektifi --remote --file=server/d1/schema.sql
 *   npx wrangler d1 execute arac-dedektifi --remote --file=server/d1/seed.sql
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')

const vehicles = JSON.parse(readFileSync(join(root, 'src', 'data', 'vehicles.json'), 'utf8'))

/** SQL metin değeri: tek tırnaklar ikilenir. */
const q = (value) => "'" + String(value ?? '').replace(/'/g, "''") + "'"

/** "Volkswagen|Golf (Mk7)" -> kararlı anahtar */
function keyFor(entry) {
  return (entry.brand + '|' + entry.model).toLowerCase().replace(/\s+/g, ' ').trim()
}

const now = Date.now()
const revision = 1

const lines = [
  '-- Araç Dedektifi tohum verisi',
  '-- ' + vehicles.length + ' araç kaydı, üretim tarihi ' + new Date(now).toISOString(),
  '-- Bu dosya üretilmiştir; elle düzenlemeyin, generate-seed.mjs ile yeniden üretin.',
  '',
  'DELETE FROM vehicles;',
  ''
]

// Tek dev INSERT yerine gruplara bölünür: D1 tek ifadede çok büyük SQL kabul etmez.
const BATCH = 25
for (let i = 0; i < vehicles.length; i += BATCH) {
  const chunk = vehicles.slice(i, i + BATCH)
  const values = chunk
    .map((entry) =>
      '(' +
      [
        q(keyFor(entry)),
        q(entry.brand),
        q(entry.model),
        q(entry.yearRange || ''),
        revision,
        0,
        now,
        q(JSON.stringify(entry))
      ].join(', ') +
      ')'
    )
    .join(',\n  ')

  lines.push(
    'INSERT INTO vehicles (id, brand, model, year_range, revision, deleted, updated_at, payload) VALUES'
  )
  lines.push('  ' + values + ';')
  lines.push('')
}

lines.push(
  "INSERT INTO meta (key, value) VALUES ('data_revision', '" +
    revision +
    "') ON CONFLICT(key) DO UPDATE SET value = excluded.value;"
)
lines.push('')

const outPath = join(here, 'seed.sql')
writeFileSync(outPath, lines.join('\n'), 'utf8')

console.log('Yazıldı: ' + outPath)
console.log('Kayıt sayısı: ' + vehicles.length)
console.log('Boyut: ' + (Buffer.byteLength(lines.join('\n')) / 1024).toFixed(0) + ' KB')

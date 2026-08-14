-- Araç Dedektifi - araç veritabanı şeması (Cloudflare D1 / SQLite)
--
-- Tasarım kararı: her araç kaydı tek satırda, tam JSON olarak tutulur.
-- Marka/model/motor/arıza tablolarına normalize etmek yerine bunun tercih
-- edilmesinin nedeni, istemcinin veriyi zaten bütün bir nesne olarak
-- kullanması ve senkronizasyonun satır bazında yapılabilmesidir. Sorgular
-- sunucuda değil, veriyi indirdikten sonra cihazda çalışır.
--
-- Senkronizasyon: her satırda artan bir `revision` vardır. İstemci elindeki
-- en yüksek revizyonu gönderir, sunucu yalnızca ondan yenilerini döner.
-- Böylece 600 KB'lık veri her açılışta yeniden indirilmez.

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id         TEXT PRIMARY KEY,   -- "marka|model" (normalize edilmiş anahtar)
  brand      TEXT NOT NULL,
  model      TEXT NOT NULL,
  year_range TEXT,
  revision   INTEGER NOT NULL,   -- delta senkronizasyon sayacı
  deleted    INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  payload    TEXT NOT NULL       -- kaydın tamamı (JSON)
);

-- Delta sorgusu bu indeks üzerinden çalışır.
CREATE INDEX IF NOT EXISTS idx_vehicles_revision ON vehicles(revision);

-- Topluluk katkıları ve yapay zekâ araştırmaları buraya düşer.
-- Elle doğrulanmış `vehicles` tablosuyla KARIŞTIRILMAZ: kullanıcıya ayrı
-- etiketle gösterilir ve ancak onaylandıktan sonra vehicles'a taşınır.
CREATE TABLE IF NOT EXISTS submissions (
  id         TEXT PRIMARY KEY,
  brand      TEXT NOT NULL,
  model      TEXT NOT NULL,
  engine     TEXT,
  source     TEXT NOT NULL,      -- 'topluluk' | 'arastirma'
  status     TEXT NOT NULL DEFAULT 'beklemede', -- beklemede | onaylandi | reddedildi
  created_at INTEGER NOT NULL,
  payload    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

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

-- ============================================================================
-- KULLANIM KOTASI
-- ============================================================================
-- Yapay zekâ çağrılarının her biri gerçek para maliyetidir. Kota İSTEMCİDE
-- DEĞİL burada tutulur; istemci tarafında tutulan bir sayaç, uygulamanın
-- verisini silmek kadar kolay sıfırlanır ve hiçbir koruma sağlamaz.
--
-- DÜRÜST SINIR: `id` cihazın ürettiği bir kimliktir. Uygulama verisi silinir
-- ya da uygulama yeniden kurulursa yeni kimlik oluşur ve kota sıfırlanır. Bu
-- gerçek bir kimlik doğrulama değildir; amaç sıradan aşırı kullanımı ve
-- maliyeti sınırlamaktır. Bunu kısmen dengelemek için IP başına aylık ikinci
-- bir tavan (ip_quota) uygulanır.
CREATE TABLE IF NOT EXISTS accounts (
  id           TEXT PRIMARY KEY,   -- cihaz kimliği (UUID)
  plan         TEXT NOT NULL DEFAULT 'ucretsiz',
  created_at   INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  period_key   TEXT NOT NULL,      -- '2026-08' — ay değişince sayaç sıfırlanır
  used_count   INTEGER NOT NULL DEFAULT 0,
  total_count  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_accounts_period ON accounts(period_key);

-- IP başına aylık tavan: tek kişinin sınırsız yeni cihaz kimliği üretip
-- ücretsiz hakkı tekrar tekrar kullanmasını zorlaştırır.
CREATE TABLE IF NOT EXISTS ip_quota (
  ip          TEXT NOT NULL,
  period_key  TEXT NOT NULL,
  used_count  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip, period_key)
);

-- ============================================================================
-- ANALİZ GEÇMİŞİ
-- ============================================================================
-- Kullanıcı baktığı araçları sonradan görebilsin diye tutulur. Yalnızca ÖZET
-- saklanır (marka, model, yıl, km, fiyat, skor) — ilan metni, fotoğraf ve
-- kullanıcının yazdığı notlar SAKLANMAZ.
--
-- Bunun nedeni hem gizlilik hem maliyet: analiz metni ve görseller kullanıcının
-- kendi cihazında kalır, sunucuda yalnızca listelenebilir bir künye durur.
CREATE TABLE IF NOT EXISTS analysis_history (
  id          TEXT PRIMARY KEY,          -- istemcinin ürettiği UUID
  account_id  TEXT NOT NULL,             -- accounts.id
  created_at  INTEGER NOT NULL,
  brand       TEXT,
  model       TEXT,
  year        TEXT,
  km          INTEGER,
  price       INTEGER,
  score       INTEGER,                   -- araç genel puanı
  trust_score INTEGER,                   -- ilan güven puanı
  verdict     TEXT,                      -- al | dikkatli | alma | belirsiz
  source      TEXT                       -- ilan-link | ekran-goruntusu | metin | form
);

CREATE INDEX IF NOT EXISTS idx_history_account ON analysis_history(account_id, created_at);

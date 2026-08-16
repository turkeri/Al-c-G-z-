-- Araç Dedektifi — başlangıç şeması.
--
-- Bu dosya mevcut D1'e OTOMATİK uygulanmaz. Remote uygulama öncesinde
-- docs/DATABASE.md içindeki export ve rollback adımları tamamlanmalıdır.
-- Tüm DDL ifadeleri idempotenttir; mevcut tablo ve kayıtlara dokunmaz.

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id         TEXT PRIMARY KEY,
  brand      TEXT NOT NULL,
  model      TEXT NOT NULL,
  year_range TEXT,
  revision   INTEGER NOT NULL,
  deleted    INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  payload    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vehicles_revision ON vehicles(revision);

CREATE TABLE IF NOT EXISTS submissions (
  id         TEXT PRIMARY KEY,
  brand      TEXT NOT NULL,
  model      TEXT NOT NULL,
  engine     TEXT,
  source     TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'beklemede',
  created_at INTEGER NOT NULL,
  payload    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

CREATE TABLE IF NOT EXISTS accounts (
  id           TEXT PRIMARY KEY,
  plan         TEXT NOT NULL DEFAULT 'ucretsiz',
  created_at   INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  period_key   TEXT NOT NULL,
  used_count   INTEGER NOT NULL DEFAULT 0,
  total_count  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_accounts_period ON accounts(period_key);

CREATE TABLE IF NOT EXISTS ip_quota (
  ip          TEXT NOT NULL,
  period_key  TEXT NOT NULL,
  used_count  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip, period_key)
);

CREATE TABLE IF NOT EXISTS analysis_history (
  id          TEXT PRIMARY KEY,
  account_id  TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  brand       TEXT,
  model       TEXT,
  year        TEXT,
  km          INTEGER,
  price       INTEGER,
  score       INTEGER,
  trust_score INTEGER,
  verdict     TEXT,
  source      TEXT
);

CREATE INDEX IF NOT EXISTS idx_history_account ON analysis_history(account_id, created_at);

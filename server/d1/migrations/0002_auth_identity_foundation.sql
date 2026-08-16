-- Aşama 2B-1: Supabase Auth subject'ini D1 uygulama verisine eşleme temeli.
-- Supabase session/JWT/refresh tokenları buraya yazılmaz. Bu migration mevcut
-- cihaz tabanlı accounts ve analysis_history tablolarını değiştirmez.
-- Timestamp'ler mevcut şemayla uyumlu UTC epoch milisaniyedir.
--
-- Rollback notu: production'da DROP TABLE çalıştırmayın. Önce auth endpointini
-- kapatın, export alın, sonra onaylı ayrı rollback migration'ı tasarlayın.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  auth_subject  TEXT NOT NULL UNIQUE,
  email         TEXT,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'deletion_pending', 'deleted')),
  plan          TEXT NOT NULL DEFAULT 'ucretsiz',
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,
  last_seen_at  INTEGER,
  deleted_at    INTEGER
);

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status, updated_at);

CREATE TABLE IF NOT EXISTS user_identities (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL,
  provider          TEXT NOT NULL,
  provider_subject  TEXT NOT NULL,
  created_at        INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(provider, provider_subject)
);

CREATE INDEX IF NOT EXISTS idx_user_identities_user ON user_identities(user_id);

CREATE TABLE IF NOT EXISTS device_links (
  id            TEXT PRIMARY KEY,
  device_id     TEXT NOT NULL,
  user_id       TEXT NOT NULL,
  linked_at     INTEGER NOT NULL,
  last_seen_at  INTEGER,
  revoked_at    INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SQLite partial unique index: yalnız aktif link bir cihazı sahiplenebilir;
-- revoke edilmiş geçmiş kayıtları silinmeden kalabilir.
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_links_active_device
  ON device_links(device_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_device_links_user ON device_links(user_id, linked_at);

CREATE TABLE IF NOT EXISTS consent_records (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL,
  consent_type    TEXT NOT NULL,
  policy_version  TEXT NOT NULL,
  granted         INTEGER NOT NULL CHECK (granted IN (0, 1)),
  created_at      INTEGER NOT NULL,
  source          TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_consent_records_user
  ON consent_records(user_id, consent_type, created_at);

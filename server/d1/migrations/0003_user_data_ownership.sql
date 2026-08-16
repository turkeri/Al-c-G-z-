-- Aşama 2B-2: mevcut anonim veriye zarar vermeden kullanıcı sahipliği.
-- Bu dosya mevcut Wrangler migrations_dir altında yer alır; remote'a uygulanmaz.

CREATE TABLE IF NOT EXISTS history_owners (
  history_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  linked_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_history_owners_user ON history_owners(user_id, linked_at);
CREATE INDEX IF NOT EXISTS idx_history_owners_device ON history_owners(device_id);

CREATE TABLE IF NOT EXISTS user_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, device_id, source_id)
);
CREATE INDEX IF NOT EXISTS idx_user_favorites_owner ON user_favorites(user_id, updated_at);

CREATE TABLE IF NOT EXISTS user_garage_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, device_id, source_id)
);
CREATE INDEX IF NOT EXISTS idx_user_garage_owner ON user_garage_records(user_id, updated_at);

CREATE TABLE IF NOT EXISTS user_expertise_notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, device_id, source_id)
);
CREATE INDEX IF NOT EXISTS idx_user_expertise_owner ON user_expertise_notes(user_id, updated_at);

-- İlk başarılı aktarımın sayıları idempotent yanıtta aynen döner.
CREATE TABLE IF NOT EXISTS device_link_transfers (
  device_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  result_json TEXT NOT NULL,
  completed_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

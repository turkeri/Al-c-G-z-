-- Sürekli sync için additive değişiklik günlüğü. Mevcut 0003 kayıtları korunur.
CREATE TABLE IF NOT EXISTS user_sync_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('favorites', 'garage', 'expertise_notes')),
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, id)
);
CREATE INDEX IF NOT EXISTS idx_user_sync_cursor ON user_sync_records(user_id, updated_at, id);
CREATE INDEX IF NOT EXISTS idx_user_sync_type ON user_sync_records(user_id, record_type, updated_at);

CREATE TABLE IF NOT EXISTS user_sync_operations (
  operation_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  result_json TEXT NOT NULL,
  processed_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

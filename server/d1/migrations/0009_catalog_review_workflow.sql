CREATE TABLE IF NOT EXISTS catalog_review_items (
  id TEXT PRIMARY KEY, revision_id TEXT NOT NULL, source_type TEXT NOT NULL, source_key TEXT NOT NULL,
  entity_type TEXT NOT NULL, proposed_target_id TEXT, confidence TEXT NOT NULL CHECK(confidence IN('unknown','low','medium','high')),
  reason_code TEXT NOT NULL, source_summary_json TEXT, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN('pending','accepted','rejected','deferred')),
  reviewed_by TEXT, reviewed_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, version INTEGER NOT NULL DEFAULT 1,
  UNIQUE(revision_id,source_type,source_key,entity_type,reason_code), FOREIGN KEY(revision_id) REFERENCES catalog_revisions(id), FOREIGN KEY(reviewed_by) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_catalog_review_revision_status ON catalog_review_items(revision_id,status,confidence,id);

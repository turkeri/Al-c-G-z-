-- Canonical katalog çekirdeği. Bu migration veri import etmez; published
-- revision oluşana kadar uygulama mevcut statik/gömülü kaynakları kullanır.

CREATE TABLE IF NOT EXISTS catalog_revisions (
  id TEXT PRIMARY KEY,
  revision_number INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('draft','validating','published','failed','archived')),
  label TEXT,
  notes TEXT,
  source_type TEXT,
  created_by TEXT,
  created_at INTEGER NOT NULL,
  validated_at INTEGER,
  published_at INTEGER,
  archived_at INTEGER,
  validation_error_count INTEGER NOT NULL DEFAULT 0 CHECK (validation_error_count >= 0),
  validation_warning_count INTEGER NOT NULL DEFAULT 0 CHECK (validation_warning_count >= 0)
);

CREATE TABLE IF NOT EXISTS catalog_state (
  singleton_key TEXT PRIMARY KEY CHECK (singleton_key = 'active'),
  published_revision_id TEXT,
  previous_revision_id TEXT,
  updated_at INTEGER NOT NULL,
  updated_by TEXT,
  FOREIGN KEY (published_revision_id) REFERENCES catalog_revisions(id),
  FOREIGN KEY (previous_revision_id) REFERENCES catalog_revisions(id)
);

CREATE TABLE IF NOT EXISTS catalog_publication_history (
  id TEXT PRIMARY KEY,
  from_revision_id TEXT,
  to_revision_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('publish','rollback','archive')),
  actor_user_id TEXT,
  created_at INTEGER NOT NULL,
  reason TEXT,
  FOREIGN KEY (from_revision_id) REFERENCES catalog_revisions(id),
  FOREIGN KEY (to_revision_id) REFERENCES catalog_revisions(id)
);

CREATE TABLE IF NOT EXISTS catalog_brands (
  revision_id TEXT NOT NULL,
  id TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  country_code TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  source_key TEXT,
  source_file TEXT,
  source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id, id),
  UNIQUE (revision_id, slug),
  UNIQUE (revision_id, normalized_name),
  FOREIGN KEY (revision_id) REFERENCES catalog_revisions(id)
);

CREATE TABLE IF NOT EXISTS catalog_models (
  revision_id TEXT NOT NULL,
  id TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  source_key TEXT,
  source_file TEXT,
  source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id, id),
  UNIQUE (revision_id, brand_id, slug),
  UNIQUE (revision_id, brand_id, normalized_name),
  FOREIGN KEY (revision_id, brand_id) REFERENCES catalog_brands(revision_id, id)
);

CREATE TABLE IF NOT EXISTS catalog_generations (
  revision_id TEXT NOT NULL,
  id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  code TEXT,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  year_start INTEGER NOT NULL CHECK (year_start BETWEEN 1886 AND 2100),
  year_end INTEGER CHECK (year_end IS NULL OR (year_end BETWEEN 1886 AND 2100 AND year_end >= year_start)),
  body_types_json TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  source_key TEXT,
  source_file TEXT,
  source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id, id),
  UNIQUE (revision_id, model_id, code),
  UNIQUE (revision_id, model_id, normalized_name, year_start),
  FOREIGN KEY (revision_id, model_id) REFERENCES catalog_models(revision_id, id)
);

CREATE TABLE IF NOT EXISTS catalog_engines (
  revision_id TEXT NOT NULL,
  id TEXT NOT NULL,
  code TEXT,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  fuel_type TEXT,
  displacement_cc INTEGER CHECK (displacement_cc IS NULL OR displacement_cc >= 0),
  power_hp INTEGER CHECK (power_hp IS NULL OR power_hp >= 0),
  power_kw INTEGER CHECK (power_kw IS NULL OR power_kw >= 0),
  torque_nm INTEGER CHECK (torque_nm IS NULL OR torque_nm >= 0),
  aspiration TEXT,
  cylinder_count INTEGER CHECK (cylinder_count IS NULL OR cylinder_count > 0),
  year_start INTEGER CHECK (year_start IS NULL OR year_start BETWEEN 1886 AND 2100),
  year_end INTEGER CHECK (year_end IS NULL OR (year_end BETWEEN 1886 AND 2100 AND (year_start IS NULL OR year_end >= year_start))),
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  source_key TEXT,
  source_file TEXT,
  source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id, id),
  UNIQUE (revision_id, normalized_name, code),
  FOREIGN KEY (revision_id) REFERENCES catalog_revisions(id)
);

CREATE TABLE IF NOT EXISTS catalog_transmissions (
  revision_id TEXT NOT NULL,
  id TEXT NOT NULL,
  code TEXT,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  transmission_type TEXT,
  gear_count INTEGER CHECK (gear_count IS NULL OR gear_count > 0),
  manufacturer TEXT,
  clutch_type TEXT,
  year_start INTEGER CHECK (year_start IS NULL OR year_start BETWEEN 1886 AND 2100),
  year_end INTEGER CHECK (year_end IS NULL OR (year_end BETWEEN 1886 AND 2100 AND (year_start IS NULL OR year_end >= year_start))),
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  source_key TEXT,
  source_file TEXT,
  source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id, id),
  UNIQUE (revision_id, normalized_name, code),
  FOREIGN KEY (revision_id) REFERENCES catalog_revisions(id)
);

CREATE TABLE IF NOT EXISTS catalog_generation_engines (
  id TEXT PRIMARY KEY,
  revision_id TEXT NOT NULL,
  generation_id TEXT NOT NULL,
  engine_id TEXT NOT NULL,
  year_start INTEGER CHECK (year_start IS NULL OR year_start BETWEEN 1886 AND 2100),
  year_end INTEGER CHECK (year_end IS NULL OR (year_end BETWEEN 1886 AND 2100 AND (year_start IS NULL OR year_end >= year_start))),
  source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')),
  source_file TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE (revision_id, generation_id, engine_id, year_start, year_end),
  FOREIGN KEY (revision_id, generation_id) REFERENCES catalog_generations(revision_id, id),
  FOREIGN KEY (revision_id, engine_id) REFERENCES catalog_engines(revision_id, id)
);

CREATE TABLE IF NOT EXISTS catalog_generation_transmissions (
  id TEXT PRIMARY KEY,
  revision_id TEXT NOT NULL,
  generation_id TEXT NOT NULL,
  transmission_id TEXT NOT NULL,
  year_start INTEGER CHECK (year_start IS NULL OR year_start BETWEEN 1886 AND 2100),
  year_end INTEGER CHECK (year_end IS NULL OR (year_end BETWEEN 1886 AND 2100 AND (year_start IS NULL OR year_end >= year_start))),
  source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')),
  source_file TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE (revision_id, generation_id, transmission_id, year_start, year_end),
  FOREIGN KEY (revision_id, generation_id) REFERENCES catalog_generations(revision_id, id),
  FOREIGN KEY (revision_id, transmission_id) REFERENCES catalog_transmissions(revision_id, id)
);

CREATE INDEX IF NOT EXISTS idx_catalog_state_published_revision ON catalog_state(published_revision_id);
CREATE INDEX IF NOT EXISTS idx_catalog_brands_active_sort ON catalog_brands(revision_id, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_catalog_models_brand ON catalog_models(revision_id, brand_id, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_catalog_generations_model ON catalog_generations(revision_id, model_id, year_start);
CREATE INDEX IF NOT EXISTS idx_catalog_engines_lookup ON catalog_engines(revision_id, normalized_name, code);
CREATE INDEX IF NOT EXISTS idx_catalog_transmissions_lookup ON catalog_transmissions(revision_id, normalized_name, code);
CREATE INDEX IF NOT EXISTS idx_catalog_generation_engines_generation ON catalog_generation_engines(revision_id, generation_id);
CREATE INDEX IF NOT EXISTS idx_catalog_generation_transmissions_generation ON catalog_generation_transmissions(revision_id, generation_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_catalog_generation_engines_scope ON catalog_generation_engines(revision_id, generation_id, engine_id, ifnull(year_start, -1), ifnull(year_end, -1));
CREATE UNIQUE INDEX IF NOT EXISTS uq_catalog_generation_transmissions_scope ON catalog_generation_transmissions(revision_id, generation_id, transmission_id, ifnull(year_start, -1), ifnull(year_end, -1));

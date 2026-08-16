-- Paket, donanım ve canonical araç varyantı snapshot katmanı. Veri seed/import
-- edilmez; eşleşmeyen paket-generation bağları import validator'ına bırakılır.

CREATE TABLE IF NOT EXISTS catalog_packages (
  revision_id TEXT NOT NULL,
  id TEXT NOT NULL,
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) > 0),
  normalized_name TEXT NOT NULL CHECK (length(trim(normalized_name)) > 0),
  code TEXT,
  description TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  source_key TEXT,
  source_file TEXT,
  source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id, id),
  FOREIGN KEY (revision_id) REFERENCES catalog_revisions(id)
);

CREATE TABLE IF NOT EXISTS catalog_equipment (
  revision_id TEXT NOT NULL,
  id TEXT NOT NULL,
  category TEXT,
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) > 0),
  normalized_name TEXT NOT NULL CHECK (length(trim(normalized_name)) > 0),
  description TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  source_key TEXT,
  source_file TEXT,
  source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id, id),
  FOREIGN KEY (revision_id) REFERENCES catalog_revisions(id)
);

CREATE TABLE IF NOT EXISTS catalog_generation_packages (
  id TEXT NOT NULL,
  revision_id TEXT NOT NULL,
  generation_id TEXT NOT NULL,
  package_id TEXT NOT NULL,
  year_start INTEGER CHECK (year_start IS NULL OR year_start BETWEEN 1886 AND 2100),
  year_end INTEGER CHECK (year_end IS NULL OR (year_end BETWEEN 1886 AND 2100 AND (year_start IS NULL OR year_end >= year_start))),
  body_type TEXT,
  source_key TEXT,
  source_file TEXT,
  source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id, id),
  FOREIGN KEY (revision_id, generation_id) REFERENCES catalog_generations(revision_id, id),
  FOREIGN KEY (revision_id, package_id) REFERENCES catalog_packages(revision_id, id)
);

CREATE TABLE IF NOT EXISTS catalog_package_equipment (
  revision_id TEXT NOT NULL,
  package_id TEXT NOT NULL,
  equipment_id TEXT NOT NULL,
  availability TEXT NOT NULL CHECK (availability IN ('standard','optional','unavailable','unknown')),
  standard INTEGER NOT NULL CHECK (standard IN (0,1)),
  notes TEXT,
  source_file TEXT,
  source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id, package_id, equipment_id),
  CHECK ((availability = 'standard' AND standard = 1) OR (availability != 'standard' AND standard = 0)),
  FOREIGN KEY (revision_id, package_id) REFERENCES catalog_packages(revision_id, id),
  FOREIGN KEY (revision_id, equipment_id) REFERENCES catalog_equipment(revision_id, id)
);

CREATE TABLE IF NOT EXISTS catalog_vehicle_variants (
  revision_id TEXT NOT NULL,
  id TEXT NOT NULL,
  generation_id TEXT NOT NULL,
  engine_id TEXT,
  transmission_id TEXT,
  package_id TEXT,
  model_year INTEGER CHECK (model_year IS NULL OR model_year BETWEEN 1886 AND 2100),
  year_start INTEGER CHECK (year_start IS NULL OR year_start BETWEEN 1886 AND 2100),
  year_end INTEGER CHECK (year_end IS NULL OR (year_end BETWEEN 1886 AND 2100 AND (year_start IS NULL OR year_end >= year_start))),
  body_type TEXT,
  drivetrain TEXT,
  fuel_type_override TEXT,
  power_hp_override INTEGER CHECK (power_hp_override IS NULL OR power_hp_override >= 0),
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) > 0),
  normalized_name TEXT NOT NULL CHECK (length(trim(normalized_name)) > 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  source_key TEXT,
  source_file TEXT,
  source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')),
  legacy_vehicle_key TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id, id),
  FOREIGN KEY (revision_id, generation_id) REFERENCES catalog_generations(revision_id, id),
  FOREIGN KEY (revision_id, engine_id) REFERENCES catalog_engines(revision_id, id),
  FOREIGN KEY (revision_id, transmission_id) REFERENCES catalog_transmissions(revision_id, id),
  FOREIGN KEY (revision_id, package_id) REFERENCES catalog_packages(revision_id, id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_catalog_generation_packages_scope ON catalog_generation_packages(revision_id, generation_id, package_id, ifnull(year_start, -1), ifnull(year_end, -1), ifnull(body_type, ''));
CREATE INDEX IF NOT EXISTS idx_catalog_packages_lookup ON catalog_packages(revision_id, normalized_name);
CREATE INDEX IF NOT EXISTS idx_catalog_equipment_lookup ON catalog_equipment(revision_id, category, normalized_name);
CREATE INDEX IF NOT EXISTS idx_catalog_generation_packages_generation ON catalog_generation_packages(revision_id, generation_id);
CREATE INDEX IF NOT EXISTS idx_catalog_package_equipment_package ON catalog_package_equipment(revision_id, package_id);
CREATE INDEX IF NOT EXISTS idx_catalog_vehicle_variants_generation ON catalog_vehicle_variants(revision_id, generation_id);
CREATE INDEX IF NOT EXISTS idx_catalog_vehicle_variants_engine ON catalog_vehicle_variants(revision_id, engine_id);
CREATE INDEX IF NOT EXISTS idx_catalog_vehicle_variants_transmission ON catalog_vehicle_variants(revision_id, transmission_id);
CREATE INDEX IF NOT EXISTS idx_catalog_vehicle_variants_package ON catalog_vehicle_variants(revision_id, package_id);
CREATE INDEX IF NOT EXISTS idx_catalog_vehicle_variants_legacy_key ON catalog_vehicle_variants(revision_id, legacy_vehicle_key);
CREATE INDEX IF NOT EXISTS idx_catalog_vehicle_variants_active ON catalog_vehicle_variants(revision_id, active, generation_id);

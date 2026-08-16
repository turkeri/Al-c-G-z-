-- Sorun, bakım ve değerleme snapshot katmanı. Veri import/seed edilmez.

CREATE TABLE IF NOT EXISTS catalog_problem_archetypes (
  revision_id TEXT NOT NULL, id TEXT NOT NULL, code TEXT,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0), normalized_title TEXT NOT NULL CHECK (length(trim(normalized_title)) > 0), category TEXT,
  default_severity TEXT NOT NULL DEFAULT 'unknown' CHECK (default_severity IN ('low','medium','high','critical','unknown')),
  summary TEXT, diagnostic_guidance TEXT, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  source_key TEXT, source_file TEXT, source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')),
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id,id), FOREIGN KEY (revision_id) REFERENCES catalog_revisions(id)
);

CREATE TABLE IF NOT EXISTS catalog_problem_applicability (
  revision_id TEXT NOT NULL, id TEXT NOT NULL, problem_archetype_id TEXT, generation_id TEXT, engine_id TEXT, transmission_id TEXT, package_id TEXT, vehicle_variant_id TEXT,
  fuel_type_filter TEXT, transmission_type_filter TEXT, title_override TEXT, description_override TEXT, severity_override TEXT CHECK (severity_override IS NULL OR severity_override IN ('low','medium','high','critical','unknown')),
  symptoms_json TEXT, checks_json TEXT, repair_guidance TEXT,
  confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (confidence IN ('high','medium','low','unknown')),
  evidence_status TEXT NOT NULL DEFAULT 'unverified' CHECK (evidence_status IN ('unverified','reviewed','verified','rejected')),
  source_key TEXT, source_file TEXT, legacy_vehicle_key TEXT, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)), created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id,id),
  CHECK (problem_archetype_id IS NOT NULL OR generation_id IS NOT NULL OR engine_id IS NOT NULL OR transmission_id IS NOT NULL OR package_id IS NOT NULL OR vehicle_variant_id IS NOT NULL OR fuel_type_filter IS NOT NULL OR transmission_type_filter IS NOT NULL),
  FOREIGN KEY (revision_id,problem_archetype_id) REFERENCES catalog_problem_archetypes(revision_id,id), FOREIGN KEY (revision_id,generation_id) REFERENCES catalog_generations(revision_id,id), FOREIGN KEY (revision_id,engine_id) REFERENCES catalog_engines(revision_id,id), FOREIGN KEY (revision_id,transmission_id) REFERENCES catalog_transmissions(revision_id,id), FOREIGN KEY (revision_id,package_id) REFERENCES catalog_packages(revision_id,id), FOREIGN KEY (revision_id,vehicle_variant_id) REFERENCES catalog_vehicle_variants(revision_id,id)
);

CREATE TABLE IF NOT EXISTS catalog_maintenance_items (
  revision_id TEXT NOT NULL, id TEXT NOT NULL, code TEXT, title TEXT NOT NULL CHECK (length(trim(title)) > 0), normalized_title TEXT NOT NULL CHECK (length(trim(normalized_title)) > 0), category TEXT, description TEXT,
  default_interval_km INTEGER CHECK (default_interval_km IS NULL OR default_interval_km > 0), default_interval_months INTEGER CHECK (default_interval_months IS NULL OR default_interval_months > 0), priority TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)), source_key TEXT, source_file TEXT, source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')), created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id,id), FOREIGN KEY (revision_id) REFERENCES catalog_revisions(id)
);

CREATE TABLE IF NOT EXISTS catalog_maintenance_applicability (
  revision_id TEXT NOT NULL, id TEXT NOT NULL, maintenance_item_id TEXT NOT NULL,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('global','filtered','vehicle')), generation_id TEXT, engine_id TEXT, transmission_id TEXT, package_id TEXT, vehicle_variant_id TEXT, fuel_type_filter TEXT,
  interval_km_override INTEGER CHECK (interval_km_override IS NULL OR interval_km_override > 0), interval_months_override INTEGER CHECK (interval_months_override IS NULL OR interval_months_override > 0),
  year_start INTEGER CHECK (year_start IS NULL OR year_start BETWEEN 1886 AND 2100), year_end INTEGER CHECK (year_end IS NULL OR (year_end BETWEEN 1886 AND 2100 AND (year_start IS NULL OR year_end >= year_start))), notes TEXT,
  confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (confidence IN ('high','medium','low','unknown')), source_key TEXT, source_file TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id,id),
  CHECK ((scope_type = 'global' AND generation_id IS NULL AND engine_id IS NULL AND transmission_id IS NULL AND package_id IS NULL AND vehicle_variant_id IS NULL AND fuel_type_filter IS NULL) OR (scope_type = 'filtered' AND (fuel_type_filter IS NOT NULL OR generation_id IS NOT NULL OR engine_id IS NOT NULL OR transmission_id IS NOT NULL OR package_id IS NOT NULL OR vehicle_variant_id IS NOT NULL)) OR (scope_type = 'vehicle' AND (generation_id IS NOT NULL OR engine_id IS NOT NULL OR transmission_id IS NOT NULL OR package_id IS NOT NULL OR vehicle_variant_id IS NOT NULL))),
  FOREIGN KEY (revision_id,maintenance_item_id) REFERENCES catalog_maintenance_items(revision_id,id), FOREIGN KEY (revision_id,generation_id) REFERENCES catalog_generations(revision_id,id), FOREIGN KEY (revision_id,engine_id) REFERENCES catalog_engines(revision_id,id), FOREIGN KEY (revision_id,transmission_id) REFERENCES catalog_transmissions(revision_id,id), FOREIGN KEY (revision_id,package_id) REFERENCES catalog_packages(revision_id,id), FOREIGN KEY (revision_id,vehicle_variant_id) REFERENCES catalog_vehicle_variants(revision_id,id)
);

CREATE TABLE IF NOT EXISTS catalog_reference_values (
  revision_id TEXT NOT NULL, id TEXT NOT NULL, vehicle_variant_id TEXT, generation_id TEXT, engine_id TEXT, transmission_id TEXT, package_id TEXT, model_year INTEGER CHECK (model_year IS NULL OR model_year BETWEEN 1886 AND 2100),
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0), currency TEXT NOT NULL DEFAULT 'TRY' CHECK (currency GLOB '[A-Z][A-Z][A-Z]'), value_type TEXT NOT NULL CHECK (value_type IN ('reference','asking_median','transaction_estimate','manual','imported_legacy')),
  effective_at INTEGER NOT NULL, valid_until INTEGER CHECK (valid_until IS NULL OR valid_until >= effective_at), mileage_min INTEGER CHECK (mileage_min IS NULL OR mileage_min >= 0), mileage_max INTEGER CHECK (mileage_max IS NULL OR (mileage_max >= 0 AND (mileage_min IS NULL OR mileage_max >= mileage_min))),
  source_name TEXT, source_url TEXT, source_observed_at INTEGER, confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (confidence IN ('high','medium','low','unknown')), source_key TEXT, source_file TEXT, active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)), created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id,id), CHECK (vehicle_variant_id IS NOT NULL OR generation_id IS NOT NULL),
  FOREIGN KEY (revision_id,vehicle_variant_id) REFERENCES catalog_vehicle_variants(revision_id,id), FOREIGN KEY (revision_id,generation_id) REFERENCES catalog_generations(revision_id,id), FOREIGN KEY (revision_id,engine_id) REFERENCES catalog_engines(revision_id,id), FOREIGN KEY (revision_id,transmission_id) REFERENCES catalog_transmissions(revision_id,id), FOREIGN KEY (revision_id,package_id) REFERENCES catalog_packages(revision_id,id)
);

CREATE TABLE IF NOT EXISTS catalog_valuation_factors (
  revision_id TEXT NOT NULL, id TEXT NOT NULL, factor_type TEXT NOT NULL, factor_key TEXT NOT NULL, display_name TEXT NOT NULL CHECK (length(trim(display_name)) > 0), numeric_value REAL, value_json TEXT, unit TEXT, description TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)), source_key TEXT, source_file TEXT, source_confidence TEXT NOT NULL DEFAULT 'unknown' CHECK (source_confidence IN ('high','medium','low','unknown')), created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  PRIMARY KEY (revision_id,id), UNIQUE (revision_id,factor_type,factor_key), CHECK (numeric_value IS NOT NULL OR value_json IS NOT NULL), FOREIGN KEY (revision_id) REFERENCES catalog_revisions(id)
);

CREATE INDEX IF NOT EXISTS idx_catalog_problem_archetypes_lookup ON catalog_problem_archetypes(revision_id,category,normalized_title);
CREATE INDEX IF NOT EXISTS idx_catalog_problem_applicability_generation ON catalog_problem_applicability(revision_id,generation_id,active);
CREATE INDEX IF NOT EXISTS idx_catalog_problem_applicability_engine ON catalog_problem_applicability(revision_id,engine_id,active);
CREATE INDEX IF NOT EXISTS idx_catalog_problem_applicability_transmission ON catalog_problem_applicability(revision_id,transmission_id,active);
CREATE INDEX IF NOT EXISTS idx_catalog_problem_applicability_package ON catalog_problem_applicability(revision_id,package_id,active);
CREATE INDEX IF NOT EXISTS idx_catalog_problem_applicability_variant ON catalog_problem_applicability(revision_id,vehicle_variant_id,active,evidence_status);
CREATE INDEX IF NOT EXISTS idx_catalog_maintenance_applicability_item ON catalog_maintenance_applicability(revision_id,maintenance_item_id);
CREATE INDEX IF NOT EXISTS idx_catalog_maintenance_applicability_generation ON catalog_maintenance_applicability(revision_id,generation_id);
CREATE INDEX IF NOT EXISTS idx_catalog_maintenance_applicability_variant ON catalog_maintenance_applicability(revision_id,vehicle_variant_id);
CREATE INDEX IF NOT EXISTS idx_catalog_reference_values_variant ON catalog_reference_values(revision_id,vehicle_variant_id,effective_at);
CREATE INDEX IF NOT EXISTS idx_catalog_reference_values_generation ON catalog_reference_values(revision_id,generation_id,model_year);

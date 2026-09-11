-- CloudOS initial schema
-- Run this in Supabase SQL editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- CERTIFICATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  vendor        TEXT,
  status        TEXT NOT NULL DEFAULT 'planned'  CHECK (status IN ('planned', 'in_progress', 'completed', 'failed')),
  target_date   DATE,
  passed_date   DATE,
  cost_usd      NUMERIC(10,2),
  badge_url     TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  repo_url      TEXT,
  live_url      TEXT,
  tech_stack    TEXT[] DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 8-step project checklist
CREATE TABLE IF NOT EXISTS project_checklist (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item          TEXT NOT NULL,
  "order"       INT NOT NULL DEFAULT 0,
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- LEARNING TRACKS (Python / Bash / Nuxt / Cloud)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_tracks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track       TEXT NOT NULL CHECK (track IN ('python', 'bash', 'nuxt', 'cloud')),
  title       TEXT NOT NULL,
  content     TEXT,              -- notes / explanation
  resources   TEXT[] DEFAULT '{}',-- URLs
  status      TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- JOB APPLICATIONS (Kanban pipeline)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company       TEXT NOT NULL,
  role          TEXT NOT NULL,
  stage         TEXT NOT NULL DEFAULT 'saved'
                  CHECK (stage IN ('saved', 'applied', 'screening', 'interview', 'offer', 'rejected')),
  job_url       TEXT,
  applied_date  DATE,
  salary_range  TEXT,
  contact_name  TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Application events / interview notes
CREATE TABLE IF NOT EXISTS application_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL, -- e.g. 'phone_screen', 'technical', 'offer_received'
  event_date      DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- FINANCIAL RUNWAY
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial_snapshots (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date         DATE NOT NULL,
  savings_ksh           NUMERIC(12,2),
  monthly_burn_ksh      NUMERIC(10,2),
  monthly_income_ksh    NUMERIC(10,2) DEFAULT 0,
  monthly_burn          NUMERIC(10,2),  -- alias for compatibility
  months_remaining      NUMERIC(5,1),
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- DAILY OUTPUT LOG
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date      DATE NOT NULL UNIQUE,
  outputs       TEXT[] DEFAULT '{}',   -- what did you ship/learn today?
  energy_level  INT CHECK (energy_level BETWEEN 1 AND 5),
  mood          TEXT,
  blockers      TEXT,
  next_focus    TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- CHECKPOINT GATES (Month 3, 6, 9, 10)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checkpoints (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month           INT NOT NULL UNIQUE CHECK (month IN (3, 6, 9, 10)),
  status          TEXT NOT NULL DEFAULT 'not_started'
                    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  criteria_met    BOOLEAN[] DEFAULT '{}',   -- parallel array to hardcoded criteria
  completed_date  DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- CASE STUDIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_studies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  summary     TEXT,
  challenge   TEXT,
  solution    TEXT,
  outcome     TEXT,
  tags        TEXT[] DEFAULT '{}',
  published   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security (RLS)
-- Single-user app — enable RLS and allow authenticated users full access
-- ─────────────────────────────────────────────────────────────
ALTER TABLE certifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_checklist    ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_tracks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_snapshots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints          ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies         ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read/write their data
DO $$ BEGIN
  CREATE POLICY "auth_all" ON certifications      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  CREATE POLICY "auth_all" ON projects            FOR ALL TO authenticated USING (true) WITH CHECK (true);
  CREATE POLICY "auth_all" ON project_checklist   FOR ALL TO authenticated USING (true) WITH CHECK (true);
  CREATE POLICY "auth_all" ON learning_tracks     FOR ALL TO authenticated USING (true) WITH CHECK (true);
  CREATE POLICY "auth_all" ON applications        FOR ALL TO authenticated USING (true) WITH CHECK (true);
  CREATE POLICY "auth_all" ON application_events  FOR ALL TO authenticated USING (true) WITH CHECK (true);
  CREATE POLICY "auth_all" ON financial_snapshots FOR ALL TO authenticated USING (true) WITH CHECK (true);
  CREATE POLICY "auth_all" ON daily_logs          FOR ALL TO authenticated USING (true) WITH CHECK (true);
  CREATE POLICY "auth_all" ON checkpoints         FOR ALL TO authenticated USING (true) WITH CHECK (true);
  CREATE POLICY "auth_all" ON case_studies        FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'certifications', 'projects', 'learning_tracks',
    'applications', 'daily_logs', 'checkpoints', 'case_studies'
  ] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_updated_at ON %I;
      CREATE TRIGGER trg_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    ', t, t);
  END LOOP;
END $$;

-- CloudOS security hardening
-- Run in Supabase SQL editor after 001_initial_schema.sql

-- ─────────────────────────────────────────────────────────────
-- 1. Add user_id to all tables (single-owner per row)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE certifications       ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE projects             ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE project_checklist    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE learning_tracks      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE applications         ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE application_events   ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE financial_snapshots  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE daily_logs           ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE checkpoints          ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE case_studies         ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────
-- 2. Backfill user_id for existing rows (set to the current owner)
--    Replace <YOUR_USER_UUID> with your auth.users id from the
--    Supabase dashboard → Authentication → Users tab.
-- ─────────────────────────────────────────────────────────────
-- UPDATE certifications       SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
-- UPDATE projects             SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
-- UPDATE project_checklist    SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
-- UPDATE learning_tracks      SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
-- UPDATE applications         SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
-- UPDATE application_events   SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
-- UPDATE financial_snapshots  SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
-- UPDATE daily_logs           SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
-- UPDATE checkpoints          SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
-- UPDATE case_studies         SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;

-- ─────────────────────────────────────────────────────────────
-- 3. Drop the broad "auth_all" policies
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "auth_all" ON certifications;
  DROP POLICY IF EXISTS "auth_all" ON projects;
  DROP POLICY IF EXISTS "auth_all" ON project_checklist;
  DROP POLICY IF EXISTS "auth_all" ON learning_tracks;
  DROP POLICY IF EXISTS "auth_all" ON applications;
  DROP POLICY IF EXISTS "auth_all" ON application_events;
  DROP POLICY IF EXISTS "auth_all" ON financial_snapshots;
  DROP POLICY IF EXISTS "auth_all" ON daily_logs;
  DROP POLICY IF EXISTS "auth_all" ON checkpoints;
  DROP POLICY IF EXISTS "auth_all" ON case_studies;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 4. Create strict user-scoped RLS policies
--    Each user can only see and modify their own rows.
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  -- certifications
  CREATE POLICY "owner_only" ON certifications
    FOR ALL TO authenticated
    USING      (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  -- projects
  CREATE POLICY "owner_only" ON projects
    FOR ALL TO authenticated
    USING      (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  -- project_checklist (via parent project ownership)
  CREATE POLICY "owner_only" ON project_checklist
    FOR ALL TO authenticated
    USING      (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  -- learning_tracks
  CREATE POLICY "owner_only" ON learning_tracks
    FOR ALL TO authenticated
    USING      (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  -- applications
  CREATE POLICY "owner_only" ON applications
    FOR ALL TO authenticated
    USING      (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  -- application_events
  CREATE POLICY "owner_only" ON application_events
    FOR ALL TO authenticated
    USING      (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  -- financial_snapshots
  CREATE POLICY "owner_only" ON financial_snapshots
    FOR ALL TO authenticated
    USING      (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  -- daily_logs
  CREATE POLICY "owner_only" ON daily_logs
    FOR ALL TO authenticated
    USING      (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  -- checkpoints
  CREATE POLICY "owner_only" ON checkpoints
    FOR ALL TO authenticated
    USING      (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  -- case_studies
  CREATE POLICY "owner_only" ON case_studies
    FOR ALL TO authenticated
    USING      (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 5. Disable public sign-ups (single-user app)
--    Do this in the Supabase dashboard instead:
--    Authentication → Providers → Email → "Enable Email Provider"
--    → uncheck "Confirm email" and turn off "Sign-ups" toggle.
-- ─────────────────────────────────────────────────────────────

-- Migration: 0154_add_missing_columns.sql
-- Description: Add missing columns to existing tables

-- events: Add venue_id for venue reference
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);

-- events: Add additional columns used by clone_event function
ALTER TABLE events ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS doors_time TIME;
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_time TIME;
ALTER TABLE events ADD COLUMN IF NOT EXISTS age_restriction TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS categories TEXT[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS refund_policy TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS terms_conditions TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS parking_info TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS accessibility_info TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS production_id UUID REFERENCES productions(id) ON DELETE SET NULL;

-- deals: Add name column for compatibility
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'name') THEN
    ALTER TABLE deals ADD COLUMN name TEXT;
    UPDATE deals SET name = title WHERE name IS NULL;
  END IF;
END $$;

-- crew_members: Add full_name column
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS full_name TEXT;
UPDATE crew_members SET full_name = COALESCE(first_name || ' ' || last_name, first_name, last_name, 'Unknown') WHERE full_name IS NULL;

-- crew_members: Add other missing columns
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2);
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS total_projects INT DEFAULT 0;

-- invoices: Add paid_at column
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- tickets: Add user_id column if missing
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES platform_users(id);

-- notification_preferences: Add missing columns
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS preferences_by_type JSONB DEFAULT '{}';

-- platform_users: Add first_name, last_name if missing
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS last_name TEXT;

-- assets: Add name and status columns if missing
ALTER TABLE assets ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';

-- projects: Add description and status columns if missing
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- production_contacts: Ensure contact_id column exists
ALTER TABLE production_contacts ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id);

-- entity_comments: Add user_name column
ALTER TABLE entity_comments ADD COLUMN IF NOT EXISTS user_name TEXT;

-- version_snapshots: Create if not exists
CREATE TABLE IF NOT EXISTS version_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  created_by UUID REFERENCES platform_users(id),
  created_by_name TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE version_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY version_snapshots_select ON version_snapshots FOR SELECT USING (TRUE);
CREATE POLICY version_snapshots_insert ON version_snapshots FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
GRANT SELECT, INSERT ON version_snapshots TO authenticated;

-- change_requests: Create if not exists
CREATE TABLE IF NOT EXISTS change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES platform_users(id),
  requested_by_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  change_type TEXT DEFAULT 'scope',
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS change_requests_select ON change_requests;
DROP POLICY IF EXISTS change_requests_manage ON change_requests;
CREATE POLICY change_requests_select ON change_requests FOR SELECT USING (TRUE);
CREATE POLICY change_requests_manage ON change_requests FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
GRANT SELECT, INSERT, UPDATE ON change_requests TO authenticated;

-- discounts: Create if not exists
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC(10,2) NOT NULL,
  min_purchase NUMERIC(10,2),
  max_uses INT,
  current_uses INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS discounts_select ON discounts;
CREATE POLICY discounts_select ON discounts FOR SELECT USING (TRUE);
GRANT SELECT, INSERT, UPDATE ON discounts TO authenticated;

-- wallets: Create if not exists
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  auto_reload_enabled BOOLEAN DEFAULT FALSE,
  auto_reload_threshold NUMERIC(10,2),
  auto_reload_amount NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wallets_select ON wallets;
CREATE POLICY wallets_select ON wallets FOR SELECT USING (user_id = (SELECT auth.uid()));
GRANT SELECT, INSERT, UPDATE ON wallets TO authenticated;

-- referrals: Add missing columns
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referred_user_id UUID REFERENCES platform_users(id);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMPTZ;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS reward_amount NUMERIC(10,2);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS referrals_select ON referrals;
CREATE POLICY referrals_select ON referrals FOR SELECT USING (referrer_id = (SELECT auth.uid()) OR referred_user_id = (SELECT auth.uid()));
GRANT SELECT, INSERT, UPDATE ON referrals TO authenticated;

-- workflow_assignments: Add columns if missing
ALTER TABLE workflow_assignments ADD COLUMN IF NOT EXISTS current_step INT DEFAULT 0;
ALTER TABLE workflow_assignments ADD COLUMN IF NOT EXISTS total_steps INT DEFAULT 1;

-- sops: Create if not exists
CREATE TABLE IF NOT EXISTS sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sop_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sop_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id),
  step_id UUID REFERENCES sop_steps(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- blueprints: Create if not exists
CREATE TABLE IF NOT EXISTS blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  blueprint_type TEXT,
  data JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS blueprints_select ON blueprints;
CREATE POLICY blueprints_select ON blueprints FOR SELECT USING (org_matches(organization_id));
GRANT SELECT, INSERT, UPDATE, DELETE ON blueprints TO authenticated;

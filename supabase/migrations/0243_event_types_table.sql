-- Migration: 0243_event_types_table.sql
-- Description: Create event_types table for categorizing bookings/events

-- Event types table
CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  default_duration_hours INTEGER DEFAULT 4,
  requires_approval BOOLEAN DEFAULT false,
  min_lead_time_days INTEGER DEFAULT 0,
  max_capacity INTEGER,
  default_setup_time_minutes INTEGER DEFAULT 60,
  default_teardown_time_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_types_organization ON event_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_event_types_is_active ON event_types(is_active);
CREATE INDEX IF NOT EXISTS idx_event_types_name ON event_types(name);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_event_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_event_types_updated_at ON event_types;
CREATE TRIGGER trigger_event_types_updated_at
  BEFORE UPDATE ON event_types
  FOR EACH ROW
  EXECUTE FUNCTION update_event_types_updated_at();

-- RLS Policies
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view event types in their organization" ON event_types;
CREATE POLICY "Users can view event types in their organization" ON event_types
  FOR SELECT USING (org_matches(organization_id));

DROP POLICY IF EXISTS "Admins can manage event types" ON event_types;
CREATE POLICY "Admins can manage event types" ON event_types
  FOR ALL USING (org_matches(organization_id));

-- Service role bypass
DROP POLICY IF EXISTS "Service role has full access to event_types" ON event_types;
CREATE POLICY "Service role has full access to event_types" ON event_types
  FOR ALL USING (auth.role() = 'service_role');

-- Note: contract_templates columns are added in migration 0252_v3_contracts.sql

-- Grant permissions
GRANT ALL ON event_types TO authenticated;
GRANT ALL ON event_types TO service_role;

COMMENT ON TABLE event_types IS 'Event types for categorizing bookings and events with default settings';

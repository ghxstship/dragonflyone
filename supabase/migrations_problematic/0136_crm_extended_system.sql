-- Migration: CRM Extended System
-- Description: Tables for marketing attribution, territory management, and activity tracking

-- Attribution events
CREATE TABLE IF NOT EXISTS attribution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  contact_id UUID REFERENCES contacts(id),
  deal_id UUID REFERENCES deals(id),
  user_id UUID REFERENCES platform_users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'form_submit', 'email_open', 'email_click', 'ad_click', 'social_click', 'referral', 'conversion')),
  source TEXT NOT NULL,
  medium TEXT,
  campaign TEXT,
  content TEXT,
  term TEXT,
  referrer TEXT,
  landing_page TEXT,
  value NUMERIC(12,2),
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attribution_events_contact ON attribution_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_attribution_events_deal ON attribution_events(deal_id);
CREATE INDEX IF NOT EXISTS idx_attribution_events_source ON attribution_events(source);
CREATE INDEX IF NOT EXISTS idx_attribution_events_campaign ON attribution_events(campaign);
CREATE INDEX IF NOT EXISTS idx_attribution_events_type ON attribution_events(event_type);
CREATE INDEX IF NOT EXISTS idx_attribution_events_created ON attribution_events(created_at);

-- Territories
CREATE TABLE IF NOT EXISTS territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('geographic', 'industry', 'account_size', 'product', 'custom')),
  criteria JSONB NOT NULL DEFAULT '{}',
  assigned_to UUID REFERENCES platform_users(id),
  team_id UUID REFERENCES teams(id),
  quota NUMERIC(12,2),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_territories_org ON territories(organization_id);
CREATE INDEX IF NOT EXISTS idx_territories_assigned ON territories(assigned_to);
CREATE INDEX IF NOT EXISTS idx_territories_active ON territories(is_active);

-- Account assignments
CREATE TABLE IF NOT EXISTS account_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id),
  organization_id UUID REFERENCES organizations(id),
  territory_id UUID NOT NULL REFERENCES territories(id),
  assigned_to UUID NOT NULL REFERENCES platform_users(id),
  assignment_type TEXT DEFAULT 'primary' CHECK (assignment_type IN ('primary', 'secondary', 'overlay')),
  effective_date DATE,
  expiration_date DATE,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contact_id, organization_id, assignment_type)
);

CREATE INDEX IF NOT EXISTS idx_account_assignments_contact ON account_assignments(contact_id);
CREATE INDEX IF NOT EXISTS idx_account_assignments_org ON account_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_account_assignments_territory ON account_assignments(territory_id);
CREATE INDEX IF NOT EXISTS idx_account_assignments_assigned ON account_assignments(assigned_to);

-- Activity log for CRM
CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  contact_id UUID REFERENCES contacts(id),
  deal_id UUID REFERENCES deals(id),
  organization_id UUID REFERENCES organizations(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'task', 'demo', 'proposal', 'contract', 'other')),
  subject TEXT NOT NULL,
  description TEXT,
  outcome TEXT,
  duration_minutes INT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_user ON crm_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact ON crm_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_deal ON crm_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_type ON crm_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created ON crm_activities(created_at);

-- Custom fields
CREATE TABLE IF NOT EXISTS custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'organization', 'deal', 'project', 'asset')),
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'datetime', 'boolean', 'select', 'multiselect', 'url', 'email', 'phone', 'currency', 'percent')),
  options JSONB,
  default_value TEXT,
  is_required BOOLEAN DEFAULT false,
  is_searchable BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_fields_org ON custom_fields(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_entity ON custom_fields(entity_type);

-- Custom field values
CREATE TABLE IF NOT EXISTS custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(field_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_custom_field_values_field ON custom_field_values(field_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_entity ON custom_field_values(entity_id);

-- Duplicate detection rules
CREATE TABLE IF NOT EXISTS duplicate_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'organization')),
  name TEXT NOT NULL,
  match_fields TEXT[] NOT NULL,
  match_type TEXT DEFAULT 'exact' CHECK (match_type IN ('exact', 'fuzzy', 'phonetic')),
  threshold NUMERIC(3,2) DEFAULT 0.8,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Duplicate candidates
CREATE TABLE IF NOT EXISTS duplicate_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES duplicate_rules(id),
  entity_type TEXT NOT NULL,
  entity_id_1 UUID NOT NULL,
  entity_id_2 UUID NOT NULL,
  match_score NUMERIC(3,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'merged', 'not_duplicate', 'ignored')),
  resolved_by UUID REFERENCES platform_users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_duplicate_candidates_status ON duplicate_candidates(status);
CREATE INDEX IF NOT EXISTS idx_duplicate_candidates_entity ON duplicate_candidates(entity_type, entity_id_1);

-- Win/loss analysis
CREATE TABLE IF NOT EXISTS win_loss_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id),
  outcome TEXT NOT NULL CHECK (outcome IN ('won', 'lost')),
  primary_reason TEXT,
  secondary_reasons TEXT[],
  competitor_id UUID,
  competitor_name TEXT,
  price_comparison TEXT CHECK (price_comparison IN ('lower', 'same', 'higher', 'unknown')),
  decision_factors JSONB,
  lessons_learned TEXT,
  follow_up_actions TEXT,
  analyzed_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_win_loss_analyses_deal ON win_loss_analyses(deal_id);
CREATE INDEX IF NOT EXISTS idx_win_loss_analyses_outcome ON win_loss_analyses(outcome);

-- Function to calculate attribution
CREATE OR REPLACE FUNCTION calculate_attribution(
  p_contact_id UUID,
  p_model TEXT DEFAULT 'last_touch'
)
RETURNS TABLE (
  source TEXT,
  campaign TEXT,
  attributed_value NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_value NUMERIC;
BEGIN
  -- Get total conversion value
  SELECT COALESCE(SUM(value), 0) INTO v_total_value
  FROM attribution_events
  WHERE contact_id = p_contact_id AND event_type = 'conversion';
  
  IF p_model = 'first_touch' THEN
    RETURN QUERY
    SELECT e.source, e.campaign, v_total_value as attributed_value
    FROM attribution_events e
    WHERE e.contact_id = p_contact_id
    ORDER BY e.created_at ASC
    LIMIT 1;
  ELSIF p_model = 'last_touch' THEN
    RETURN QUERY
    SELECT e.source, e.campaign, v_total_value as attributed_value
    FROM attribution_events e
    WHERE e.contact_id = p_contact_id AND e.event_type != 'conversion'
    ORDER BY e.created_at DESC
    LIMIT 1;
  ELSIF p_model = 'linear' THEN
    RETURN QUERY
    SELECT e.source, e.campaign, 
           v_total_value / COUNT(*) OVER () as attributed_value
    FROM attribution_events e
    WHERE e.contact_id = p_contact_id AND e.event_type != 'conversion'
    GROUP BY e.source, e.campaign;
  END IF;
END;
$$;

-- Function to find duplicates
CREATE OR REPLACE FUNCTION find_duplicate_contacts(
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_name TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  match_type TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.email, c.first_name, c.last_name, c.phone,
         CASE 
           WHEN c.email = p_email THEN 'email'
           WHEN c.phone = p_phone THEN 'phone'
           ELSE 'name'
         END as match_type
  FROM contacts c
  WHERE c.email = p_email
     OR (p_phone IS NOT NULL AND c.phone = p_phone)
     OR (p_name IS NOT NULL AND CONCAT(c.first_name, ' ', c.last_name) ILIKE '%' || p_name || '%');
END;
$$;

-- RLS policies
ALTER TABLE attribution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE win_loss_analyses ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT ON attribution_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON territories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON account_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON crm_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON custom_fields TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON custom_field_values TO authenticated;
GRANT SELECT, INSERT, UPDATE ON duplicate_rules TO authenticated;
GRANT SELECT, INSERT, UPDATE ON duplicate_candidates TO authenticated;
GRANT SELECT, INSERT ON win_loss_analyses TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_attribution(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION find_duplicate_contacts(TEXT, TEXT, TEXT) TO authenticated;

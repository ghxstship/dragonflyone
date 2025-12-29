-- ============================================================================
-- 0031_compvss_extended_ops.sql
-- COMPVSS Extended Operations - Bids, Build/Strike, Access, Travel, Weather
-- GHXSTSHIP Platform - 100% COMPVSS Feature Coverage
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENUM TYPES
-- ============================================================================

CREATE TYPE bid_status AS ENUM ('draft', 'submitted', 'under_review', 'shortlisted', 'awarded', 'rejected', 'withdrawn');
CREATE TYPE production_phase AS ENUM ('planning', 'load_in', 'build', 'rehearsal', 'show', 'strike', 'load_out', 'complete');
CREATE TYPE access_status AS ENUM ('pending', 'approved', 'active', 'expired', 'revoked', 'denied');
CREATE TYPE weather_severity AS ENUM ('clear', 'watch', 'advisory', 'warning', 'emergency');

-- ============================================================================
-- SECTION 2: BID PORTAL
-- ============================================================================

CREATE TABLE bid_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status bid_status NOT NULL DEFAULT 'draft',
  scope_of_work TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  budget_range_min NUMERIC(14,2),
  budget_range_max NUMERIC(14,2),
  submission_deadline TIMESTAMPTZ NOT NULL,
  decision_date DATE,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES platform_users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bid_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES bid_opportunities(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES procurement_vendors(id) ON DELETE CASCADE,
  status bid_status NOT NULL DEFAULT 'draft',
  proposed_amount NUMERIC(14,2),
  proposal_summary TEXT,
  timeline JSONB DEFAULT '{}'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ,
  score NUMERIC(5,2),
  is_winner BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(opportunity_id, vendor_id)
);

-- ============================================================================
-- SECTION 3: BUILD/STRIKE & STAGE MANAGEMENT
-- ============================================================================

CREATE TABLE production_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phase production_phase NOT NULL,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  location_id UUID REFERENCES legend_places(id),
  department TEXT,
  crew_required INTEGER,
  tasks JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'scheduled',
  supervisor_id UUID REFERENCES workforce_employees(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stage_plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES legend_people(id),
  name TEXT NOT NULL,
  description TEXT,
  stage_dimensions JSONB,
  elements JSONB DEFAULT '[]'::jsonb,
  input_list JSONB DEFAULT '[]'::jsonb,
  monitor_mix JSONB DEFAULT '[]'::jsonb,
  backline JSONB DEFAULT '[]'::jsonb,
  diagram_url TEXT,
  version TEXT DEFAULT '1.0',
  is_current BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 4: SITE ACCESS & VIP MANAGEMENT
-- ============================================================================

CREATE TABLE access_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  person_id UUID REFERENCES legend_people(id),
  employee_id UUID REFERENCES workforce_employees(id),
  pass_type TEXT NOT NULL,
  pass_number TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  photo_url TEXT,
  status access_status NOT NULL DEFAULT 'pending',
  access_zones JSONB DEFAULT '[]'::jsonb,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  issued_by UUID REFERENCES platform_users(id),
  check_ins JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vip_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  person_id UUID REFERENCES legend_people(id),
  guest_name TEXT NOT NULL,
  guest_title TEXT,
  guest_company TEXT,
  guest_email TEXT,
  vip_level TEXT NOT NULL,
  party_size INTEGER DEFAULT 1,
  special_requirements TEXT,
  dietary_restrictions TEXT,
  arrival_time TIMESTAMPTZ,
  assigned_host_id UUID REFERENCES workforce_employees(id),
  access_pass_id UUID REFERENCES access_passes(id),
  status TEXT DEFAULT 'confirmed',
  checked_in BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 5: TRAVEL MANAGEMENT
-- ============================================================================

CREATE TABLE travel_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  traveler_id UUID REFERENCES legend_people(id),
  employee_id UUID REFERENCES workforce_employees(id),
  traveler_name TEXT NOT NULL,
  trip_name TEXT NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'planned',
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  origin_city TEXT,
  destination_city TEXT,
  flights JSONB DEFAULT '[]'::jsonb,
  hotels JSONB DEFAULT '[]'::jsonb,
  ground_transport JSONB DEFAULT '[]'::jsonb,
  estimated_cost NUMERIC(12,2),
  actual_cost NUMERIC(12,2),
  documents JSONB DEFAULT '[]'::jsonb,
  approved_by UUID REFERENCES platform_users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 6: WEATHER & CONTINGENCY
-- ============================================================================

CREATE TABLE weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  location_id UUID REFERENCES legend_places(id),
  alert_type TEXT NOT NULL,
  severity weather_severity NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT,
  effective_from TIMESTAMPTZ NOT NULL,
  effective_until TIMESTAMPTZ,
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  acknowledged_by UUID REFERENCES platform_users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contingency_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  trigger_conditions JSONB DEFAULT '[]'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  communication_plan JSONB DEFAULT '{}'::jsonb,
  responsible_parties JSONB DEFAULT '[]'::jsonb,
  estimated_cost NUMERIC(12,2),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 7: PHOTO DOCUMENTATION & SOCIAL
-- ============================================================================

CREATE TABLE photo_documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  location_id UUID REFERENCES legend_places(id),
  photo_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  taken_at TIMESTAMPTZ,
  taken_by UUID REFERENCES platform_users(id),
  gps_latitude NUMERIC(10,7),
  gps_longitude NUMERIC(10,7),
  tags JSONB DEFAULT '[]'::jsonb,
  is_before BOOLEAN,
  is_after BOOLEAN,
  related_incident_id UUID REFERENCES incidents(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE social_amplification_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL,
  platforms JSONB DEFAULT '[]'::jsonb,
  hashtags JSONB DEFAULT '[]'::jsonb,
  start_date DATE,
  end_date DATE,
  target_reach INTEGER,
  actual_reach INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 8: INDEXES
-- ============================================================================

CREATE INDEX idx_bid_opportunities_org ON bid_opportunities(organization_id, status);
CREATE INDEX idx_bid_responses_opportunity ON bid_responses(opportunity_id);
CREATE INDEX idx_production_schedules_org ON production_schedules(organization_id, event_id);
CREATE INDEX idx_production_schedules_phase ON production_schedules(phase, scheduled_start);
CREATE INDEX idx_stage_plots_org ON stage_plots(organization_id, event_id);
CREATE INDEX idx_access_passes_org ON access_passes(organization_id, event_id, status);
CREATE INDEX idx_access_passes_person ON access_passes(person_id) WHERE person_id IS NOT NULL;
CREATE INDEX idx_vip_guests_org ON vip_guests(organization_id, event_id);
CREATE INDEX idx_travel_itineraries_org ON travel_itineraries(organization_id, departure_date);
CREATE INDEX idx_weather_alerts_org ON weather_alerts(organization_id, is_active);
CREATE INDEX idx_contingency_plans_org ON contingency_plans(organization_id, event_id);
CREATE INDEX idx_photo_documentation_org ON photo_documentation(organization_id, event_id);
CREATE INDEX idx_social_campaigns_org ON social_amplification_campaigns(organization_id, status);

-- ============================================================================
-- SECTION 9: RLS POLICIES
-- ============================================================================

ALTER TABLE bid_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contingency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_amplification_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY bid_opportunities_org ON bid_opportunities FOR ALL USING (org_matches(organization_id));
CREATE POLICY bid_responses_access ON bid_responses FOR ALL USING (EXISTS (SELECT 1 FROM bid_opportunities bo WHERE bo.id = opportunity_id AND org_matches(bo.organization_id)));
CREATE POLICY production_schedules_org ON production_schedules FOR ALL USING (org_matches(organization_id));
CREATE POLICY stage_plots_org ON stage_plots FOR ALL USING (org_matches(organization_id));
CREATE POLICY access_passes_org ON access_passes FOR ALL USING (org_matches(organization_id));
CREATE POLICY vip_guests_org ON vip_guests FOR ALL USING (org_matches(organization_id));
CREATE POLICY travel_itineraries_org ON travel_itineraries FOR ALL USING (org_matches(organization_id));
CREATE POLICY weather_alerts_org ON weather_alerts FOR ALL USING (org_matches(organization_id));
CREATE POLICY contingency_plans_org ON contingency_plans FOR ALL USING (org_matches(organization_id));
CREATE POLICY photo_documentation_org ON photo_documentation FOR ALL USING (org_matches(organization_id));
CREATE POLICY social_campaigns_org ON social_amplification_campaigns FOR ALL USING (org_matches(organization_id));

-- ============================================================================
-- SECTION 10: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON bid_opportunities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bid_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON production_schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON stage_plots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON access_passes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vip_guests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON travel_itineraries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON weather_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON contingency_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON photo_documentation TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_amplification_campaigns TO authenticated;

-- ============================================================================
-- SECTION 11: TRIGGERS
-- ============================================================================

CREATE TRIGGER bid_opportunities_updated_at BEFORE UPDATE ON bid_opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER bid_responses_updated_at BEFORE UPDATE ON bid_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER production_schedules_updated_at BEFORE UPDATE ON production_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER stage_plots_updated_at BEFORE UPDATE ON stage_plots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER access_passes_updated_at BEFORE UPDATE ON access_passes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER vip_guests_updated_at BEFORE UPDATE ON vip_guests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER travel_itineraries_updated_at BEFORE UPDATE ON travel_itineraries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER weather_alerts_updated_at BEFORE UPDATE ON weather_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER contingency_plans_updated_at BEFORE UPDATE ON contingency_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER social_campaigns_updated_at BEFORE UPDATE ON social_amplification_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

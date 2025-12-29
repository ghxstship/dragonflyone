-- Migration: 0262_legend_extended_profiles_part2.sql
-- Purpose: Add missing RLS policies + Organizations profile tables

-- ============================================================================
-- PHASE 1: COMPLETE RLS POLICIES FOR PART 1 TABLES
-- ============================================================================

-- People profile mentor policies (INSERT/UPDATE/DELETE)
CREATE POLICY "people_profile_mentor_insert" ON people_profile_mentor FOR INSERT
  WITH CHECK (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_mentor_update" ON people_profile_mentor FOR UPDATE
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_mentor_delete" ON people_profile_mentor FOR DELETE
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- People profile influencer policies (INSERT/UPDATE/DELETE)
CREATE POLICY "people_profile_influencer_insert" ON people_profile_influencer FOR INSERT
  WITH CHECK (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_influencer_update" ON people_profile_influencer FOR UPDATE
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_influencer_delete" ON people_profile_influencer FOR DELETE
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- People profile speaker policies (INSERT/UPDATE/DELETE)
CREATE POLICY "people_profile_speaker_insert" ON people_profile_speaker FOR INSERT
  WITH CHECK (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_speaker_update" ON people_profile_speaker FOR UPDATE
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_speaker_delete" ON people_profile_speaker FOR DELETE
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- People profile attendee policies (INSERT/UPDATE/DELETE)
CREATE POLICY "people_profile_attendee_insert" ON people_profile_attendee FOR INSERT
  WITH CHECK (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_attendee_update" ON people_profile_attendee FOR UPDATE
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_attendee_delete" ON people_profile_attendee FOR DELETE
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- Places profile zone policies (INSERT/UPDATE/DELETE)
CREATE POLICY "places_profile_zone_insert" ON places_profile_zone FOR INSERT
  WITH CHECK (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_zone_update" ON places_profile_zone FOR UPDATE
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_zone_delete" ON places_profile_zone FOR DELETE
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- Places profile space policies (INSERT/UPDATE/DELETE)
CREATE POLICY "places_profile_space_insert" ON places_profile_space FOR INSERT
  WITH CHECK (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_space_update" ON places_profile_space FOR UPDATE
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_space_delete" ON places_profile_space FOR DELETE
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- Places profile staging policies (INSERT/UPDATE/DELETE)
CREATE POLICY "places_profile_staging_insert" ON places_profile_staging FOR INSERT
  WITH CHECK (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_staging_update" ON places_profile_staging FOR UPDATE
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_staging_delete" ON places_profile_staging FOR DELETE
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- Places profile parking policies (INSERT/UPDATE/DELETE)
CREATE POLICY "places_profile_parking_insert" ON places_profile_parking FOR INSERT
  WITH CHECK (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_parking_update" ON places_profile_parking FOR UPDATE
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_parking_delete" ON places_profile_parking FOR DELETE
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- Places profile office policies (INSERT/UPDATE/DELETE)
CREATE POLICY "places_profile_office_insert" ON places_profile_office FOR INSERT
  WITH CHECK (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_office_update" ON places_profile_office FOR UPDATE
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_office_delete" ON places_profile_office FOR DELETE
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- ============================================================================
-- PHASE 2: LEGEND ORGANIZATIONS EXTENDED PROFILES
-- ============================================================================

-- Vendor profile
CREATE TABLE IF NOT EXISTS orgs_profile_vendor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES legend_organizations(id) ON DELETE CASCADE,
  vendor_type TEXT,
  vendor_code TEXT,
  tax_id TEXT,
  duns_number TEXT,
  payment_terms TEXT DEFAULT 'NET30',
  payment_method TEXT,
  bank_account_info JSONB DEFAULT '{}',
  credit_limit DECIMAL(12, 2),
  credit_currency TEXT DEFAULT 'USD',
  insurance_info JSONB DEFAULT '{}',
  insurance_expiry DATE,
  certifications JSONB DEFAULT '[]',
  compliance_status TEXT DEFAULT 'pending',
  compliance_verified_at TIMESTAMPTZ,
  performance_rating DECIMAL(3, 2),
  rating_count INTEGER DEFAULT 0,
  on_time_delivery_rate DECIMAL(5, 2),
  quality_score DECIMAL(5, 2),
  response_time_hours DECIMAL(5, 2),
  preferred_vendor BOOLEAN DEFAULT false,
  approved_categories JSONB DEFAULT '[]',
  contract_start_date DATE,
  contract_end_date DATE,
  contract_value DECIMAL(14, 2),
  minimum_order_value DECIMAL(10, 2),
  lead_time_days INTEGER,
  return_policy TEXT,
  warranty_terms TEXT,
  primary_contact_id UUID REFERENCES legend_people(id),
  billing_address_id UUID REFERENCES addresses(id),
  shipping_address_id UUID REFERENCES addresses(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_orgs_profile_vendor_org ON orgs_profile_vendor(organization_id);
CREATE INDEX IF NOT EXISTS idx_orgs_profile_vendor_type ON orgs_profile_vendor(vendor_type);
CREATE INDEX IF NOT EXISTS idx_orgs_profile_vendor_preferred ON orgs_profile_vendor(preferred_vendor);

-- Sponsor profile
CREATE TABLE IF NOT EXISTS orgs_profile_sponsor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES legend_organizations(id) ON DELETE CASCADE,
  sponsor_tier TEXT,
  sponsorship_type TEXT,
  industry TEXT,
  annual_budget DECIMAL(14, 2),
  budget_currency TEXT DEFAULT 'USD',
  fiscal_year_end TEXT,
  decision_timeline TEXT,
  primary_contact_id UUID REFERENCES legend_people(id),
  marketing_contact_id UUID REFERENCES legend_people(id),
  billing_contact_id UUID REFERENCES legend_people(id),
  target_demographics JSONB DEFAULT '[]',
  brand_guidelines_url TEXT,
  logo_url TEXT,
  logo_usage_rights JSONB DEFAULT '{}',
  activation_preferences JSONB DEFAULT '[]',
  exclusivity_requirements JSONB DEFAULT '[]',
  competitor_restrictions JSONB DEFAULT '[]',
  past_sponsorships JSONB DEFAULT '[]',
  total_lifetime_value DECIMAL(14, 2),
  renewal_probability DECIMAL(3, 2),
  satisfaction_score DECIMAL(3, 2),
  nps_score INTEGER,
  last_engagement_date DATE,
  next_renewal_date DATE,
  contract_notes TEXT,
  internal_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_orgs_profile_sponsor_org ON orgs_profile_sponsor(organization_id);
CREATE INDEX IF NOT EXISTS idx_orgs_profile_sponsor_tier ON orgs_profile_sponsor(sponsor_tier);

-- Partner profile
CREATE TABLE IF NOT EXISTS orgs_profile_partner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES legend_organizations(id) ON DELETE CASCADE,
  partner_type TEXT,
  partner_tier TEXT,
  partnership_status TEXT DEFAULT 'active',
  partnership_start_date DATE,
  partnership_end_date DATE,
  revenue_share_percentage DECIMAL(5, 2),
  commission_structure JSONB DEFAULT '{}',
  referral_code TEXT,
  referral_count INTEGER DEFAULT 0,
  total_referral_value DECIMAL(14, 2),
  integration_type TEXT,
  api_access_level TEXT,
  api_key_id TEXT,
  co_marketing_agreement BOOLEAN DEFAULT false,
  co_selling_agreement BOOLEAN DEFAULT false,
  white_label_rights BOOLEAN DEFAULT false,
  territory_restrictions JSONB DEFAULT '[]',
  exclusivity_terms TEXT,
  primary_contact_id UUID REFERENCES legend_people(id),
  technical_contact_id UUID REFERENCES legend_people(id),
  joint_customers INTEGER DEFAULT 0,
  joint_revenue DECIMAL(14, 2),
  performance_metrics JSONB DEFAULT '{}',
  certification_level TEXT,
  training_completed JSONB DEFAULT '[]',
  support_tier TEXT,
  escalation_path JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_orgs_profile_partner_org ON orgs_profile_partner(organization_id);
CREATE INDEX IF NOT EXISTS idx_orgs_profile_partner_type ON orgs_profile_partner(partner_type);
CREATE INDEX IF NOT EXISTS idx_orgs_profile_partner_tier ON orgs_profile_partner(partner_tier);

-- Agency profile
CREATE TABLE IF NOT EXISTS orgs_profile_agency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES legend_organizations(id) ON DELETE CASCADE,
  agency_type TEXT,
  specializations JSONB DEFAULT '[]',
  services_offered JSONB DEFAULT '[]',
  team_size INTEGER,
  year_founded INTEGER,
  headquarters_location TEXT,
  office_locations JSONB DEFAULT '[]',
  hourly_rate_min DECIMAL(10, 2),
  hourly_rate_max DECIMAL(10, 2),
  project_rate_min DECIMAL(12, 2),
  project_rate_max DECIMAL(12, 2),
  retainer_rate_min DECIMAL(12, 2),
  retainer_rate_max DECIMAL(12, 2),
  rate_currency TEXT DEFAULT 'USD',
  minimum_engagement_value DECIMAL(12, 2),
  typical_project_duration TEXT,
  industries_served JSONB DEFAULT '[]',
  notable_clients JSONB DEFAULT '[]',
  case_studies JSONB DEFAULT '[]',
  awards JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  technology_stack JSONB DEFAULT '[]',
  portfolio_url TEXT,
  clutch_rating DECIMAL(3, 2),
  google_rating DECIMAL(3, 2),
  primary_contact_id UUID REFERENCES legend_people(id),
  account_manager_id UUID REFERENCES legend_people(id),
  nda_signed BOOLEAN DEFAULT false,
  nda_signed_date DATE,
  msa_signed BOOLEAN DEFAULT false,
  msa_signed_date DATE,
  insurance_verified BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_orgs_profile_agency_org ON orgs_profile_agency(organization_id);
CREATE INDEX IF NOT EXISTS idx_orgs_profile_agency_type ON orgs_profile_agency(agency_type);

-- Client profile
CREATE TABLE IF NOT EXISTS orgs_profile_client (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES legend_organizations(id) ON DELETE CASCADE,
  client_type TEXT,
  client_tier TEXT,
  client_status TEXT DEFAULT 'active',
  acquisition_source TEXT,
  acquisition_date DATE,
  acquisition_cost DECIMAL(10, 2),
  industry TEXT,
  company_size TEXT,
  annual_revenue TEXT,
  employee_count INTEGER,
  primary_contact_id UUID REFERENCES legend_people(id),
  billing_contact_id UUID REFERENCES legend_people(id),
  decision_maker_id UUID REFERENCES legend_people(id),
  billing_address_id UUID REFERENCES addresses(id),
  payment_terms TEXT DEFAULT 'NET30',
  credit_limit DECIMAL(12, 2),
  credit_currency TEXT DEFAULT 'USD',
  lifetime_value DECIMAL(14, 2),
  monthly_recurring_revenue DECIMAL(12, 2),
  annual_contract_value DECIMAL(14, 2),
  churn_risk_score DECIMAL(3, 2),
  health_score DECIMAL(3, 2),
  nps_score INTEGER,
  last_nps_date DATE,
  satisfaction_score DECIMAL(3, 2),
  last_engagement_date DATE,
  next_review_date DATE,
  contract_start_date DATE,
  contract_end_date DATE,
  auto_renewal BOOLEAN DEFAULT false,
  products_used JSONB DEFAULT '[]',
  feature_requests JSONB DEFAULT '[]',
  success_milestones JSONB DEFAULT '[]',
  account_manager_id UUID REFERENCES legend_people(id),
  csm_id UUID REFERENCES legend_people(id),
  internal_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_orgs_profile_client_org ON orgs_profile_client(organization_id);
CREATE INDEX IF NOT EXISTS idx_orgs_profile_client_type ON orgs_profile_client(client_type);
CREATE INDEX IF NOT EXISTS idx_orgs_profile_client_tier ON orgs_profile_client(client_tier);
CREATE INDEX IF NOT EXISTS idx_orgs_profile_client_status ON orgs_profile_client(client_status);

-- ============================================================================
-- RLS POLICIES FOR ORGANIZATIONS PROFILES
-- ============================================================================

ALTER TABLE orgs_profile_vendor ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs_profile_sponsor ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs_profile_partner ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs_profile_agency ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs_profile_client ENABLE ROW LEVEL SECURITY;

-- Vendor policies
CREATE POLICY "orgs_profile_vendor_select" ON orgs_profile_vendor FOR SELECT
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_vendor_insert" ON orgs_profile_vendor FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_vendor_update" ON orgs_profile_vendor FOR UPDATE
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_vendor_delete" ON orgs_profile_vendor FOR DELETE
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- Sponsor policies
CREATE POLICY "orgs_profile_sponsor_select" ON orgs_profile_sponsor FOR SELECT
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_sponsor_insert" ON orgs_profile_sponsor FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_sponsor_update" ON orgs_profile_sponsor FOR UPDATE
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_sponsor_delete" ON orgs_profile_sponsor FOR DELETE
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- Partner policies
CREATE POLICY "orgs_profile_partner_select" ON orgs_profile_partner FOR SELECT
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_partner_insert" ON orgs_profile_partner FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_partner_update" ON orgs_profile_partner FOR UPDATE
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_partner_delete" ON orgs_profile_partner FOR DELETE
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- Agency policies
CREATE POLICY "orgs_profile_agency_select" ON orgs_profile_agency FOR SELECT
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_agency_insert" ON orgs_profile_agency FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_agency_update" ON orgs_profile_agency FOR UPDATE
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_agency_delete" ON orgs_profile_agency FOR DELETE
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- Client policies
CREATE POLICY "orgs_profile_client_select" ON orgs_profile_client FOR SELECT
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_client_insert" ON orgs_profile_client FOR INSERT
  WITH CHECK (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_client_update" ON orgs_profile_client FOR UPDATE
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "orgs_profile_client_delete" ON orgs_profile_client FOR DELETE
  USING (organization_id IN (SELECT id FROM legend_organizations WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON orgs_profile_vendor TO authenticated;
GRANT ALL ON orgs_profile_sponsor TO authenticated;
GRANT ALL ON orgs_profile_partner TO authenticated;
GRANT ALL ON orgs_profile_agency TO authenticated;
GRANT ALL ON orgs_profile_client TO authenticated;

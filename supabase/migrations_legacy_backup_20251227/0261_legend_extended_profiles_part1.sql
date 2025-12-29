-- Migration: 0261_legend_extended_profiles_part1.sql
-- Purpose: Create extended profile tables for Legend entities (Part 1: Infrastructure + People + Places)

-- ============================================================================
-- PHASE 1: SHARED INFRASTRUCTURE
-- ============================================================================

-- Addresses table for normalized address storage
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  address_type TEXT CHECK (address_type IN ('billing', 'shipping', 'venue', 'office', 'home', 'warehouse', 'other')),
  label TEXT,
  street_address TEXT,
  street_address_2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_source TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_organization ON addresses(organization_id);
CREATE INDEX IF NOT EXISTS idx_addresses_type ON addresses(address_type);
CREATE INDEX IF NOT EXISTS idx_addresses_city_state ON addresses(city, state_province);
CREATE INDEX IF NOT EXISTS idx_addresses_postal ON addresses(postal_code);

-- ============================================================================
-- PHASE 2: LEGEND PEOPLE EXTENDED PROFILES
-- ============================================================================

-- Candidate profile (job applicants)
CREATE TABLE IF NOT EXISTS people_profile_candidate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  application_date DATE,
  position_applied TEXT,
  department_id UUID REFERENCES legend_departments(id),
  resume_url TEXT,
  cover_letter_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  source TEXT,
  referrer_id UUID REFERENCES legend_people(id),
  current_stage TEXT DEFAULT 'applied',
  stage_changed_at TIMESTAMPTZ DEFAULT now(),
  expected_salary_min DECIMAL(12, 2),
  expected_salary_max DECIMAL(12, 2),
  salary_currency TEXT DEFAULT 'USD',
  available_start_date DATE,
  willing_to_relocate BOOLEAN DEFAULT false,
  work_authorization TEXT,
  years_experience INTEGER,
  education_level TEXT,
  skills JSONB DEFAULT '[]',
  interview_notes JSONB DEFAULT '[]',
  assessment_scores JSONB DEFAULT '{}',
  background_check_status TEXT,
  background_check_date DATE,
  offer_details JSONB DEFAULT '{}',
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(person_id)
);

CREATE INDEX IF NOT EXISTS idx_people_profile_candidate_person ON people_profile_candidate(person_id);
CREATE INDEX IF NOT EXISTS idx_people_profile_candidate_stage ON people_profile_candidate(current_stage);

-- Mentor profile
CREATE TABLE IF NOT EXISTS people_profile_mentor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  mentor_type TEXT DEFAULT 'internal',
  expertise_areas JSONB DEFAULT '[]',
  max_mentees INTEGER DEFAULT 3,
  current_mentee_count INTEGER DEFAULT 0,
  availability_hours_per_month DECIMAL(5, 2),
  preferred_meeting_frequency TEXT,
  preferred_meeting_format TEXT,
  bio TEXT,
  mentoring_philosophy TEXT,
  years_mentoring INTEGER,
  certifications JSONB DEFAULT '[]',
  languages JSONB DEFAULT '[]',
  timezone TEXT,
  is_accepting_mentees BOOLEAN DEFAULT true,
  rating_average DECIMAL(3, 2),
  rating_count INTEGER DEFAULT 0,
  total_mentees_helped INTEGER DEFAULT 0,
  success_stories JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(person_id)
);

CREATE INDEX IF NOT EXISTS idx_people_profile_mentor_person ON people_profile_mentor(person_id);
CREATE INDEX IF NOT EXISTS idx_people_profile_mentor_accepting ON people_profile_mentor(is_accepting_mentees);

-- Influencer profile
CREATE TABLE IF NOT EXISTS people_profile_influencer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  influencer_tier TEXT,
  primary_platform TEXT,
  social_handles JSONB DEFAULT '{}',
  follower_counts JSONB DEFAULT '{}',
  engagement_rates JSONB DEFAULT '{}',
  content_categories JSONB DEFAULT '[]',
  audience_demographics JSONB DEFAULT '{}',
  average_post_reach INTEGER,
  rate_per_post DECIMAL(10, 2),
  rate_per_story DECIMAL(10, 2),
  rate_per_video DECIMAL(10, 2),
  rate_currency TEXT DEFAULT 'USD',
  preferred_content_types JSONB DEFAULT '[]',
  brand_partnerships JSONB DEFAULT '[]',
  media_kit_url TEXT,
  verified_platforms JSONB DEFAULT '[]',
  last_metrics_update TIMESTAMPTZ,
  is_available BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(person_id)
);

CREATE INDEX IF NOT EXISTS idx_people_profile_influencer_person ON people_profile_influencer(person_id);
CREATE INDEX IF NOT EXISTS idx_people_profile_influencer_tier ON people_profile_influencer(influencer_tier);

-- Speaker profile
CREATE TABLE IF NOT EXISTS people_profile_speaker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  speaker_type TEXT,
  topics JSONB DEFAULT '[]',
  bio_short TEXT,
  bio_long TEXT,
  headshot_url TEXT,
  speaker_reel_url TEXT,
  presentation_samples JSONB DEFAULT '[]',
  speaking_fee_min DECIMAL(10, 2),
  speaking_fee_max DECIMAL(10, 2),
  fee_currency TEXT DEFAULT 'USD',
  travel_requirements JSONB DEFAULT '{}',
  technical_requirements JSONB DEFAULT '{}',
  preferred_session_length INTEGER,
  languages JSONB DEFAULT '[]',
  past_events JSONB DEFAULT '[]',
  testimonials JSONB DEFAULT '[]',
  awards JSONB DEFAULT '[]',
  publications JSONB DEFAULT '[]',
  speaker_bureau TEXT,
  agent_contact JSONB DEFAULT '{}',
  availability_calendar_url TEXT,
  rating_average DECIMAL(3, 2),
  rating_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(person_id)
);

CREATE INDEX IF NOT EXISTS idx_people_profile_speaker_person ON people_profile_speaker(person_id);
CREATE INDEX IF NOT EXISTS idx_people_profile_speaker_type ON people_profile_speaker(speaker_type);

-- Attendee profile
CREATE TABLE IF NOT EXISTS people_profile_attendee (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  dietary_restrictions JSONB DEFAULT '[]',
  accessibility_needs JSONB DEFAULT '[]',
  preferred_seating TEXT,
  t_shirt_size TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  medical_conditions TEXT,
  allergies JSONB DEFAULT '[]',
  preferred_language TEXT DEFAULT 'en',
  communication_preferences JSONB DEFAULT '{}',
  event_interests JSONB DEFAULT '[]',
  past_events_attended INTEGER DEFAULT 0,
  vip_status TEXT,
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier TEXT,
  opt_in_marketing BOOLEAN DEFAULT false,
  opt_in_partners BOOLEAN DEFAULT false,
  photo_consent BOOLEAN DEFAULT true,
  video_consent BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(person_id)
);

CREATE INDEX IF NOT EXISTS idx_people_profile_attendee_person ON people_profile_attendee(person_id);
CREATE INDEX IF NOT EXISTS idx_people_profile_attendee_vip ON people_profile_attendee(vip_status);

-- ============================================================================
-- PHASE 3: LEGEND PLACES EXTENDED PROFILES
-- ============================================================================

-- Zone profile
CREATE TABLE IF NOT EXISTS places_profile_zone (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES legend_places(id) ON DELETE CASCADE,
  zone_type TEXT,
  parent_zone_id UUID REFERENCES legend_places(id),
  capacity INTEGER,
  current_occupancy INTEGER DEFAULT 0,
  access_level TEXT DEFAULT 'public',
  credential_types_allowed JSONB DEFAULT '[]',
  age_restriction INTEGER,
  hours_of_operation JSONB DEFAULT '{}',
  amenities JSONB DEFAULT '[]',
  rules JSONB DEFAULT '[]',
  map_coordinates JSONB DEFAULT '{}',
  color_code TEXT,
  icon TEXT,
  is_indoor BOOLEAN DEFAULT false,
  climate_controlled BOOLEAN DEFAULT false,
  has_power BOOLEAN DEFAULT true,
  has_water BOOLEAN DEFAULT false,
  has_wifi BOOLEAN DEFAULT false,
  noise_level TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(place_id)
);

CREATE INDEX IF NOT EXISTS idx_places_profile_zone_place ON places_profile_zone(place_id);
CREATE INDEX IF NOT EXISTS idx_places_profile_zone_type ON places_profile_zone(zone_type);

-- Space profile (bookable spaces)
CREATE TABLE IF NOT EXISTS places_profile_space (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES legend_places(id) ON DELETE CASCADE,
  space_type TEXT,
  parent_place_id UUID REFERENCES legend_places(id),
  floor_number INTEGER,
  room_number TEXT,
  capacity_seated INTEGER,
  capacity_standing INTEGER,
  capacity_theater INTEGER,
  capacity_classroom INTEGER,
  capacity_banquet INTEGER,
  square_footage DECIMAL(10, 2),
  ceiling_height DECIMAL(5, 2),
  hourly_rate DECIMAL(10, 2),
  half_day_rate DECIMAL(10, 2),
  full_day_rate DECIMAL(10, 2),
  rate_currency TEXT DEFAULT 'USD',
  minimum_booking_hours INTEGER DEFAULT 1,
  setup_time_minutes INTEGER DEFAULT 30,
  teardown_time_minutes INTEGER DEFAULT 30,
  amenities JSONB DEFAULT '[]',
  av_equipment JSONB DEFAULT '[]',
  furniture_included JSONB DEFAULT '[]',
  catering_allowed BOOLEAN DEFAULT true,
  alcohol_allowed BOOLEAN DEFAULT false,
  outside_vendors_allowed BOOLEAN DEFAULT true,
  noise_restrictions JSONB DEFAULT '{}',
  booking_rules JSONB DEFAULT '{}',
  photos JSONB DEFAULT '[]',
  floor_plan_url TEXT,
  virtual_tour_url TEXT,
  is_bookable BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(place_id)
);

CREATE INDEX IF NOT EXISTS idx_places_profile_space_place ON places_profile_space(place_id);
CREATE INDEX IF NOT EXISTS idx_places_profile_space_type ON places_profile_space(space_type);

-- Staging area profile
CREATE TABLE IF NOT EXISTS places_profile_staging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES legend_places(id) ON DELETE CASCADE,
  staging_type TEXT,
  dock_count INTEGER,
  dock_height_inches INTEGER,
  max_truck_length_feet INTEGER,
  has_leveler BOOLEAN DEFAULT false,
  has_forklift BOOLEAN DEFAULT false,
  forklift_capacity_lbs INTEGER,
  has_pallet_jack BOOLEAN DEFAULT true,
  covered BOOLEAN DEFAULT false,
  secure BOOLEAN DEFAULT true,
  hours_of_operation JSONB DEFAULT '{}',
  reservation_required BOOLEAN DEFAULT true,
  advance_notice_hours INTEGER DEFAULT 24,
  max_dwell_time_hours INTEGER,
  weight_limit_lbs INTEGER,
  special_equipment JSONB DEFAULT '[]',
  access_instructions TEXT,
  contact_phone TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(place_id)
);

CREATE INDEX IF NOT EXISTS idx_places_profile_staging_place ON places_profile_staging(place_id);
CREATE INDEX IF NOT EXISTS idx_places_profile_staging_type ON places_profile_staging(staging_type);

-- Parking profile
CREATE TABLE IF NOT EXISTS places_profile_parking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES legend_places(id) ON DELETE CASCADE,
  parking_type TEXT,
  total_spaces INTEGER,
  handicap_spaces INTEGER,
  ev_charging_spaces INTEGER,
  motorcycle_spaces INTEGER,
  oversized_spaces INTEGER,
  reserved_spaces INTEGER,
  hourly_rate DECIMAL(8, 2),
  daily_rate DECIMAL(8, 2),
  event_rate DECIMAL(8, 2),
  monthly_rate DECIMAL(8, 2),
  rate_currency TEXT DEFAULT 'USD',
  accepts_cash BOOLEAN DEFAULT true,
  accepts_card BOOLEAN DEFAULT true,
  accepts_mobile_pay BOOLEAN DEFAULT true,
  validation_available BOOLEAN DEFAULT false,
  height_clearance_inches INTEGER,
  is_covered BOOLEAN DEFAULT false,
  is_secure BOOLEAN DEFAULT true,
  has_attendant BOOLEAN DEFAULT false,
  hours_of_operation JSONB DEFAULT '{}',
  shuttle_available BOOLEAN DEFAULT false,
  shuttle_frequency_minutes INTEGER,
  walking_distance_minutes INTEGER,
  special_instructions TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(place_id)
);

CREATE INDEX IF NOT EXISTS idx_places_profile_parking_place ON places_profile_parking(place_id);
CREATE INDEX IF NOT EXISTS idx_places_profile_parking_type ON places_profile_parking(parking_type);

-- Office profile
CREATE TABLE IF NOT EXISTS places_profile_office (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES legend_places(id) ON DELETE CASCADE,
  office_type TEXT,
  floor_number INTEGER,
  suite_number TEXT,
  square_footage DECIMAL(10, 2),
  workstation_count INTEGER,
  private_office_count INTEGER,
  conference_room_count INTEGER,
  phone_number TEXT,
  fax_number TEXT,
  reception_hours JSONB DEFAULT '{}',
  building_access_hours JSONB DEFAULT '{}',
  security_type TEXT,
  parking_spaces_included INTEGER,
  amenities JSONB DEFAULT '[]',
  lease_start_date DATE,
  lease_end_date DATE,
  monthly_rent DECIMAL(12, 2),
  rent_currency TEXT DEFAULT 'USD',
  landlord_contact JSONB DEFAULT '{}',
  building_management_contact JSONB DEFAULT '{}',
  emergency_procedures TEXT,
  evacuation_route_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(place_id)
);

CREATE INDEX IF NOT EXISTS idx_places_profile_office_place ON places_profile_office(place_id);
CREATE INDEX IF NOT EXISTS idx_places_profile_office_type ON places_profile_office(office_type);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_candidate ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_mentor ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_influencer ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_speaker ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_attendee ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_zone ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_space ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_parking ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_office ENABLE ROW LEVEL SECURITY;

-- Addresses policies
CREATE POLICY "addresses_select" ON addresses FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

CREATE POLICY "addresses_insert" ON addresses FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

CREATE POLICY "addresses_update" ON addresses FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

CREATE POLICY "addresses_delete" ON addresses FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()));

-- People profile policies (via legend_people organization)
CREATE POLICY "people_profile_candidate_select" ON people_profile_candidate FOR SELECT
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_candidate_insert" ON people_profile_candidate FOR INSERT
  WITH CHECK (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_candidate_update" ON people_profile_candidate FOR UPDATE
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_candidate_delete" ON people_profile_candidate FOR DELETE
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- Similar policies for other people profiles
CREATE POLICY "people_profile_mentor_select" ON people_profile_mentor FOR SELECT
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_influencer_select" ON people_profile_influencer FOR SELECT
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_speaker_select" ON people_profile_speaker FOR SELECT
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "people_profile_attendee_select" ON people_profile_attendee FOR SELECT
  USING (person_id IN (SELECT id FROM legend_people WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- Places profile policies (via legend_places organization)
CREATE POLICY "places_profile_zone_select" ON places_profile_zone FOR SELECT
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_space_select" ON places_profile_space FOR SELECT
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_staging_select" ON places_profile_staging FOR SELECT
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_parking_select" ON places_profile_parking FOR SELECT
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "places_profile_office_select" ON places_profile_office FOR SELECT
  USING (place_id IN (SELECT id FROM legend_places WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON addresses TO authenticated;
GRANT ALL ON people_profile_candidate TO authenticated;
GRANT ALL ON people_profile_mentor TO authenticated;
GRANT ALL ON people_profile_influencer TO authenticated;
GRANT ALL ON people_profile_speaker TO authenticated;
GRANT ALL ON people_profile_attendee TO authenticated;
GRANT ALL ON places_profile_zone TO authenticated;
GRANT ALL ON places_profile_space TO authenticated;
GRANT ALL ON places_profile_staging TO authenticated;
GRANT ALL ON places_profile_parking TO authenticated;
GRANT ALL ON places_profile_office TO authenticated;

-- ============================================================================
-- 0004_legend_profiles.sql
-- LEGEND Profile Extension Tables
-- Type-specific attributes for Legend entities while maintaining 3NF
-- GHXSTSHIP Platform - Single Source of Truth
-- ============================================================================

-- ============================================================================
-- PEOPLE PROFILES
-- ============================================================================

-- Employee profile
CREATE TABLE people_profile_employee (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  employee_number TEXT,
  hire_date DATE,
  termination_date DATE,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern', 'temp')),
  position_id UUID REFERENCES legend_positions(id) ON DELETE SET NULL,
  department_id UUID REFERENCES legend_departments(id) ON DELETE SET NULL,
  team_id UUID REFERENCES legend_teams(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  salary DECIMAL(12, 2),
  salary_currency TEXT DEFAULT 'USD',
  pay_frequency TEXT CHECK (pay_frequency IN ('hourly', 'weekly', 'biweekly', 'monthly', 'annual')),
  work_location_id UUID REFERENCES legend_places(id) ON DELETE SET NULL,
  is_remote BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(person_id)
);

CREATE INDEX idx_people_profile_employee_person ON people_profile_employee(person_id);
CREATE INDEX idx_people_profile_employee_department ON people_profile_employee(department_id);
CREATE INDEX idx_people_profile_employee_manager ON people_profile_employee(manager_id);

-- Crew profile
CREATE TABLE people_profile_crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  crew_type TEXT,
  department TEXT,
  position TEXT,
  skills TEXT[] DEFAULT '{}',
  certifications JSONB DEFAULT '[]',
  union_affiliation TEXT,
  union_local TEXT,
  hourly_rate DECIMAL(10, 2),
  day_rate DECIMAL(10, 2),
  overtime_rate DECIMAL(10, 2),
  rate_currency TEXT DEFAULT 'USD',
  availability_status TEXT DEFAULT 'available',
  travel_willing BOOLEAN DEFAULT true,
  equipment_owned JSONB DEFAULT '[]',
  portfolio_url TEXT,
  rating DECIMAL(3, 2),
  rating_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(person_id)
);

CREATE INDEX idx_people_profile_crew_person ON people_profile_crew(person_id);
CREATE INDEX idx_people_profile_crew_type ON people_profile_crew(crew_type);
CREATE INDEX idx_people_profile_crew_skills ON people_profile_crew USING GIN(skills);

-- Artist profile
CREATE TABLE people_profile_artist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  stage_name TEXT,
  artist_type TEXT,
  genres TEXT[] DEFAULT '{}',
  bio_short TEXT,
  bio_long TEXT,
  hometown TEXT,
  country TEXT,
  website TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  youtube_url TEXT,
  instagram_handle TEXT,
  twitter_handle TEXT,
  tiktok_handle TEXT,
  facebook_url TEXT,
  booking_email TEXT,
  booking_phone TEXT,
  management_company TEXT,
  management_contact TEXT,
  label TEXT,
  press_kit_url TEXT,
  tech_rider_url TEXT,
  hospitality_rider_url TEXT,
  performance_fee_min DECIMAL(12, 2),
  performance_fee_max DECIMAL(12, 2),
  fee_currency TEXT DEFAULT 'USD',
  is_verified BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(person_id)
);

CREATE INDEX idx_people_profile_artist_person ON people_profile_artist(person_id);
CREATE INDEX idx_people_profile_artist_type ON people_profile_artist(artist_type);
CREATE INDEX idx_people_profile_artist_genres ON people_profile_artist USING GIN(genres);

-- Volunteer profile
CREATE TABLE people_profile_volunteer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  volunteer_type TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  availability JSONB DEFAULT '{}'::jsonb,
  t_shirt_size TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  dietary_restrictions TEXT[] DEFAULT '{}',
  accessibility_needs TEXT[] DEFAULT '{}',
  background_check_status TEXT,
  background_check_date DATE,
  training_completed JSONB DEFAULT '[]',
  total_hours_volunteered DECIMAL(10, 2) DEFAULT 0,
  events_volunteered INTEGER DEFAULT 0,
  rating DECIMAL(3, 2),
  rating_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(person_id)
);

CREATE INDEX idx_people_profile_volunteer_person ON people_profile_volunteer(person_id);
CREATE INDEX idx_people_profile_volunteer_skills ON people_profile_volunteer USING GIN(skills);

-- Contact profile
CREATE TABLE people_profile_contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  contact_type TEXT,
  company TEXT,
  job_title TEXT,
  department TEXT,
  source TEXT,
  lead_status TEXT,
  lead_score INTEGER,
  last_contacted_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  preferred_contact_method TEXT,
  do_not_contact BOOLEAN DEFAULT false,
  subscribed_to_newsletter BOOLEAN DEFAULT false,
  subscribed_to_marketing BOOLEAN DEFAULT false,
  linkedin_url TEXT,
  twitter_handle TEXT,
  lifetime_value DECIMAL(12, 2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(person_id)
);

CREATE INDEX idx_people_profile_contact_person ON people_profile_contact(person_id);
CREATE INDEX idx_people_profile_contact_type ON people_profile_contact(contact_type);
CREATE INDEX idx_people_profile_contact_lead_status ON people_profile_contact(lead_status);

-- Candidate profile
CREATE TABLE people_profile_candidate (
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

CREATE INDEX idx_people_profile_candidate_person ON people_profile_candidate(person_id);
CREATE INDEX idx_people_profile_candidate_stage ON people_profile_candidate(current_stage);

-- Mentor profile
CREATE TABLE people_profile_mentor (
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

CREATE INDEX idx_people_profile_mentor_person ON people_profile_mentor(person_id);
CREATE INDEX idx_people_profile_mentor_accepting ON people_profile_mentor(is_accepting_mentees);

-- Influencer profile
CREATE TABLE people_profile_influencer (
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

CREATE INDEX idx_people_profile_influencer_person ON people_profile_influencer(person_id);
CREATE INDEX idx_people_profile_influencer_tier ON people_profile_influencer(influencer_tier);

-- Speaker profile
CREATE TABLE people_profile_speaker (
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

CREATE INDEX idx_people_profile_speaker_person ON people_profile_speaker(person_id);
CREATE INDEX idx_people_profile_speaker_type ON people_profile_speaker(speaker_type);

-- Attendee profile
CREATE TABLE people_profile_attendee (
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

CREATE INDEX idx_people_profile_attendee_person ON people_profile_attendee(person_id);
CREATE INDEX idx_people_profile_attendee_vip ON people_profile_attendee(vip_status);

-- ============================================================================
-- PLACES PROFILES
-- ============================================================================

-- Venue profile
CREATE TABLE places_profile_venue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES legend_places(id) ON DELETE CASCADE,
  venue_type TEXT,
  address_id UUID REFERENCES addresses(id),
  capacity_seated INTEGER,
  capacity_standing INTEGER,
  capacity_theater INTEGER,
  capacity_banquet INTEGER,
  stage_dimensions JSONB DEFAULT '{}',
  loading_dock BOOLEAN DEFAULT false,
  green_room BOOLEAN DEFAULT false,
  dressing_rooms INTEGER DEFAULT 0,
  parking_spaces INTEGER,
  accessibility_features JSONB DEFAULT '[]',
  technical_specs JSONB DEFAULT '{}',
  house_sound BOOLEAN DEFAULT false,
  house_lights BOOLEAN DEFAULT false,
  backline_available JSONB DEFAULT '[]',
  catering_kitchen BOOLEAN DEFAULT false,
  alcohol_license BOOLEAN DEFAULT false,
  curfew_time TIME,
  load_in_time TIME,
  sound_check_time TIME,
  doors_time TIME,
  rental_rate_hourly DECIMAL(10, 2),
  rental_rate_daily DECIMAL(10, 2),
  rental_rate_event DECIMAL(10, 2),
  rate_currency TEXT DEFAULT 'USD',
  deposit_required DECIMAL(10, 2),
  insurance_required BOOLEAN DEFAULT true,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  booking_url TEXT,
  virtual_tour_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(place_id)
);

CREATE INDEX idx_places_profile_venue_place ON places_profile_venue(place_id);
CREATE INDEX idx_places_profile_venue_type ON places_profile_venue(venue_type);

-- Warehouse profile
CREATE TABLE places_profile_warehouse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES legend_places(id) ON DELETE CASCADE,
  warehouse_type TEXT,
  address_id UUID REFERENCES addresses(id),
  total_square_feet DECIMAL(12, 2),
  usable_square_feet DECIMAL(12, 2),
  ceiling_height_feet DECIMAL(6, 2),
  loading_docks INTEGER DEFAULT 0,
  drive_in_doors INTEGER DEFAULT 0,
  climate_controlled BOOLEAN DEFAULT false,
  temperature_range JSONB DEFAULT '{}',
  humidity_controlled BOOLEAN DEFAULT false,
  security_features JSONB DEFAULT '[]',
  fire_suppression TEXT,
  power_capacity TEXT,
  forklift_available BOOLEAN DEFAULT false,
  pallet_racking BOOLEAN DEFAULT false,
  rack_capacity INTEGER,
  floor_load_capacity TEXT,
  operating_hours JSONB DEFAULT '{}',
  monthly_rent DECIMAL(12, 2),
  rent_currency TEXT DEFAULT 'USD',
  lease_start_date DATE,
  lease_end_date DATE,
  manager_id UUID REFERENCES legend_people(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(place_id)
);

CREATE INDEX idx_places_profile_warehouse_place ON places_profile_warehouse(place_id);
CREATE INDEX idx_places_profile_warehouse_type ON places_profile_warehouse(warehouse_type);

-- Zone profile
CREATE TABLE places_profile_zone (
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

CREATE INDEX idx_places_profile_zone_place ON places_profile_zone(place_id);
CREATE INDEX idx_places_profile_zone_type ON places_profile_zone(zone_type);

-- Space profile (bookable spaces)
CREATE TABLE places_profile_space (
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

CREATE INDEX idx_places_profile_space_place ON places_profile_space(place_id);
CREATE INDEX idx_places_profile_space_type ON places_profile_space(space_type);

-- Staging area profile
CREATE TABLE places_profile_staging (
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

CREATE INDEX idx_places_profile_staging_place ON places_profile_staging(place_id);
CREATE INDEX idx_places_profile_staging_type ON places_profile_staging(staging_type);

-- Parking profile
CREATE TABLE places_profile_parking (
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

CREATE INDEX idx_places_profile_parking_place ON places_profile_parking(place_id);
CREATE INDEX idx_places_profile_parking_type ON places_profile_parking(parking_type);

-- Office profile
CREATE TABLE places_profile_office (
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

CREATE INDEX idx_places_profile_office_place ON places_profile_office(place_id);
CREATE INDEX idx_places_profile_office_type ON places_profile_office(office_type);

-- Apply updated_at triggers for people profiles
CREATE TRIGGER people_profile_employee_updated_at BEFORE UPDATE ON people_profile_employee FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER people_profile_crew_updated_at BEFORE UPDATE ON people_profile_crew FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER people_profile_artist_updated_at BEFORE UPDATE ON people_profile_artist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER people_profile_volunteer_updated_at BEFORE UPDATE ON people_profile_volunteer FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER people_profile_contact_updated_at BEFORE UPDATE ON people_profile_contact FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER people_profile_candidate_updated_at BEFORE UPDATE ON people_profile_candidate FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER people_profile_mentor_updated_at BEFORE UPDATE ON people_profile_mentor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER people_profile_influencer_updated_at BEFORE UPDATE ON people_profile_influencer FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER people_profile_speaker_updated_at BEFORE UPDATE ON people_profile_speaker FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER people_profile_attendee_updated_at BEFORE UPDATE ON people_profile_attendee FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at triggers for places profiles
CREATE TRIGGER places_profile_venue_updated_at BEFORE UPDATE ON places_profile_venue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER places_profile_warehouse_updated_at BEFORE UPDATE ON places_profile_warehouse FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER places_profile_zone_updated_at BEFORE UPDATE ON places_profile_zone FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER places_profile_space_updated_at BEFORE UPDATE ON places_profile_space FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER places_profile_staging_updated_at BEFORE UPDATE ON places_profile_staging FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER places_profile_parking_updated_at BEFORE UPDATE ON places_profile_parking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER places_profile_office_updated_at BEFORE UPDATE ON places_profile_office FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

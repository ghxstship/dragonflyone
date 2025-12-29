-- Migration: 0263_legend_extended_profiles_part3.sql
-- Purpose: Create extended profile tables for Legend Products, Events, and Documents

-- ============================================================================
-- PHASE 1: LEGEND PRODUCTS EXTENDED PROFILES
-- ============================================================================

-- Merchandise profile
CREATE TABLE IF NOT EXISTS products_profile_merchandise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES legend_products(id) ON DELETE CASCADE,
  merchandise_type TEXT,
  brand TEXT,
  manufacturer TEXT,
  manufacturer_sku TEXT,
  upc TEXT,
  ean TEXT,
  weight_oz DECIMAL(10, 2),
  length_in DECIMAL(8, 2),
  width_in DECIMAL(8, 2),
  height_in DECIMAL(8, 2),
  color TEXT,
  size TEXT,
  material TEXT,
  country_of_origin TEXT,
  customs_code TEXT,
  is_hazmat BOOLEAN DEFAULT false,
  hazmat_class TEXT,
  requires_refrigeration BOOLEAN DEFAULT false,
  shelf_life_days INTEGER,
  min_order_quantity INTEGER DEFAULT 1,
  max_order_quantity INTEGER,
  case_pack_quantity INTEGER,
  pallet_quantity INTEGER,
  lead_time_days INTEGER,
  reorder_point INTEGER,
  reorder_quantity INTEGER,
  safety_stock INTEGER,
  wholesale_price DECIMAL(10, 2),
  msrp DECIMAL(10, 2),
  map_price DECIMAL(10, 2),
  price_currency TEXT DEFAULT 'USD',
  warranty_months INTEGER,
  return_policy TEXT,
  care_instructions TEXT,
  assembly_required BOOLEAN DEFAULT false,
  batteries_required BOOLEAN DEFAULT false,
  battery_type TEXT,
  age_restriction INTEGER,
  certifications JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);

CREATE INDEX IF NOT EXISTS idx_products_profile_merchandise_product ON products_profile_merchandise(product_id);
CREATE INDEX IF NOT EXISTS idx_products_profile_merchandise_type ON products_profile_merchandise(merchandise_type);
CREATE INDEX IF NOT EXISTS idx_products_profile_merchandise_upc ON products_profile_merchandise(upc);

-- Ticket profile
CREATE TABLE IF NOT EXISTS products_profile_ticket (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES legend_products(id) ON DELETE CASCADE,
  ticket_type TEXT,
  event_id UUID REFERENCES legend_events(id),
  session_id UUID,
  tier TEXT,
  section TEXT,
  row_name TEXT,
  seat_range TEXT,
  access_level TEXT,
  includes_parking BOOLEAN DEFAULT false,
  includes_meal BOOLEAN DEFAULT false,
  includes_swag BOOLEAN DEFAULT false,
  swag_items JSONB DEFAULT '[]',
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  entry_time TEXT,
  exit_time TEXT,
  transferable BOOLEAN DEFAULT true,
  refundable BOOLEAN DEFAULT false,
  refund_deadline TIMESTAMPTZ,
  resale_allowed BOOLEAN DEFAULT false,
  resale_max_price DECIMAL(10, 2),
  age_restriction INTEGER,
  id_required BOOLEAN DEFAULT false,
  credential_type TEXT,
  barcode_type TEXT,
  max_per_order INTEGER,
  min_per_order INTEGER DEFAULT 1,
  group_size INTEGER,
  early_bird_deadline TIMESTAMPTZ,
  early_bird_price DECIMAL(10, 2),
  regular_price DECIMAL(10, 2),
  door_price DECIMAL(10, 2),
  price_currency TEXT DEFAULT 'USD',
  capacity INTEGER,
  sold_count INTEGER DEFAULT 0,
  reserved_count INTEGER DEFAULT 0,
  waitlist_enabled BOOLEAN DEFAULT false,
  waitlist_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);

CREATE INDEX IF NOT EXISTS idx_products_profile_ticket_product ON products_profile_ticket(product_id);
CREATE INDEX IF NOT EXISTS idx_products_profile_ticket_event ON products_profile_ticket(event_id);
CREATE INDEX IF NOT EXISTS idx_products_profile_ticket_type ON products_profile_ticket(ticket_type);

-- Service profile
CREATE TABLE IF NOT EXISTS products_profile_service (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES legend_products(id) ON DELETE CASCADE,
  service_type TEXT,
  delivery_method TEXT,
  duration_minutes INTEGER,
  session_count INTEGER DEFAULT 1,
  frequency TEXT,
  location_type TEXT,
  location_id UUID REFERENCES legend_places(id),
  provider_id UUID REFERENCES legend_people(id),
  provider_type TEXT,
  capacity INTEGER DEFAULT 1,
  min_participants INTEGER DEFAULT 1,
  max_participants INTEGER,
  skill_level TEXT,
  prerequisites JSONB DEFAULT '[]',
  equipment_provided JSONB DEFAULT '[]',
  equipment_required JSONB DEFAULT '[]',
  materials_included BOOLEAN DEFAULT false,
  materials_fee DECIMAL(10, 2),
  cancellation_policy TEXT,
  cancellation_hours INTEGER DEFAULT 24,
  rescheduling_allowed BOOLEAN DEFAULT true,
  rescheduling_hours INTEGER DEFAULT 24,
  booking_lead_time_hours INTEGER DEFAULT 1,
  booking_window_days INTEGER DEFAULT 90,
  recurring_options JSONB DEFAULT '[]',
  package_options JSONB DEFAULT '[]',
  add_ons JSONB DEFAULT '[]',
  hourly_rate DECIMAL(10, 2),
  flat_rate DECIMAL(10, 2),
  package_rate DECIMAL(10, 2),
  rate_currency TEXT DEFAULT 'USD',
  deposit_required BOOLEAN DEFAULT false,
  deposit_amount DECIMAL(10, 2),
  deposit_percentage DECIMAL(5, 2),
  travel_fee DECIMAL(10, 2),
  travel_radius_miles INTEGER,
  availability_schedule JSONB DEFAULT '{}',
  blackout_dates JSONB DEFAULT '[]',
  certifications_required JSONB DEFAULT '[]',
  insurance_required BOOLEAN DEFAULT false,
  waiver_required BOOLEAN DEFAULT false,
  waiver_template_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);

CREATE INDEX IF NOT EXISTS idx_products_profile_service_product ON products_profile_service(product_id);
CREATE INDEX IF NOT EXISTS idx_products_profile_service_type ON products_profile_service(service_type);
CREATE INDEX IF NOT EXISTS idx_products_profile_service_provider ON products_profile_service(provider_id);

-- Subscription profile
CREATE TABLE IF NOT EXISTS products_profile_subscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES legend_products(id) ON DELETE CASCADE,
  subscription_type TEXT,
  billing_frequency TEXT,
  billing_day INTEGER,
  trial_days INTEGER DEFAULT 0,
  trial_price DECIMAL(10, 2),
  monthly_price DECIMAL(10, 2),
  quarterly_price DECIMAL(10, 2),
  annual_price DECIMAL(10, 2),
  lifetime_price DECIMAL(10, 2),
  price_currency TEXT DEFAULT 'USD',
  setup_fee DECIMAL(10, 2),
  cancellation_fee DECIMAL(10, 2),
  minimum_term_months INTEGER,
  auto_renew BOOLEAN DEFAULT true,
  proration_enabled BOOLEAN DEFAULT true,
  grace_period_days INTEGER DEFAULT 3,
  dunning_attempts INTEGER DEFAULT 3,
  pause_allowed BOOLEAN DEFAULT false,
  max_pause_days INTEGER,
  upgrade_paths JSONB DEFAULT '[]',
  downgrade_paths JSONB DEFAULT '[]',
  features_included JSONB DEFAULT '[]',
  usage_limits JSONB DEFAULT '{}',
  overage_rates JSONB DEFAULT '{}',
  add_ons_available JSONB DEFAULT '[]',
  discounts_available JSONB DEFAULT '[]',
  referral_discount_percentage DECIMAL(5, 2),
  loyalty_rewards JSONB DEFAULT '{}',
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);

CREATE INDEX IF NOT EXISTS idx_products_profile_subscription_product ON products_profile_subscription(product_id);
CREATE INDEX IF NOT EXISTS idx_products_profile_subscription_type ON products_profile_subscription(subscription_type);

-- Rental profile
CREATE TABLE IF NOT EXISTS products_profile_rental (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES legend_products(id) ON DELETE CASCADE,
  rental_type TEXT,
  condition TEXT DEFAULT 'excellent',
  serial_number TEXT,
  asset_tag TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  current_value DECIMAL(10, 2),
  depreciation_rate DECIMAL(5, 2),
  hourly_rate DECIMAL(10, 2),
  daily_rate DECIMAL(10, 2),
  weekly_rate DECIMAL(10, 2),
  monthly_rate DECIMAL(10, 2),
  rate_currency TEXT DEFAULT 'USD',
  deposit_amount DECIMAL(10, 2),
  cleaning_fee DECIMAL(10, 2),
  late_fee_hourly DECIMAL(10, 2),
  late_fee_daily DECIMAL(10, 2),
  damage_fee_schedule JSONB DEFAULT '{}',
  minimum_rental_hours INTEGER DEFAULT 1,
  maximum_rental_days INTEGER,
  advance_booking_hours INTEGER DEFAULT 24,
  pickup_location_id UUID REFERENCES legend_places(id),
  return_location_id UUID REFERENCES legend_places(id),
  delivery_available BOOLEAN DEFAULT false,
  delivery_fee DECIMAL(10, 2),
  delivery_radius_miles INTEGER,
  setup_included BOOLEAN DEFAULT false,
  setup_fee DECIMAL(10, 2),
  training_required BOOLEAN DEFAULT false,
  training_duration_minutes INTEGER,
  operator_required BOOLEAN DEFAULT false,
  operator_hourly_rate DECIMAL(10, 2),
  insurance_required BOOLEAN DEFAULT true,
  insurance_included BOOLEAN DEFAULT false,
  insurance_fee_daily DECIMAL(10, 2),
  waiver_required BOOLEAN DEFAULT true,
  age_requirement INTEGER DEFAULT 18,
  license_required TEXT,
  maintenance_schedule JSONB DEFAULT '{}',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  availability_calendar JSONB DEFAULT '{}',
  blackout_dates JSONB DEFAULT '[]',
  accessories_included JSONB DEFAULT '[]',
  accessories_available JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);

CREATE INDEX IF NOT EXISTS idx_products_profile_rental_product ON products_profile_rental(product_id);
CREATE INDEX IF NOT EXISTS idx_products_profile_rental_type ON products_profile_rental(rental_type);
CREATE INDEX IF NOT EXISTS idx_products_profile_rental_condition ON products_profile_rental(condition);

-- ============================================================================
-- PHASE 2: LEGEND EVENTS EXTENDED PROFILES
-- ============================================================================

-- Conference profile
CREATE TABLE IF NOT EXISTS events_profile_conference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  conference_type TEXT,
  theme TEXT,
  tagline TEXT,
  target_audience JSONB DEFAULT '[]',
  expected_attendance INTEGER,
  track_count INTEGER,
  session_count INTEGER,
  keynote_count INTEGER,
  workshop_count INTEGER,
  networking_events_count INTEGER,
  exhibition_booths INTEGER,
  cfp_open_date DATE,
  cfp_close_date DATE,
  cfp_url TEXT,
  speaker_count INTEGER,
  sponsor_tiers JSONB DEFAULT '[]',
  sponsor_count INTEGER,
  exhibitor_count INTEGER,
  media_partners JSONB DEFAULT '[]',
  live_streaming BOOLEAN DEFAULT false,
  streaming_platform TEXT,
  recording_available BOOLEAN DEFAULT false,
  on_demand_access_days INTEGER,
  mobile_app_enabled BOOLEAN DEFAULT false,
  mobile_app_url TEXT,
  networking_app_enabled BOOLEAN DEFAULT false,
  badge_printing BOOLEAN DEFAULT true,
  lead_retrieval_enabled BOOLEAN DEFAULT false,
  ce_credits_offered BOOLEAN DEFAULT false,
  ce_credit_hours DECIMAL(5, 2),
  accreditation_body TEXT,
  hashtag TEXT,
  social_wall_enabled BOOLEAN DEFAULT false,
  photo_booth BOOLEAN DEFAULT false,
  childcare_available BOOLEAN DEFAULT false,
  accessibility_features JSONB DEFAULT '[]',
  sustainability_initiatives JSONB DEFAULT '[]',
  covid_policy TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id)
);

CREATE INDEX IF NOT EXISTS idx_events_profile_conference_event ON events_profile_conference(event_id);
CREATE INDEX IF NOT EXISTS idx_events_profile_conference_type ON events_profile_conference(conference_type);

-- Festival profile
CREATE TABLE IF NOT EXISTS events_profile_festival (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  festival_type TEXT,
  genre TEXT,
  headliners JSONB DEFAULT '[]',
  artist_count INTEGER,
  stage_count INTEGER,
  stages JSONB DEFAULT '[]',
  camping_available BOOLEAN DEFAULT false,
  camping_capacity INTEGER,
  glamping_available BOOLEAN DEFAULT false,
  rv_parking BOOLEAN DEFAULT false,
  day_parking_capacity INTEGER,
  shuttle_service BOOLEAN DEFAULT false,
  food_vendors_count INTEGER,
  beverage_vendors_count INTEGER,
  merchandise_vendors_count INTEGER,
  art_installations INTEGER,
  interactive_experiences JSONB DEFAULT '[]',
  wellness_area BOOLEAN DEFAULT false,
  family_area BOOLEAN DEFAULT false,
  vip_areas JSONB DEFAULT '[]',
  backstage_tours BOOLEAN DEFAULT false,
  meet_and_greets BOOLEAN DEFAULT false,
  silent_disco BOOLEAN DEFAULT false,
  afterparties JSONB DEFAULT '[]',
  age_restriction INTEGER,
  alcohol_policy TEXT,
  drug_policy TEXT,
  search_policy TEXT,
  prohibited_items JSONB DEFAULT '[]',
  weather_policy TEXT,
  rain_or_shine BOOLEAN DEFAULT true,
  medical_staff_onsite BOOLEAN DEFAULT true,
  security_level TEXT,
  lost_and_found BOOLEAN DEFAULT true,
  phone_charging BOOLEAN DEFAULT false,
  lockers_available BOOLEAN DEFAULT false,
  atm_onsite BOOLEAN DEFAULT false,
  wifi_available BOOLEAN DEFAULT false,
  cell_service_boosted BOOLEAN DEFAULT false,
  sustainability_score DECIMAL(3, 2),
  carbon_offset BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id)
);

CREATE INDEX IF NOT EXISTS idx_events_profile_festival_event ON events_profile_festival(event_id);
CREATE INDEX IF NOT EXISTS idx_events_profile_festival_type ON events_profile_festival(festival_type);

-- Workshop profile
CREATE TABLE IF NOT EXISTS events_profile_workshop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  workshop_type TEXT,
  skill_level TEXT,
  prerequisites JSONB DEFAULT '[]',
  learning_objectives JSONB DEFAULT '[]',
  curriculum JSONB DEFAULT '[]',
  instructor_id UUID REFERENCES legend_people(id),
  co_instructors JSONB DEFAULT '[]',
  max_participants INTEGER,
  min_participants INTEGER DEFAULT 1,
  waitlist_enabled BOOLEAN DEFAULT true,
  waitlist_capacity INTEGER,
  materials_provided BOOLEAN DEFAULT true,
  materials_list JSONB DEFAULT '[]',
  materials_fee DECIMAL(10, 2),
  equipment_provided BOOLEAN DEFAULT true,
  equipment_list JSONB DEFAULT '[]',
  bring_your_own JSONB DEFAULT '[]',
  hands_on_percentage INTEGER DEFAULT 50,
  take_home_project BOOLEAN DEFAULT false,
  certificate_provided BOOLEAN DEFAULT false,
  certificate_type TEXT,
  ce_credits DECIMAL(5, 2),
  recording_provided BOOLEAN DEFAULT false,
  follow_up_resources JSONB DEFAULT '[]',
  community_access BOOLEAN DEFAULT false,
  community_duration_days INTEGER,
  office_hours_included BOOLEAN DEFAULT false,
  office_hours_count INTEGER,
  refund_policy TEXT,
  cancellation_deadline_hours INTEGER DEFAULT 48,
  dress_code TEXT,
  physical_requirements TEXT,
  dietary_accommodations BOOLEAN DEFAULT false,
  accessibility_accommodations BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en',
  translation_available BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id)
);

CREATE INDEX IF NOT EXISTS idx_events_profile_workshop_event ON events_profile_workshop(event_id);
CREATE INDEX IF NOT EXISTS idx_events_profile_workshop_type ON events_profile_workshop(workshop_type);
CREATE INDEX IF NOT EXISTS idx_events_profile_workshop_instructor ON events_profile_workshop(instructor_id);

-- Webinar profile
CREATE TABLE IF NOT EXISTS events_profile_webinar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  webinar_type TEXT,
  platform TEXT,
  platform_webinar_id TEXT,
  host_id UUID REFERENCES legend_people(id),
  panelists JSONB DEFAULT '[]',
  moderator_id UUID REFERENCES legend_people(id),
  max_attendees INTEGER,
  registration_required BOOLEAN DEFAULT true,
  approval_required BOOLEAN DEFAULT false,
  password_protected BOOLEAN DEFAULT false,
  waiting_room BOOLEAN DEFAULT true,
  auto_record BOOLEAN DEFAULT true,
  recording_consent_required BOOLEAN DEFAULT true,
  cloud_recording BOOLEAN DEFAULT true,
  local_recording BOOLEAN DEFAULT false,
  transcription_enabled BOOLEAN DEFAULT false,
  closed_captions BOOLEAN DEFAULT false,
  sign_language_interpreter BOOLEAN DEFAULT false,
  q_and_a_enabled BOOLEAN DEFAULT true,
  q_and_a_anonymous BOOLEAN DEFAULT false,
  chat_enabled BOOLEAN DEFAULT true,
  private_chat BOOLEAN DEFAULT false,
  polls_enabled BOOLEAN DEFAULT true,
  polls JSONB DEFAULT '[]',
  handouts JSONB DEFAULT '[]',
  breakout_rooms BOOLEAN DEFAULT false,
  breakout_room_count INTEGER,
  screen_sharing TEXT DEFAULT 'host_only',
  virtual_background BOOLEAN DEFAULT true,
  practice_session BOOLEAN DEFAULT true,
  practice_session_time TIMESTAMPTZ,
  reminder_emails JSONB DEFAULT '[]',
  follow_up_emails JSONB DEFAULT '[]',
  on_demand_available BOOLEAN DEFAULT true,
  on_demand_duration_days INTEGER DEFAULT 30,
  replay_url TEXT,
  attendance_tracking BOOLEAN DEFAULT true,
  engagement_score_enabled BOOLEAN DEFAULT false,
  integration_crm TEXT,
  integration_marketing TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id)
);

CREATE INDEX IF NOT EXISTS idx_events_profile_webinar_event ON events_profile_webinar(event_id);
CREATE INDEX IF NOT EXISTS idx_events_profile_webinar_type ON events_profile_webinar(webinar_type);
CREATE INDEX IF NOT EXISTS idx_events_profile_webinar_host ON events_profile_webinar(host_id);

-- ============================================================================
-- PHASE 3: LEGEND DOCUMENTS EXTENDED PROFILES
-- ============================================================================

-- Contract profile
CREATE TABLE IF NOT EXISTS docs_profile_contract (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES legend_documents(id) ON DELETE CASCADE,
  contract_type TEXT,
  contract_number TEXT,
  title TEXT,
  parties JSONB DEFAULT '[]',
  effective_date DATE,
  expiration_date DATE,
  execution_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  renewal_term_months INTEGER,
  renewal_notice_days INTEGER,
  termination_notice_days INTEGER,
  termination_for_convenience BOOLEAN DEFAULT false,
  governing_law TEXT,
  jurisdiction TEXT,
  dispute_resolution TEXT,
  confidentiality_term_years INTEGER,
  non_compete_term_months INTEGER,
  non_solicitation_term_months INTEGER,
  total_value DECIMAL(14, 2),
  value_currency TEXT DEFAULT 'USD',
  payment_terms TEXT,
  payment_schedule JSONB DEFAULT '[]',
  penalties JSONB DEFAULT '{}',
  insurance_requirements JSONB DEFAULT '{}',
  deliverables JSONB DEFAULT '[]',
  milestones JSONB DEFAULT '[]',
  sla_terms JSONB DEFAULT '{}',
  amendments JSONB DEFAULT '[]',
  exhibits JSONB DEFAULT '[]',
  signatories JSONB DEFAULT '[]',
  witness_required BOOLEAN DEFAULT false,
  notarization_required BOOLEAN DEFAULT false,
  executed_copy_url TEXT,
  redline_url TEXT,
  summary TEXT,
  key_terms JSONB DEFAULT '[]',
  risk_assessment TEXT,
  internal_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id)
);

CREATE INDEX IF NOT EXISTS idx_docs_profile_contract_document ON docs_profile_contract(document_id);
CREATE INDEX IF NOT EXISTS idx_docs_profile_contract_type ON docs_profile_contract(contract_type);
CREATE INDEX IF NOT EXISTS idx_docs_profile_contract_expiration ON docs_profile_contract(expiration_date);

-- Invoice profile
CREATE TABLE IF NOT EXISTS docs_profile_invoice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES legend_documents(id) ON DELETE CASCADE,
  invoice_type TEXT,
  invoice_number TEXT NOT NULL,
  po_number TEXT,
  quote_number TEXT,
  bill_from_org_id UUID REFERENCES legend_organizations(id),
  bill_from_address_id UUID REFERENCES addresses(id),
  bill_to_org_id UUID REFERENCES legend_organizations(id),
  bill_to_address_id UUID REFERENCES addresses(id),
  ship_to_address_id UUID REFERENCES addresses(id),
  issue_date DATE NOT NULL,
  due_date DATE,
  payment_terms TEXT,
  currency TEXT DEFAULT 'USD',
  subtotal DECIMAL(14, 2),
  discount_type TEXT,
  discount_value DECIMAL(10, 2),
  discount_amount DECIMAL(14, 2),
  tax_rate DECIMAL(5, 2),
  tax_amount DECIMAL(14, 2),
  shipping_amount DECIMAL(10, 2),
  total_amount DECIMAL(14, 2) NOT NULL,
  amount_paid DECIMAL(14, 2) DEFAULT 0,
  amount_due DECIMAL(14, 2),
  line_items JSONB DEFAULT '[]',
  notes TEXT,
  terms TEXT,
  payment_instructions TEXT,
  payment_methods JSONB DEFAULT '[]',
  bank_details JSONB DEFAULT '{}',
  stripe_invoice_id TEXT,
  quickbooks_invoice_id TEXT,
  xero_invoice_id TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  void_reason TEXT,
  reminder_sent_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id)
);

CREATE INDEX IF NOT EXISTS idx_docs_profile_invoice_document ON docs_profile_invoice(document_id);
CREATE INDEX IF NOT EXISTS idx_docs_profile_invoice_number ON docs_profile_invoice(invoice_number);
CREATE INDEX IF NOT EXISTS idx_docs_profile_invoice_bill_to ON docs_profile_invoice(bill_to_org_id);
CREATE INDEX IF NOT EXISTS idx_docs_profile_invoice_due_date ON docs_profile_invoice(due_date);

-- Report profile
CREATE TABLE IF NOT EXISTS docs_profile_report (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES legend_documents(id) ON DELETE CASCADE,
  report_type TEXT,
  report_category TEXT,
  report_period_start DATE,
  report_period_end DATE,
  frequency TEXT,
  author_id UUID REFERENCES legend_people(id),
  reviewers JSONB DEFAULT '[]',
  approved_by_id UUID REFERENCES legend_people(id),
  approved_at TIMESTAMPTZ,
  executive_summary TEXT,
  key_findings JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  data_sources JSONB DEFAULT '[]',
  methodology TEXT,
  limitations TEXT,
  charts JSONB DEFAULT '[]',
  tables JSONB DEFAULT '[]',
  appendices JSONB DEFAULT '[]',
  references JSONB DEFAULT '[]',
  distribution_list JSONB DEFAULT '[]',
  confidentiality_level TEXT DEFAULT 'internal',
  retention_period_years INTEGER,
  next_report_date DATE,
  related_reports JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  kpis JSONB DEFAULT '[]',
  benchmarks JSONB DEFAULT '{}',
  year_over_year_comparison JSONB DEFAULT '{}',
  forecast JSONB DEFAULT '{}',
  risks_identified JSONB DEFAULT '[]',
  opportunities_identified JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id)
);

CREATE INDEX IF NOT EXISTS idx_docs_profile_report_document ON docs_profile_report(document_id);
CREATE INDEX IF NOT EXISTS idx_docs_profile_report_type ON docs_profile_report(report_type);
CREATE INDEX IF NOT EXISTS idx_docs_profile_report_author ON docs_profile_report(author_id);

-- Template profile
CREATE TABLE IF NOT EXISTS docs_profile_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES legend_documents(id) ON DELETE CASCADE,
  template_type TEXT,
  template_category TEXT,
  use_case TEXT,
  version TEXT DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  author_id UUID REFERENCES legend_people(id),
  last_editor_id UUID REFERENCES legend_people(id),
  variables JSONB DEFAULT '[]',
  placeholders JSONB DEFAULT '[]',
  sections JSONB DEFAULT '[]',
  conditional_logic JSONB DEFAULT '[]',
  merge_fields JSONB DEFAULT '[]',
  output_formats JSONB DEFAULT '["pdf", "docx"]',
  page_size TEXT DEFAULT 'letter',
  orientation TEXT DEFAULT 'portrait',
  margins JSONB DEFAULT '{}',
  header_template TEXT,
  footer_template TEXT,
  watermark TEXT,
  branding JSONB DEFAULT '{}',
  font_family TEXT,
  font_size INTEGER,
  line_spacing DECIMAL(3, 2),
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  average_completion_time_minutes INTEGER,
  instructions TEXT,
  examples JSONB DEFAULT '[]',
  related_templates JSONB DEFAULT '[]',
  approval_required BOOLEAN DEFAULT false,
  approvers JSONB DEFAULT '[]',
  expiration_date DATE,
  review_date DATE,
  compliance_tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id)
);

CREATE INDEX IF NOT EXISTS idx_docs_profile_template_document ON docs_profile_template(document_id);
CREATE INDEX IF NOT EXISTS idx_docs_profile_template_type ON docs_profile_template(template_type);
CREATE INDEX IF NOT EXISTS idx_docs_profile_template_active ON docs_profile_template(is_active);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE products_profile_merchandise ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_profile_ticket ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_profile_service ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_profile_subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_profile_rental ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_profile_conference ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_profile_festival ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_profile_workshop ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_profile_webinar ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_profile_contract ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_profile_invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_profile_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_profile_template ENABLE ROW LEVEL SECURITY;

-- Products profile policies
CREATE POLICY "products_profile_merchandise_select" ON products_profile_merchandise FOR SELECT
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_merchandise_insert" ON products_profile_merchandise FOR INSERT
  WITH CHECK (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_merchandise_update" ON products_profile_merchandise FOR UPDATE
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_merchandise_delete" ON products_profile_merchandise FOR DELETE
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "products_profile_ticket_select" ON products_profile_ticket FOR SELECT
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_ticket_insert" ON products_profile_ticket FOR INSERT
  WITH CHECK (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_ticket_update" ON products_profile_ticket FOR UPDATE
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_ticket_delete" ON products_profile_ticket FOR DELETE
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "products_profile_service_select" ON products_profile_service FOR SELECT
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_service_insert" ON products_profile_service FOR INSERT
  WITH CHECK (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_service_update" ON products_profile_service FOR UPDATE
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_service_delete" ON products_profile_service FOR DELETE
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "products_profile_subscription_select" ON products_profile_subscription FOR SELECT
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_subscription_insert" ON products_profile_subscription FOR INSERT
  WITH CHECK (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_subscription_update" ON products_profile_subscription FOR UPDATE
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_subscription_delete" ON products_profile_subscription FOR DELETE
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "products_profile_rental_select" ON products_profile_rental FOR SELECT
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_rental_insert" ON products_profile_rental FOR INSERT
  WITH CHECK (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_rental_update" ON products_profile_rental FOR UPDATE
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "products_profile_rental_delete" ON products_profile_rental FOR DELETE
  USING (product_id IN (SELECT id FROM legend_products WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- Events profile policies
CREATE POLICY "events_profile_conference_select" ON events_profile_conference FOR SELECT
  USING (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "events_profile_conference_insert" ON events_profile_conference FOR INSERT
  WITH CHECK (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "events_profile_conference_update" ON events_profile_conference FOR UPDATE
  USING (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "events_profile_conference_delete" ON events_profile_conference FOR DELETE
  USING (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "events_profile_festival_select" ON events_profile_festival FOR SELECT
  USING (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "events_profile_festival_insert" ON events_profile_festival FOR INSERT
  WITH CHECK (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "events_profile_festival_update" ON events_profile_festival FOR UPDATE
  USING (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "events_profile_festival_delete" ON events_profile_festival FOR DELETE
  USING (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "events_profile_workshop_select" ON events_profile_workshop FOR SELECT
  USING (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "events_profile_workshop_insert" ON events_profile_workshop FOR INSERT
  WITH CHECK (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "events_profile_workshop_update" ON events_profile_workshop FOR UPDATE
  USING (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "events_profile_workshop_delete" ON events_profile_workshop FOR DELETE
  USING (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "events_profile_webinar_select" ON events_profile_webinar FOR SELECT
  USING (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "events_profile_webinar_insert" ON events_profile_webinar FOR INSERT
  WITH CHECK (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "events_profile_webinar_update" ON events_profile_webinar FOR UPDATE
  USING (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "events_profile_webinar_delete" ON events_profile_webinar FOR DELETE
  USING (event_id IN (SELECT id FROM legend_events WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- Documents profile policies
CREATE POLICY "docs_profile_contract_select" ON docs_profile_contract FOR SELECT
  USING (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "docs_profile_contract_insert" ON docs_profile_contract FOR INSERT
  WITH CHECK (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "docs_profile_contract_update" ON docs_profile_contract FOR UPDATE
  USING (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "docs_profile_contract_delete" ON docs_profile_contract FOR DELETE
  USING (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "docs_profile_invoice_select" ON docs_profile_invoice FOR SELECT
  USING (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "docs_profile_invoice_insert" ON docs_profile_invoice FOR INSERT
  WITH CHECK (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "docs_profile_invoice_update" ON docs_profile_invoice FOR UPDATE
  USING (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "docs_profile_invoice_delete" ON docs_profile_invoice FOR DELETE
  USING (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "docs_profile_report_select" ON docs_profile_report FOR SELECT
  USING (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "docs_profile_report_insert" ON docs_profile_report FOR INSERT
  WITH CHECK (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "docs_profile_report_update" ON docs_profile_report FOR UPDATE
  USING (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "docs_profile_report_delete" ON docs_profile_report FOR DELETE
  USING (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

CREATE POLICY "docs_profile_template_select" ON docs_profile_template FOR SELECT
  USING (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "docs_profile_template_insert" ON docs_profile_template FOR INSERT
  WITH CHECK (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "docs_profile_template_update" ON docs_profile_template FOR UPDATE
  USING (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));
CREATE POLICY "docs_profile_template_delete" ON docs_profile_template FOR DELETE
  USING (document_id IN (SELECT id FROM legend_documents WHERE organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON products_profile_merchandise TO authenticated;
GRANT ALL ON products_profile_ticket TO authenticated;
GRANT ALL ON products_profile_service TO authenticated;
GRANT ALL ON products_profile_subscription TO authenticated;
GRANT ALL ON products_profile_rental TO authenticated;
GRANT ALL ON events_profile_conference TO authenticated;
GRANT ALL ON events_profile_festival TO authenticated;
GRANT ALL ON events_profile_workshop TO authenticated;
GRANT ALL ON events_profile_webinar TO authenticated;
GRANT ALL ON docs_profile_contract TO authenticated;
GRANT ALL ON docs_profile_invoice TO authenticated;
GRANT ALL ON docs_profile_report TO authenticated;
GRANT ALL ON docs_profile_template TO authenticated;

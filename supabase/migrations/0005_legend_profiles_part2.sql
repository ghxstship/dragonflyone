-- ============================================================================
-- 0005_legend_profiles_part2.sql
-- LEGEND Profile Extension Tables - Organizations, Products, Events, Documents
-- GHXSTSHIP Platform - Single Source of Truth
-- ============================================================================

-- ============================================================================
-- ORGANIZATIONS PROFILES
-- ============================================================================

-- Vendor profile
CREATE TABLE orgs_profile_vendor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES legend_organizations(id) ON DELETE CASCADE,
  vendor_code TEXT,
  vendor_type TEXT,
  payment_terms TEXT DEFAULT 'net_30',
  credit_limit DECIMAL(14, 2),
  currency TEXT DEFAULT 'USD',
  tax_exempt BOOLEAN DEFAULT false,
  tax_exempt_certificate TEXT,
  w9_on_file BOOLEAN DEFAULT false,
  w9_date DATE,
  insurance_on_file BOOLEAN DEFAULT false,
  insurance_expiry DATE,
  insurance_amount DECIMAL(14, 2),
  preferred_payment_method TEXT,
  bank_account_info JSONB DEFAULT '{}',
  minimum_order_amount DECIMAL(10, 2),
  lead_time_days INTEGER,
  return_policy TEXT,
  warranty_terms TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  performance_rating DECIMAL(3, 2),
  rating_count INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spend DECIMAL(14, 2) DEFAULT 0,
  last_order_date DATE,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id)
);

CREATE INDEX idx_orgs_profile_vendor_org ON orgs_profile_vendor(org_id);
CREATE INDEX idx_orgs_profile_vendor_type ON orgs_profile_vendor(vendor_type);
CREATE INDEX idx_orgs_profile_vendor_approved ON orgs_profile_vendor(is_approved);

-- Sponsor profile
CREATE TABLE orgs_profile_sponsor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES legend_organizations(id) ON DELETE CASCADE,
  sponsor_tier TEXT,
  sponsor_type TEXT,
  contract_value DECIMAL(14, 2),
  contract_currency TEXT DEFAULT 'USD',
  contract_start_date DATE,
  contract_end_date DATE,
  benefits JSONB DEFAULT '[]',
  deliverables JSONB DEFAULT '[]',
  exclusivity_category TEXT,
  logo_placement JSONB DEFAULT '[]',
  speaking_opportunities INTEGER DEFAULT 0,
  booth_size TEXT,
  booth_location TEXT,
  complimentary_tickets INTEGER DEFAULT 0,
  vip_passes INTEGER DEFAULT 0,
  social_media_mentions INTEGER DEFAULT 0,
  email_mentions INTEGER DEFAULT 0,
  website_placement JSONB DEFAULT '{}',
  activation_rights JSONB DEFAULT '[]',
  renewal_status TEXT,
  renewal_probability DECIMAL(5, 2),
  account_manager_id UUID REFERENCES legend_people(id),
  primary_contact_id UUID REFERENCES legend_people(id),
  satisfaction_score DECIMAL(3, 2),
  roi_metrics JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id)
);

CREATE INDEX idx_orgs_profile_sponsor_org ON orgs_profile_sponsor(org_id);
CREATE INDEX idx_orgs_profile_sponsor_tier ON orgs_profile_sponsor(sponsor_tier);

-- Partner profile
CREATE TABLE orgs_profile_partner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES legend_organizations(id) ON DELETE CASCADE,
  partner_type TEXT,
  partner_tier TEXT,
  partnership_start_date DATE,
  partnership_end_date DATE,
  agreement_url TEXT,
  revenue_share_percentage DECIMAL(5, 2),
  commission_rate DECIMAL(5, 2),
  referral_code TEXT,
  referral_count INTEGER DEFAULT 0,
  referral_revenue DECIMAL(14, 2) DEFAULT 0,
  co_marketing_budget DECIMAL(12, 2),
  joint_initiatives JSONB DEFAULT '[]',
  integration_status TEXT,
  api_access_level TEXT,
  dedicated_support BOOLEAN DEFAULT false,
  partner_manager_id UUID REFERENCES legend_people(id),
  primary_contact_id UUID REFERENCES legend_people(id),
  performance_metrics JSONB DEFAULT '{}',
  certification_level TEXT,
  training_completed JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id)
);

CREATE INDEX idx_orgs_profile_partner_org ON orgs_profile_partner(org_id);
CREATE INDEX idx_orgs_profile_partner_type ON orgs_profile_partner(partner_type);

-- Agency profile
CREATE TABLE orgs_profile_agency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES legend_organizations(id) ON DELETE CASCADE,
  agency_type TEXT,
  specializations JSONB DEFAULT '[]',
  roster_size INTEGER,
  geographic_coverage JSONB DEFAULT '[]',
  commission_rate DECIMAL(5, 2),
  retainer_amount DECIMAL(12, 2),
  retainer_currency TEXT DEFAULT 'USD',
  contract_start_date DATE,
  contract_end_date DATE,
  exclusive_representation BOOLEAN DEFAULT false,
  exclusivity_territory TEXT,
  booking_authority_limit DECIMAL(12, 2),
  requires_approval_above DECIMAL(12, 2),
  payment_terms TEXT,
  primary_agent_id UUID REFERENCES legend_people(id),
  secondary_agent_id UUID REFERENCES legend_people(id),
  roster JSONB DEFAULT '[]',
  past_bookings_count INTEGER DEFAULT 0,
  total_booking_value DECIMAL(14, 2) DEFAULT 0,
  performance_rating DECIMAL(3, 2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id)
);

CREATE INDEX idx_orgs_profile_agency_org ON orgs_profile_agency(org_id);
CREATE INDEX idx_orgs_profile_agency_type ON orgs_profile_agency(agency_type);

-- Client profile
CREATE TABLE orgs_profile_client (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES legend_organizations(id) ON DELETE CASCADE,
  client_type TEXT,
  client_tier TEXT,
  account_status TEXT DEFAULT 'active',
  account_manager_id UUID REFERENCES legend_people(id),
  primary_contact_id UUID REFERENCES legend_people(id),
  billing_contact_id UUID REFERENCES legend_people(id),
  billing_address_id UUID REFERENCES addresses(id),
  payment_terms TEXT DEFAULT 'net_30',
  credit_limit DECIMAL(14, 2),
  currency TEXT DEFAULT 'USD',
  tax_exempt BOOLEAN DEFAULT false,
  tax_id TEXT,
  preferred_payment_method TEXT,
  auto_invoice BOOLEAN DEFAULT false,
  invoice_frequency TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  contract_value DECIMAL(14, 2),
  lifetime_value DECIMAL(14, 2) DEFAULT 0,
  total_projects INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  satisfaction_score DECIMAL(3, 2),
  nps_score INTEGER,
  last_survey_date DATE,
  churn_risk TEXT,
  upsell_opportunities JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id)
);

CREATE INDEX idx_orgs_profile_client_org ON orgs_profile_client(org_id);
CREATE INDEX idx_orgs_profile_client_type ON orgs_profile_client(client_type);
CREATE INDEX idx_orgs_profile_client_tier ON orgs_profile_client(client_tier);

-- ============================================================================
-- PRODUCTS PROFILES
-- ============================================================================

-- Merchandise profile
CREATE TABLE products_profile_merchandise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES legend_products(id) ON DELETE CASCADE,
  merchandise_type TEXT,
  brand TEXT,
  collection TEXT,
  season TEXT,
  sizes_available JSONB DEFAULT '[]',
  colors_available JSONB DEFAULT '[]',
  materials JSONB DEFAULT '[]',
  care_instructions TEXT,
  country_of_origin TEXT,
  is_licensed BOOLEAN DEFAULT false,
  license_holder TEXT,
  royalty_percentage DECIMAL(5, 2),
  minimum_order_quantity INTEGER DEFAULT 1,
  wholesale_price DECIMAL(10, 2),
  suggested_retail_price DECIMAL(10, 2),
  map_price DECIMAL(10, 2),
  margin_percentage DECIMAL(5, 2),
  lead_time_days INTEGER,
  is_customizable BOOLEAN DEFAULT false,
  customization_options JSONB DEFAULT '[]',
  customization_fee DECIMAL(10, 2),
  is_dropship BOOLEAN DEFAULT false,
  dropship_fee DECIMAL(10, 2),
  return_window_days INTEGER DEFAULT 30,
  is_final_sale BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);

CREATE INDEX idx_products_profile_merchandise_product ON products_profile_merchandise(product_id);
CREATE INDEX idx_products_profile_merchandise_type ON products_profile_merchandise(merchandise_type);

-- Ticket profile
CREATE TABLE products_profile_ticket (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES legend_products(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id),
  ticket_type TEXT,
  tier TEXT,
  section TEXT,
  row_name TEXT,
  seat_numbers JSONB DEFAULT '[]',
  is_general_admission BOOLEAN DEFAULT false,
  is_reserved BOOLEAN DEFAULT false,
  is_vip BOOLEAN DEFAULT false,
  includes_meet_greet BOOLEAN DEFAULT false,
  includes_merchandise BOOLEAN DEFAULT false,
  merchandise_items JSONB DEFAULT '[]',
  includes_food_drink BOOLEAN DEFAULT false,
  food_drink_value DECIMAL(10, 2),
  includes_parking BOOLEAN DEFAULT false,
  parking_location TEXT,
  early_entry BOOLEAN DEFAULT false,
  early_entry_time TIME,
  age_restriction INTEGER,
  transferable BOOLEAN DEFAULT true,
  resellable BOOLEAN DEFAULT true,
  max_resale_price DECIMAL(10, 2),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  barcode_type TEXT,
  barcode_value TEXT,
  qr_code_url TEXT,
  access_zones JSONB DEFAULT '[]',
  special_instructions TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);

CREATE INDEX idx_products_profile_ticket_product ON products_profile_ticket(product_id);
CREATE INDEX idx_products_profile_ticket_event ON products_profile_ticket(event_id);
CREATE INDEX idx_products_profile_ticket_type ON products_profile_ticket(ticket_type);

-- Service profile
CREATE TABLE products_profile_service (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES legend_products(id) ON DELETE CASCADE,
  service_type TEXT,
  service_category TEXT,
  delivery_method TEXT,
  duration_minutes INTEGER,
  duration_hours DECIMAL(5, 2),
  duration_days INTEGER,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_frequency TEXT,
  setup_fee DECIMAL(10, 2),
  hourly_rate DECIMAL(10, 2),
  daily_rate DECIMAL(10, 2),
  project_rate DECIMAL(12, 2),
  retainer_rate DECIMAL(12, 2),
  rate_currency TEXT DEFAULT 'USD',
  minimum_engagement DECIMAL(10, 2),
  cancellation_policy TEXT,
  cancellation_fee DECIMAL(10, 2),
  cancellation_notice_hours INTEGER,
  rescheduling_policy TEXT,
  rescheduling_fee DECIMAL(10, 2),
  deliverables JSONB DEFAULT '[]',
  sla_terms JSONB DEFAULT '{}',
  support_hours JSONB DEFAULT '{}',
  support_channels JSONB DEFAULT '[]',
  prerequisites JSONB DEFAULT '[]',
  certifications_required JSONB DEFAULT '[]',
  equipment_required JSONB DEFAULT '[]',
  travel_included BOOLEAN DEFAULT false,
  travel_radius_miles INTEGER,
  travel_fee_per_mile DECIMAL(5, 2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);

CREATE INDEX idx_products_profile_service_product ON products_profile_service(product_id);
CREATE INDEX idx_products_profile_service_type ON products_profile_service(service_type);

-- Subscription profile
CREATE TABLE products_profile_subscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES legend_products(id) ON DELETE CASCADE,
  subscription_type TEXT,
  billing_frequency TEXT,
  billing_day INTEGER,
  trial_days INTEGER DEFAULT 0,
  setup_fee DECIMAL(10, 2),
  monthly_price DECIMAL(10, 2),
  annual_price DECIMAL(10, 2),
  annual_discount_percentage DECIMAL(5, 2),
  price_currency TEXT DEFAULT 'USD',
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  overage_rates JSONB DEFAULT '{}',
  add_ons JSONB DEFAULT '[]',
  upgrade_path TEXT,
  downgrade_path TEXT,
  cancellation_policy TEXT,
  cancellation_notice_days INTEGER,
  refund_policy TEXT,
  auto_renew BOOLEAN DEFAULT true,
  renewal_reminder_days INTEGER DEFAULT 30,
  grace_period_days INTEGER DEFAULT 7,
  pause_allowed BOOLEAN DEFAULT false,
  max_pause_days INTEGER,
  transferable BOOLEAN DEFAULT false,
  shareable BOOLEAN DEFAULT false,
  max_users INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);

CREATE INDEX idx_products_profile_subscription_product ON products_profile_subscription(product_id);
CREATE INDEX idx_products_profile_subscription_type ON products_profile_subscription(subscription_type);

-- Rental profile
CREATE TABLE products_profile_rental (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES legend_products(id) ON DELETE CASCADE,
  rental_type TEXT,
  condition TEXT DEFAULT 'excellent',
  serial_number TEXT,
  asset_tag TEXT,
  hourly_rate DECIMAL(10, 2),
  daily_rate DECIMAL(10, 2),
  weekly_rate DECIMAL(10, 2),
  monthly_rate DECIMAL(10, 2),
  rate_currency TEXT DEFAULT 'USD',
  deposit_amount DECIMAL(10, 2),
  deposit_type TEXT,
  minimum_rental_hours INTEGER,
  minimum_rental_days INTEGER,
  maximum_rental_days INTEGER,
  late_fee_hourly DECIMAL(10, 2),
  late_fee_daily DECIMAL(10, 2),
  damage_waiver_fee DECIMAL(10, 2),
  damage_waiver_coverage DECIMAL(12, 2),
  insurance_required BOOLEAN DEFAULT false,
  insurance_minimum DECIMAL(12, 2),
  pickup_available BOOLEAN DEFAULT true,
  delivery_available BOOLEAN DEFAULT true,
  delivery_fee DECIMAL(10, 2),
  delivery_radius_miles INTEGER,
  setup_required BOOLEAN DEFAULT false,
  setup_fee DECIMAL(10, 2),
  training_required BOOLEAN DEFAULT false,
  training_fee DECIMAL(10, 2),
  operator_required BOOLEAN DEFAULT false,
  operator_hourly_rate DECIMAL(10, 2),
  accessories_included JSONB DEFAULT '[]',
  consumables_included JSONB DEFAULT '[]',
  maintenance_schedule JSONB DEFAULT '{}',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  usage_tracking TEXT,
  current_location_id UUID REFERENCES legend_places(id),
  home_location_id UUID REFERENCES legend_places(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);

CREATE INDEX idx_products_profile_rental_product ON products_profile_rental(product_id);
CREATE INDEX idx_products_profile_rental_type ON products_profile_rental(rental_type);
CREATE INDEX idx_products_profile_rental_location ON products_profile_rental(current_location_id);

-- ============================================================================
-- EVENTS PROFILES
-- ============================================================================

-- Conference profile
CREATE TABLE events_profile_conference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  conference_type TEXT,
  theme TEXT,
  tracks JSONB DEFAULT '[]',
  keynote_speakers JSONB DEFAULT '[]',
  session_count INTEGER DEFAULT 0,
  workshop_count INTEGER DEFAULT 0,
  networking_events JSONB DEFAULT '[]',
  exhibitor_count INTEGER DEFAULT 0,
  exhibit_hall_sqft INTEGER,
  registration_types JSONB DEFAULT '[]',
  early_bird_deadline DATE,
  regular_deadline DATE,
  late_deadline DATE,
  ceu_credits_available BOOLEAN DEFAULT false,
  ceu_credit_hours DECIMAL(5, 2),
  certification_offered BOOLEAN DEFAULT false,
  certification_name TEXT,
  mobile_app_url TEXT,
  live_stream_available BOOLEAN DEFAULT false,
  live_stream_url TEXT,
  recording_available BOOLEAN DEFAULT false,
  recording_access_days INTEGER,
  sponsor_prospectus_url TEXT,
  exhibitor_prospectus_url TEXT,
  speaker_guidelines_url TEXT,
  attendee_demographics JSONB DEFAULT '{}',
  target_attendance INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id)
);

CREATE INDEX idx_events_profile_conference_event ON events_profile_conference(event_id);
CREATE INDEX idx_events_profile_conference_type ON events_profile_conference(conference_type);

-- Festival profile
CREATE TABLE events_profile_festival (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  festival_type TEXT,
  genres JSONB DEFAULT '[]',
  headliners JSONB DEFAULT '[]',
  stage_count INTEGER DEFAULT 1,
  stages JSONB DEFAULT '[]',
  camping_available BOOLEAN DEFAULT false,
  camping_capacity INTEGER,
  camping_types JSONB DEFAULT '[]',
  rv_hookups BOOLEAN DEFAULT false,
  glamping_available BOOLEAN DEFAULT false,
  food_vendors_count INTEGER,
  beverage_vendors_count INTEGER,
  merchandise_vendors_count INTEGER,
  art_installations JSONB DEFAULT '[]',
  activities JSONB DEFAULT '[]',
  age_restriction INTEGER,
  family_friendly_areas BOOLEAN DEFAULT false,
  accessibility_features JSONB DEFAULT '[]',
  medical_services JSONB DEFAULT '[]',
  security_level TEXT,
  re_entry_allowed BOOLEAN DEFAULT true,
  outside_food_allowed BOOLEAN DEFAULT false,
  outside_beverages_allowed BOOLEAN DEFAULT false,
  cooler_policy TEXT,
  bag_policy TEXT,
  prohibited_items JSONB DEFAULT '[]',
  weather_policy TEXT,
  rain_or_shine BOOLEAN DEFAULT true,
  shuttle_service BOOLEAN DEFAULT false,
  shuttle_routes JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id)
);

CREATE INDEX idx_events_profile_festival_event ON events_profile_festival(event_id);
CREATE INDEX idx_events_profile_festival_type ON events_profile_festival(festival_type);

-- Workshop profile
CREATE TABLE events_profile_workshop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  workshop_type TEXT,
  skill_level TEXT,
  prerequisites JSONB DEFAULT '[]',
  learning_objectives JSONB DEFAULT '[]',
  curriculum JSONB DEFAULT '[]',
  instructor_ids JSONB DEFAULT '[]',
  max_participants INTEGER,
  min_participants INTEGER,
  waitlist_enabled BOOLEAN DEFAULT true,
  materials_provided BOOLEAN DEFAULT true,
  materials_list JSONB DEFAULT '[]',
  materials_fee DECIMAL(10, 2),
  equipment_provided BOOLEAN DEFAULT true,
  equipment_list JSONB DEFAULT '[]',
  bring_your_own JSONB DEFAULT '[]',
  hands_on_percentage INTEGER,
  take_home_project BOOLEAN DEFAULT false,
  certificate_provided BOOLEAN DEFAULT false,
  certificate_name TEXT,
  ceu_credits DECIMAL(5, 2),
  recording_provided BOOLEAN DEFAULT false,
  follow_up_resources JSONB DEFAULT '[]',
  feedback_form_url TEXT,
  satisfaction_target DECIMAL(3, 2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id)
);

CREATE INDEX idx_events_profile_workshop_event ON events_profile_workshop(event_id);
CREATE INDEX idx_events_profile_workshop_type ON events_profile_workshop(workshop_type);

-- Webinar profile
CREATE TABLE events_profile_webinar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  webinar_type TEXT,
  platform TEXT,
  platform_meeting_id TEXT,
  platform_password TEXT,
  join_url TEXT,
  host_ids JSONB DEFAULT '[]',
  panelist_ids JSONB DEFAULT '[]',
  max_attendees INTEGER,
  registration_required BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMPTZ,
  approval_required BOOLEAN DEFAULT false,
  reminder_schedule JSONB DEFAULT '[]',
  q_and_a_enabled BOOLEAN DEFAULT true,
  chat_enabled BOOLEAN DEFAULT true,
  polls_enabled BOOLEAN DEFAULT true,
  polls JSONB DEFAULT '[]',
  handouts JSONB DEFAULT '[]',
  recording_enabled BOOLEAN DEFAULT true,
  recording_auto_share BOOLEAN DEFAULT false,
  recording_access_days INTEGER,
  on_demand_available BOOLEAN DEFAULT true,
  transcript_enabled BOOLEAN DEFAULT false,
  closed_captions_enabled BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  interpretation_languages JSONB DEFAULT '[]',
  practice_session_time TIMESTAMPTZ,
  green_room_time TIMESTAMPTZ,
  post_webinar_survey_url TEXT,
  follow_up_email_template TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id)
);

CREATE INDEX idx_events_profile_webinar_event ON events_profile_webinar(event_id);
CREATE INDEX idx_events_profile_webinar_type ON events_profile_webinar(webinar_type);

-- ============================================================================
-- DOCUMENTS PROFILES
-- ============================================================================

-- Contract profile
CREATE TABLE docs_profile_contract (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES legend_documents(id) ON DELETE CASCADE,
  contract_type TEXT,
  contract_category TEXT,
  party_a_org_id UUID REFERENCES legend_organizations(id),
  party_a_person_id UUID REFERENCES legend_people(id),
  party_b_org_id UUID REFERENCES legend_organizations(id),
  party_b_person_id UUID REFERENCES legend_people(id),
  contract_value DECIMAL(14, 2),
  currency TEXT DEFAULT 'USD',
  payment_terms TEXT,
  payment_schedule JSONB DEFAULT '[]',
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  renewal_terms TEXT,
  renewal_notice_days INTEGER,
  termination_clause TEXT,
  termination_notice_days INTEGER,
  termination_fee DECIMAL(12, 2),
  governing_law TEXT,
  dispute_resolution TEXT,
  confidentiality_clause BOOLEAN DEFAULT true,
  non_compete_clause BOOLEAN DEFAULT false,
  non_compete_duration_months INTEGER,
  non_compete_geography TEXT,
  indemnification_clause BOOLEAN DEFAULT true,
  liability_cap DECIMAL(14, 2),
  insurance_requirements JSONB DEFAULT '{}',
  deliverables JSONB DEFAULT '[]',
  milestones JSONB DEFAULT '[]',
  sla_terms JSONB DEFAULT '{}',
  amendments JSONB DEFAULT '[]',
  executed_date DATE,
  executed_by_a UUID REFERENCES platform_users(id),
  executed_by_b UUID REFERENCES platform_users(id),
  witness_ids JSONB DEFAULT '[]',
  notarized BOOLEAN DEFAULT false,
  notary_info JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id)
);

CREATE INDEX idx_docs_profile_contract_document ON docs_profile_contract(document_id);
CREATE INDEX idx_docs_profile_contract_type ON docs_profile_contract(contract_type);
CREATE INDEX idx_docs_profile_contract_party_a_org ON docs_profile_contract(party_a_org_id);
CREATE INDEX idx_docs_profile_contract_party_b_org ON docs_profile_contract(party_b_org_id);

-- Invoice profile
CREATE TABLE docs_profile_invoice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES legend_documents(id) ON DELETE CASCADE,
  invoice_type TEXT,
  invoice_number TEXT NOT NULL,
  po_number TEXT,
  bill_to_org_id UUID REFERENCES legend_organizations(id),
  bill_to_person_id UUID REFERENCES legend_people(id),
  bill_to_address_id UUID REFERENCES addresses(id),
  ship_to_address_id UUID REFERENCES addresses(id),
  issue_date DATE NOT NULL,
  due_date DATE,
  payment_terms TEXT,
  subtotal DECIMAL(14, 2),
  discount_amount DECIMAL(14, 2),
  discount_percentage DECIMAL(5, 2),
  tax_rate DECIMAL(5, 2),
  tax_amount DECIMAL(14, 2),
  shipping_amount DECIMAL(10, 2),
  total_amount DECIMAL(14, 2),
  amount_paid DECIMAL(14, 2) DEFAULT 0,
  amount_due DECIMAL(14, 2),
  currency TEXT DEFAULT 'USD',
  line_items JSONB DEFAULT '[]',
  payment_instructions TEXT,
  bank_details JSONB DEFAULT '{}',
  payment_link TEXT,
  paid_date DATE,
  paid_amount DECIMAL(14, 2),
  payment_method TEXT,
  payment_reference TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_frequency TEXT,
  next_invoice_date DATE,
  late_fee_percentage DECIMAL(5, 2),
  late_fee_amount DECIMAL(10, 2),
  reminder_sent_count INTEGER DEFAULT 0,
  last_reminder_date DATE,
  collection_status TEXT,
  write_off_amount DECIMAL(14, 2),
  write_off_date DATE,
  write_off_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id)
);

CREATE INDEX idx_docs_profile_invoice_document ON docs_profile_invoice(document_id);
CREATE INDEX idx_docs_profile_invoice_number ON docs_profile_invoice(invoice_number);
CREATE INDEX idx_docs_profile_invoice_bill_to_org ON docs_profile_invoice(bill_to_org_id);

-- Report profile
CREATE TABLE docs_profile_report (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES legend_documents(id) ON DELETE CASCADE,
  report_type TEXT,
  report_category TEXT,
  reporting_period_start DATE,
  reporting_period_end DATE,
  generated_at TIMESTAMPTZ,
  generated_by UUID REFERENCES platform_users(id),
  data_sources JSONB DEFAULT '[]',
  filters_applied JSONB DEFAULT '{}',
  parameters JSONB DEFAULT '{}',
  summary JSONB DEFAULT '{}',
  key_metrics JSONB DEFAULT '{}',
  charts JSONB DEFAULT '[]',
  tables JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  is_scheduled BOOLEAN DEFAULT false,
  schedule_frequency TEXT,
  next_generation_date DATE,
  recipients JSONB DEFAULT '[]',
  distribution_list JSONB DEFAULT '[]',
  access_level TEXT DEFAULT 'internal',
  confidentiality_level TEXT,
  retention_days INTEGER,
  archive_date DATE,
  version INTEGER DEFAULT 1,
  previous_version_id UUID,
  comparison_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id)
);

CREATE INDEX idx_docs_profile_report_document ON docs_profile_report(document_id);
CREATE INDEX idx_docs_profile_report_type ON docs_profile_report(report_type);

-- Template profile
CREATE TABLE docs_profile_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES legend_documents(id) ON DELETE CASCADE,
  template_type TEXT,
  template_category TEXT,
  template_format TEXT,
  version TEXT DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  variables JSONB DEFAULT '[]',
  placeholders JSONB DEFAULT '[]',
  sections JSONB DEFAULT '[]',
  styling JSONB DEFAULT '{}',
  header_content TEXT,
  footer_content TEXT,
  page_settings JSONB DEFAULT '{}',
  merge_fields JSONB DEFAULT '[]',
  conditional_sections JSONB DEFAULT '[]',
  approval_required BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  preview_url TEXT,
  thumbnail_url TEXT,
  instructions TEXT,
  examples JSONB DEFAULT '[]',
  related_templates JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id)
);

CREATE INDEX idx_docs_profile_template_document ON docs_profile_template(document_id);
CREATE INDEX idx_docs_profile_template_type ON docs_profile_template(template_type);
CREATE INDEX idx_docs_profile_template_active ON docs_profile_template(is_active);

-- Apply updated_at triggers
CREATE TRIGGER orgs_profile_vendor_updated_at BEFORE UPDATE ON orgs_profile_vendor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER orgs_profile_sponsor_updated_at BEFORE UPDATE ON orgs_profile_sponsor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER orgs_profile_partner_updated_at BEFORE UPDATE ON orgs_profile_partner FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER orgs_profile_agency_updated_at BEFORE UPDATE ON orgs_profile_agency FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER orgs_profile_client_updated_at BEFORE UPDATE ON orgs_profile_client FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER products_profile_merchandise_updated_at BEFORE UPDATE ON products_profile_merchandise FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER products_profile_ticket_updated_at BEFORE UPDATE ON products_profile_ticket FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER products_profile_service_updated_at BEFORE UPDATE ON products_profile_service FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER products_profile_subscription_updated_at BEFORE UPDATE ON products_profile_subscription FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER products_profile_rental_updated_at BEFORE UPDATE ON products_profile_rental FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER events_profile_conference_updated_at BEFORE UPDATE ON events_profile_conference FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER events_profile_festival_updated_at BEFORE UPDATE ON events_profile_festival FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER events_profile_workshop_updated_at BEFORE UPDATE ON events_profile_workshop FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER events_profile_webinar_updated_at BEFORE UPDATE ON events_profile_webinar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER docs_profile_contract_updated_at BEFORE UPDATE ON docs_profile_contract FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER docs_profile_invoice_updated_at BEFORE UPDATE ON docs_profile_invoice FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER docs_profile_report_updated_at BEFORE UPDATE ON docs_profile_report FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER docs_profile_template_updated_at BEFORE UPDATE ON docs_profile_template FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

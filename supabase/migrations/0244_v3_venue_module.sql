-- 0045_v3_venue_module.sql
-- V3 Expansion: Venue Module - Lead Management, Booking, Document Generation, Payments
-- CRITICAL priority features database schema

-- ============================================================================
-- PART 1: LEAD MANAGEMENT (LM-001, LM-002, LM-003)
-- ============================================================================

-- Lead Capture Forms (LM-001)
CREATE TABLE IF NOT EXISTS lead_capture_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]',
  settings JSONB NOT NULL DEFAULT '{}',
  styling JSONB NOT NULL DEFAULT '{}',
  redirect_url TEXT,
  notification_emails TEXT[],
  active BOOLEAN DEFAULT true,
  submissions_count INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_lead_capture_forms_org ON lead_capture_forms(organization_id);
CREATE INDEX IF NOT EXISTS idx_lead_capture_forms_active ON lead_capture_forms(active);

-- Lead Form Submissions
CREATE TABLE IF NOT EXISTS lead_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES lead_capture_forms(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}',
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_params JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_form_submissions_form ON lead_form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_lead_form_submissions_lead ON lead_form_submissions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_form_submissions_created ON lead_form_submissions(created_at);

-- Pipeline Stages (LM-002)
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0,
  probability INT DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  color TEXT DEFAULT '#3B82F6',
  is_won BOOLEAN DEFAULT false,
  is_lost BOOLEAN DEFAULT false,
  auto_actions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_org ON pipeline_stages(organization_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_order ON pipeline_stages(organization_id, order_index);

-- Leads table enhancement (if not exists, create; if exists, alter)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  source TEXT,
  source_detail TEXT,
  status TEXT DEFAULT 'new',
  title TEXT,
  description TEXT,
  event_type TEXT,
  event_date DATE,
  guest_count INT,
  estimated_value NUMERIC(12,2),
  probability INT DEFAULT 0,
  weighted_value NUMERIC(12,2) GENERATED ALWAYS AS (estimated_value * probability / 100) STORED,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expected_close_date DATE,
  actual_close_date DATE,
  lost_reason TEXT,
  won_booking_id UUID,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing leads table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'stage_id') THEN
    ALTER TABLE leads ADD COLUMN stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'source_detail') THEN
    ALTER TABLE leads ADD COLUMN source_detail TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'title') THEN
    ALTER TABLE leads ADD COLUMN title TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'description') THEN
    ALTER TABLE leads ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'event_type') THEN
    ALTER TABLE leads ADD COLUMN event_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'event_date') THEN
    ALTER TABLE leads ADD COLUMN event_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'guest_count') THEN
    ALTER TABLE leads ADD COLUMN guest_count INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'estimated_value') THEN
    ALTER TABLE leads ADD COLUMN estimated_value NUMERIC(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'probability') THEN
    ALTER TABLE leads ADD COLUMN probability INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'venue_id') THEN
    ALTER TABLE leads ADD COLUMN venue_id UUID REFERENCES venues(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'assigned_to') THEN
    ALTER TABLE leads ADD COLUMN assigned_to UUID REFERENCES platform_users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'last_activity_at') THEN
    ALTER TABLE leads ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'expected_close_date') THEN
    ALTER TABLE leads ADD COLUMN expected_close_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'actual_close_date') THEN
    ALTER TABLE leads ADD COLUMN actual_close_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'lost_reason') THEN
    ALTER TABLE leads ADD COLUMN lost_reason TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'won_booking_id') THEN
    ALTER TABLE leads ADD COLUMN won_booking_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'tags') THEN
    ALTER TABLE leads ADD COLUMN tags TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'metadata') THEN
    ALTER TABLE leads ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'created_by') THEN
    ALTER TABLE leads ADD COLUMN created_by UUID REFERENCES platform_users(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_venue ON leads(venue_id);

-- Lead Activities
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  outcome TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities(activity_type);

-- Contact enhancements (LM-003) - Add columns if table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'lifetime_value') THEN
    ALTER TABLE contacts ADD COLUMN lifetime_value NUMERIC(14,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'total_events') THEN
    ALTER TABLE contacts ADD COLUMN total_events INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'preferences') THEN
    ALTER TABLE contacts ADD COLUMN preferences JSONB DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'last_interaction_at') THEN
    ALTER TABLE contacts ADD COLUMN last_interaction_at TIMESTAMPTZ;
  END IF;
END $$;

-- Contact Interactions
CREATE TABLE IF NOT EXISTS contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  channel TEXT,
  subject TEXT,
  content TEXT,
  direction TEXT DEFAULT 'outbound',
  sentiment TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_interactions_contact ON contact_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_org ON contact_interactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_type ON contact_interactions(interaction_type);

-- ============================================================================
-- PART 2: VENUE BOOKING (BK-001, BK-002, BK-003, BK-004)
-- ============================================================================

-- Venue Spaces (BK-002)
CREATE TABLE IF NOT EXISTS venue_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  space_type TEXT DEFAULT 'room',
  photos JSONB DEFAULT '[]',
  floor_number INT,
  square_footage NUMERIC(10,2),
  ceiling_height NUMERIC(5,2),
  amenities JSONB DEFAULT '[]',
  restrictions JSONB DEFAULT '{}',
  base_rental_rate NUMERIC(12,2),
  rental_rate_type TEXT DEFAULT 'flat',
  minimum_spend NUMERIC(12,2),
  setup_time_minutes INT DEFAULT 60,
  breakdown_time_minutes INT DEFAULT 60,
  is_combinable BOOLEAN DEFAULT false,
  combine_with UUID[],
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing venue_spaces table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_spaces' AND column_name = 'organization_id') THEN
    ALTER TABLE venue_spaces ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_spaces' AND column_name = 'active') THEN
    ALTER TABLE venue_spaces ADD COLUMN active BOOLEAN DEFAULT true;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_venue_spaces_venue ON venue_spaces(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_spaces_org ON venue_spaces(organization_id);
CREATE INDEX IF NOT EXISTS idx_venue_spaces_active ON venue_spaces(active);

-- Space Capacity Configurations
CREATE TABLE IF NOT EXISTS space_capacity_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES venue_spaces(id) ON DELETE CASCADE,
  setup_type TEXT NOT NULL,
  capacity INT NOT NULL,
  diagram_url TEXT,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_space_capacity_configs_space ON space_capacity_configs(space_id);

-- Space Pricing Rules
CREATE TABLE IF NOT EXISTS space_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES venue_spaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}',
  adjustment_type TEXT NOT NULL,
  adjustment_value NUMERIC(12,2) NOT NULL,
  priority INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_space_pricing_rules_space ON space_pricing_rules(space_id);

-- Venue Events / Calendar (BK-001)
CREATE TABLE IF NOT EXISTS venue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  space_id UUID REFERENCES venue_spaces(id) ON DELETE SET NULL,
  booking_id UUID,
  name TEXT NOT NULL,
  event_type TEXT,
  status TEXT DEFAULT 'tentative',
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  setup_start TIMESTAMPTZ,
  breakdown_end TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  color TEXT,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  notes TEXT,
  internal_notes TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_events_org ON venue_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_venue_events_venue ON venue_events(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_events_space ON venue_events(space_id);
CREATE INDEX IF NOT EXISTS idx_venue_events_dates ON venue_events(start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_venue_events_status ON venue_events(status);

-- Space Holds (BK-003)
CREATE TYPE hold_status AS ENUM ('active', 'expired', 'released', 'converted');
CREATE TYPE hold_priority AS ENUM ('first_right', 'standard', 'low');

CREATE TABLE IF NOT EXISTS space_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES venue_spaces(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  hold_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status hold_status DEFAULT 'active',
  priority hold_priority DEFAULT 'standard',
  expires_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES platform_users(id),
  released_by UUID REFERENCES platform_users(id),
  released_at TIMESTAMPTZ,
  converted_to_booking_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_space_holds_space ON space_holds(space_id);
CREATE INDEX IF NOT EXISTS idx_space_holds_date ON space_holds(hold_date);
CREATE INDEX IF NOT EXISTS idx_space_holds_status ON space_holds(status);
CREATE INDEX IF NOT EXISTS idx_space_holds_expires ON space_holds(expires_at);

-- Bookings (BK-004)
CREATE TYPE booking_status AS ENUM ('draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  booking_number TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
  event_type TEXT,
  event_name TEXT,
  status booking_status DEFAULT 'draft',
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  setup_time TIME,
  breakdown_time TIME,
  guest_count_expected INT,
  guest_count_guaranteed INT,
  guest_count_actual INT,
  package_id UUID,
  line_items JSONB DEFAULT '[]',
  subtotal NUMERIC(14,2) DEFAULT 0,
  tax_rate NUMERIC(5,4) DEFAULT 0,
  tax_amount NUMERIC(14,2) DEFAULT 0,
  service_charge_rate NUMERIC(5,4) DEFAULT 0,
  service_charge_amount NUMERIC(14,2) DEFAULT 0,
  discount_amount NUMERIC(14,2) DEFAULT 0,
  total_amount NUMERIC(14,2) DEFAULT 0,
  deposit_required NUMERIC(14,2) DEFAULT 0,
  deposit_paid NUMERIC(14,2) DEFAULT 0,
  balance_due NUMERIC(14,2) GENERATED ALWAYS AS (total_amount - deposit_paid) STORED,
  payment_status TEXT DEFAULT 'pending',
  special_requests TEXT,
  internal_notes TEXT,
  dietary_notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES platform_users(id),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES platform_users(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, booking_number)
);

CREATE INDEX IF NOT EXISTS idx_bookings_org ON bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_contact ON bookings(contact_id);
CREATE INDEX IF NOT EXISTS idx_bookings_venue ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(event_date);

-- Booking Spaces (many-to-many for multi-space bookings)
CREATE TABLE IF NOT EXISTS booking_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES venue_spaces(id) ON DELETE RESTRICT,
  setup_type TEXT,
  capacity INT,
  rental_amount NUMERIC(12,2),
  notes TEXT,
  UNIQUE(booking_id, space_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_spaces_booking ON booking_spaces(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_spaces_space ON booking_spaces(space_id);

-- Booking Templates
CREATE TABLE IF NOT EXISTS booking_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_type TEXT,
  description TEXT,
  default_package_id UUID,
  default_line_items JSONB DEFAULT '[]',
  default_timeline JSONB DEFAULT '[]',
  default_notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_templates_org ON booking_templates(organization_id);

-- ============================================================================
-- PART 3: DOCUMENT GENERATION (DG-001, DG-002, DG-004)
-- ============================================================================

-- Proposals (DG-001)
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired');

CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  proposal_number TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  status proposal_status DEFAULT 'draft',
  version INT DEFAULT 1,
  content JSONB NOT NULL DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  pricing_items JSONB DEFAULT '[]',
  subtotal NUMERIC(14,2) DEFAULT 0,
  tax_amount NUMERIC(14,2) DEFAULT 0,
  total NUMERIC(14,2) DEFAULT 0,
  terms TEXT,
  valid_until DATE,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  view_count INT DEFAULT 0,
  responded_at TIMESTAMPTZ,
  response_notes TEXT,
  signature_data JSONB,
  signed_at TIMESTAMPTZ,
  public_token TEXT UNIQUE,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, proposal_number)
);

-- Add missing columns to existing proposals table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'booking_id') THEN
    ALTER TABLE proposals ADD COLUMN booking_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'contact_id') THEN
    ALTER TABLE proposals ADD COLUMN contact_id UUID REFERENCES contacts(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'public_token') THEN
    ALTER TABLE proposals ADD COLUMN public_token TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'status') THEN
    ALTER TABLE proposals ADD COLUMN status TEXT DEFAULT 'draft';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_proposals_org ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_booking ON proposals(booking_id);
CREATE INDEX IF NOT EXISTS idx_proposals_contact ON proposals(contact_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_token ON proposals(public_token);

-- Proposal Templates
CREATE TABLE IF NOT EXISTS proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_type TEXT,
  content_blocks JSONB NOT NULL DEFAULT '[]',
  default_terms TEXT,
  styling JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposal_templates_org ON proposal_templates(organization_id);

-- Contract enhancements (DG-002) - Add e-signature support
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'signers') THEN
    ALTER TABLE contracts ADD COLUMN signers JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'signature_order') THEN
    ALTER TABLE contracts ADD COLUMN signature_order TEXT DEFAULT 'parallel';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'audit_trail') THEN
    ALTER TABLE contracts ADD COLUMN audit_trail JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'public_token') THEN
    ALTER TABLE contracts ADD COLUMN public_token TEXT UNIQUE;
  END IF;
END $$;

-- Contract Signatures
CREATE TABLE IF NOT EXISTS contract_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signer_role TEXT,
  signature_data JSONB,
  signed_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'pending',
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contract_signatures_contract ON contract_signatures(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_signatures_status ON contract_signatures(status);

-- Invoice enhancements (DG-004)
CREATE TABLE IF NOT EXISTS venue_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'draft',
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  line_items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(14,2) DEFAULT 0,
  tax_rate NUMERIC(5,4) DEFAULT 0,
  tax_amount NUMERIC(14,2) DEFAULT 0,
  service_charge NUMERIC(14,2) DEFAULT 0,
  discount_amount NUMERIC(14,2) DEFAULT 0,
  total NUMERIC(14,2) DEFAULT 0,
  amount_paid NUMERIC(14,2) DEFAULT 0,
  balance_due NUMERIC(14,2) GENERATED ALWAYS AS (total - amount_paid) STORED,
  payment_terms TEXT,
  notes TEXT,
  internal_notes TEXT,
  stripe_invoice_id TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  voided_by UUID REFERENCES platform_users(id),
  public_token TEXT UNIQUE,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_venue_invoices_org ON venue_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_venue_invoices_booking ON venue_invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_venue_invoices_contact ON venue_invoices(contact_id);
CREATE INDEX IF NOT EXISTS idx_venue_invoices_status ON venue_invoices(status);
CREATE INDEX IF NOT EXISTS idx_venue_invoices_due ON venue_invoices(due_date);

-- Invoice Payments
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES venue_invoices(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  reference_number TEXT,
  stripe_payment_id TEXT,
  stripe_charge_id TEXT,
  status TEXT DEFAULT 'completed',
  notes TEXT,
  recorded_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_date ON invoice_payments(payment_date);

-- ============================================================================
-- PART 4: PAYMENT SCHEDULES (PM-002)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES venue_invoices(id) ON DELETE SET NULL,
  name TEXT,
  deposit_percentage NUMERIC(5,2) DEFAULT 50,
  late_fee_percentage NUMERIC(5,2) DEFAULT 0,
  late_fee_grace_days INT DEFAULT 0,
  auto_reminder BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_schedules_booking ON payment_schedules(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_org ON payment_schedules(organization_id);

-- Payment Schedule Milestones
CREATE TABLE IF NOT EXISTS payment_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES payment_schedules(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  percentage NUMERIC(5,2),
  description TEXT,
  status TEXT DEFAULT 'pending',
  paid_amount NUMERIC(14,2) DEFAULT 0,
  paid_at TIMESTAMPTZ,
  payment_id UUID REFERENCES invoice_payments(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_milestones_schedule ON payment_milestones(schedule_id);
CREATE INDEX IF NOT EXISTS idx_payment_milestones_due ON payment_milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_milestones_status ON payment_milestones(status);

-- Payment Reminders
CREATE TABLE IF NOT EXISTS payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES payment_schedules(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES payment_milestones(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  channel TEXT DEFAULT 'email',
  recipient_email TEXT,
  message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing payment_reminders table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_reminders' AND column_name = 'schedule_id') THEN
    ALTER TABLE payment_reminders ADD COLUMN schedule_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_reminders' AND column_name = 'milestone_id') THEN
    ALTER TABLE payment_reminders ADD COLUMN milestone_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_reminders' AND column_name = 'scheduled_for') THEN
    ALTER TABLE payment_reminders ADD COLUMN scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payment_reminders_schedule ON payment_reminders(schedule_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_milestone ON payment_reminders(milestone_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_scheduled ON payment_reminders(scheduled_for);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

DO $$ 
DECLARE 
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'lead_capture_forms', 'lead_form_submissions', 'pipeline_stages', 'leads', 'lead_activities',
    'contact_interactions', 'venue_spaces', 'space_capacity_configs', 'space_pricing_rules',
    'venue_events', 'space_holds', 'bookings', 'booking_spaces', 'booking_templates',
    'proposals', 'proposal_templates', 'contract_signatures', 'venue_invoices', 'invoice_payments',
    'payment_schedules', 'payment_milestones', 'payment_reminders'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Organization-scoped read/write policies for all tables that have organization_id
DO $$
DECLARE
  tbl TEXT;
  has_org_id BOOLEAN;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'lead_capture_forms', 'pipeline_stages', 'leads', 'lead_activities',
    'contact_interactions', 'venue_spaces', 'space_capacity_configs', 'space_pricing_rules',
    'venue_events', 'space_holds', 'bookings', 'booking_spaces', 'booking_templates',
    'proposals', 'proposal_templates', 'venue_invoices', 'invoice_payments',
    'payment_schedules', 'payment_milestones', 'payment_reminders'
  ])
  LOOP
    -- Check if table has organization_id column
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = tbl AND column_name = 'organization_id'
    ) INTO has_org_id;
    
    IF has_org_id THEN
      -- Drop existing policies if they exist
      EXECUTE format('DROP POLICY IF EXISTS %I_org_read ON %I', tbl, tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I_org_write ON %I', tbl, tbl);
      
      -- Create read policy
      EXECUTE format('
        CREATE POLICY %I_org_read ON %I FOR SELECT
        USING (organization_id IN (
          SELECT organization_id FROM platform_users WHERE id = auth.uid()
        ))', tbl, tbl);
      
      -- Create write policy
      EXECUTE format('
        CREATE POLICY %I_org_write ON %I FOR ALL
        USING (organization_id IN (
          SELECT organization_id FROM platform_users WHERE id = auth.uid()
        ))', tbl, tbl);
    END IF;
  END LOOP;
END $$;

-- Special policy for lead_form_submissions (allow public inserts)
DROP POLICY IF EXISTS lead_form_submissions_public_insert ON lead_form_submissions;
CREATE POLICY lead_form_submissions_public_insert ON lead_form_submissions
  FOR INSERT WITH CHECK (true);

-- Special policy for contract_signatures (accessed via token)
DROP POLICY IF EXISTS contract_signatures_org_read ON contract_signatures;
CREATE POLICY contract_signatures_org_read ON contract_signatures FOR SELECT
  USING (contract_id IN (
    SELECT id FROM contracts WHERE organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
  ));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'lead_capture_forms', 'pipeline_stages', 'leads', 'venue_spaces',
    'venue_events', 'space_holds', 'bookings', 'booking_templates',
    'proposals', 'proposal_templates', 'venue_invoices',
    'payment_schedules', 'payment_milestones'
  ])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON %I', tbl, tbl);
    EXECUTE format('
      CREATE TRIGGER %I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl, tbl);
  END LOOP;
END $$;

-- Increment form submission count
CREATE OR REPLACE FUNCTION increment_form_submissions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lead_capture_forms
  SET submissions_count = submissions_count + 1
  WHERE id = NEW.form_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lead_form_submission_count ON lead_form_submissions;
CREATE TRIGGER lead_form_submission_count
  AFTER INSERT ON lead_form_submissions
  FOR EACH ROW EXECUTE FUNCTION increment_form_submissions();

-- Update lead last_activity_at
CREATE OR REPLACE FUNCTION update_lead_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE leads
  SET last_activity_at = NOW()
  WHERE id = NEW.lead_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lead_activity_update ON lead_activities;
CREATE TRIGGER lead_activity_update
  AFTER INSERT ON lead_activities
  FOR EACH ROW EXECUTE FUNCTION update_lead_activity();

-- Auto-expire holds
CREATE OR REPLACE FUNCTION expire_old_holds()
RETURNS void AS $$
BEGIN
  UPDATE space_holds
  SET status = 'expired'
  WHERE status = 'active' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
    NEW.booking_number := 'BK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
      LPAD(CAST(FLOOR(RANDOM() * 10000) AS TEXT), 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_number_gen ON bookings;
CREATE TRIGGER booking_number_gen
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION generate_booking_number();

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
      LPAD(CAST(FLOOR(RANDOM() * 10000) AS TEXT), 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invoice_number_gen ON venue_invoices;
CREATE TRIGGER invoice_number_gen
  BEFORE INSERT ON venue_invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- Generate proposal number
CREATE OR REPLACE FUNCTION generate_proposal_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.proposal_number IS NULL OR NEW.proposal_number = '' THEN
    NEW.proposal_number := 'PROP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
      LPAD(CAST(FLOOR(RANDOM() * 10000) AS TEXT), 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS proposal_number_gen ON proposals;
CREATE TRIGGER proposal_number_gen
  BEFORE INSERT ON proposals
  FOR EACH ROW EXECUTE FUNCTION generate_proposal_number();

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Allow anon to insert form submissions (public lead capture)
GRANT INSERT ON lead_form_submissions TO anon;
GRANT SELECT ON lead_capture_forms TO anon;

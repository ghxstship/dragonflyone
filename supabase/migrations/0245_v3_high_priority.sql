-- ============================================================================
-- V3 EXPANSION: HIGH PRIORITY FEATURES
-- Migration: 0046_v3_high_priority.sql
-- Features: FP-001 Floor Plans, CP-001 Client Portal, TK-001 Ticketing,
--           RP-001 Revenue Reports, RP-002 Occupancy Analytics
-- ============================================================================

-- ============================================================================
-- PART 1: FLOOR PLAN DESIGNER (FP-001)
-- ============================================================================

CREATE TABLE IF NOT EXISTS floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  space_id UUID REFERENCES venue_spaces(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version INT DEFAULT 1,
  canvas_data JSONB DEFAULT '{}',
  dimensions JSONB DEFAULT '{"width": 1000, "height": 800, "unit": "px"}',
  scale DECIMAL(10,4) DEFAULT 1.0,
  objects JSONB DEFAULT '[]',
  capacity_by_setup JSONB DEFAULT '{}',
  thumbnail_url TEXT,
  is_template BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS floor_plan_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  icon_svg TEXT,
  icon_url TEXT,
  dimensions JSONB DEFAULT '{"width": 50, "height": 50}',
  default_capacity INT DEFAULT 1,
  is_custom BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_floor_plans_org ON floor_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_floor_plans_space ON floor_plans(space_id);
CREATE INDEX IF NOT EXISTS idx_floor_plan_objects_org ON floor_plan_objects(organization_id);
CREATE INDEX IF NOT EXISTS idx_floor_plan_objects_category ON floor_plan_objects(category);

-- Default floor plan objects library
INSERT INTO floor_plan_objects (name, category, dimensions, default_capacity, is_custom) VALUES
  ('Round Table 60"', 'tables', '{"width": 60, "height": 60}', 8, false),
  ('Round Table 72"', 'tables', '{"width": 72, "height": 72}', 10, false),
  ('Rectangle Table 6ft', 'tables', '{"width": 72, "height": 30}', 6, false),
  ('Rectangle Table 8ft', 'tables', '{"width": 96, "height": 30}', 8, false),
  ('Cocktail Table', 'tables', '{"width": 30, "height": 30}', 4, false),
  ('Banquet Chair', 'seating', '{"width": 20, "height": 20}', 1, false),
  ('Chiavari Chair', 'seating', '{"width": 18, "height": 18}', 1, false),
  ('Lounge Sofa', 'seating', '{"width": 80, "height": 36}', 3, false),
  ('Stage 4x8', 'staging', '{"width": 96, "height": 48}', 0, false),
  ('Dance Floor 12x12', 'flooring', '{"width": 144, "height": 144}', 0, false),
  ('Bar 8ft', 'fixtures', '{"width": 96, "height": 30}', 0, false),
  ('Buffet Station', 'catering', '{"width": 72, "height": 30}', 0, false),
  ('DJ Booth', 'entertainment', '{"width": 60, "height": 48}', 0, false),
  ('Photo Booth', 'entertainment', '{"width": 72, "height": 72}', 0, false),
  ('Entrance/Exit', 'architecture', '{"width": 48, "height": 8}', 0, false),
  ('Column/Pillar', 'architecture', '{"width": 24, "height": 24}', 0, false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 2: CLIENT PORTAL (CP-001)
-- ============================================================================

CREATE TYPE client_portal_permission AS ENUM (
  'view_events', 'view_documents', 'view_invoices', 'make_payments',
  'send_messages', 'update_guest_count', 'sign_documents', 'all'
);

CREATE TABLE IF NOT EXISTS client_portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  access_token VARCHAR(255) UNIQUE NOT NULL,
  permissions JSONB DEFAULT '["view_events", "view_documents", "view_invoices"]',
  is_active BOOLEAN DEFAULT TRUE,
  last_accessed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_portal_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_id UUID NOT NULL REFERENCES client_portal_access(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_portal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  access_id UUID NOT NULL REFERENCES client_portal_access(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  subject VARCHAR(500),
  body TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  read_at TIMESTAMPTZ,
  replied_to_id UUID REFERENCES client_portal_messages(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_portal_access_contact ON client_portal_access(contact_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_access_token ON client_portal_access(access_token);
CREATE INDEX IF NOT EXISTS idx_client_portal_access_booking ON client_portal_access(booking_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_activities_access ON client_portal_activities(access_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_messages_access ON client_portal_messages(access_id);

-- Function to generate secure portal access token
CREATE OR REPLACE FUNCTION generate_portal_token()
RETURNS VARCHAR(255) AS $$
BEGIN
  RETURN 'portal_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 3: TICKETING ENHANCEMENTS (TK-001)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  quantity_available INT,
  quantity_sold INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  sales_start TIMESTAMPTZ,
  sales_end TIMESTAMPTZ,
  min_per_order INT DEFAULT 1,
  max_per_order INT DEFAULT 10,
  visibility VARCHAR(50) DEFAULT 'public' CHECK (visibility IN ('public', 'hidden', 'password', 'invite_only')),
  access_code VARCHAR(100),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE ticket_order_status AS ENUM (
  'pending', 'processing', 'completed', 'cancelled', 'refunded', 'partially_refunded'
);

CREATE TABLE IF NOT EXISTS ticket_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status ticket_order_status DEFAULT 'pending',
  tickets JSONB DEFAULT '[]',
  subtotal DECIMAL(10,2) DEFAULT 0,
  fees DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_code VARCHAR(100),
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  payment_status VARCHAR(50),
  purchaser_name VARCHAR(255),
  purchaser_email VARCHAR(255),
  purchaser_phone VARCHAR(50),
  billing_address JSONB,
  notes TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE ticket_status AS ENUM (
  'valid', 'used', 'cancelled', 'transferred', 'expired'
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES ticket_orders(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  barcode VARCHAR(100) UNIQUE NOT NULL,
  qr_code_url TEXT,
  attendee_name VARCHAR(255),
  attendee_email VARCHAR(255),
  attendee_phone VARCHAR(50),
  status ticket_status DEFAULT 'valid',
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES auth.users(id),
  transferred_to UUID REFERENCES contacts(id),
  transferred_at TIMESTAMPTZ,
  seat_assignment JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  checked_in_by UUID REFERENCES auth.users(id),
  method VARCHAR(50) DEFAULT 'scan' CHECK (method IN ('scan', 'manual', 'bulk')),
  location VARCHAR(255),
  device_info JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing ticket_types table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'organization_id') THEN
    ALTER TABLE ticket_types ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'event_id') THEN
    ALTER TABLE ticket_types ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add missing columns to existing tickets table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'organization_id') THEN
    ALTER TABLE tickets ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'order_id') THEN
    ALTER TABLE tickets ADD COLUMN order_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'ticket_type_id') THEN
    ALTER TABLE tickets ADD COLUMN ticket_type_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'event_id') THEN
    ALTER TABLE tickets ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'barcode') THEN
    ALTER TABLE tickets ADD COLUMN barcode VARCHAR(100) UNIQUE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_org ON ticket_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_event ON ticket_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_contact ON ticket_orders(contact_id);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_number ON ticket_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_tickets_order ON tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_barcode ON tickets(barcode);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_check_ins_ticket ON ticket_check_ins(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_check_ins_event ON ticket_check_ins(event_id);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_ticket_orders_number
  BEFORE INSERT ON ticket_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Function to generate ticket barcode
CREATE OR REPLACE FUNCTION generate_ticket_barcode()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.barcode IS NULL THEN
    NEW.barcode := 'TKT' || UPPER(SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 12)) ||
                   LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_tickets_barcode
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_barcode();

-- ============================================================================
-- PART 4: REPORTING & ANALYTICS (RP-001, RP-002)
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(100) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  columns JSONB DEFAULT '[]',
  grouping JSONB DEFAULT '[]',
  schedule JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES report_definitions(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  parameters JSONB DEFAULT '{}',
  result_summary JSONB,
  result_url TEXT,
  row_count INT,
  execution_time_ms INT,
  error_message TEXT,
  executed_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  widget_type VARCHAR(100) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  position JSONB DEFAULT '{"x": 0, "y": 0, "w": 4, "h": 3}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dashboard_widgets' AND column_name = 'organization_id') THEN
    ALTER TABLE dashboard_widgets ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dashboard_widgets' AND column_name = 'user_id') THEN
    ALTER TABLE dashboard_widgets ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_definitions' AND column_name = 'organization_id') THEN
    ALTER TABLE report_definitions ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_definitions' AND column_name = 'report_type') THEN
    ALTER TABLE report_definitions ADD COLUMN report_type VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_executions' AND column_name = 'report_id') THEN
    ALTER TABLE report_executions ADD COLUMN report_id UUID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_report_definitions_org ON report_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_report_definitions_type ON report_definitions(report_type);
CREATE INDEX IF NOT EXISTS idx_report_executions_report ON report_executions(report_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_org ON dashboard_widgets(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user ON dashboard_widgets(user_id);

-- ============================================================================
-- PART 5: RLS POLICIES
-- ============================================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'floor_plans', 'floor_plan_objects', 'client_portal_access', 'client_portal_activities',
    'client_portal_messages', 'ticket_types', 'ticket_orders', 'tickets', 'ticket_check_ins',
    'report_definitions', 'report_executions', 'dashboard_widgets'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;

-- ============================================================================
-- PART 6: GRANTS
-- ============================================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'floor_plans', 'floor_plan_objects', 'client_portal_access', 'client_portal_activities',
    'client_portal_messages', 'ticket_types', 'ticket_orders', 'tickets', 'ticket_check_ins',
    'report_definitions', 'report_executions', 'dashboard_widgets'
  ])
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO authenticated', tbl);
    EXECUTE format('GRANT SELECT ON %I TO anon', tbl);
  END LOOP;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

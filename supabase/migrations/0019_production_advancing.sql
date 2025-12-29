-- ============================================================================
-- 0019_production_advancing.sql
-- Production Advancing Catalog and Requests
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================

-- ============================================================================
-- ENUM TYPES FOR PRODUCTION ADVANCING
-- ============================================================================

CREATE TYPE advance_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'in_progress',
  'fulfilled',
  'rejected',
  'cancelled'
);

-- ============================================================================
-- PRODUCTION ADVANCING CATALOG (329 standardized items)
-- ============================================================================

CREATE TABLE production_advancing_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  item_name TEXT NOT NULL,
  common_variations TEXT[],
  related_accessories TEXT[],
  specifications TEXT,
  standard_unit TEXT NOT NULL,
  default_quantity NUMERIC(10,2) DEFAULT 1,
  estimated_cost_min NUMERIC(10,2),
  estimated_cost_max NUMERIC(10,2),
  lead_time_days INTEGER,
  requires_approval BOOLEAN DEFAULT false,
  approval_threshold NUMERIC(10,2),
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_catalog_category ON production_advancing_catalog(category);
CREATE INDEX idx_catalog_subcategory ON production_advancing_catalog(subcategory);
CREATE INDEX idx_catalog_item_id ON production_advancing_catalog(item_id);
CREATE INDEX idx_catalog_item_name ON production_advancing_catalog(item_name);
CREATE INDEX idx_catalog_enabled ON production_advancing_catalog(enabled) WHERE enabled = true;

-- ============================================================================
-- PRODUCTION ADVANCES (Advance Requests)
-- ============================================================================

CREATE TABLE production_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  advance_number TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  team_workspace TEXT,
  activation_name TEXT,
  description TEXT,
  submitter_id UUID NOT NULL REFERENCES platform_users(id),
  submitted_at TIMESTAMPTZ,
  status advance_status NOT NULL DEFAULT 'draft',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  needed_by_date DATE,
  delivery_location TEXT,
  delivery_contact TEXT,
  delivery_notes TEXT,
  reviewed_by UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  fulfilled_by UUID REFERENCES platform_users(id),
  fulfilled_at TIMESTAMPTZ,
  fulfillment_notes TEXT,
  estimated_cost NUMERIC(14,2),
  actual_cost NUMERIC(14,2),
  currency TEXT DEFAULT 'USD',
  attachments TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, advance_number)
);

CREATE INDEX idx_advances_org ON production_advances(organization_id);
CREATE INDEX idx_advances_project ON production_advances(project_id);
CREATE INDEX idx_advances_event ON production_advances(event_id);
CREATE INDEX idx_advances_status ON production_advances(status);
CREATE INDEX idx_advances_submitter ON production_advances(submitter_id);
CREATE INDEX idx_advances_submitted_at ON production_advances(submitted_at) WHERE submitted_at IS NOT NULL;
CREATE INDEX idx_advances_needed_by ON production_advances(needed_by_date) WHERE needed_by_date IS NOT NULL;

-- ============================================================================
-- PRODUCTION ADVANCE ITEMS (Line items)
-- ============================================================================

CREATE TABLE production_advance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_id UUID NOT NULL REFERENCES production_advances(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  catalog_item_id UUID REFERENCES production_advancing_catalog(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  specifications TEXT,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL,
  unit_cost NUMERIC(12,2),
  total_cost NUMERIC(12,2),
  quantity_fulfilled NUMERIC(10,2) DEFAULT 0,
  fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'partial', 'complete', 'cancelled')),
  vendor_id UUID REFERENCES procurement_vendors(id),
  vendor_name TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(advance_id, line_number)
);

CREATE INDEX idx_advance_items_advance ON production_advance_items(advance_id);
CREATE INDEX idx_advance_items_catalog ON production_advance_items(catalog_item_id) WHERE catalog_item_id IS NOT NULL;
CREATE INDEX idx_advance_items_status ON production_advance_items(fulfillment_status);

-- ============================================================================
-- PRODUCTION ADVANCE HISTORY (Status changes)
-- ============================================================================

CREATE TABLE production_advance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_id UUID NOT NULL REFERENCES production_advances(id) ON DELETE CASCADE,
  previous_status advance_status,
  new_status advance_status NOT NULL,
  changed_by UUID REFERENCES platform_users(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_advance_history_advance ON production_advance_history(advance_id, changed_at DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE production_advancing_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_advance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_advance_history ENABLE ROW LEVEL SECURITY;

-- Catalog policies (read for all authenticated)
CREATE POLICY catalog_select ON production_advancing_catalog FOR SELECT USING (true);
CREATE POLICY catalog_manage ON production_advancing_catalog FOR ALL USING (role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Advances policies
CREATE POLICY advances_select ON production_advances FOR SELECT USING (
  org_matches(organization_id) AND (
    submitter_id = current_platform_user_id() OR
    role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN')
  )
);
CREATE POLICY advances_insert ON production_advances FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY advances_update ON production_advances FOR UPDATE USING (
  org_matches(organization_id) AND (
    (status = 'draft' AND submitter_id = current_platform_user_id()) OR
    role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN')
  )
);
CREATE POLICY advances_delete ON production_advances FOR DELETE USING (
  org_matches(organization_id) AND status = 'draft' AND (
    submitter_id = current_platform_user_id() OR
    role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  )
);

-- Advance Items policies
CREATE POLICY advance_items_select ON production_advance_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM production_advances a WHERE a.id = advance_id AND org_matches(a.organization_id))
);
CREATE POLICY advance_items_manage ON production_advance_items FOR ALL USING (
  EXISTS (SELECT 1 FROM production_advances a WHERE a.id = advance_id AND org_matches(a.organization_id) AND (
    a.submitter_id = current_platform_user_id() OR
    role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN')
  ))
);

-- Advance History policies
CREATE POLICY advance_history_select ON production_advance_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM production_advances a WHERE a.id = advance_id AND org_matches(a.organization_id))
);
CREATE POLICY advance_history_insert ON production_advance_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM production_advances a WHERE a.id = advance_id AND org_matches(a.organization_id))
);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON production_advancing_catalog TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON production_advances TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON production_advance_items TO authenticated;
GRANT SELECT, INSERT ON production_advance_history TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER catalog_updated_at BEFORE UPDATE ON production_advancing_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER advances_updated_at BEFORE UPDATE ON production_advances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Status change trigger
CREATE OR REPLACE FUNCTION trigger_advance_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO production_advance_history (
      advance_id,
      previous_status,
      new_status,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      current_platform_user_id()
    );
    
    IF NEW.status = 'submitted' AND OLD.status = 'draft' THEN
      NEW.submitted_at := now();
    ELSIF NEW.status = 'approved' THEN
      NEW.approved_at := now();
      NEW.approved_by := current_platform_user_id();
    ELSIF NEW.status = 'fulfilled' THEN
      NEW.fulfilled_at := now();
      NEW.fulfilled_by := current_platform_user_id();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER advance_status_change
  BEFORE UPDATE ON production_advances
  FOR EACH ROW
  EXECUTE FUNCTION trigger_advance_status_change();

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION log_advance_event(
  p_advance_id UUID,
  p_status advance_status,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_current_status advance_status;
BEGIN
  SELECT status INTO v_current_status
  FROM production_advances
  WHERE id = p_advance_id;

  INSERT INTO production_advance_history (
    advance_id,
    previous_status,
    new_status,
    changed_by,
    notes
  ) VALUES (
    p_advance_id,
    v_current_status,
    p_status,
    current_platform_user_id(),
    p_notes
  ) RETURNING id INTO v_id;

  UPDATE production_advances
  SET status = p_status
  WHERE id = p_advance_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION log_advance_event TO authenticated;

-- ============================================================================
-- SEED PRODUCTION ADVANCING CATALOG (Sample categories)
-- ============================================================================

INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, standard_unit, specifications) VALUES
  -- Technical - Audio
  ('TECH-1000', 'Technical', 'Audio', 'PA System', 'Per Unit/Day', 'Main PA system for venue'),
  ('TECH-1001', 'Technical', 'Audio', 'Monitor System', 'Per Unit/Day', 'Stage monitor system'),
  ('TECH-1002', 'Technical', 'Audio', 'Wireless Microphone', 'Per Unit/Day', 'Handheld or lavalier'),
  ('TECH-1003', 'Technical', 'Audio', 'DI Box', 'Per Unit/Day', 'Direct injection box'),
  ('TECH-1004', 'Technical', 'Audio', 'Audio Console', 'Per Unit/Day', 'Mixing console'),
  
  -- Technical - Lighting
  ('TECH-2000', 'Technical', 'Lighting', 'Moving Head', 'Per Unit/Day', 'Intelligent moving head fixture'),
  ('TECH-2001', 'Technical', 'Lighting', 'LED Par', 'Per Unit/Day', 'LED par can'),
  ('TECH-2002', 'Technical', 'Lighting', 'Followspot', 'Per Unit/Day', 'Followspot with operator'),
  ('TECH-2003', 'Technical', 'Lighting', 'Lighting Console', 'Per Unit/Day', 'DMX lighting console'),
  ('TECH-2004', 'Technical', 'Lighting', 'Truss', 'Per Linear Foot', 'Aluminum truss'),
  
  -- Technical - Video
  ('TECH-3000', 'Technical', 'Video', 'LED Wall', 'Per Panel/Day', 'LED video wall panel'),
  ('TECH-3001', 'Technical', 'Video', 'Projector', 'Per Unit/Day', 'High-lumen projector'),
  ('TECH-3002', 'Technical', 'Video', 'Camera', 'Per Unit/Day', 'Broadcast camera'),
  ('TECH-3003', 'Technical', 'Video', 'Video Switcher', 'Per Unit/Day', 'Video production switcher'),
  ('TECH-3004', 'Technical', 'Video', 'Confidence Monitor', 'Per Unit/Day', 'Stage confidence monitor'),
  
  -- Hospitality
  ('HOSP-1000', 'Hospitality', 'Catering', 'Breakfast', 'Per Person', 'Continental or hot breakfast'),
  ('HOSP-1001', 'Hospitality', 'Catering', 'Lunch', 'Per Person', 'Plated or buffet lunch'),
  ('HOSP-1002', 'Hospitality', 'Catering', 'Dinner', 'Per Person', 'Plated or buffet dinner'),
  ('HOSP-1003', 'Hospitality', 'Catering', 'Snacks', 'Per Person', 'Snack service'),
  ('HOSP-1004', 'Hospitality', 'Beverages', 'Water', 'Per Case', 'Bottled water'),
  ('HOSP-1005', 'Hospitality', 'Beverages', 'Soft Drinks', 'Per Case', 'Assorted soft drinks'),
  ('HOSP-1006', 'Hospitality', 'Beverages', 'Coffee Service', 'Per Gallon', 'Hot coffee service'),
  
  -- Transportation
  ('TRANS-1000', 'Transportation', 'Ground', 'Passenger Van', 'Per Day', '12-15 passenger van'),
  ('TRANS-1001', 'Transportation', 'Ground', 'Sprinter Van', 'Per Day', 'Mercedes Sprinter'),
  ('TRANS-1002', 'Transportation', 'Ground', 'Box Truck', 'Per Day', '16-26 foot box truck'),
  ('TRANS-1003', 'Transportation', 'Ground', 'Semi Truck', 'Per Day', 'Tractor trailer'),
  ('TRANS-1004', 'Transportation', 'Ground', 'Golf Cart', 'Per Day', 'Electric golf cart'),
  
  -- Staging
  ('STAGE-1000', 'Staging', 'Platforms', 'Stage Deck', 'Per 4x8 Section', '4x8 stage deck'),
  ('STAGE-1001', 'Staging', 'Platforms', 'Riser', 'Per Unit', 'Drum riser or platform'),
  ('STAGE-1002', 'Staging', 'Drape', 'Pipe and Drape', 'Per Linear Foot', 'Pipe and drape system'),
  ('STAGE-1003', 'Staging', 'Drape', 'Backdrop', 'Per Unit', 'Custom backdrop'),
  ('STAGE-1004', 'Staging', 'Furniture', 'Podium', 'Per Unit', 'Speaking podium'),
  
  -- Power
  ('POWER-1000', 'Power', 'Distribution', 'Generator', 'Per Day', 'Portable generator'),
  ('POWER-1001', 'Power', 'Distribution', 'Distro Box', 'Per Unit', 'Power distribution box'),
  ('POWER-1002', 'Power', 'Cables', 'Feeder Cable', 'Per 100ft', 'Cam-lock feeder cable'),
  ('POWER-1003', 'Power', 'Cables', 'Extension Cord', 'Per Unit', 'Heavy duty extension'),
  
  -- Communications
  ('COMM-1000', 'Communications', 'Radio', 'Two-Way Radio', 'Per Unit/Day', 'Handheld two-way radio'),
  ('COMM-1001', 'Communications', 'Intercom', 'Clearcom System', 'Per Station', 'Wired intercom system'),
  ('COMM-1002', 'Communications', 'Internet', 'WiFi Hotspot', 'Per Unit/Day', 'Mobile WiFi hotspot'),
  
  -- Safety
  ('SAFE-1000', 'Safety', 'Barriers', 'Crowd Barrier', 'Per Unit', 'Steel crowd barrier'),
  ('SAFE-1001', 'Safety', 'Barriers', 'Bike Rack', 'Per Unit', 'Bike rack barrier'),
  ('SAFE-1002', 'Safety', 'Medical', 'First Aid Kit', 'Per Unit', 'Professional first aid kit'),
  ('SAFE-1003', 'Safety', 'Fire', 'Fire Extinguisher', 'Per Unit', 'ABC fire extinguisher')
ON CONFLICT (item_id) DO UPDATE SET
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  item_name = EXCLUDED.item_name,
  standard_unit = EXCLUDED.standard_unit,
  specifications = EXCLUDED.specifications,
  enabled = true,
  updated_at = now();

-- Comments
COMMENT ON TABLE production_advancing_catalog IS 'Global catalog of standardized production items across categories';
COMMENT ON TABLE production_advances IS 'Production advance requests submitted from COMPVSS, reviewed/approved in ATLVS';
COMMENT ON TABLE production_advance_items IS 'Line items for each production advance request with fulfillment tracking';
COMMENT ON COLUMN production_advances.team_workspace IS 'Team or workspace name (categorization)';
COMMENT ON COLUMN production_advances.activation_name IS 'Event activation name (categorization)';
COMMENT ON COLUMN production_advance_items.fulfillment_status IS 'Track fulfillment: pending, partial, complete, cancelled';

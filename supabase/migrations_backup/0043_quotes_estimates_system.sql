-- =====================================================
-- QUOTES & ESTIMATES SYSTEM
-- =====================================================
-- Proposal and quote management for ATLVS
-- Sales pipeline, pricing, approvals, and conversion to contracts

-- =====================================================
-- QUOTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Quote identification
  quote_number TEXT NOT NULL UNIQUE,
  version INTEGER DEFAULT 1,
  parent_quote_id UUID REFERENCES quotes(id), -- For revisions
  
  -- Client information
  client_id UUID REFERENCES clients(id),
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  
  -- Opportunity
  opportunity_name TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN (
    'concert', 'festival', 'corporate', 'private', 'sporting', 'theatrical',
    'wedding', 'conference', 'exhibition', 'other'
  )),
  event_date DATE,
  event_venue TEXT,
  event_location TEXT,
  
  -- Pricing
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  discount_percentage NUMERIC(5, 2) DEFAULT 0,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  tax_rate NUMERIC(5, 2) DEFAULT 0,
  total_amount NUMERIC(12, 2) GENERATED ALWAYS AS (
    subtotal - discount_amount + tax_amount
  ) STORED,
  currency TEXT DEFAULT 'USD',
  
  -- Payment terms
  payment_terms TEXT, -- Net 30, 50% deposit, etc.
  deposit_required BOOLEAN DEFAULT false,
  deposit_amount NUMERIC(10, 2),
  deposit_percentage NUMERIC(5, 2),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_review', 'sent', 'viewed', 'negotiating', 
    'accepted', 'declined', 'expired', 'converted'
  )),
  
  -- Dates
  issued_date DATE,
  valid_until DATE,
  accepted_date DATE,
  declined_date DATE,
  converted_date DATE, -- When converted to contract
  
  -- Conversion
  converted_to_contract_id UUID REFERENCES contracts(id),
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  terms_and_conditions TEXT,
  notes TEXT,
  internal_notes TEXT, -- Private notes for team
  
  -- Presentation
  template_id UUID, -- Quote template used
  custom_branding BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  
  -- Tracking
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  last_sent_at TIMESTAMPTZ,
  
  -- Ownership
  created_by UUID REFERENCES platform_users(id),
  assigned_to UUID REFERENCES platform_users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  tags TEXT[]
);

-- =====================================================
-- QUOTE LINE ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  -- Item details
  item_type TEXT NOT NULL CHECK (item_type IN (
    'labor', 'equipment', 'service', 'material', 'package', 'fee', 'discount'
  )),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Reference to catalog items
  catalog_item_id UUID, -- Reference to equipment, service catalog
  
  -- Pricing
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_of_measure TEXT DEFAULT 'each', -- each, hour, day, sqft, etc.
  unit_price NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  
  -- Discount
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  discount_percentage NUMERIC(5, 2) DEFAULT 0,
  
  -- Total
  total NUMERIC(12, 2) GENERATED ALWAYS AS (
    (quantity * unit_price) - discount_amount
  ) STORED,
  
  -- Tax
  taxable BOOLEAN DEFAULT true,
  
  -- Grouping and ordering
  section TEXT, -- Group items: "Audio", "Lighting", "Labor", etc.
  sort_order INTEGER DEFAULT 0,
  
  -- Optional/Required
  is_optional BOOLEAN DEFAULT false,
  is_selected BOOLEAN DEFAULT true, -- For optional items
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUOTE TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Template details
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- "Concert", "Festival", "Corporate", etc.
  
  -- Content
  default_terms TEXT,
  default_payment_terms TEXT,
  header_content TEXT,
  footer_content TEXT,
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Branding
  logo_url TEXT,
  color_scheme JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- =====================================================
-- QUOTE ACTIVITIES TABLE (Audit trail)
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'created', 'updated', 'sent', 'viewed', 'accepted', 'declined',
    'commented', 'revision_created', 'converted', 'expired'
  )),
  
  -- Actor
  user_id UUID REFERENCES platform_users(id),
  user_name TEXT,
  user_email TEXT,
  
  -- Details
  description TEXT,
  metadata JSONB,
  
  -- IP tracking (for client views)
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUOTE COMMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  -- Comment
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal team comments vs client-facing
  
  -- Author
  user_id UUID REFERENCES platform_users(id),
  user_name TEXT NOT NULL,
  
  -- Threading
  parent_comment_id UUID REFERENCES quote_comments(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_quotes_org ON quotes(organization_id);
CREATE INDEX idx_quotes_number ON quotes(quote_number);
CREATE INDEX idx_quotes_client ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_assigned ON quotes(assigned_to);
CREATE INDEX idx_quotes_event_date ON quotes(event_date);
CREATE INDEX idx_quotes_created ON quotes(created_at DESC);
CREATE INDEX idx_quotes_valid_until ON quotes(valid_until) WHERE status IN ('sent', 'viewed', 'negotiating');
CREATE INDEX idx_quotes_parent ON quotes(parent_quote_id) WHERE parent_quote_id IS NOT NULL;

CREATE INDEX idx_quote_line_items_quote ON quote_line_items(quote_id);
CREATE INDEX idx_quote_line_items_section ON quote_line_items(quote_id, section);
CREATE INDEX idx_quote_line_items_order ON quote_line_items(quote_id, sort_order);

CREATE INDEX idx_quote_templates_org ON quote_templates(organization_id);
CREATE INDEX idx_quote_templates_active ON quote_templates(is_active) WHERE is_active = true;

CREATE INDEX idx_quote_activities_quote ON quote_activities(quote_id);
CREATE INDEX idx_quote_activities_type ON quote_activities(activity_type);
CREATE INDEX idx_quote_activities_created ON quote_activities(created_at DESC);

CREATE INDEX idx_quote_comments_quote ON quote_comments(quote_id);
CREATE INDEX idx_quote_comments_parent ON quote_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_comments ENABLE ROW LEVEL SECURITY;

-- Quotes policies
CREATE POLICY "Users can view quotes in their organization"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update quotes in their organization"
  ON quotes FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
  );

-- Quote line items policies
CREATE POLICY "Users can view line items"
  ON quote_line_items FOR SELECT
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM quotes
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage line items"
  ON quote_line_items FOR ALL
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM quotes
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

-- Templates policies
CREATE POLICY "Users can view templates in their organization"
  ON quote_templates FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage templates"
  ON quote_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND organization_id = quote_templates.organization_id
      AND role IN ('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
    )
  );

-- Activities and comments (read-only for users)
CREATE POLICY "Users can view activities"
  ON quote_activities FOR SELECT
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM quotes
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view and create comments"
  ON quote_comments FOR ALL
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM quotes
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Generate next quote number
CREATE OR REPLACE FUNCTION generate_quote_number(org_id UUID)
RETURNS TEXT AS $$
DECLARE
  year_prefix TEXT;
  next_seq INTEGER;
  quote_num TEXT;
BEGIN
  year_prefix := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(quote_number FROM '\d+$') AS INTEGER)
  ), 0) + 1
  INTO next_seq
  FROM quotes
  WHERE organization_id = org_id
    AND quote_number LIKE 'Q' || year_prefix || '%';
  
  quote_num := 'Q' || year_prefix || LPAD(next_seq::TEXT, 4, '0');
  
  RETURN quote_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate quote totals from line items
CREATE OR REPLACE FUNCTION calculate_quote_totals(p_quote_id UUID)
RETURNS VOID AS $$
DECLARE
  v_subtotal NUMERIC(12, 2);
  v_discount NUMERIC(10, 2);
  v_tax_rate NUMERIC(5, 2);
  v_tax_amount NUMERIC(10, 2);
BEGIN
  -- Calculate subtotal from selected line items
  SELECT COALESCE(SUM(total), 0)
  INTO v_subtotal
  FROM quote_line_items
  WHERE quote_id = p_quote_id
    AND is_selected = true;
  
  -- Get quote discount and tax rate
  SELECT discount_amount, tax_rate
  INTO v_discount, v_tax_rate
  FROM quotes
  WHERE id = p_quote_id;
  
  -- Calculate tax
  v_tax_amount := (v_subtotal - COALESCE(v_discount, 0)) * (v_tax_rate / 100);
  
  -- Update quote
  UPDATE quotes
  SET 
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    updated_at = NOW()
  WHERE id = p_quote_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log quote activity
CREATE OR REPLACE FUNCTION log_quote_activity(
  p_quote_id UUID,
  p_activity_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
  v_user_name TEXT;
BEGIN
  -- Get user name if provided
  IF p_user_id IS NOT NULL THEN
    SELECT full_name INTO v_user_name
    FROM platform_users
    WHERE id = p_user_id;
  END IF;
  
  INSERT INTO quote_activities (
    quote_id,
    activity_type,
    user_id,
    user_name,
    description,
    metadata
  ) VALUES (
    p_quote_id,
    p_activity_type,
    p_user_id,
    v_user_name,
    p_description,
    p_metadata
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamps
CREATE TRIGGER update_quotes_timestamp
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

CREATE TRIGGER update_quote_templates_timestamp
  BEFORE UPDATE ON quote_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

-- Recalculate totals when line items change
CREATE OR REPLACE FUNCTION recalculate_quote_totals_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_quote_totals(COALESCE(NEW.quote_id, OLD.quote_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalc_totals_on_line_item_change
  AFTER INSERT OR UPDATE OR DELETE ON quote_line_items
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_quote_totals_trigger();

-- Log status changes
CREATE OR REPLACE FUNCTION log_quote_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM log_quote_activity(
      NEW.id,
      'updated',
      auth.uid(),
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_quote_status
  AFTER UPDATE OF status ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION log_quote_status_change();

COMMENT ON TABLE quotes IS 'Sales quotes and proposals for events and services';
COMMENT ON TABLE quote_line_items IS 'Individual line items within quotes with pricing';
COMMENT ON TABLE quote_templates IS 'Reusable quote templates with branding and terms';
COMMENT ON TABLE quote_activities IS 'Complete audit trail of quote lifecycle events';
COMMENT ON TABLE quote_comments IS 'Internal and client-facing comments on quotes';

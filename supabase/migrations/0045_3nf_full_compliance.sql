-- ============================================================================
-- 0045_3nf_full_compliance.sql
-- Complete 3NF Compliance: Ad-hoc Vendors & Contacts Address Finalization
-- GHXSTSHIP Platform - Database Normalization Completion
-- ============================================================================

-- ============================================================================
-- SECTION 1: AD-HOC VENDORS TABLE
-- Normalizes vendor_name fields by creating a proper table for vendors
-- that are not yet formalized in legend_organizations
-- ============================================================================

CREATE TABLE IF NOT EXISTS ad_hoc_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',
  tax_id TEXT,
  payment_terms TEXT DEFAULT 'net_30',
  notes TEXT,
  -- Link to legend_organizations when vendor is formalized
  promoted_to_vendor_id UUID REFERENCES legend_organizations(id) ON DELETE SET NULL,
  promoted_at TIMESTAMPTZ,
  promoted_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_hoc_vendors_org ON ad_hoc_vendors(organization_id);
CREATE INDEX IF NOT EXISTS idx_ad_hoc_vendors_name ON ad_hoc_vendors(organization_id, name);
CREATE INDEX IF NOT EXISTS idx_ad_hoc_vendors_promoted ON ad_hoc_vendors(promoted_to_vendor_id) WHERE promoted_to_vendor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ad_hoc_vendors_active ON ad_hoc_vendors(organization_id, is_active) WHERE is_active = true;

-- ============================================================================
-- SECTION 2: ADD AD-HOC VENDOR FK TO FINANCE TABLES
-- Replace vendor_name with proper FK reference
-- ============================================================================

-- Add ad_hoc_vendor_id to finance_expenses
ALTER TABLE finance_expenses 
  ADD COLUMN IF NOT EXISTS ad_hoc_vendor_id UUID REFERENCES ad_hoc_vendors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_ad_hoc_vendor ON finance_expenses(ad_hoc_vendor_id);

-- Add ad_hoc_vendor_id to finance_purchase_orders
ALTER TABLE finance_purchase_orders 
  ADD COLUMN IF NOT EXISTS ad_hoc_vendor_id UUID REFERENCES ad_hoc_vendors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_po_ad_hoc_vendor ON finance_purchase_orders(ad_hoc_vendor_id);

-- Add ad_hoc_vendor_id to bills
ALTER TABLE bills 
  ADD COLUMN IF NOT EXISTS ad_hoc_vendor_id UUID REFERENCES ad_hoc_vendors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bills_ad_hoc_vendor ON bills(ad_hoc_vendor_id);

-- Add ad_hoc_vendor_id to procurement_requests
ALTER TABLE procurement_requests 
  ADD COLUMN IF NOT EXISTS ad_hoc_vendor_id UUID REFERENCES ad_hoc_vendors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_procurement_requests_ad_hoc_vendor ON procurement_requests(ad_hoc_vendor_id);

-- ============================================================================
-- SECTION 3: DATA MIGRATION FUNCTIONS
-- Migrate existing vendor_name data to ad_hoc_vendors table
-- ============================================================================

-- Function to migrate vendor_name from finance_expenses
CREATE OR REPLACE FUNCTION migrate_expense_vendor_names()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_record RECORD;
  v_ad_hoc_id UUID;
BEGIN
  FOR v_record IN 
    SELECT DISTINCT fe.organization_id, fe.vendor_name
    FROM finance_expenses fe
    WHERE fe.vendor_name IS NOT NULL 
      AND fe.vendor_name != ''
      AND fe.vendor_id IS NULL
      AND fe.ad_hoc_vendor_id IS NULL
  LOOP
    -- Check if ad-hoc vendor already exists
    SELECT id INTO v_ad_hoc_id
    FROM ad_hoc_vendors
    WHERE organization_id = v_record.organization_id
      AND LOWER(name) = LOWER(v_record.vendor_name)
    LIMIT 1;
    
    -- Create if not exists
    IF v_ad_hoc_id IS NULL THEN
      INSERT INTO ad_hoc_vendors (organization_id, name)
      VALUES (v_record.organization_id, v_record.vendor_name)
      RETURNING id INTO v_ad_hoc_id;
    END IF;
    
    -- Update all expenses with this vendor_name
    UPDATE finance_expenses
    SET ad_hoc_vendor_id = v_ad_hoc_id
    WHERE organization_id = v_record.organization_id
      AND vendor_name = v_record.vendor_name
      AND vendor_id IS NULL
      AND ad_hoc_vendor_id IS NULL;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to migrate vendor_name from finance_purchase_orders
CREATE OR REPLACE FUNCTION migrate_po_vendor_names()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_record RECORD;
  v_ad_hoc_id UUID;
BEGIN
  FOR v_record IN 
    SELECT DISTINCT fpo.organization_id, fpo.vendor_name
    FROM finance_purchase_orders fpo
    WHERE fpo.vendor_name IS NOT NULL 
      AND fpo.vendor_name != ''
      AND fpo.vendor_id IS NULL
      AND fpo.ad_hoc_vendor_id IS NULL
  LOOP
    -- Check if ad-hoc vendor already exists
    SELECT id INTO v_ad_hoc_id
    FROM ad_hoc_vendors
    WHERE organization_id = v_record.organization_id
      AND LOWER(name) = LOWER(v_record.vendor_name)
    LIMIT 1;
    
    -- Create if not exists
    IF v_ad_hoc_id IS NULL THEN
      INSERT INTO ad_hoc_vendors (organization_id, name)
      VALUES (v_record.organization_id, v_record.vendor_name)
      RETURNING id INTO v_ad_hoc_id;
    END IF;
    
    -- Update all POs with this vendor_name
    UPDATE finance_purchase_orders
    SET ad_hoc_vendor_id = v_ad_hoc_id
    WHERE organization_id = v_record.organization_id
      AND vendor_name = v_record.vendor_name
      AND vendor_id IS NULL
      AND ad_hoc_vendor_id IS NULL;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to migrate vendor_name from bills
CREATE OR REPLACE FUNCTION migrate_bill_vendor_names()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_record RECORD;
  v_ad_hoc_id UUID;
BEGIN
  FOR v_record IN 
    SELECT DISTINCT b.organization_id, b.vendor_name
    FROM bills b
    WHERE b.vendor_name IS NOT NULL 
      AND b.vendor_name != ''
      AND b.vendor_id IS NULL
      AND b.ad_hoc_vendor_id IS NULL
  LOOP
    -- Check if ad-hoc vendor already exists
    SELECT id INTO v_ad_hoc_id
    FROM ad_hoc_vendors
    WHERE organization_id = v_record.organization_id
      AND LOWER(name) = LOWER(v_record.vendor_name)
    LIMIT 1;
    
    -- Create if not exists
    IF v_ad_hoc_id IS NULL THEN
      INSERT INTO ad_hoc_vendors (organization_id, name)
      VALUES (v_record.organization_id, v_record.vendor_name)
      RETURNING id INTO v_ad_hoc_id;
    END IF;
    
    -- Update all bills with this vendor_name
    UPDATE bills
    SET ad_hoc_vendor_id = v_ad_hoc_id
    WHERE organization_id = v_record.organization_id
      AND vendor_name = v_record.vendor_name
      AND vendor_id IS NULL
      AND ad_hoc_vendor_id IS NULL;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to migrate preferred_vendor_name from procurement_requests
CREATE OR REPLACE FUNCTION migrate_procurement_vendor_names()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_record RECORD;
  v_ad_hoc_id UUID;
BEGIN
  FOR v_record IN 
    SELECT DISTINCT pr.organization_id, pr.preferred_vendor_name
    FROM procurement_requests pr
    WHERE pr.preferred_vendor_name IS NOT NULL 
      AND pr.preferred_vendor_name != ''
      AND pr.vendor_id IS NULL
      AND pr.ad_hoc_vendor_id IS NULL
  LOOP
    -- Check if ad-hoc vendor already exists
    SELECT id INTO v_ad_hoc_id
    FROM ad_hoc_vendors
    WHERE organization_id = v_record.organization_id
      AND LOWER(name) = LOWER(v_record.preferred_vendor_name)
    LIMIT 1;
    
    -- Create if not exists
    IF v_ad_hoc_id IS NULL THEN
      INSERT INTO ad_hoc_vendors (organization_id, name)
      VALUES (v_record.organization_id, v_record.preferred_vendor_name)
      RETURNING id INTO v_ad_hoc_id;
    END IF;
    
    -- Update all procurement requests with this vendor_name
    UPDATE procurement_requests
    SET ad_hoc_vendor_id = v_ad_hoc_id
    WHERE organization_id = v_record.organization_id
      AND preferred_vendor_name = v_record.preferred_vendor_name
      AND vendor_id IS NULL
      AND ad_hoc_vendor_id IS NULL;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Master migration function
CREATE OR REPLACE FUNCTION migrate_all_vendor_names()
RETURNS TABLE(table_name TEXT, migrated_count INTEGER) AS $$
BEGIN
  table_name := 'finance_expenses';
  migrated_count := migrate_expense_vendor_names();
  RETURN NEXT;
  
  table_name := 'finance_purchase_orders';
  migrated_count := migrate_po_vendor_names();
  RETURN NEXT;
  
  table_name := 'bills';
  migrated_count := migrate_bill_vendor_names();
  RETURN NEXT;
  
  table_name := 'procurement_requests';
  migrated_count := migrate_procurement_vendor_names();
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 4: PROMOTE AD-HOC VENDOR TO LEGEND ORGANIZATION
-- Function to formalize an ad-hoc vendor
-- ============================================================================

CREATE OR REPLACE FUNCTION promote_ad_hoc_vendor(
  p_ad_hoc_vendor_id UUID,
  p_promoted_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_ad_hoc RECORD;
  v_legend_org_id UUID;
BEGIN
  -- Get ad-hoc vendor details
  SELECT * INTO v_ad_hoc FROM ad_hoc_vendors WHERE id = p_ad_hoc_vendor_id;
  
  IF v_ad_hoc IS NULL THEN
    RAISE EXCEPTION 'Ad-hoc vendor not found: %', p_ad_hoc_vendor_id;
  END IF;
  
  IF v_ad_hoc.promoted_to_vendor_id IS NOT NULL THEN
    RAISE EXCEPTION 'Ad-hoc vendor already promoted to: %', v_ad_hoc.promoted_to_vendor_id;
  END IF;
  
  -- Create legend_organizations record
  INSERT INTO legend_organizations (
    organization_id,
    name,
    display_name,
    org_type,
    status,
    primary_email,
    primary_phone,
    metadata
  ) VALUES (
    v_ad_hoc.organization_id,
    v_ad_hoc.name,
    v_ad_hoc.name,
    'vendor',
    'active',
    v_ad_hoc.contact_email,
    v_ad_hoc.contact_phone,
    jsonb_build_object(
      'promoted_from_ad_hoc', p_ad_hoc_vendor_id,
      'original_notes', v_ad_hoc.notes
    )
  )
  RETURNING id INTO v_legend_org_id;
  
  -- Create address if provided
  IF v_ad_hoc.address_line1 IS NOT NULL OR v_ad_hoc.city IS NOT NULL THEN
    INSERT INTO addresses (
      organization_id,
      address_type,
      street_address,
      street_address_2,
      city,
      state_province,
      postal_code,
      country
    ) VALUES (
      v_ad_hoc.organization_id,
      'business',
      v_ad_hoc.address_line1,
      v_ad_hoc.address_line2,
      v_ad_hoc.city,
      v_ad_hoc.state,
      v_ad_hoc.postal_code,
      COALESCE(v_ad_hoc.country, 'USA')
    );
  END IF;
  
  -- Update ad-hoc vendor with promotion info
  UPDATE ad_hoc_vendors
  SET 
    promoted_to_vendor_id = v_legend_org_id,
    promoted_at = now(),
    promoted_by = p_promoted_by,
    is_active = false
  WHERE id = p_ad_hoc_vendor_id;
  
  -- Update all references to use the new legend_organizations record
  UPDATE finance_expenses
  SET vendor_id = v_legend_org_id, ad_hoc_vendor_id = NULL
  WHERE ad_hoc_vendor_id = p_ad_hoc_vendor_id;
  
  UPDATE finance_purchase_orders
  SET vendor_id = v_legend_org_id, ad_hoc_vendor_id = NULL
  WHERE ad_hoc_vendor_id = p_ad_hoc_vendor_id;
  
  UPDATE bills
  SET vendor_id = v_legend_org_id, ad_hoc_vendor_id = NULL
  WHERE ad_hoc_vendor_id = p_ad_hoc_vendor_id;
  
  UPDATE procurement_requests
  SET vendor_id = v_legend_org_id, ad_hoc_vendor_id = NULL
  WHERE ad_hoc_vendor_id = p_ad_hoc_vendor_id;
  
  RETURN v_legend_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 5: NORMALIZED VIEWS
-- Views that provide unified vendor access
-- ============================================================================

CREATE OR REPLACE VIEW v_expenses_with_vendor AS
SELECT 
  fe.id,
  fe.organization_id,
  fe.expense_number,
  fe.category_id,
  fe.project_id,
  fe.department_id,
  fe.submitter_id,
  fe.amount,
  fe.currency,
  fe.expense_date,
  fe.description,
  fe.receipt_url,
  fe.receipt_required,
  fe.status,
  fe.approved_by,
  fe.approved_at,
  fe.paid_at,
  fe.rejection_reason,
  fe.ledger_entry_id,
  fe.metadata,
  fe.created_at,
  fe.updated_at,
  -- Normalized vendor info
  COALESCE(fe.vendor_id, ahv.promoted_to_vendor_id) AS resolved_vendor_id,
  fe.ad_hoc_vendor_id,
  COALESCE(lo.name, ahv.name, fe.vendor_name) AS vendor_display_name,
  CASE 
    WHEN fe.vendor_id IS NOT NULL THEN 'legend_organization'
    WHEN fe.ad_hoc_vendor_id IS NOT NULL THEN 'ad_hoc_vendor'
    WHEN fe.vendor_name IS NOT NULL THEN 'legacy_text'
    ELSE NULL
  END AS vendor_source
FROM finance_expenses fe
LEFT JOIN legend_organizations lo ON fe.vendor_id = lo.id
LEFT JOIN ad_hoc_vendors ahv ON fe.ad_hoc_vendor_id = ahv.id;

CREATE OR REPLACE VIEW v_purchase_orders_with_vendor AS
SELECT 
  fpo.id,
  fpo.organization_id,
  fpo.po_number,
  fpo.project_id,
  fpo.department_id,
  fpo.requested_by,
  fpo.status,
  fpo.order_date,
  fpo.expected_delivery_date,
  fpo.shipping_address,
  fpo.billing_address,
  fpo.subtotal,
  fpo.tax_amount,
  fpo.shipping_amount,
  fpo.total_amount,
  fpo.currency,
  fpo.payment_terms,
  fpo.notes,
  fpo.approved_by,
  fpo.approved_at,
  fpo.received_by,
  fpo.received_at,
  fpo.metadata,
  fpo.created_at,
  fpo.updated_at,
  -- Normalized vendor info
  COALESCE(fpo.vendor_id, ahv.promoted_to_vendor_id) AS resolved_vendor_id,
  fpo.ad_hoc_vendor_id,
  COALESCE(lo.name, ahv.name, fpo.vendor_name) AS vendor_display_name,
  CASE 
    WHEN fpo.vendor_id IS NOT NULL THEN 'legend_organization'
    WHEN fpo.ad_hoc_vendor_id IS NOT NULL THEN 'ad_hoc_vendor'
    WHEN fpo.vendor_name IS NOT NULL THEN 'legacy_text'
    ELSE NULL
  END AS vendor_source
FROM finance_purchase_orders fpo
LEFT JOIN legend_organizations lo ON fpo.vendor_id = lo.id
LEFT JOIN ad_hoc_vendors ahv ON fpo.ad_hoc_vendor_id = ahv.id;

CREATE OR REPLACE VIEW v_bills_with_vendor AS
SELECT 
  b.id,
  b.organization_id,
  b.bill_number,
  b.purchase_order_id,
  b.project_id,
  b.bill_date,
  b.due_date,
  b.subtotal,
  b.tax_amount,
  b.total_amount,
  b.currency,
  b.status,
  b.paid_amount,
  b.paid_at,
  b.notes,
  b.attachments,
  b.metadata,
  b.created_at,
  b.updated_at,
  -- Normalized vendor info
  COALESCE(b.vendor_id, ahv.promoted_to_vendor_id) AS resolved_vendor_id,
  b.ad_hoc_vendor_id,
  COALESCE(lo.name, ahv.name, b.vendor_name) AS vendor_display_name,
  CASE 
    WHEN b.vendor_id IS NOT NULL THEN 'legend_organization'
    WHEN b.ad_hoc_vendor_id IS NOT NULL THEN 'ad_hoc_vendor'
    WHEN b.vendor_name IS NOT NULL THEN 'legacy_text'
    ELSE NULL
  END AS vendor_source
FROM bills b
LEFT JOIN legend_organizations lo ON b.vendor_id = lo.id
LEFT JOIN ad_hoc_vendors ahv ON b.ad_hoc_vendor_id = ahv.id;

-- ============================================================================
-- SECTION 6: CONTACTS ADDRESS FINALIZATION
-- Complete the address normalization started in 0038
-- ============================================================================

-- Ensure all contacts with inline addresses have been migrated
-- This is a verification function, not a migration
CREATE OR REPLACE FUNCTION verify_contacts_address_migration()
RETURNS TABLE(
  unmigrated_count BIGINT,
  migrated_count BIGINT,
  total_count BIGINT
) AS $$
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE address_id IS NULL AND (address IS NOT NULL OR city IS NOT NULL)),
    COUNT(*) FILTER (WHERE address_id IS NOT NULL),
    COUNT(*)
  INTO unmigrated_count, migrated_count, total_count
  FROM contacts;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 7: RLS POLICIES FOR AD-HOC VENDORS
-- ============================================================================

ALTER TABLE ad_hoc_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY ad_hoc_vendors_select ON ad_hoc_vendors 
  FOR SELECT USING (org_matches(organization_id));

CREATE POLICY ad_hoc_vendors_insert ON ad_hoc_vendors 
  FOR INSERT WITH CHECK (org_matches(organization_id));

CREATE POLICY ad_hoc_vendors_update ON ad_hoc_vendors 
  FOR UPDATE USING (org_matches(organization_id));

CREATE POLICY ad_hoc_vendors_delete ON ad_hoc_vendors 
  FOR DELETE USING (
    org_matches(organization_id) 
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'LEGEND_SUPER_ADMIN')
  );

-- ============================================================================
-- SECTION 8: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ad_hoc_vendors TO authenticated;

-- ============================================================================
-- SECTION 9: TRIGGERS
-- ============================================================================

CREATE TRIGGER ad_hoc_vendors_updated_at 
  BEFORE UPDATE ON ad_hoc_vendors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 10: DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE ad_hoc_vendors IS '3NF compliant table for vendors not yet formalized in legend_organizations. Replaces inline vendor_name fields.';
COMMENT ON FUNCTION migrate_all_vendor_names IS 'Migrates all vendor_name text fields to normalized ad_hoc_vendors references. Run once after deployment.';
COMMENT ON FUNCTION promote_ad_hoc_vendor IS 'Promotes an ad-hoc vendor to a full legend_organizations record and updates all references.';
COMMENT ON VIEW v_expenses_with_vendor IS 'View providing expenses with unified vendor information from all sources.';
COMMENT ON VIEW v_purchase_orders_with_vendor IS 'View providing purchase orders with unified vendor information from all sources.';
COMMENT ON VIEW v_bills_with_vendor IS 'View providing bills with unified vendor information from all sources.';

-- ============================================================================
-- SECTION 11: DEPRECATION MARKERS
-- Mark vendor_name columns as deprecated (will be dropped in future migration)
-- ============================================================================

COMMENT ON COLUMN finance_expenses.vendor_name IS 'DEPRECATED: Use vendor_id or ad_hoc_vendor_id instead. Will be removed in future migration.';
COMMENT ON COLUMN finance_purchase_orders.vendor_name IS 'DEPRECATED: Use vendor_id or ad_hoc_vendor_id instead. Will be removed in future migration.';
COMMENT ON COLUMN bills.vendor_name IS 'DEPRECATED: Use vendor_id or ad_hoc_vendor_id instead. Will be removed in future migration.';
COMMENT ON COLUMN procurement_requests.preferred_vendor_name IS 'DEPRECATED: Use vendor_id or ad_hoc_vendor_id instead. Will be removed in future migration.';
COMMENT ON COLUMN contacts.address IS 'DEPRECATED: Use address_id instead. Will be removed in future migration.';
COMMENT ON COLUMN contacts.city IS 'DEPRECATED: Use address_id instead. Will be removed in future migration.';
COMMENT ON COLUMN contacts.state IS 'DEPRECATED: Use address_id instead. Will be removed in future migration.';
COMMENT ON COLUMN contacts.postal_code IS 'DEPRECATED: Use address_id instead. Will be removed in future migration.';
COMMENT ON COLUMN contacts.country IS 'DEPRECATED: Use address_id instead. Will be removed in future migration.';


-- Migration: Quotes Business Logic Functions
-- Description: RPC functions for quote management, numbering, activity logging, and conversions

-- Generate quote number function
CREATE OR REPLACE FUNCTION generate_quote_number(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prefix TEXT;
  year_suffix TEXT;
  sequence_num INT;
  new_number TEXT;
BEGIN
  -- Get organization prefix or use default
  SELECT COALESCE(settings->>'quote_prefix', 'QT') INTO prefix
  FROM organizations WHERE id = org_id;
  
  IF prefix IS NULL THEN
    prefix := 'QT';
  END IF;
  
  -- Get year suffix
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Get next sequence number for this org and year
  SELECT COALESCE(MAX(
    CASE 
      WHEN quote_number ~ ('^' || prefix || year_suffix || '-[0-9]+$')
      THEN CAST(SUBSTRING(quote_number FROM '[0-9]+$') AS INT)
      ELSE 0
    END
  ), 0) + 1 INTO sequence_num
  FROM quotes
  WHERE organization_id = org_id
    AND quote_number LIKE prefix || year_suffix || '-%';
  
  -- Format: QT24-0001
  new_number := prefix || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$;

-- Generate contract number function
CREATE OR REPLACE FUNCTION generate_contract_number(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prefix TEXT;
  year_suffix TEXT;
  sequence_num INT;
  new_number TEXT;
BEGIN
  SELECT COALESCE(settings->>'contract_prefix', 'CT') INTO prefix
  FROM organizations WHERE id = org_id;
  
  IF prefix IS NULL THEN
    prefix := 'CT';
  END IF;
  
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN contract_number ~ ('^' || prefix || year_suffix || '-[0-9]+$')
      THEN CAST(SUBSTRING(contract_number FROM '[0-9]+$') AS INT)
      ELSE 0
    END
  ), 0) + 1 INTO sequence_num
  FROM contracts
  WHERE organization_id = org_id
    AND contract_number LIKE prefix || year_suffix || '-%';
  
  new_number := prefix || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$;

-- Generate invoice number function
CREATE OR REPLACE FUNCTION generate_invoice_number(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prefix TEXT;
  year_suffix TEXT;
  sequence_num INT;
  new_number TEXT;
BEGIN
  SELECT COALESCE(settings->>'invoice_prefix', 'INV') INTO prefix
  FROM organizations WHERE id = org_id;
  
  IF prefix IS NULL THEN
    prefix := 'INV';
  END IF;
  
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN invoice_number ~ ('^' || prefix || year_suffix || '-[0-9]+$')
      THEN CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INT)
      ELSE 0
    END
  ), 0) + 1 INTO sequence_num
  FROM invoices
  WHERE organization_id = org_id
    AND invoice_number LIKE prefix || year_suffix || '-%';
  
  new_number := prefix || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$;

-- Generate project code function
CREATE OR REPLACE FUNCTION generate_project_code(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prefix TEXT;
  year_suffix TEXT;
  sequence_num INT;
  new_code TEXT;
BEGIN
  SELECT COALESCE(settings->>'project_prefix', 'PRJ') INTO prefix
  FROM organizations WHERE id = org_id;
  
  IF prefix IS NULL THEN
    prefix := 'PRJ';
  END IF;
  
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN project_code ~ ('^' || prefix || year_suffix || '-[0-9]+$')
      THEN CAST(SUBSTRING(project_code FROM '[0-9]+$') AS INT)
      ELSE 0
    END
  ), 0) + 1 INTO sequence_num
  FROM projects
  WHERE organization_id = org_id
    AND project_code LIKE prefix || year_suffix || '-%';
  
  new_code := prefix || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN new_code;
END;
$$;

-- Log quote activity function
CREATE OR REPLACE FUNCTION log_quote_activity(
  p_quote_id UUID,
  p_activity_type TEXT,
  p_user_id UUID,
  p_description TEXT,
  p_changes JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO quote_activity_log (
    quote_id,
    activity_type,
    user_id,
    description,
    changes,
    created_at
  ) VALUES (
    p_quote_id,
    p_activity_type,
    p_user_id,
    p_description,
    p_changes,
    NOW()
  )
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Convert quote to contract function
CREATE OR REPLACE FUNCTION convert_quote_to_contract(
  p_quote_id UUID,
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quote RECORD;
  v_contract_number TEXT;
  v_contract_id UUID;
  v_total_amount NUMERIC;
BEGIN
  -- Get quote details
  SELECT * INTO v_quote FROM quotes WHERE id = p_quote_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quote not found';
  END IF;
  
  IF v_quote.status != 'accepted' THEN
    RAISE EXCEPTION 'Only accepted quotes can be converted to contracts';
  END IF;
  
  -- Calculate total from line items
  SELECT COALESCE(SUM(
    (quantity * unit_price) - 
    COALESCE(discount_amount, 0) - 
    ((quantity * unit_price) * COALESCE(discount_percentage, 0) / 100)
  ), 0) INTO v_total_amount
  FROM quote_line_items
  WHERE quote_id = p_quote_id AND is_selected = true;
  
  -- Apply quote-level discount and tax
  v_total_amount := v_total_amount - COALESCE(v_quote.discount_amount, 0);
  v_total_amount := v_total_amount - (v_total_amount * COALESCE(v_quote.discount_percentage, 0) / 100);
  v_total_amount := v_total_amount + (v_total_amount * COALESCE(v_quote.tax_rate, 0) / 100);
  
  -- Generate contract number
  v_contract_number := generate_contract_number(v_quote.organization_id);
  
  -- Create contract
  INSERT INTO contracts (
    contract_number,
    organization_id,
    client_id,
    quote_id,
    title,
    description,
    status,
    contract_type,
    start_date,
    total_value,
    payment_terms,
    deposit_required,
    deposit_amount,
    terms_and_conditions,
    created_by,
    assigned_to
  ) VALUES (
    v_contract_number,
    v_quote.organization_id,
    v_quote.client_id,
    p_quote_id,
    v_quote.title,
    v_quote.description,
    'draft',
    'service_agreement',
    v_quote.event_date,
    v_total_amount,
    v_quote.payment_terms,
    v_quote.deposit_required,
    COALESCE(v_quote.deposit_amount, v_total_amount * COALESCE(v_quote.deposit_percentage, 0) / 100),
    v_quote.terms_and_conditions,
    p_user_id,
    v_quote.assigned_to
  )
  RETURNING id INTO v_contract_id;
  
  -- Copy line items to contract
  INSERT INTO contract_line_items (
    contract_id,
    item_type,
    name,
    description,
    quantity,
    unit_price,
    unit_of_measure,
    total_price,
    sort_order
  )
  SELECT 
    v_contract_id,
    item_type,
    name,
    description,
    quantity,
    unit_price,
    unit_of_measure,
    quantity * unit_price,
    sort_order
  FROM quote_line_items
  WHERE quote_id = p_quote_id AND is_selected = true
  ORDER BY sort_order;
  
  -- Update quote status
  UPDATE quotes SET
    status = 'converted',
    converted_to_contract_id = v_contract_id,
    converted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_quote_id;
  
  -- Log activity
  PERFORM log_quote_activity(
    p_quote_id,
    'converted_to_contract',
    p_user_id,
    'Converted to contract ' || v_contract_number
  );
  
  RETURN v_contract_id;
END;
$$;

-- Quote expiration check function (for scheduled jobs)
CREATE OR REPLACE FUNCTION check_quote_expirations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Mark expired quotes
  UPDATE quotes SET
    status = 'expired',
    updated_at = NOW()
  WHERE status IN ('sent', 'viewed', 'negotiating')
    AND valid_until < CURRENT_DATE
    AND valid_until IS NOT NULL;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$;

-- Calculate quote totals function
CREATE OR REPLACE FUNCTION calculate_quote_totals(p_quote_id UUID)
RETURNS TABLE (
  subtotal NUMERIC,
  taxable_amount NUMERIC,
  tax_amount NUMERIC,
  discount_amount NUMERIC,
  total_amount NUMERIC,
  optional_total NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quote RECORD;
  v_subtotal NUMERIC;
  v_taxable NUMERIC;
  v_tax NUMERIC;
  v_discount NUMERIC;
  v_total NUMERIC;
  v_optional NUMERIC;
BEGIN
  -- Get quote
  SELECT * INTO v_quote FROM quotes WHERE id = p_quote_id;
  
  -- Calculate subtotal from selected items
  SELECT COALESCE(SUM(
    (quantity * unit_price) - 
    COALESCE(li.discount_amount, 0) - 
    ((quantity * unit_price) * COALESCE(li.discount_percentage, 0) / 100)
  ), 0) INTO v_subtotal
  FROM quote_line_items li
  WHERE quote_id = p_quote_id AND is_selected = true;
  
  -- Calculate taxable amount
  SELECT COALESCE(SUM(
    (quantity * unit_price) - 
    COALESCE(li.discount_amount, 0) - 
    ((quantity * unit_price) * COALESCE(li.discount_percentage, 0) / 100)
  ), 0) INTO v_taxable
  FROM quote_line_items li
  WHERE quote_id = p_quote_id AND is_selected = true AND taxable = true;
  
  -- Calculate optional items total
  SELECT COALESCE(SUM(quantity * unit_price), 0) INTO v_optional
  FROM quote_line_items
  WHERE quote_id = p_quote_id AND is_optional = true AND is_selected = false;
  
  -- Apply quote-level discount
  v_discount := COALESCE(v_quote.discount_amount, 0) + 
                (v_subtotal * COALESCE(v_quote.discount_percentage, 0) / 100);
  
  -- Calculate tax
  v_tax := v_taxable * COALESCE(v_quote.tax_rate, 0) / 100;
  
  -- Calculate total
  v_total := v_subtotal - v_discount + v_tax;
  
  RETURN QUERY SELECT v_subtotal, v_taxable, v_tax, v_discount, v_total, v_optional;
END;
$$;

-- Update quote totals trigger function
CREATE OR REPLACE FUNCTION update_quote_totals_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_totals RECORD;
BEGIN
  -- Get calculated totals
  SELECT * INTO v_totals FROM calculate_quote_totals(
    COALESCE(NEW.quote_id, OLD.quote_id)
  );
  
  -- Update quote with new totals
  UPDATE quotes SET
    subtotal = v_totals.subtotal,
    tax_amount = v_totals.tax_amount,
    total_amount = v_totals.total_amount,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for quote line item changes
DROP TRIGGER IF EXISTS quote_line_items_totals_trigger ON quote_line_items;
CREATE TRIGGER quote_line_items_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON quote_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_totals_trigger();

-- Quote activity log table (if not exists)
CREATE TABLE IF NOT EXISTS quote_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  user_id UUID REFERENCES platform_users(id),
  description TEXT,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for activity log
CREATE INDEX IF NOT EXISTS idx_quote_activity_log_quote_id ON quote_activity_log(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_activity_log_created_at ON quote_activity_log(created_at DESC);

-- Add columns to quotes table if not exist
DO $$
BEGIN
  -- Add version column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'version') THEN
    ALTER TABLE quotes ADD COLUMN version INTEGER DEFAULT 1;
  END IF;
  
  -- Add parent_quote_id for revisions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'parent_quote_id') THEN
    ALTER TABLE quotes ADD COLUMN parent_quote_id UUID REFERENCES quotes(id);
  END IF;
  
  -- Add revision_number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'revision_number') THEN
    ALTER TABLE quotes ADD COLUMN revision_number INTEGER DEFAULT 0;
  END IF;
  
  -- Add converted_at timestamp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'converted_at') THEN
    ALTER TABLE quotes ADD COLUMN converted_at TIMESTAMPTZ;
  END IF;
  
  -- Add calculated total columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'subtotal') THEN
    ALTER TABLE quotes ADD COLUMN subtotal NUMERIC(15,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'tax_amount') THEN
    ALTER TABLE quotes ADD COLUMN tax_amount NUMERIC(15,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'total_amount') THEN
    ALTER TABLE quotes ADD COLUMN total_amount NUMERIC(15,2) DEFAULT 0;
  END IF;
END $$;

-- RLS policies for quote_activity_log
ALTER TABLE quote_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity for quotes they can access"
  ON quote_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quotes q
      WHERE q.id = quote_activity_log.quote_id
      AND (
        q.created_by = auth.uid()
        OR q.assigned_to = auth.uid()
        OR EXISTS (
          SELECT 1 FROM platform_users pu
          WHERE pu.id = auth.uid()
          AND pu.platform_roles && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN']
        )
      )
    )
  );

CREATE POLICY "System can insert activity logs"
  ON quote_activity_log FOR INSERT
  WITH CHECK (true);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_quote_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_contract_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invoice_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_project_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_quote_activity(UUID, TEXT, UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION convert_quote_to_contract(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_quote_totals(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_quote_expirations() TO authenticated;

-- 0185_fix_broken_functions.sql
-- Fixes 4 functions with incorrect column/table references identified by linter

-- 1. Fix duplicate_kpi_report - use user_roles instead of non-existent user_organizations
CREATE OR REPLACE FUNCTION public.duplicate_kpi_report(
  p_report_id uuid,
  p_new_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
  v_source_report RECORD;
  v_new_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user's organization from user_roles table
  SELECT organization_id INTO v_org_id
  FROM user_roles
  WHERE platform_user_id = v_user_id
  LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'User organization not found';
  END IF;

  -- Get source report
  SELECT * INTO v_source_report
  FROM kpi_reports
  WHERE id = p_report_id;

  IF v_source_report IS NULL THEN
    RAISE EXCEPTION 'Source report not found';
  END IF;

  -- Create duplicate
  INSERT INTO kpi_reports (
    organization_id,
    name,
    description,
    kpi_codes,
    category,
    filters,
    is_global,
    is_user_copy,
    source_report_id,
    created_by
  ) VALUES (
    v_org_id,
    COALESCE(p_new_name, v_source_report.name || ' (Copy)'),
    v_source_report.description,
    v_source_report.kpi_codes,
    v_source_report.category,
    v_source_report.filters,
    false,
    true,
    p_report_id,
    v_user_id
  ) RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

COMMENT ON FUNCTION public.duplicate_kpi_report(uuid, text) IS 'Create a user copy of a KPI report';

-- 2. Fix duplicate_catalog_item_to_org - production_advancing_catalog doesn't have description column
-- Use specifications or item_name as fallback
CREATE OR REPLACE FUNCTION public.duplicate_catalog_item_to_org(
  p_source_item_id uuid,
  p_organization_id uuid,
  p_custom_item_id text DEFAULT NULL,
  p_custom_name text DEFAULT NULL,
  p_is_locked boolean DEFAULT false,
  p_created_by uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_source_item RECORD;
  v_item_id TEXT;
  v_new_id UUID;
BEGIN
  -- Get source item from global catalog
  SELECT * INTO v_source_item
  FROM production_advancing_catalog
  WHERE id = p_source_item_id;

  IF v_source_item IS NULL THEN
    RAISE EXCEPTION 'Source catalog item not found';
  END IF;

  -- Generate item_id if not provided
  v_item_id := COALESCE(p_custom_item_id, 'ORG-' || SUBSTRING(gen_random_uuid()::text, 1, 8));

  -- Insert into organization catalog
  INSERT INTO organization_catalog_items (
    organization_id,
    source_catalog_item_id,
    item_id,
    item_name,
    description,
    category,
    subcategory,
    base_price_low,
    base_price_high,
    standard_unit,
    industry_verticals,
    procurement_type,
    is_locked,
    locked_by,
    locked_at,
    created_by
  )
  VALUES (
    p_organization_id,
    p_source_item_id,
    v_item_id,
    COALESCE(p_custom_name, v_source_item.item_name),
    v_source_item.specifications,  -- Use specifications instead of non-existent description
    v_source_item.category,
    v_source_item.subcategory,
    NULL,  -- base_price_low not in source
    NULL,  -- base_price_high not in source
    v_source_item.standard_unit,
    v_source_item.industry_verticals::text[],
    v_source_item.procurement_type::text,
    p_is_locked,
    CASE WHEN p_is_locked THEN p_created_by ELSE NULL END,
    CASE WHEN p_is_locked THEN NOW() ELSE NULL END,
    p_created_by
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

COMMENT ON FUNCTION public.duplicate_catalog_item_to_org(uuid, uuid, text, text, boolean, uuid) IS 'Duplicates a global catalog item to an organization custom catalog';

-- 3. Fix can_request_category - use role_code instead of non-existent role_id
CREATE OR REPLACE FUNCTION public.can_request_category(
  p_user_id uuid,
  p_organization_id uuid,
  p_category text,
  p_subcategory text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_roles TEXT[];
  v_allowed_roles TEXT[];
BEGIN
  -- Get user's roles using correct column name (role_code, not role_id)
  SELECT ARRAY_AGG(role_code)
  INTO v_user_roles
  FROM user_roles
  WHERE platform_user_id = p_user_id
    AND organization_id = p_organization_id;

  IF v_user_roles IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check category permissions
  SELECT allowed_roles INTO v_allowed_roles
  FROM asset_request_permissions
  WHERE organization_id = p_organization_id
    AND category = p_category
    AND (subcategory IS NULL OR subcategory = p_subcategory);

  -- If no specific permission exists, allow all roles
  IF v_allowed_roles IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check if user has any of the allowed roles
  RETURN v_user_roles && v_allowed_roles;
END;
$$;

COMMENT ON FUNCTION public.can_request_category(uuid, uuid, text, text) IS 'Checks if a user can request items from a specific category';

-- 4. Fix get_effective_catalog - production_advancing_catalog doesn't have description column
CREATE OR REPLACE FUNCTION public.get_effective_catalog(
  p_organization_id uuid,
  p_category text DEFAULT NULL,
  p_include_global boolean DEFAULT true
)
RETURNS TABLE(
  id uuid,
  item_id text,
  item_name text,
  description text,
  category text,
  subcategory text,
  base_price_low numeric,
  base_price_high numeric,
  standard_unit text,
  source_type text,
  is_locked boolean,
  is_preferred boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  -- Organization-specific catalog items
  SELECT 
    oci.id,
    oci.item_id,
    oci.item_name,
    oci.description,
    oci.category,
    oci.subcategory,
    oci.base_price_low,
    oci.base_price_high,
    oci.standard_unit,
    'organization'::TEXT AS source_type,
    oci.is_locked,
    oci.is_preferred
  FROM organization_catalog_items oci
  WHERE oci.organization_id = p_organization_id
    AND oci.enabled = TRUE
    AND (p_category IS NULL OR oci.category = p_category)
  
  UNION ALL
  
  -- Global catalog items (if not overridden by org-specific)
  SELECT 
    pac.id,
    pac.item_id,
    pac.item_name,
    pac.specifications AS description,  -- Use specifications instead of non-existent description
    pac.category,
    pac.subcategory,
    NULL::numeric AS base_price_low,
    NULL::numeric AS base_price_high,
    pac.standard_unit,
    'global'::TEXT AS source_type,
    FALSE AS is_locked,
    FALSE AS is_preferred
  FROM production_advancing_catalog pac
  WHERE pac.enabled = TRUE
    AND p_include_global = TRUE
    AND (p_category IS NULL OR pac.category = p_category)
    AND NOT EXISTS (
      SELECT 1 FROM organization_catalog_items oci2
      WHERE oci2.organization_id = p_organization_id
        AND oci2.source_catalog_item_id = pac.id
        AND oci2.enabled = TRUE
    )
  
  ORDER BY category, subcategory, item_name;
END;
$$;

COMMENT ON FUNCTION public.get_effective_catalog(uuid, text, boolean) IS 'Returns the effective catalog for an organization (global + org-specific)';

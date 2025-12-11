-- Migration: Fix Security Definer Views and Mutable Search Paths
-- Description: Fixes all remaining security issues flagged by Supabase linter
-- Date: 2025-12-11

-- ============================================================================
-- FIX VIEWS WITH SECURITY DEFINER
-- Views should use SECURITY INVOKER to run with caller's permissions
-- ============================================================================

-- Fix analytics_nps_summary view
DROP VIEW IF EXISTS public.analytics_nps_summary;
CREATE VIEW public.analytics_nps_summary 
WITH (security_invoker = true)
AS SELECT * FROM analytics.nps_summary;

GRANT SELECT ON public.analytics_nps_summary TO authenticated;

-- Fix analytics_asset_utilization view
DROP VIEW IF EXISTS public.analytics_asset_utilization;
CREATE VIEW public.analytics_asset_utilization 
WITH (security_invoker = true)
AS SELECT * FROM analytics.asset_utilization;

GRANT SELECT ON public.analytics_asset_utilization TO authenticated;

-- Fix analytics_project_budget_vs_actual view
DROP VIEW IF EXISTS public.analytics_project_budget_vs_actual;
CREATE VIEW public.analytics_project_budget_vs_actual 
WITH (security_invoker = true)
AS SELECT * FROM analytics.project_budget_vs_actual;

GRANT SELECT ON public.analytics_project_budget_vs_actual TO authenticated;

-- Fix user_event_roles view
DROP VIEW IF EXISTS public.user_event_roles;
CREATE VIEW public.user_event_roles 
WITH (security_invoker = true)
AS
SELECT
  era.id,
  era.organization_id,
  era.platform_user_id,
  pu.auth_user_id,
  era.role_code,
  erd.level,
  era.platform,
  era.project_id,
  era.external_event_ref,
  era.assigned_at,
  era.expires_at,
  era.metadata
FROM event_role_assignments era
JOIN platform_users pu ON pu.id = era.platform_user_id
JOIN event_role_definitions erd ON erd.code = era.role_code;

GRANT SELECT ON public.user_event_roles TO authenticated;

-- Fix analytics_kpi_summary view
DROP VIEW IF EXISTS public.analytics_kpi_summary;
CREATE VIEW public.analytics_kpi_summary 
WITH (security_invoker = true)
AS
SELECT
  kdp.organization_id,
  kdp.kpi_code,
  kdp.kpi_name,
  kdp.unit,
  count(*) as data_point_count,
  avg(kdp.value) as avg_value,
  min(kdp.value) as min_value,
  max(kdp.value) as max_value,
  stddev(kdp.value) as stddev_value,
  max(kdp.calculated_at) as last_calculated,
  kt.target_value,
  kt.warning_threshold,
  kt.critical_threshold
FROM kpi_data_points kdp
LEFT JOIN kpi_targets kt ON 
  kt.organization_id = kdp.organization_id 
  AND kt.kpi_code = kdp.kpi_code
  AND kdp.calculated_at BETWEEN kt.valid_from AND COALESCE(kt.valid_to, 'infinity'::timestamptz)
WHERE kdp.calculated_at >= now() - interval '90 days'
GROUP BY kdp.organization_id, kdp.kpi_code, kdp.kpi_name, kdp.unit, 
  kt.target_value, kt.warning_threshold, kt.critical_threshold;

GRANT SELECT ON public.analytics_kpi_summary TO authenticated;

-- ============================================================================
-- FIX FUNCTION WITH MUTABLE SEARCH PATH
-- ============================================================================

-- Fix update_template_items_timestamp function
CREATE OR REPLACE FUNCTION update_template_items_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- FIX ANY OTHER FUNCTIONS FROM 0178 THAT NEED SEARCH_PATH
-- ============================================================================

-- Fix create_advance_from_template
CREATE OR REPLACE FUNCTION create_advance_from_template(
  p_template_id UUID,
  p_organization_id UUID,
  p_project_id UUID DEFAULT NULL,
  p_team_workspace TEXT DEFAULT NULL,
  p_activation_name TEXT DEFAULT NULL,
  p_submitter_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template RECORD;
  v_advance_id UUID;
  v_total_cost DECIMAL(12,2) := 0;
BEGIN
  -- Get the template
  SELECT * INTO v_template
  FROM advance_templates
  WHERE id = p_template_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;
  
  -- Calculate total estimated cost from template items
  SELECT COALESCE(SUM(default_quantity * COALESCE(estimated_unit_cost, 0)), 0)
  INTO v_total_cost
  FROM advance_template_items
  WHERE template_id = p_template_id;
  
  -- Create the advance
  INSERT INTO production_advances (
    organization_id,
    project_id,
    team_workspace,
    activation_name,
    submitter_id,
    status,
    estimated_cost,
    currency,
    template_id
  )
  VALUES (
    p_organization_id,
    p_project_id,
    COALESCE(p_team_workspace, v_template.name),
    p_activation_name,
    p_submitter_id,
    'draft',
    v_total_cost,
    'USD',
    p_template_id
  )
  RETURNING id INTO v_advance_id;
  
  -- Copy template items to advance items
  INSERT INTO production_advance_items (
    advance_id,
    catalog_item_id,
    item_name,
    description,
    quantity,
    unit,
    unit_cost,
    total_cost,
    notes
  )
  SELECT
    v_advance_id,
    ati.catalog_item_id,
    ati.item_name,
    ati.description,
    ati.default_quantity,
    ati.unit,
    ati.estimated_unit_cost,
    ati.default_quantity * COALESCE(ati.estimated_unit_cost, 0),
    ati.notes
  FROM advance_template_items ati
  WHERE ati.template_id = p_template_id
  ORDER BY ati.display_order;
  
  -- Update template usage stats
  UPDATE advance_templates
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = p_template_id;
  
  RETURN v_advance_id;
END;
$$;

-- Fix create_template_from_advance
CREATE OR REPLACE FUNCTION create_template_from_advance(
  p_advance_id UUID,
  p_template_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_is_global BOOLEAN DEFAULT FALSE,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_advance RECORD;
  v_template_id UUID;
BEGIN
  -- Get the advance
  SELECT * INTO v_advance
  FROM production_advances
  WHERE id = p_advance_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Advance not found';
  END IF;
  
  -- Create the template
  INSERT INTO advance_templates (
    organization_id,
    name,
    description,
    category,
    is_global,
    is_active,
    created_by,
    project_id,
    estimated_cost
  )
  VALUES (
    v_advance.organization_id,
    p_template_name,
    p_description,
    p_category,
    p_is_global,
    TRUE,
    p_created_by,
    v_advance.project_id,
    v_advance.estimated_cost
  )
  RETURNING id INTO v_template_id;
  
  -- Copy advance items to template items
  INSERT INTO advance_template_items (
    template_id,
    catalog_item_id,
    item_name,
    description,
    category,
    default_quantity,
    unit,
    estimated_unit_cost,
    notes,
    display_order
  )
  SELECT
    v_template_id,
    pai.catalog_item_id,
    pai.item_name,
    pai.description,
    pac.category,
    pai.quantity,
    pai.unit,
    pai.unit_cost,
    pai.notes,
    ROW_NUMBER() OVER (ORDER BY pai.created_at)
  FROM production_advance_items pai
  LEFT JOIN production_advancing_catalog pac ON pai.catalog_item_id = pac.id
  WHERE pai.advance_id = p_advance_id;
  
  RETURN v_template_id;
END;
$$;

-- Fix get_user_templates
CREATE OR REPLACE FUNCTION get_user_templates(
  p_user_id UUID,
  p_organization_id UUID,
  p_category TEXT DEFAULT NULL,
  p_include_global BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  template_type TEXT,
  is_global BOOLEAN,
  is_favorite BOOLEAN,
  usage_count INTEGER,
  last_used_at TIMESTAMPTZ,
  estimated_cost DECIMAL,
  item_count BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    at.id,
    at.name,
    at.description,
    at.category,
    at.template_type,
    at.is_global,
    COALESCE(utf.id IS NOT NULL, FALSE) AS is_favorite,
    at.usage_count,
    at.last_used_at,
    at.estimated_cost,
    (SELECT COUNT(*) FROM advance_template_items ati WHERE ati.template_id = at.id) AS item_count,
    at.created_at
  FROM advance_templates at
  LEFT JOIN user_template_favorites utf ON utf.template_id = at.id AND utf.user_id = p_user_id
  WHERE at.is_active = TRUE
    AND (
      at.organization_id = p_organization_id
      OR (at.is_global = TRUE AND p_include_global = TRUE)
    )
    AND (p_category IS NULL OR at.category = p_category)
  ORDER BY 
    COALESCE(utf.id IS NOT NULL, FALSE) DESC,
    at.usage_count DESC,
    at.name;
END;
$$;

-- ============================================================================
-- FIX REMAINING TRIGGER FUNCTIONS WITH MUTABLE SEARCH PATH
-- ============================================================================

-- Fix update_saved_filters_updated_at
CREATE OR REPLACE FUNCTION public.update_saved_filters_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_saved_views_updated_at
CREATE OR REPLACE FUNCTION public.update_saved_views_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_org_catalog_items_timestamp
CREATE OR REPLACE FUNCTION update_org_catalog_items_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix reload_pgrst_schema
CREATE OR REPLACE FUNCTION reload_pgrst_schema()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
END;
$$;

-- Fix get_user_organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT organization_id FROM public.platform_users 
  WHERE auth_user_id = (SELECT auth.uid())
  LIMIT 1;
$$;

-- Fix storage_user_has_role
CREATE OR REPLACE FUNCTION public.storage_user_has_role(required_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.platform_users pu ON ur.platform_user_id = pu.id
    WHERE pu.auth_user_id = (SELECT auth.uid())
    AND ur.role_code = required_role
  );
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON VIEW public.analytics_nps_summary IS 'NPS summary analytics view with security invoker';
COMMENT ON VIEW public.analytics_asset_utilization IS 'Asset utilization analytics view with security invoker';
COMMENT ON VIEW public.analytics_project_budget_vs_actual IS 'Project budget vs actual analytics view with security invoker';
COMMENT ON VIEW public.user_event_roles IS 'User event roles view with security invoker';
COMMENT ON VIEW public.analytics_kpi_summary IS 'KPI summary analytics view with security invoker';

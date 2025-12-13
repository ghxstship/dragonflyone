-- ============================================================================
-- Gap 13 Remediation: Soft Delete Implementation
-- Implements deleted_at timestamps for data recovery
-- ============================================================================

-- Function to add deleted_at column to a table if it doesn't exist
CREATE OR REPLACE FUNCTION public.add_soft_delete_column(table_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format('
    ALTER TABLE public.%I 
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.platform_users(id)
  ', table_name);
  
  -- Create index for soft delete queries
  EXECUTE format('
    CREATE INDEX IF NOT EXISTS idx_%I_deleted_at ON public.%I(deleted_at)
  ', table_name, table_name);
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not add soft delete to %: %', table_name, SQLERRM;
END;
$$;

-- Add soft delete columns to key tables
DO $$
DECLARE
  tables_to_update TEXT[] := ARRAY[
    'organizations',
    'productions',
    'projects',
    'tasks',
    'budgets',
    'budget_items',
    'expenses',
    'invoices',
    'contracts',
    'vendors',
    'sponsors',
    'investors',
    'artists',
    'venues',
    'events',
    'tickets',
    'orders',
    'contacts',
    'crew_members',
    'assets',
    'documents',
    'comments',
    'notifications'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables_to_update
  LOOP
    PERFORM public.add_soft_delete_column(t);
  END LOOP;
END;
$$;

-- Function to soft delete a record
CREATE OR REPLACE FUNCTION public.soft_delete(
  p_table_name TEXT,
  p_record_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_table_exists BOOLEAN;
  v_has_soft_delete BOOLEAN;
BEGIN
  -- Validate table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = p_table_name
  ) INTO v_table_exists;
  
  IF NOT v_table_exists THEN
    RAISE EXCEPTION 'Table % does not exist', p_table_name;
  END IF;
  
  -- Validate table has soft delete columns
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = p_table_name AND column_name = 'deleted_at'
  ) INTO v_has_soft_delete;
  
  IF NOT v_has_soft_delete THEN
    RAISE EXCEPTION 'Table % does not support soft delete (missing deleted_at column)', p_table_name;
  END IF;
  
  -- Get current user's platform user ID
  SELECT id INTO v_user_id
  FROM public.platform_users
  WHERE auth_user_id = auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found or not authenticated';
  END IF;
  
  -- Perform soft delete
  EXECUTE format('
    UPDATE public.%I 
    SET deleted_at = NOW(), deleted_by = $1
    WHERE id = $2 AND deleted_at IS NULL
  ', p_table_name)
  USING v_user_id, p_record_id;
  
  -- Log the soft delete action
  IF FOUND THEN
    INSERT INTO public.permission_audit_log (action_type, metadata)
    VALUES ('role_modified', jsonb_build_object(
      'action', 'soft_delete',
      'table', p_table_name,
      'record_id', p_record_id,
      'deleted_by', v_user_id
    ));
  END IF;
  
  RETURN FOUND;
EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'Soft delete failed for %.%: %', p_table_name, p_record_id, SQLERRM;
END;
$$;

-- Function to restore a soft-deleted record
CREATE OR REPLACE FUNCTION public.restore_deleted(
  p_table_name TEXT,
  p_record_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if user has permission (admin only)
  SELECT id INTO v_user_id
  FROM public.platform_users
  WHERE auth_user_id = auth.uid()
  AND platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN'];
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Insufficient permissions to restore deleted records';
  END IF;
  
  -- Restore the record
  EXECUTE format('
    UPDATE public.%I 
    SET deleted_at = NULL, deleted_by = NULL
    WHERE id = $1 AND deleted_at IS NOT NULL
  ', p_table_name)
  USING p_record_id;
  
  RETURN FOUND;
END;
$$;

-- Function to permanently delete soft-deleted records older than retention period
CREATE OR REPLACE FUNCTION public.purge_deleted_records(
  p_table_name TEXT,
  p_retention_days INT DEFAULT 90
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  -- Check if user has permission (super admin only)
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_users
    WHERE auth_user_id = auth.uid()
    AND platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN']
  ) THEN
    RAISE EXCEPTION 'Only super admins can purge deleted records';
  END IF;
  
  -- Delete records older than retention period
  EXECUTE format('
    DELETE FROM public.%I 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - ($1 || '' days'')::INTERVAL
  ', p_table_name)
  USING p_retention_days;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Log the purge
  INSERT INTO public.permission_audit_log (
    action_type, metadata
  ) VALUES (
    'role_modified',
    jsonb_build_object(
      'action', 'purge_deleted_records',
      'table', p_table_name,
      'retention_days', p_retention_days,
      'records_purged', v_count
    )
  );
  
  RETURN v_count;
END;
$$;

-- Function to get deleted records for a table
CREATE OR REPLACE FUNCTION public.get_deleted_records(
  p_table_name TEXT,
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  deleted_by_email TEXT,
  data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has permission
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_users
    WHERE auth_user_id = auth.uid()
    AND platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN']
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to view deleted records';
  END IF;
  
  RETURN QUERY EXECUTE format('
    SELECT 
      t.id,
      t.deleted_at,
      t.deleted_by,
      pu.email as deleted_by_email,
      to_jsonb(t) - ''deleted_at'' - ''deleted_by'' as data
    FROM public.%I t
    LEFT JOIN public.platform_users pu ON pu.id = t.deleted_by
    WHERE t.deleted_at IS NOT NULL
    ORDER BY t.deleted_at DESC
    LIMIT $1 OFFSET $2
  ', p_table_name)
  USING p_limit, p_offset;
END;
$$;

-- Create view helper for excluding deleted records
-- Usage: SELECT * FROM active_organizations (instead of organizations)
CREATE OR REPLACE FUNCTION public.create_active_view(p_table_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format('
    CREATE OR REPLACE VIEW public.active_%I AS
    SELECT * FROM public.%I WHERE deleted_at IS NULL
  ', p_table_name, p_table_name);
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not create active view for %: %', p_table_name, SQLERRM;
END;
$$;

-- Create active views for key tables
DO $$
DECLARE
  tables_with_views TEXT[] := ARRAY[
    'organizations',
    'productions',
    'projects',
    'tasks',
    'vendors',
    'sponsors',
    'investors',
    'contracts',
    'events'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables_with_views
  LOOP
    PERFORM public.create_active_view(t);
  END LOOP;
END;
$$;

-- Update RLS policies to exclude deleted records by default
-- Example for organizations table
DROP POLICY IF EXISTS "organizations_exclude_deleted" ON public.organizations;
CREATE POLICY "organizations_exclude_deleted" ON public.organizations
  FOR SELECT USING (
    deleted_at IS NULL
    OR EXISTS (
      SELECT 1 FROM public.platform_users pu
      WHERE pu.auth_user_id = auth.uid()
      AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']
    )
  );

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.soft_delete TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_deleted TO authenticated;
GRANT EXECUTE ON FUNCTION public.purge_deleted_records TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_deleted_records TO authenticated;

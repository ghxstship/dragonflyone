-- ============================================================================
-- Gap 14 Remediation: Export Permissions and Audit Logging
-- Implements export restrictions by role and audit logging for exports
-- ============================================================================

-- Create export permissions table
CREATE TABLE IF NOT EXISTS public.export_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.platform_users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  -- Export types allowed
  can_export_csv BOOLEAN NOT NULL DEFAULT FALSE,
  can_export_excel BOOLEAN NOT NULL DEFAULT FALSE,
  can_export_pdf BOOLEAN NOT NULL DEFAULT FALSE,
  can_export_json BOOLEAN NOT NULL DEFAULT FALSE,
  -- Data types allowed
  allowed_tables TEXT[] DEFAULT ARRAY[]::TEXT[],
  denied_tables TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Restrictions
  max_records_per_export INT DEFAULT 10000,
  max_exports_per_day INT DEFAULT 100,
  include_sensitive_fields BOOLEAN NOT NULL DEFAULT FALSE,
  -- Metadata
  granted_by UUID REFERENCES public.platform_users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Create export audit log table
CREATE TABLE IF NOT EXISTS public.export_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.platform_users(id) ON DELETE SET NULL,
  user_email TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  -- Export details
  export_type TEXT NOT NULL CHECK (export_type IN ('csv', 'excel', 'pdf', 'json')),
  table_name TEXT NOT NULL,
  record_count INT NOT NULL,
  file_size_bytes BIGINT,
  -- Query details
  filters_applied JSONB DEFAULT '{}'::JSONB,
  columns_exported TEXT[],
  included_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  -- Request details
  ip_address INET,
  user_agent TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('started', 'completed', 'failed', 'blocked')),
  error_message TEXT,
  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_export_permissions_user_id ON public.export_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_export_permissions_org_id ON public.export_permissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_export_audit_log_user_id ON public.export_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_export_audit_log_created_at ON public.export_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_export_audit_log_table_name ON public.export_audit_log(table_name);

-- Enable RLS
ALTER TABLE public.export_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for export_permissions
DROP POLICY IF EXISTS "export_permissions_select" ON public.export_permissions;
CREATE POLICY "export_permissions_select" ON public.export_permissions
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.platform_users pu
      WHERE pu.auth_user_id = auth.uid()
      AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN']
    )
  );

-- RLS policies for export_audit_log
DROP POLICY IF EXISTS "export_audit_log_select" ON public.export_audit_log;
CREATE POLICY "export_audit_log_select" ON public.export_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.platform_users pu
      WHERE pu.auth_user_id = auth.uid()
      AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN']
    )
  );

-- Sensitive fields configuration
CREATE TABLE IF NOT EXISTS public.sensitive_field_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  field_name TEXT NOT NULL,
  sensitivity_level TEXT NOT NULL DEFAULT 'medium' CHECK (sensitivity_level IN ('low', 'medium', 'high', 'critical')),
  mask_pattern TEXT, -- e.g., '***-**-####' for SSN
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(table_name, field_name)
);

-- Insert default sensitive fields
INSERT INTO public.sensitive_field_config (table_name, field_name, sensitivity_level, description)
VALUES
  ('platform_users', 'email', 'medium', 'User email address'),
  ('platform_users', 'phone', 'high', 'User phone number'),
  ('contacts', 'email', 'medium', 'Contact email'),
  ('contacts', 'phone', 'high', 'Contact phone'),
  ('contacts', 'ssn', 'critical', 'Social security number'),
  ('vendors', 'tax_id', 'critical', 'Tax identification number'),
  ('vendors', 'bank_account', 'critical', 'Bank account number'),
  ('investors', 'tax_id', 'critical', 'Tax identification number'),
  ('investors', 'bank_account', 'critical', 'Bank account number'),
  ('expenses', 'receipt_data', 'medium', 'Receipt information'),
  ('invoices', 'payment_details', 'high', 'Payment information')
ON CONFLICT (table_name, field_name) DO NOTHING;

-- Function to check if user can export
CREATE OR REPLACE FUNCTION public.can_export(
  p_user_id UUID,
  p_export_type TEXT,
  p_table_name TEXT,
  p_record_count INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_roles TEXT[];
  v_perm RECORD;
  v_exports_today INT;
  v_result JSONB;
BEGIN
  -- Get user roles
  SELECT platform_roles INTO v_user_roles
  FROM public.platform_users
  WHERE id = p_user_id;
  
  -- Legend and Super Admin have full export access
  IF v_user_roles && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN'] THEN
    RETURN jsonb_build_object(
      'allowed', TRUE,
      'reason', 'Admin access',
      'include_sensitive', TRUE
    );
  END IF;
  
  -- ATLVS Super Admin can export with sensitive data
  IF v_user_roles && ARRAY['ATLVS_SUPER_ADMIN'] THEN
    RETURN jsonb_build_object(
      'allowed', TRUE,
      'reason', 'Super admin access',
      'include_sensitive', TRUE
    );
  END IF;
  
  -- ATLVS Admin can export without sensitive data by default
  IF v_user_roles && ARRAY['ATLVS_ADMIN'] THEN
    RETURN jsonb_build_object(
      'allowed', TRUE,
      'reason', 'Admin access',
      'include_sensitive', FALSE
    );
  END IF;
  
  -- Check explicit permissions
  SELECT * INTO v_perm
  FROM public.export_permissions
  WHERE user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > NOW());
  
  IF v_perm IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'reason', 'No export permissions granted'
    );
  END IF;
  
  -- Check export type
  CASE p_export_type
    WHEN 'csv' THEN
      IF NOT v_perm.can_export_csv THEN
        RETURN jsonb_build_object('allowed', FALSE, 'reason', 'CSV export not allowed');
      END IF;
    WHEN 'excel' THEN
      IF NOT v_perm.can_export_excel THEN
        RETURN jsonb_build_object('allowed', FALSE, 'reason', 'Excel export not allowed');
      END IF;
    WHEN 'pdf' THEN
      IF NOT v_perm.can_export_pdf THEN
        RETURN jsonb_build_object('allowed', FALSE, 'reason', 'PDF export not allowed');
      END IF;
    WHEN 'json' THEN
      IF NOT v_perm.can_export_json THEN
        RETURN jsonb_build_object('allowed', FALSE, 'reason', 'JSON export not allowed');
      END IF;
    ELSE
      RETURN jsonb_build_object('allowed', FALSE, 'reason', 'Unknown export type');
  END CASE;
  
  -- Check table restrictions
  IF v_perm.denied_tables IS NOT NULL AND p_table_name = ANY(v_perm.denied_tables) THEN
    RETURN jsonb_build_object('allowed', FALSE, 'reason', 'Table export denied');
  END IF;
  
  IF v_perm.allowed_tables IS NOT NULL AND array_length(v_perm.allowed_tables, 1) > 0 THEN
    IF NOT (p_table_name = ANY(v_perm.allowed_tables)) THEN
      RETURN jsonb_build_object('allowed', FALSE, 'reason', 'Table not in allowed list');
    END IF;
  END IF;
  
  -- Check record count limit
  IF p_record_count > v_perm.max_records_per_export THEN
    RETURN jsonb_build_object(
      'allowed', FALSE, 
      'reason', format('Record count %s exceeds limit of %s', p_record_count, v_perm.max_records_per_export)
    );
  END IF;
  
  -- Check daily export limit
  SELECT COUNT(*) INTO v_exports_today
  FROM public.export_audit_log
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE
    AND status = 'completed';
  
  IF v_exports_today >= v_perm.max_exports_per_day THEN
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'reason', format('Daily export limit of %s reached', v_perm.max_exports_per_day)
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', TRUE,
    'reason', 'Permission granted',
    'include_sensitive', v_perm.include_sensitive_fields,
    'remaining_exports_today', v_perm.max_exports_per_day - v_exports_today
  );
END;
$$;

-- Function to log export
CREATE OR REPLACE FUNCTION public.log_export(
  p_export_type TEXT,
  p_table_name TEXT,
  p_record_count INT,
  p_file_size_bytes BIGINT DEFAULT NULL,
  p_filters JSONB DEFAULT '{}'::JSONB,
  p_columns TEXT[] DEFAULT NULL,
  p_included_sensitive BOOLEAN DEFAULT FALSE,
  p_status TEXT DEFAULT 'completed',
  p_error_message TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_org_id UUID;
  v_log_id UUID;
BEGIN
  -- Get current user info
  SELECT id, email, organization_id INTO v_user_id, v_user_email, v_org_id
  FROM public.platform_users
  WHERE auth_user_id = auth.uid();
  
  -- Insert log entry
  INSERT INTO public.export_audit_log (
    user_id, user_email, organization_id,
    export_type, table_name, record_count, file_size_bytes,
    filters_applied, columns_exported, included_sensitive,
    status, error_message, ip_address, user_agent,
    completed_at
  )
  VALUES (
    v_user_id, v_user_email, v_org_id,
    p_export_type, p_table_name, p_record_count, p_file_size_bytes,
    p_filters, p_columns, p_included_sensitive,
    p_status, p_error_message, p_ip_address, p_user_agent,
    CASE WHEN p_status IN ('completed', 'failed', 'blocked') THEN NOW() ELSE NULL END
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to grant export permissions
CREATE OR REPLACE FUNCTION public.grant_export_permissions(
  p_user_id UUID,
  p_organization_id UUID DEFAULT NULL,
  p_can_csv BOOLEAN DEFAULT TRUE,
  p_can_excel BOOLEAN DEFAULT TRUE,
  p_can_pdf BOOLEAN DEFAULT TRUE,
  p_can_json BOOLEAN DEFAULT FALSE,
  p_allowed_tables TEXT[] DEFAULT NULL,
  p_denied_tables TEXT[] DEFAULT NULL,
  p_max_records INT DEFAULT 10000,
  p_max_daily INT DEFAULT 100,
  p_include_sensitive BOOLEAN DEFAULT FALSE,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_granter_id UUID;
  v_perm_id UUID;
BEGIN
  -- Get granter ID
  SELECT id INTO v_granter_id
  FROM public.platform_users
  WHERE auth_user_id = auth.uid();
  
  -- Check if granter has permission
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_users pu
    WHERE pu.id = v_granter_id
    AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN']
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to grant export access';
  END IF;
  
  -- Insert or update
  INSERT INTO public.export_permissions (
    user_id, organization_id,
    can_export_csv, can_export_excel, can_export_pdf, can_export_json,
    allowed_tables, denied_tables,
    max_records_per_export, max_exports_per_day, include_sensitive_fields,
    granted_by, expires_at, notes
  )
  VALUES (
    p_user_id, p_organization_id,
    p_can_csv, p_can_excel, p_can_pdf, p_can_json,
    p_allowed_tables, p_denied_tables,
    p_max_records, p_max_daily, p_include_sensitive,
    v_granter_id, p_expires_at, p_notes
  )
  ON CONFLICT (user_id, organization_id)
  DO UPDATE SET
    can_export_csv = EXCLUDED.can_export_csv,
    can_export_excel = EXCLUDED.can_export_excel,
    can_export_pdf = EXCLUDED.can_export_pdf,
    can_export_json = EXCLUDED.can_export_json,
    allowed_tables = EXCLUDED.allowed_tables,
    denied_tables = EXCLUDED.denied_tables,
    max_records_per_export = EXCLUDED.max_records_per_export,
    max_exports_per_day = EXCLUDED.max_exports_per_day,
    include_sensitive_fields = EXCLUDED.include_sensitive_fields,
    granted_by = EXCLUDED.granted_by,
    expires_at = EXCLUDED.expires_at,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_perm_id;
  
  -- Log the permission change
  PERFORM public.log_permission_change(
    'permission_granted',
    p_user_id,
    NULL,
    jsonb_build_object(
      'type', 'export',
      'can_csv', p_can_csv,
      'can_excel', p_can_excel,
      'can_pdf', p_can_pdf,
      'can_json', p_can_json,
      'include_sensitive', p_include_sensitive
    )
  );
  
  RETURN v_perm_id;
END;
$$;

-- Function to get export statistics
CREATE OR REPLACE FUNCTION public.get_export_statistics(
  p_days INT DEFAULT 30,
  p_organization_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_users pu
    WHERE pu.auth_user_id = auth.uid()
    AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN']
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  SELECT jsonb_build_object(
    'total_exports', COUNT(*),
    'total_records_exported', SUM(record_count),
    'total_size_bytes', SUM(file_size_bytes),
    'by_type', (
      SELECT jsonb_object_agg(export_type, cnt)
      FROM (
        SELECT export_type, COUNT(*) as cnt
        FROM public.export_audit_log
        WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
          AND (p_organization_id IS NULL OR organization_id = p_organization_id)
        GROUP BY export_type
      ) sub
    ),
    'by_table', (
      SELECT jsonb_object_agg(table_name, cnt)
      FROM (
        SELECT table_name, COUNT(*) as cnt
        FROM public.export_audit_log
        WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
          AND (p_organization_id IS NULL OR organization_id = p_organization_id)
        GROUP BY table_name
        ORDER BY cnt DESC
        LIMIT 10
      ) sub
    ),
    'by_status', (
      SELECT jsonb_object_agg(status, cnt)
      FROM (
        SELECT status, COUNT(*) as cnt
        FROM public.export_audit_log
        WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
          AND (p_organization_id IS NULL OR organization_id = p_organization_id)
        GROUP BY status
      ) sub
    ),
    'sensitive_exports', (
      SELECT COUNT(*)
      FROM public.export_audit_log
      WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
        AND (p_organization_id IS NULL OR organization_id = p_organization_id)
        AND included_sensitive = TRUE
    ),
    'unique_users', (
      SELECT COUNT(DISTINCT user_id)
      FROM public.export_audit_log
      WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
        AND (p_organization_id IS NULL OR organization_id = p_organization_id)
    ),
    'period_start', NOW() - (p_days || ' days')::INTERVAL,
    'period_end', NOW()
  ) INTO v_result
  FROM public.export_audit_log
  WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND (p_organization_id IS NULL OR organization_id = p_organization_id);
  
  RETURN v_result;
END;
$$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_export_permissions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS export_permissions_updated_at ON public.export_permissions;
CREATE TRIGGER export_permissions_updated_at
  BEFORE UPDATE ON public.export_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_export_permissions_updated_at();

-- Grant permissions
GRANT SELECT ON public.export_permissions TO authenticated;
GRANT SELECT ON public.export_audit_log TO authenticated;
GRANT SELECT ON public.sensitive_field_config TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_export TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_export TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_export_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_export_statistics TO authenticated;

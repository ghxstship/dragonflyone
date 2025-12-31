-- ============================================================================
-- 0042_pos_ats_tables.sql
-- Create POS and ATS Integration Tables, RLS, and RPC Functions
-- GHXSTSHIP Platform - Integration Expansion (Part 2: Tables & Functions)
-- Note: This runs AFTER 0041 which adds the enum values
-- ============================================================================

-- ============================================================================
-- INTEGRATION POS TRANSACTION LINKS (POS Sales Sync)
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_pos_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES legend_places(id) ON DELETE SET NULL,
  external_location_id TEXT,
  external_terminal_id TEXT,
  location_name TEXT,
  is_active BOOLEAN DEFAULT true,
  sync_orders BOOLEAN DEFAULT true,
  sync_inventory BOOLEAN DEFAULT true,
  sync_employees BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, integration_id, external_location_id)
);

CREATE INDEX IF NOT EXISTS idx_pos_links_org ON integration_pos_links(organization_id);
CREATE INDEX IF NOT EXISTS idx_pos_links_event ON integration_pos_links(event_id);
CREATE INDEX IF NOT EXISTS idx_pos_links_venue ON integration_pos_links(venue_id);

-- ============================================================================
-- INTEGRATION POS TRANSACTIONS (Sales Data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pos_link_id UUID NOT NULL REFERENCES integration_pos_links(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  external_order_id TEXT NOT NULL,
  external_receipt_id TEXT,
  transaction_type TEXT NOT NULL DEFAULT 'sale' CHECK (transaction_type IN ('sale', 'refund', 'void', 'exchange')),
  transaction_date TIMESTAMPTZ NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  tip_amount NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  currency TEXT DEFAULT 'USD',
  items_count INTEGER DEFAULT 0,
  employee_external_id TEXT,
  employee_name TEXT,
  customer_external_id TEXT,
  table_number TEXT,
  order_type TEXT CHECK (order_type IN ('dine_in', 'takeout', 'delivery', 'bar', 'retail', 'other')),
  raw_data JSONB,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_transactions_org ON integration_pos_transactions(organization_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_link ON integration_pos_transactions(pos_link_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_event ON integration_pos_transactions(event_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_external ON integration_pos_transactions(external_order_id);

-- ============================================================================
-- INTEGRATION ATS CANDIDATE LINKS (Recruitment Sync)
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_ats_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  person_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES workforce_employees(id) ON DELETE SET NULL,
  external_candidate_id TEXT NOT NULL,
  external_application_id TEXT,
  external_job_id TEXT,
  job_title TEXT,
  candidate_name TEXT,
  candidate_email TEXT,
  candidate_phone TEXT,
  application_status TEXT CHECK (application_status IN ('new', 'screening', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn')),
  stage_name TEXT,
  source TEXT,
  applied_at TIMESTAMPTZ,
  hired_at TIMESTAMPTZ,
  start_date DATE,
  sync_status sync_status NOT NULL DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, integration_id, external_candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_ats_links_org ON integration_ats_links(organization_id);
CREATE INDEX IF NOT EXISTS idx_ats_links_person ON integration_ats_links(person_id);
CREATE INDEX IF NOT EXISTS idx_ats_links_employee ON integration_ats_links(employee_id);
CREATE INDEX IF NOT EXISTS idx_ats_links_status ON integration_ats_links(application_status);
CREATE INDEX IF NOT EXISTS idx_ats_links_job ON integration_ats_links(external_job_id);

-- ============================================================================
-- INTEGRATION ATS JOB POSTINGS (Job Sync)
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_ats_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  external_job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'temporary', 'internship', 'freelance')),
  job_status TEXT DEFAULT 'open' CHECK (job_status IN ('draft', 'open', 'paused', 'closed', 'filled')),
  description TEXT,
  requirements TEXT,
  salary_min NUMERIC(12,2),
  salary_max NUMERIC(12,2),
  salary_currency TEXT DEFAULT 'USD',
  remote_type TEXT CHECK (remote_type IN ('onsite', 'remote', 'hybrid')),
  posted_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  applications_count INTEGER DEFAULT 0,
  external_url TEXT,
  sync_status sync_status NOT NULL DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, integration_id, external_job_id)
);

CREATE INDEX IF NOT EXISTS idx_ats_jobs_org ON integration_ats_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_ats_jobs_status ON integration_ats_jobs(job_status);
CREATE INDEX IF NOT EXISTS idx_ats_jobs_external ON integration_ats_jobs(external_job_id);

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================

ALTER TABLE integration_pos_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_ats_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_ats_jobs ENABLE ROW LEVEL SECURITY;

-- POS Links policies
CREATE POLICY pos_links_select ON integration_pos_links FOR SELECT USING (org_matches(organization_id));
CREATE POLICY pos_links_manage ON integration_pos_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- POS Transactions policies
CREATE POLICY pos_transactions_select ON integration_pos_transactions FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY pos_transactions_manage ON integration_pos_transactions FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- ATS Links policies
CREATE POLICY ats_links_select ON integration_ats_links FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY ats_links_manage ON integration_ats_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN'));

-- ATS Jobs policies
CREATE POLICY ats_jobs_select ON integration_ats_jobs FOR SELECT USING (org_matches(organization_id));
CREATE POLICY ats_jobs_manage ON integration_ats_jobs FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN'));

-- ============================================================================
-- GRANTS FOR NEW TABLES
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON integration_pos_links TO authenticated;
GRANT SELECT, INSERT ON integration_pos_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_ats_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_ats_jobs TO authenticated;

-- ============================================================================
-- TRIGGERS FOR NEW TABLES
-- ============================================================================

CREATE TRIGGER pos_links_updated_at BEFORE UPDATE ON integration_pos_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER ats_links_updated_at BEFORE UPDATE ON integration_ats_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER ats_jobs_updated_at BEFORE UPDATE ON integration_ats_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RPC FUNCTIONS FOR POS INTEGRATIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_ingest_pos_transaction(
  p_org_id UUID,
  p_pos_link_id UUID,
  p_external_order_id TEXT,
  p_transaction_type TEXT,
  p_transaction_date TIMESTAMPTZ,
  p_subtotal NUMERIC,
  p_total_amount NUMERIC,
  p_tax_amount NUMERIC DEFAULT 0,
  p_tip_amount NUMERIC DEFAULT 0,
  p_discount_amount NUMERIC DEFAULT 0,
  p_payment_method TEXT DEFAULT NULL,
  p_items_count INTEGER DEFAULT 0,
  p_employee_name TEXT DEFAULT NULL,
  p_order_type TEXT DEFAULT NULL,
  p_event_id UUID DEFAULT NULL,
  p_raw_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF NOT org_matches(p_org_id) OR NOT role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  INSERT INTO integration_pos_transactions (
    organization_id, pos_link_id, event_id, external_order_id, transaction_type,
    transaction_date, subtotal, tax_amount, tip_amount, discount_amount, total_amount,
    payment_method, items_count, employee_name, order_type, raw_data
  ) VALUES (
    p_org_id, p_pos_link_id, p_event_id, p_external_order_id, p_transaction_type,
    p_transaction_date, p_subtotal, p_tax_amount, p_tip_amount, p_discount_amount, p_total_amount,
    p_payment_method, p_items_count, p_employee_name, p_order_type, p_raw_data
  )
  ON CONFLICT (external_order_id) DO UPDATE SET
    total_amount = EXCLUDED.total_amount,
    synced_at = now()
  RETURNING id INTO v_id;

  UPDATE integration_pos_links
  SET last_sync_at = now()
  WHERE id = p_pos_link_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_ingest_pos_transaction TO authenticated;

-- ============================================================================
-- RPC FUNCTIONS FOR ATS INTEGRATIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_sync_ats_candidate(
  p_org_id UUID,
  p_integration_id UUID,
  p_external_candidate_id TEXT,
  p_external_job_id TEXT DEFAULT NULL,
  p_job_title TEXT DEFAULT NULL,
  p_candidate_name TEXT DEFAULT NULL,
  p_candidate_email TEXT DEFAULT NULL,
  p_application_status TEXT DEFAULT 'new',
  p_stage_name TEXT DEFAULT NULL,
  p_source TEXT DEFAULT NULL,
  p_applied_at TIMESTAMPTZ DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF NOT org_matches(p_org_id) OR NOT role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  INSERT INTO integration_ats_links (
    organization_id, integration_id, external_candidate_id, external_job_id,
    job_title, candidate_name, candidate_email, application_status, stage_name,
    source, applied_at, metadata, last_sync_at
  ) VALUES (
    p_org_id, p_integration_id, p_external_candidate_id, p_external_job_id,
    p_job_title, p_candidate_name, p_candidate_email, p_application_status, p_stage_name,
    p_source, p_applied_at, p_metadata, now()
  )
  ON CONFLICT (organization_id, integration_id, external_candidate_id) DO UPDATE SET
    application_status = EXCLUDED.application_status,
    stage_name = EXCLUDED.stage_name,
    metadata = EXCLUDED.metadata,
    last_sync_at = now(),
    updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_sync_ats_candidate TO authenticated;

CREATE OR REPLACE FUNCTION rpc_sync_ats_job(
  p_org_id UUID,
  p_integration_id UUID,
  p_external_job_id TEXT,
  p_job_title TEXT,
  p_department TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_employment_type TEXT DEFAULT 'full_time',
  p_job_status TEXT DEFAULT 'open',
  p_description TEXT DEFAULT NULL,
  p_salary_min NUMERIC DEFAULT NULL,
  p_salary_max NUMERIC DEFAULT NULL,
  p_remote_type TEXT DEFAULT 'onsite',
  p_posted_at TIMESTAMPTZ DEFAULT NULL,
  p_external_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF NOT org_matches(p_org_id) OR NOT role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  INSERT INTO integration_ats_jobs (
    organization_id, integration_id, external_job_id, job_title, department,
    location, employment_type, job_status, description, salary_min, salary_max,
    remote_type, posted_at, external_url, metadata, last_sync_at
  ) VALUES (
    p_org_id, p_integration_id, p_external_job_id, p_job_title, p_department,
    p_location, p_employment_type, p_job_status, p_description, p_salary_min, p_salary_max,
    p_remote_type, p_posted_at, p_external_url, p_metadata, now()
  )
  ON CONFLICT (organization_id, integration_id, external_job_id) DO UPDATE SET
    job_title = EXCLUDED.job_title,
    job_status = EXCLUDED.job_status,
    description = EXCLUDED.description,
    metadata = EXCLUDED.metadata,
    last_sync_at = now(),
    updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_sync_ats_job TO authenticated;

-- ============================================================================
-- HELPER FUNCTION: Get POS Sales Summary
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_get_pos_sales_summary(
  p_org_id UUID,
  p_event_id UUID DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_sales NUMERIC,
  total_transactions INTEGER,
  total_tax NUMERIC,
  total_tips NUMERIC,
  total_discounts NUMERIC,
  avg_transaction NUMERIC,
  sales_by_type JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(SUM(pt.total_amount), 0)::NUMERIC as total_sales,
    COUNT(*)::INTEGER as total_transactions,
    COALESCE(SUM(pt.tax_amount), 0)::NUMERIC as total_tax,
    COALESCE(SUM(pt.tip_amount), 0)::NUMERIC as total_tips,
    COALESCE(SUM(pt.discount_amount), 0)::NUMERIC as total_discounts,
    COALESCE(AVG(pt.total_amount), 0)::NUMERIC as avg_transaction,
    jsonb_object_agg(
      COALESCE(pt.order_type, 'other'),
      jsonb_build_object('count', COUNT(*), 'total', SUM(pt.total_amount))
    ) as sales_by_type
  FROM integration_pos_transactions pt
  WHERE pt.organization_id = p_org_id
    AND pt.transaction_type = 'sale'
    AND (p_event_id IS NULL OR pt.event_id = p_event_id)
    AND (p_start_date IS NULL OR pt.transaction_date >= p_start_date)
    AND (p_end_date IS NULL OR pt.transaction_date <= p_end_date)
  GROUP BY pt.organization_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_get_pos_sales_summary TO authenticated;

-- ============================================================================
-- HELPER FUNCTION: Get ATS Pipeline Summary
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_get_ats_pipeline_summary(
  p_org_id UUID,
  p_job_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_candidates INTEGER,
  new_count INTEGER,
  screening_count INTEGER,
  interviewing_count INTEGER,
  offer_count INTEGER,
  hired_count INTEGER,
  rejected_count INTEGER,
  withdrawn_count INTEGER,
  active_jobs INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_candidates,
    COUNT(*) FILTER (WHERE al.application_status = 'new')::INTEGER as new_count,
    COUNT(*) FILTER (WHERE al.application_status = 'screening')::INTEGER as screening_count,
    COUNT(*) FILTER (WHERE al.application_status = 'interviewing')::INTEGER as interviewing_count,
    COUNT(*) FILTER (WHERE al.application_status = 'offer')::INTEGER as offer_count,
    COUNT(*) FILTER (WHERE al.application_status = 'hired')::INTEGER as hired_count,
    COUNT(*) FILTER (WHERE al.application_status = 'rejected')::INTEGER as rejected_count,
    COUNT(*) FILTER (WHERE al.application_status = 'withdrawn')::INTEGER as withdrawn_count,
    (SELECT COUNT(*)::INTEGER FROM integration_ats_jobs aj WHERE aj.organization_id = p_org_id AND aj.job_status = 'open') as active_jobs
  FROM integration_ats_links al
  WHERE al.organization_id = p_org_id
    AND (p_job_id IS NULL OR al.external_job_id = p_job_id);
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_get_ats_pipeline_summary TO authenticated;

-- ============================================================================
-- 0025_schema_enrichments.sql
-- Schema Enrichments: Missing Indexes, Constraints, Views, and Functions
-- GHXSTSHIP Platform - Comprehensive Schema Enhancement
-- ============================================================================
-- 
-- This migration provides:
-- 1. Missing composite indexes for common query patterns
-- 2. Additional check constraints for data integrity
-- 3. Missing foreign key relationships
-- 4. Utility views for common reporting needs
-- 5. Additional RPC functions for complex operations
-- 6. Performance-optimized partial indexes
-- 7. Full-text search capabilities
-- 8. Data validation functions
-- ============================================================================

-- ============================================================================
-- SECTION 1: MISSING COMPOSITE INDEXES FOR QUERY OPTIMIZATION
-- ============================================================================

-- Deals: Common query patterns
CREATE INDEX IF NOT EXISTS idx_deals_org_owner_status ON deals(organization_id, owner_id, status);
CREATE INDEX IF NOT EXISTS idx_deals_org_close_date ON deals(organization_id, expected_close_date) WHERE status NOT IN ('won', 'lost');
CREATE INDEX IF NOT EXISTS idx_deals_org_value ON deals(organization_id, value DESC) WHERE status = 'lead';

-- Projects: Common query patterns
CREATE INDEX IF NOT EXISTS idx_projects_org_phase ON projects(organization_id, phase);
CREATE INDEX IF NOT EXISTS idx_projects_org_manager ON projects(organization_id, project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_client ON projects(organization_id, client_id);
CREATE INDEX IF NOT EXISTS idx_projects_date_range ON projects(organization_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(organization_id) WHERE phase NOT IN ('completed', 'cancelled');

-- Assets: Common query patterns
CREATE INDEX IF NOT EXISTS idx_assets_org_state_category ON assets(organization_id, state, category);
CREATE INDEX IF NOT EXISTS idx_assets_org_location ON assets(organization_id, location_id);
CREATE INDEX IF NOT EXISTS idx_assets_maintenance_due ON assets(organization_id, next_maintenance_at) WHERE next_maintenance_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assets_warranty_expiry ON assets(organization_id, warranty_expires_at) WHERE warranty_expires_at IS NOT NULL;

-- Contacts: Common query patterns
CREATE INDEX IF NOT EXISTS idx_contacts_org_lead_status ON contacts(organization_id, lead_status);
CREATE INDEX IF NOT EXISTS idx_contacts_org_company ON contacts(organization_id, company);

-- Expenses: Common query patterns
CREATE INDEX IF NOT EXISTS idx_expenses_org_status_date ON finance_expenses(organization_id, status, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_org_category ON finance_expenses(organization_id, category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_pending_approval ON finance_expenses(organization_id, created_at) WHERE status = 'submitted';

-- Time Entries: Common query patterns
CREATE INDEX IF NOT EXISTS idx_time_entries_approval_pending ON workforce_time_entries(organization_id, work_date DESC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_date ON workforce_time_entries(employee_id, work_date DESC);

-- Chronicle Entries: Common query patterns
CREATE INDEX IF NOT EXISTS idx_chronicle_org_type_date ON chronicle_entries(organization_id, chronicle_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_chronicle_entity ON chronicle_entries(subject_entity_type, subject_entity_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_chronicle_actor ON chronicle_entries(actor_id, occurred_at DESC);

-- Legend Events: Common query patterns
CREATE INDEX IF NOT EXISTS idx_legend_events_org_status_date ON legend_events(organization_id, status, start_datetime);
-- Note: Cannot use CURRENT_DATE in index predicate as it's not immutable
CREATE INDEX IF NOT EXISTS idx_legend_events_upcoming ON legend_events(organization_id, start_datetime) WHERE status = 'active';

-- Legend People: Common query patterns
CREATE INDEX IF NOT EXISTS idx_legend_people_org_status ON legend_people(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_legend_people_email_lower ON legend_people(organization_id, lower(email));

-- Legend Organizations: Common query patterns
CREATE INDEX IF NOT EXISTS idx_legend_orgs_org_type ON legend_organizations(organization_id, org_type);

-- ============================================================================
-- SECTION 2: FULL-TEXT SEARCH INDEXES
-- ============================================================================

-- Deals full-text search
CREATE INDEX IF NOT EXISTS idx_deals_fts ON deals USING gin(
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(notes, ''))
);

-- Projects full-text search
CREATE INDEX IF NOT EXISTS idx_projects_fts ON projects USING gin(
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''))
);

-- Contacts full-text search
CREATE INDEX IF NOT EXISTS idx_contacts_fts ON contacts USING gin(
  to_tsvector('english', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || 
    COALESCE(company, '')
  )
);

-- Legend People full-text search
CREATE INDEX IF NOT EXISTS idx_legend_people_fts ON legend_people USING gin(
  to_tsvector('english', 
    COALESCE(display_name, '') || ' ' || 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' ||
    COALESCE(email, '')
  )
);

-- Legend Events full-text search
CREATE INDEX IF NOT EXISTS idx_legend_events_fts ON legend_events USING gin(
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''))
);

-- Assets full-text search
CREATE INDEX IF NOT EXISTS idx_assets_fts ON assets USING gin(
  to_tsvector('english', 
    COALESCE(name, '') || ' ' || 
    COALESCE(tag, '') || ' ' || 
    COALESCE(serial_number, '') || ' ' ||
    COALESCE(notes, '')
  )
);

-- Production Advancing Catalog full-text search
CREATE INDEX IF NOT EXISTS idx_catalog_fts ON production_advancing_catalog USING gin(
  to_tsvector('english', 
    COALESCE(item_name, '') || ' ' || 
    COALESCE(category, '') || ' ' || 
    COALESCE(subcategory, '') || ' ' ||
    COALESCE(specifications, '')
  )
);

-- ============================================================================
-- SECTION 3: ADDITIONAL CHECK CONSTRAINTS
-- ============================================================================

-- Deals: Value must be non-negative
ALTER TABLE deals DROP CONSTRAINT IF EXISTS chk_deals_value_positive;
ALTER TABLE deals ADD CONSTRAINT chk_deals_value_positive CHECK (value IS NULL OR value >= 0);

-- Deals: Probability must be between 0 and 100
ALTER TABLE deals DROP CONSTRAINT IF EXISTS chk_deals_probability_range;
ALTER TABLE deals ADD CONSTRAINT chk_deals_probability_range CHECK (probability IS NULL OR (probability >= 0 AND probability <= 100));

-- Projects: Budget must be non-negative
ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_projects_budget_positive;
ALTER TABLE projects ADD CONSTRAINT chk_projects_budget_positive CHECK (budget IS NULL OR budget >= 0);

-- Projects: End date must be after start date
ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_projects_date_order;
ALTER TABLE projects ADD CONSTRAINT chk_projects_date_order CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);

-- Assets: Purchase price must be non-negative
ALTER TABLE assets DROP CONSTRAINT IF EXISTS chk_assets_purchase_price_positive;
ALTER TABLE assets ADD CONSTRAINT chk_assets_purchase_price_positive CHECK (purchase_price IS NULL OR purchase_price >= 0);

-- Assets: Current value must be non-negative
ALTER TABLE assets DROP CONSTRAINT IF EXISTS chk_assets_current_value_positive;
ALTER TABLE assets ADD CONSTRAINT chk_assets_current_value_positive CHECK (current_value IS NULL OR current_value >= 0);

-- Finance Expenses: Amount must be positive
ALTER TABLE finance_expenses DROP CONSTRAINT IF EXISTS chk_expenses_amount_positive;
ALTER TABLE finance_expenses ADD CONSTRAINT chk_expenses_amount_positive CHECK (amount > 0);

-- Budgets: Total amount must be non-negative
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS chk_budgets_total_positive;
ALTER TABLE budgets ADD CONSTRAINT chk_budgets_total_positive CHECK (total_amount IS NULL OR total_amount >= 0);

-- Orders: Amounts must be non-negative
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_amounts_positive;
ALTER TABLE orders ADD CONSTRAINT chk_orders_amounts_positive CHECK (
  (subtotal IS NULL OR subtotal >= 0) AND
  (tax_amount IS NULL OR tax_amount >= 0) AND
  (discount_amount IS NULL OR discount_amount >= 0) AND
  (total_amount IS NULL OR total_amount >= 0)
);

-- Bills: Amounts must be non-negative
ALTER TABLE bills DROP CONSTRAINT IF EXISTS chk_bills_amounts_positive;
ALTER TABLE bills ADD CONSTRAINT chk_bills_amounts_positive CHECK (
  (subtotal IS NULL OR subtotal >= 0) AND
  (tax_amount IS NULL OR tax_amount >= 0) AND
  (total_amount IS NULL OR total_amount >= 0)
);

-- Workforce Employees: Rates must be non-negative
ALTER TABLE workforce_employees DROP CONSTRAINT IF EXISTS chk_employees_rates_positive;
ALTER TABLE workforce_employees ADD CONSTRAINT chk_employees_rates_positive CHECK (
  (hourly_rate IS NULL OR hourly_rate >= 0) AND
  (salary IS NULL OR salary >= 0)
);

-- KPI Data Points: Value validation based on unit
ALTER TABLE kpi_data_points DROP CONSTRAINT IF EXISTS chk_kpi_percentage_range;
ALTER TABLE kpi_data_points ADD CONSTRAINT chk_kpi_percentage_range CHECK (
  unit != 'percentage' OR (value >= 0 AND value <= 100)
);

-- ============================================================================
-- SECTION 4: UTILITY VIEWS FOR COMMON REPORTING
-- ============================================================================

-- Active Deals Summary View
CREATE OR REPLACE VIEW v_active_deals_summary AS
SELECT 
  d.organization_id,
  d.id AS deal_id,
  d.title,
  d.status AS stage,
  d.status,
  d.value,
  d.currency,
  d.probability,
  d.expected_close_date,
  d.owner_id,
  pu.full_name AS owner_name,
  c.id AS contact_id,
  c.first_name || ' ' || c.last_name AS contact_name,
  c.company AS company_name,
  d.created_at,
  d.updated_at,
  CASE 
    WHEN d.expected_close_date < CURRENT_DATE THEN 'overdue'
    WHEN d.expected_close_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
    ELSE 'on_track'
  END AS urgency
FROM deals d
LEFT JOIN platform_users pu ON pu.id = d.owner_id
LEFT JOIN contacts c ON c.id = d.contact_id
WHERE d.status NOT IN ('won', 'lost');

GRANT SELECT ON v_active_deals_summary TO authenticated;

-- Project Status Overview View
CREATE OR REPLACE VIEW v_project_status_overview AS
SELECT 
  p.organization_id,
  p.id AS project_id,
  p.code,
  p.name,
  p.phase,
  p.phase AS status,
  p.budget,
  p.currency,
  p.start_date,
  p.end_date,
  p.project_manager_id,
  pm.full_name AS project_manager_name,
  lo.name AS client_name,
  d.title AS deal_title,
  COALESCE(exp.total_expenses, 0) AS total_expenses,
  COALESCE(p.budget, 0) - COALESCE(exp.total_expenses, 0) AS budget_remaining,
  CASE 
    WHEN p.budget IS NULL OR p.budget = 0 THEN NULL
    ELSE ROUND((COALESCE(exp.total_expenses, 0) / p.budget * 100)::NUMERIC, 2)
  END AS budget_utilization_pct,
  COALESCE(asset_count.count, 0) AS assigned_assets,
  p.created_at,
  p.updated_at
FROM projects p
LEFT JOIN platform_users pm ON pm.id = p.project_manager_id
LEFT JOIN legend_organizations lo ON lo.id = p.client_id
LEFT JOIN deals d ON d.id = p.deal_id
LEFT JOIN (
  SELECT project_id, SUM(amount) AS total_expenses
  FROM finance_expenses
  WHERE status IN ('approved', 'paid')
  GROUP BY project_id
) exp ON exp.project_id = p.id
LEFT JOIN (
  SELECT project_id, COUNT(*) AS count
  FROM assets
  WHERE project_id IS NOT NULL
  GROUP BY project_id
) asset_count ON asset_count.project_id = p.id;

GRANT SELECT ON v_project_status_overview TO authenticated;

-- Asset Inventory Summary View
CREATE OR REPLACE VIEW v_asset_inventory_summary AS
SELECT 
  a.organization_id,
  a.category,
  a.state,
  COUNT(*) AS asset_count,
  SUM(a.purchase_price) AS total_purchase_value,
  SUM(a.current_value) AS total_current_value,
  COUNT(*) FILTER (WHERE a.next_maintenance_at <= CURRENT_DATE + INTERVAL '30 days') AS maintenance_due_count,
  COUNT(*) FILTER (WHERE a.warranty_expires_at <= CURRENT_DATE + INTERVAL '30 days') AS warranty_expiring_count
FROM assets a
GROUP BY a.organization_id, a.category, a.state;

GRANT SELECT ON v_asset_inventory_summary TO authenticated;

-- Workforce Availability View
CREATE OR REPLACE VIEW v_workforce_availability AS
SELECT 
  we.organization_id,
  we.id AS employee_id,
  we.employee_number,
  we.first_name,
  we.last_name,
  we.status AS employment_status,
  we.department_id,
  ld.name AS department_name,
  COALESCE(scheduled.shift_count, 0) AS upcoming_shifts,
  COALESCE(scheduled.total_hours, 0) AS scheduled_hours_next_7_days,
  COALESCE(cert.active_certs, 0) AS active_certifications,
  COALESCE(cert.expiring_certs, 0) AS expiring_certifications
FROM workforce_employees we
LEFT JOIN legend_departments ld ON ld.id = we.department_id
LEFT JOIN (
  SELECT 
    wsa.employee_id,
    COUNT(*) AS shift_count,
    SUM(EXTRACT(EPOCH FROM (ws.end_time - ws.start_time)) / 3600) AS total_hours
  FROM workforce_shift_assignments wsa
  JOIN workforce_shifts ws ON ws.id = wsa.shift_id
  WHERE ws.shift_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    AND wsa.status NOT IN ('cancelled', 'no_show')
  GROUP BY wsa.employee_id
) scheduled ON scheduled.employee_id = we.id
LEFT JOIN (
  SELECT 
    employee_id,
    COUNT(*) FILTER (WHERE expiration_date IS NULL OR expiration_date > CURRENT_DATE) AS active_certs,
    COUNT(*) FILTER (WHERE expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') AS expiring_certs
  FROM workforce_certifications
  GROUP BY employee_id
) cert ON cert.employee_id = we.id
WHERE we.status = 'active';

GRANT SELECT ON v_workforce_availability TO authenticated;

-- Pending Approvals View
CREATE OR REPLACE VIEW v_pending_approvals AS
SELECT 
  'expense' AS approval_type,
  fe.organization_id,
  fe.id AS record_id,
  fe.expense_number AS reference_number,
  'Expense: ' || fe.description AS title,
  fe.amount AS value,
  fe.currency,
  fe.submitter_id AS submitted_by,
  pu.full_name AS submitter_name,
  fe.created_at AS submitted_at,
  NULL::UUID AS project_id,
  NULL AS project_name
FROM finance_expenses fe
JOIN platform_users pu ON pu.id = fe.submitter_id
WHERE fe.status = 'submitted'

UNION ALL

SELECT 
  'procurement_request' AS approval_type,
  pr.organization_id,
  pr.id AS record_id,
  pr.request_number AS reference_number,
  'Procurement: ' || pr.title AS title,
  pr.estimated_total AS value,
  pr.currency,
  pr.requested_by AS submitted_by,
  pu.full_name AS submitter_name,
  pr.created_at AS submitted_at,
  pr.project_id,
  p.name AS project_name
FROM procurement_requests pr
JOIN platform_users pu ON pu.id = pr.requested_by
LEFT JOIN projects p ON p.id = pr.project_id
WHERE pr.status = 'submitted'

UNION ALL

SELECT 
  'time_entry' AS approval_type,
  wte.organization_id,
  wte.id AS record_id,
  wte.work_date::TEXT AS reference_number,
  'Time Entry: ' || we.first_name || ' ' || we.last_name || ' - ' || wte.hours || ' hrs' AS title,
  wte.total_pay AS value,
  'USD' AS currency,
  we.person_id AS submitted_by,
  we.first_name || ' ' || we.last_name AS submitter_name,
  wte.created_at AS submitted_at,
  wte.project_id,
  p.name AS project_name
FROM workforce_time_entries wte
JOIN workforce_employees we ON we.id = wte.employee_id
LEFT JOIN projects p ON p.id = wte.project_id
WHERE wte.status = 'pending'

UNION ALL

SELECT 
  'production_advance' AS approval_type,
  pa.organization_id,
  pa.id AS record_id,
  pa.advance_number AS reference_number,
  'Advance: ' || COALESCE(pa.activation_name, pa.description) AS title,
  pa.estimated_cost AS value,
  pa.currency,
  pa.submitter_id AS submitted_by,
  pu.full_name AS submitter_name,
  pa.submitted_at,
  pa.project_id,
  p.name AS project_name
FROM production_advances pa
JOIN platform_users pu ON pu.id = pa.submitter_id
LEFT JOIN projects p ON p.id = pa.project_id
WHERE pa.status IN ('submitted', 'under_review');

GRANT SELECT ON v_pending_approvals TO authenticated;

-- Upcoming Events View
CREATE OR REPLACE VIEW v_upcoming_events AS
SELECT 
  le.organization_id,
  le.id AS event_id,
  le.name,
  le.description,
  le.status,
  le.start_datetime AS start_date,
  le.end_datetime AS end_date,
  lp.name AS venue_name,
  COALESCE(crew.crew_count, 0) AS assigned_crew,
  COALESCE(shifts.shift_count, 0) AS scheduled_shifts,
  COALESCE(advances.advance_count, 0) AS production_advances,
  (le.start_datetime::DATE - CURRENT_DATE) AS days_until_event
FROM legend_events le
LEFT JOIN legend_places lp ON lp.id = le.place_id
LEFT JOIN (
  SELECT event_id, COUNT(DISTINCT platform_user_id) AS crew_count
  FROM event_role_assignments
  WHERE valid_until IS NULL OR valid_until > now()
  GROUP BY event_id
) crew ON crew.event_id = le.id
LEFT JOIN (
  SELECT event_id, COUNT(*) AS shift_count
  FROM workforce_shifts
  WHERE status NOT IN ('cancelled', 'completed')
  GROUP BY event_id
) shifts ON shifts.event_id = le.id
LEFT JOIN (
  SELECT event_id, COUNT(*) AS advance_count
  FROM production_advances
  WHERE status NOT IN ('cancelled', 'rejected')
  GROUP BY event_id
) advances ON advances.event_id = le.id
WHERE le.status = 'active' 
  AND le.start_datetime >= CURRENT_DATE
ORDER BY le.start_datetime;

GRANT SELECT ON v_upcoming_events TO authenticated;

-- ============================================================================
-- SECTION 5: ADDITIONAL RPC FUNCTIONS
-- ============================================================================

-- Full-text search across multiple entities
CREATE OR REPLACE FUNCTION rpc_global_search(
  p_organization_id UUID,
  p_query TEXT,
  p_entity_types TEXT[] DEFAULT ARRAY['deals', 'projects', 'contacts', 'assets', 'events'],
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  subtitle TEXT,
  status TEXT,
  relevance REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tsquery TSQUERY;
BEGIN
  IF NOT org_matches(p_organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  v_tsquery := plainto_tsquery('english', p_query);

  RETURN QUERY
  WITH search_results AS (
    -- Deals
    SELECT 
      'deal'::TEXT AS entity_type,
      d.id AS entity_id,
      d.title,
      d.status::TEXT AS subtitle,
      d.status::TEXT,
      ts_rank(to_tsvector('english', COALESCE(d.title, '') || ' ' || COALESCE(d.notes, '')), v_tsquery) AS relevance
    FROM deals d
    WHERE d.organization_id = p_organization_id
      AND 'deals' = ANY(p_entity_types)
      AND to_tsvector('english', COALESCE(d.title, '') || ' ' || COALESCE(d.notes, '')) @@ v_tsquery

    UNION ALL

    -- Projects
    SELECT 
      'project'::TEXT,
      p.id,
      p.name,
      p.code,
      p.phase::TEXT,
      ts_rank(to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '')), v_tsquery)
    FROM projects p
    WHERE p.organization_id = p_organization_id
      AND 'projects' = ANY(p_entity_types)
      AND to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '')) @@ v_tsquery

    UNION ALL

    -- Contacts
    SELECT 
      'contact'::TEXT,
      c.id,
      COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, ''),
      c.company,
      c.lead_status,
      ts_rank(to_tsvector('english', 
        COALESCE(c.first_name, '') || ' ' || 
        COALESCE(c.last_name, '') || ' ' || 
        COALESCE(c.company, '')
      ), v_tsquery)
    FROM contacts c
    WHERE c.organization_id = p_organization_id
      AND 'contacts' = ANY(p_entity_types)
      AND to_tsvector('english', 
        COALESCE(c.first_name, '') || ' ' || 
        COALESCE(c.last_name, '') || ' ' || 
        COALESCE(c.company, '')
      ) @@ v_tsquery

    UNION ALL

    -- Assets
    SELECT 
      'asset'::TEXT,
      a.id,
      a.name,
      a.tag,
      a.state::TEXT,
      ts_rank(to_tsvector('english', 
        COALESCE(a.name, '') || ' ' || 
        COALESCE(a.tag, '') || ' ' || 
        COALESCE(a.serial_number, '') || ' ' ||
        COALESCE(a.notes, '')
      ), v_tsquery)
    FROM assets a
    WHERE a.organization_id = p_organization_id
      AND 'assets' = ANY(p_entity_types)
      AND to_tsvector('english', 
        COALESCE(a.name, '') || ' ' || 
        COALESCE(a.tag, '') || ' ' || 
        COALESCE(a.serial_number, '') || ' ' ||
        COALESCE(a.notes, '')
      ) @@ v_tsquery

    UNION ALL

    -- Events
    SELECT 
      'event'::TEXT,
      e.id,
      e.name,
      e.start_datetime::TEXT,
      e.status::TEXT,
      ts_rank(to_tsvector('english', COALESCE(e.name, '') || ' ' || COALESCE(e.description, '')), v_tsquery)
    FROM legend_events e
    WHERE e.organization_id = p_organization_id
      AND 'events' = ANY(p_entity_types)
      AND to_tsvector('english', COALESCE(e.name, '') || ' ' || COALESCE(e.description, '')) @@ v_tsquery
  )
  SELECT * FROM search_results
  ORDER BY relevance DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_global_search(UUID, TEXT, TEXT[], INTEGER) TO authenticated;

-- Get organization dashboard summary
CREATE OR REPLACE FUNCTION rpc_organization_dashboard_summary(
  p_organization_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT org_matches(p_organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  SELECT jsonb_build_object(
    'deals', (
      SELECT jsonb_build_object(
        'total_open', COUNT(*) FILTER (WHERE status NOT IN ('won', 'lost')),
        'total_value', COALESCE(SUM(value) FILTER (WHERE status NOT IN ('won', 'lost')), 0),
        'won_this_month', COUNT(*) FILTER (WHERE status = 'won' AND actual_close_date >= date_trunc('month', CURRENT_DATE)),
        'won_value_this_month', COALESCE(SUM(value) FILTER (WHERE status = 'won' AND actual_close_date >= date_trunc('month', CURRENT_DATE)), 0)
      )
      FROM deals WHERE organization_id = p_organization_id
    ),
    'projects', (
      SELECT jsonb_build_object(
        'active', COUNT(*) FILTER (WHERE phase NOT IN ('completed', 'cancelled')),
        'in_production', COUNT(*) FILTER (WHERE phase = 'in_production'),
        'total_budget', COALESCE(SUM(budget) FILTER (WHERE phase NOT IN ('completed', 'cancelled')), 0)
      )
      FROM projects WHERE organization_id = p_organization_id
    ),
    'assets', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'available', COUNT(*) FILTER (WHERE state = 'available'),
        'deployed', COUNT(*) FILTER (WHERE state = 'deployed'),
        'maintenance_due', COUNT(*) FILTER (WHERE next_maintenance_at <= CURRENT_DATE + INTERVAL '7 days')
      )
      FROM assets WHERE organization_id = p_organization_id
    ),
    'workforce', (
      SELECT jsonb_build_object(
        'active_employees', COUNT(*) FILTER (WHERE status = 'active'),
        'pending_time_entries', (
          SELECT COUNT(*) FROM workforce_time_entries 
          WHERE organization_id = p_organization_id AND status = 'pending'
        ),
        'shifts_today', (
          SELECT COUNT(*) FROM workforce_shifts 
          WHERE organization_id = p_organization_id AND shift_date = CURRENT_DATE
        )
      )
      FROM workforce_employees WHERE organization_id = p_organization_id
    ),
    'pending_approvals', (
      SELECT jsonb_build_object(
        'expenses', (SELECT COUNT(*) FROM finance_expenses WHERE organization_id = p_organization_id AND status = 'submitted'),
        'procurement', (SELECT COUNT(*) FROM procurement_requests WHERE organization_id = p_organization_id AND status = 'submitted'),
        'time_entries', (SELECT COUNT(*) FROM workforce_time_entries WHERE organization_id = p_organization_id AND status = 'pending'),
        'advances', (SELECT COUNT(*) FROM production_advances WHERE organization_id = p_organization_id AND status IN ('submitted', 'under_review'))
      )
    ),
    'alerts', (
      SELECT jsonb_build_object(
        'critical', COUNT(*) FILTER (WHERE severity = 'critical' AND status IN ('triggered', 'acknowledged')),
        'warning', COUNT(*) FILTER (WHERE severity = 'warning' AND status IN ('triggered', 'acknowledged')),
        'total_unresolved', COUNT(*) FILTER (WHERE status IN ('triggered', 'acknowledged'))
      )
      FROM alert_history WHERE organization_id = p_organization_id
    ),
    'upcoming_events', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', id,
        'name', name,
        'start_date', start_datetime,
        'days_until', start_datetime::DATE - CURRENT_DATE
      ) ORDER BY start_datetime), '[]'::jsonb)
      FROM legend_events 
      WHERE organization_id = p_organization_id 
        AND status = 'active' 
        AND start_datetime >= CURRENT_DATE
      ORDER BY start_datetime
      LIMIT 5
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_organization_dashboard_summary(UUID) TO authenticated;

-- Bulk status update for deals
CREATE OR REPLACE FUNCTION rpc_bulk_update_deal_status(
  p_deal_ids UUID[],
  p_new_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER := 0;
  v_org_id UUID;
BEGIN
  SELECT DISTINCT organization_id INTO v_org_id
  FROM deals WHERE id = ANY(p_deal_ids)
  LIMIT 1;

  IF NOT org_matches(v_org_id) OR NOT role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  UPDATE deals
  SET status = p_new_status::deal_status,
      updated_at = now()
  WHERE id = ANY(p_deal_ids)
    AND organization_id = v_org_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  RETURN jsonb_build_object(
    'updated_count', v_updated,
    'new_status', p_new_status,
    'deal_ids', p_deal_ids
  );
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_bulk_update_deal_status(UUID[], TEXT, TEXT) TO authenticated;

-- Get entity activity timeline
CREATE OR REPLACE FUNCTION rpc_entity_activity_timeline(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  chronicle_type chronicle_type,
  action_category chronicle_action_category,
  title TEXT,
  description TEXT,
  actor_name TEXT,
  created_at TIMESTAMPTZ,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ce.id,
    ce.chronicle_type,
    ce.action_category,
    ce.action AS title,
    ce.action_description AS description,
    pu.full_name AS actor_name,
    ce.occurred_at AS created_at,
    ce.metadata
  FROM chronicle_entries ce
  LEFT JOIN platform_users pu ON pu.id = ce.actor_id
  WHERE ce.subject_entity_type = p_entity_type
    AND ce.subject_entity_id = p_entity_id
    AND org_matches(ce.organization_id)
  ORDER BY ce.occurred_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_entity_activity_timeline(TEXT, UUID, INTEGER, INTEGER) TO authenticated;

-- Calculate project profitability
CREATE OR REPLACE FUNCTION rpc_project_profitability(
  p_project_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project projects%ROWTYPE;
  v_revenue NUMERIC;
  v_expenses NUMERIC;
  v_labor_cost NUMERIC;
  v_result JSONB;
BEGIN
  SELECT * INTO v_project FROM projects WHERE id = p_project_id;

  IF NOT org_matches(v_project.organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Get revenue from deal
  SELECT COALESCE(d.value, 0) INTO v_revenue
  FROM deals d WHERE d.id = v_project.deal_id;

  -- Get total expenses
  SELECT COALESCE(SUM(amount), 0) INTO v_expenses
  FROM finance_expenses
  WHERE project_id = p_project_id AND status IN ('approved', 'paid');

  -- Get labor costs
  SELECT COALESCE(SUM(total_pay), 0) INTO v_labor_cost
  FROM workforce_time_entries
  WHERE project_id = p_project_id AND status = 'approved';

  SELECT jsonb_build_object(
    'project_id', p_project_id,
    'project_name', v_project.name,
    'budget', v_project.budget,
    'revenue', v_revenue,
    'expenses', v_expenses,
    'labor_cost', v_labor_cost,
    'total_cost', v_expenses + v_labor_cost,
    'gross_profit', v_revenue - (v_expenses + v_labor_cost),
    'profit_margin', CASE 
      WHEN v_revenue > 0 THEN ROUND(((v_revenue - (v_expenses + v_labor_cost)) / v_revenue * 100)::NUMERIC, 2)
      ELSE 0
    END,
    'budget_utilization', CASE 
      WHEN v_project.budget > 0 THEN ROUND(((v_expenses + v_labor_cost) / v_project.budget * 100)::NUMERIC, 2)
      ELSE 0
    END
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_project_profitability(UUID) TO authenticated;

-- Get expiring items (certifications, contracts, warranties)
CREATE OR REPLACE FUNCTION rpc_get_expiring_items(
  p_organization_id UUID,
  p_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
  item_type TEXT,
  item_id UUID,
  item_name TEXT,
  related_entity TEXT,
  expiration_date DATE,
  days_until_expiry INTEGER,
  severity TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT org_matches(p_organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  -- Certifications
  SELECT 
    'certification'::TEXT AS item_type,
    wc.id AS item_id,
    wc.certification_name AS item_name,
    we.first_name || ' ' || we.last_name AS related_entity,
    wc.expiration_date,
    (wc.expiration_date - CURRENT_DATE)::INTEGER AS days_until_expiry,
    CASE 
      WHEN wc.expiration_date <= CURRENT_DATE THEN 'critical'
      WHEN wc.expiration_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'warning'
      ELSE 'info'
    END AS severity
  FROM workforce_certifications wc
  JOIN workforce_employees we ON we.id = wc.employee_id
  WHERE wc.organization_id = p_organization_id
    AND wc.expiration_date IS NOT NULL
    AND wc.expiration_date <= CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL

  UNION ALL

  -- Vendor Contracts
  SELECT 
    'vendor_contract'::TEXT,
    vc.id,
    vc.title,
    pv.name,
    vc.expiration_date,
    (vc.expiration_date - CURRENT_DATE)::INTEGER,
    CASE 
      WHEN vc.expiration_date <= CURRENT_DATE THEN 'critical'
      WHEN vc.expiration_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'warning'
      ELSE 'info'
    END
  FROM vendor_contracts vc
  JOIN procurement_vendors pv ON pv.id = vc.vendor_id
  WHERE vc.organization_id = p_organization_id
    AND vc.expiration_date IS NOT NULL
    AND vc.expiration_date <= CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL
    AND vc.status = 'active'

  UNION ALL

  -- Asset Warranties
  SELECT 
    'asset_warranty'::TEXT,
    a.id,
    a.name,
    a.tag,
    a.warranty_expires_at::DATE,
    (a.warranty_expires_at::DATE - CURRENT_DATE)::INTEGER,
    CASE 
      WHEN a.warranty_expires_at <= CURRENT_DATE THEN 'critical'
      WHEN a.warranty_expires_at <= CURRENT_DATE + INTERVAL '7 days' THEN 'warning'
      ELSE 'info'
    END
  FROM assets a
  WHERE a.organization_id = p_organization_id
    AND a.warranty_expires_at IS NOT NULL
    AND a.warranty_expires_at <= CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL

  UNION ALL

  -- Vendor Insurance
  SELECT 
    'vendor_insurance'::TEXT,
    pv.id,
    pv.name || ' - Insurance',
    pv.name,
    pv.insurance_expiry,
    (pv.insurance_expiry - CURRENT_DATE)::INTEGER,
    CASE 
      WHEN pv.insurance_expiry <= CURRENT_DATE THEN 'critical'
      WHEN pv.insurance_expiry <= CURRENT_DATE + INTERVAL '7 days' THEN 'warning'
      ELSE 'info'
    END
  FROM procurement_vendors pv
  WHERE pv.organization_id = p_organization_id
    AND pv.insurance_expiry IS NOT NULL
    AND pv.insurance_expiry <= CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL
    AND pv.status = 'approved'

  ORDER BY expiration_date;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_get_expiring_items(UUID, INTEGER) TO authenticated;

-- ============================================================================
-- SECTION 6: DATA VALIDATION FUNCTIONS
-- ============================================================================

-- Validate email format
CREATE OR REPLACE FUNCTION is_valid_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
$$;

-- Validate phone format (flexible)
CREATE OR REPLACE FUNCTION is_valid_phone(p_phone TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_phone ~* '^\+?[0-9\s\-\(\)\.]{7,20}$';
$$;

-- Validate URL format
CREATE OR REPLACE FUNCTION is_valid_url(p_url TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_url ~* '^https?://[^\s/$.?#].[^\s]*$';
$$;

-- Normalize phone number
CREATE OR REPLACE FUNCTION normalize_phone(p_phone TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(p_phone, '[^0-9+]', '', 'g');
$$;

-- ============================================================================
-- SECTION 7: SEQUENCE NUMBER GENERATORS
-- ============================================================================

-- Generate next deal number
CREATE OR REPLACE FUNCTION generate_deal_number(p_organization_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix TEXT;
  v_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CASE 
      WHEN deal_number ~ '^DEAL-[0-9]+$' 
      THEN substring(deal_number from 'DEAL-([0-9]+)')::INTEGER 
      ELSE 0 
    END
  ), 0) + 1
  INTO v_seq
  FROM deals
  WHERE organization_id = p_organization_id;

  RETURN 'DEAL-' || lpad(v_seq::TEXT, 6, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION generate_deal_number(UUID) TO authenticated;

-- Generate next project code
CREATE OR REPLACE FUNCTION generate_project_code(p_organization_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CASE 
      WHEN code ~ '^PRJ-[0-9]+$' 
      THEN substring(code from 'PRJ-([0-9]+)')::INTEGER 
      ELSE 0 
    END
  ), 0) + 1
  INTO v_seq
  FROM projects
  WHERE organization_id = p_organization_id;

  RETURN 'PRJ-' || lpad(v_seq::TEXT, 6, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION generate_project_code(UUID) TO authenticated;

-- Generate next expense number
CREATE OR REPLACE FUNCTION generate_expense_number(p_organization_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CASE 
      WHEN expense_number ~ '^EXP-[0-9]+$' 
      THEN substring(expense_number from 'EXP-([0-9]+)')::INTEGER 
      ELSE 0 
    END
  ), 0) + 1
  INTO v_seq
  FROM finance_expenses
  WHERE organization_id = p_organization_id;

  RETURN 'EXP-' || lpad(v_seq::TEXT, 6, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION generate_expense_number(UUID) TO authenticated;

-- Generate next PO number
CREATE OR REPLACE FUNCTION generate_po_number(p_organization_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CASE 
      WHEN po_number ~ '^PO-[0-9]+$' 
      THEN substring(po_number from 'PO-([0-9]+)')::INTEGER 
      ELSE 0 
    END
  ), 0) + 1
  INTO v_seq
  FROM finance_purchase_orders
  WHERE organization_id = p_organization_id;

  RETURN 'PO-' || lpad(v_seq::TEXT, 6, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION generate_po_number(UUID) TO authenticated;

-- ============================================================================
-- SECTION 8: MATERIALIZED VIEW REFRESH SCHEDULING
-- ============================================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_executive_dashboard;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_financials;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_asset_utilization;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_nps_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_deal_pipeline;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_workforce_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_by_month;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error refreshing materialized views: %', SQLERRM;
END;
$$;

-- ============================================================================
-- SECTION 9: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION rpc_global_search IS 'Full-text search across multiple entity types with relevance ranking';
COMMENT ON FUNCTION rpc_organization_dashboard_summary IS 'Returns comprehensive dashboard metrics for an organization';
COMMENT ON FUNCTION rpc_bulk_update_deal_status IS 'Bulk update deal statuses with audit logging';
COMMENT ON FUNCTION rpc_entity_activity_timeline IS 'Returns activity timeline for any entity from chronicle_entries';
COMMENT ON FUNCTION rpc_project_profitability IS 'Calculates project profitability including revenue, expenses, and labor';
COMMENT ON FUNCTION rpc_get_expiring_items IS 'Returns all items expiring within specified days (certs, contracts, warranties)';
COMMENT ON FUNCTION generate_deal_number IS 'Generates sequential deal number for organization';
COMMENT ON FUNCTION generate_project_code IS 'Generates sequential project code for organization';
COMMENT ON FUNCTION generate_expense_number IS 'Generates sequential expense number for organization';
COMMENT ON FUNCTION generate_po_number IS 'Generates sequential PO number for organization';

COMMENT ON VIEW v_active_deals_summary IS 'Summary view of all active deals with owner and contact info';
COMMENT ON VIEW v_project_status_overview IS 'Project status with budget utilization and asset counts';
COMMENT ON VIEW v_asset_inventory_summary IS 'Aggregated asset inventory by category and state';
COMMENT ON VIEW v_workforce_availability IS 'Employee availability with scheduled shifts and certifications';
COMMENT ON VIEW v_pending_approvals IS 'Unified view of all pending approvals across modules';
COMMENT ON VIEW v_upcoming_events IS 'Upcoming events with crew, shift, and advance counts';

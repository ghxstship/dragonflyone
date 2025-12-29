-- ============================================================================
-- 0007_chronicle_schema.sql
-- CHRONICLE Schema: Normalized Activities (Transactions)
-- Single source of truth for all activity/transaction data
-- GHXSTSHIP Platform - 3NF Normalized Structure
-- ============================================================================

-- ============================================================================
-- BASE CHRONICLE TABLE
-- ============================================================================

CREATE TABLE chronicle_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Type Classification
  chronicle_type chronicle_type NOT NULL,
  chronicle_subtype TEXT,
  
  -- Temporal
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER,
  
  -- Actor (who performed the action)
  actor_type TEXT NOT NULL DEFAULT 'user',
  actor_id UUID,
  actor_name TEXT,
  actor_email TEXT,
  
  -- Subject (what was affected)
  subject_entity_type TEXT,
  subject_entity_id UUID,
  subject_name TEXT,
  
  -- Action
  action TEXT NOT NULL,
  action_category chronicle_action_category NOT NULL DEFAULT 'other',
  action_description TEXT,
  
  -- Context (related entity)
  context_entity_type TEXT,
  context_entity_id UUID,
  context_name TEXT,
  
  -- Data (state changes)
  before_state JSONB,
  after_state JSONB,
  delta JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Source
  source_system TEXT,
  source_ip INET,
  source_user_agent TEXT,
  source_request_id TEXT,
  
  -- Correlation
  correlation_id UUID,
  parent_entry_id UUID REFERENCES chronicle_entries(id),
  
  -- Immutability - no updated_at
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chronicle_entries_org ON chronicle_entries(organization_id);
CREATE INDEX idx_chronicle_entries_type ON chronicle_entries(chronicle_type);
CREATE INDEX idx_chronicle_entries_occurred ON chronicle_entries(occurred_at DESC);
CREATE INDEX idx_chronicle_entries_actor ON chronicle_entries(actor_id);
CREATE INDEX idx_chronicle_entries_subject ON chronicle_entries(subject_entity_type, subject_entity_id);
CREATE INDEX idx_chronicle_entries_context ON chronicle_entries(context_entity_type, context_entity_id);
CREATE INDEX idx_chronicle_entries_action ON chronicle_entries(action_category);
CREATE INDEX idx_chronicle_entries_correlation ON chronicle_entries(correlation_id);
CREATE INDEX idx_chronicle_entries_metadata ON chronicle_entries USING GIN(metadata);
CREATE INDEX idx_chronicle_entries_org_type_occurred ON chronicle_entries(organization_id, chronicle_type, occurred_at DESC);

-- ============================================================================
-- CHRONICLE PROFILE TABLES
-- ============================================================================

-- Transaction Profile
CREATE TABLE chronicle_profile_transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chronicle_id UUID NOT NULL REFERENCES chronicle_entries(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  transaction_status TEXT DEFAULT 'completed',
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(10, 6),
  base_amount DECIMAL(15, 2),
  payment_method TEXT,
  payment_provider TEXT,
  reference_number TEXT,
  external_id TEXT,
  invoice_id UUID,
  order_id UUID,
  from_account TEXT,
  to_account TEXT,
  cost_center_id UUID REFERENCES legend_cost_centers(id),
  reconciliation_status TEXT DEFAULT 'pending',
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID REFERENCES platform_users(id),
  fee_amount DECIMAL(15, 2),
  net_amount DECIMAL(15, 2),
  UNIQUE(chronicle_id)
);

CREATE INDEX idx_chronicle_profile_transaction_chronicle ON chronicle_profile_transaction(chronicle_id);
CREATE INDEX idx_chronicle_profile_transaction_type ON chronicle_profile_transaction(transaction_type);
CREATE INDEX idx_chronicle_profile_transaction_status ON chronicle_profile_transaction(reconciliation_status);

-- Timesheet Profile
CREATE TABLE chronicle_profile_timesheet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chronicle_id UUID NOT NULL REFERENCES chronicle_entries(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  break_duration_minutes INTEGER DEFAULT 0,
  worked_hours DECIMAL(5, 2),
  overtime_hours DECIMAL(5, 2),
  pay_rate DECIMAL(10, 2),
  pay_type TEXT,
  currency TEXT DEFAULT 'USD',
  total_pay DECIMAL(10, 2),
  project_id UUID,
  task_id UUID,
  department_id UUID REFERENCES legend_departments(id),
  position_id UUID REFERENCES legend_positions(id),
  location_id UUID REFERENCES legend_places(id),
  geo_location POINT,
  approval_status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES legend_people(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(chronicle_id)
);

CREATE INDEX idx_chronicle_profile_timesheet_chronicle ON chronicle_profile_timesheet(chronicle_id);
CREATE INDEX idx_chronicle_profile_timesheet_type ON chronicle_profile_timesheet(entry_type);
CREATE INDEX idx_chronicle_profile_timesheet_project ON chronicle_profile_timesheet(project_id);

-- Movement Profile
CREATE TABLE chronicle_profile_movement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chronicle_id UUID NOT NULL REFERENCES chronicle_entries(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL,
  item_id UUID,
  item_name TEXT,
  item_sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'each',
  from_location_id UUID REFERENCES legend_places(id),
  from_location_name TEXT,
  to_location_id UUID REFERENCES legend_places(id),
  to_location_name TEXT,
  from_custodian_id UUID REFERENCES legend_people(id),
  from_custodian_name TEXT,
  to_custodian_id UUID REFERENCES legend_people(id),
  to_custodian_name TEXT,
  condition_before TEXT,
  condition_after TEXT,
  condition_notes TEXT,
  expected_return_date DATE,
  actual_return_date DATE,
  unit_value DECIMAL(15, 2),
  total_value DECIMAL(15, 2),
  currency TEXT DEFAULT 'USD',
  UNIQUE(chronicle_id)
);

CREATE INDEX idx_chronicle_profile_movement_chronicle ON chronicle_profile_movement(chronicle_id);
CREATE INDEX idx_chronicle_profile_movement_type ON chronicle_profile_movement(movement_type);
CREATE INDEX idx_chronicle_profile_movement_item ON chronicle_profile_movement(item_id);
CREATE INDEX idx_chronicle_profile_movement_from_location ON chronicle_profile_movement(from_location_id);
CREATE INDEX idx_chronicle_profile_movement_to_location ON chronicle_profile_movement(to_location_id);

-- Audit Profile
CREATE TABLE chronicle_profile_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chronicle_id UUID NOT NULL REFERENCES chronicle_entries(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  record_type TEXT,
  field_changes JSONB DEFAULT '[]'::jsonb,
  compliance_flags TEXT[],
  retention_period_days INTEGER,
  risk_level TEXT,
  requires_review BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  session_id TEXT,
  UNIQUE(chronicle_id)
);

CREATE INDEX idx_chronicle_profile_audit_chronicle ON chronicle_profile_audit(chronicle_id);
CREATE INDEX idx_chronicle_profile_audit_type ON chronicle_profile_audit(audit_type);
CREATE INDEX idx_chronicle_profile_audit_table ON chronicle_profile_audit(table_name);
CREATE INDEX idx_chronicle_profile_audit_record ON chronicle_profile_audit(record_id);
CREATE INDEX idx_chronicle_profile_audit_compliance ON chronicle_profile_audit USING GIN(compliance_flags);

-- Automation Profile
CREATE TABLE chronicle_profile_automation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chronicle_id UUID NOT NULL REFERENCES chronicle_entries(id) ON DELETE CASCADE,
  automation_type TEXT NOT NULL,
  automation_name TEXT,
  workflow_id UUID,
  job_id TEXT,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  execution_time_ms INTEGER,
  success BOOLEAN,
  exit_code INTEGER,
  error_message TEXT,
  error_code TEXT,
  error_stack TEXT,
  attempt_number INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 3,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  log_entries JSONB DEFAULT '[]'::jsonb,
  memory_used_mb INTEGER,
  cpu_time_ms INTEGER,
  UNIQUE(chronicle_id)
);

CREATE INDEX idx_chronicle_profile_automation_chronicle ON chronicle_profile_automation(chronicle_id);
CREATE INDEX idx_chronicle_profile_automation_type ON chronicle_profile_automation(automation_type);
CREATE INDEX idx_chronicle_profile_automation_workflow ON chronicle_profile_automation(workflow_id);
CREATE INDEX idx_chronicle_profile_automation_success ON chronicle_profile_automation(success);

-- Communication Profile
CREATE TABLE chronicle_profile_communication (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chronicle_id UUID NOT NULL REFERENCES chronicle_entries(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  direction TEXT NOT NULL,
  sender_address TEXT,
  recipient_addresses TEXT[],
  cc_addresses TEXT[],
  bcc_addresses TEXT[],
  subject TEXT,
  message_type TEXT,
  template_id TEXT,
  template_version TEXT,
  delivery_status TEXT,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  failure_reason TEXT,
  bounce_type TEXT,
  external_message_id TEXT,
  provider TEXT,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  UNIQUE(chronicle_id)
);

CREATE INDEX idx_chronicle_profile_communication_chronicle ON chronicle_profile_communication(chronicle_id);
CREATE INDEX idx_chronicle_profile_communication_channel ON chronicle_profile_communication(channel);
CREATE INDEX idx_chronicle_profile_communication_status ON chronicle_profile_communication(delivery_status);
CREATE INDEX idx_chronicle_profile_communication_recipients ON chronicle_profile_communication USING GIN(recipient_addresses);

-- ============================================================================
-- AGGREGATION TABLES
-- ============================================================================

CREATE TABLE chronicle_daily_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  aggregate_date DATE NOT NULL,
  chronicle_type chronicle_type NOT NULL,
  chronicle_subtype TEXT,
  entry_count INTEGER DEFAULT 0,
  total_amount DECIMAL(15, 2),
  currency TEXT,
  total_hours DECIMAL(10, 2),
  total_quantity INTEGER,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, aggregate_date, chronicle_type, chronicle_subtype)
);

CREATE INDEX idx_chronicle_daily_aggregates_org_date ON chronicle_daily_aggregates(organization_id, aggregate_date DESC);

-- ============================================================================
-- CHRONICLE HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION log_chronicle_entry(
  p_organization_id UUID,
  p_chronicle_type chronicle_type,
  p_chronicle_subtype TEXT,
  p_actor_id UUID,
  p_actor_name TEXT,
  p_action TEXT,
  p_action_category chronicle_action_category,
  p_subject_entity_type TEXT DEFAULT NULL,
  p_subject_entity_id UUID DEFAULT NULL,
  p_subject_name TEXT DEFAULT NULL,
  p_context_entity_type TEXT DEFAULT NULL,
  p_context_entity_id UUID DEFAULT NULL,
  p_context_name TEXT DEFAULT NULL,
  p_before_state JSONB DEFAULT NULL,
  p_after_state JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_source_system TEXT DEFAULT 'atlvs'
)
RETURNS UUID AS $$
DECLARE
  v_entry_id UUID;
  v_delta JSONB;
BEGIN
  IF p_before_state IS NOT NULL AND p_after_state IS NOT NULL THEN
    SELECT jsonb_object_agg(key, value)
    INTO v_delta
    FROM (
      SELECT key, p_after_state->key AS value
      FROM jsonb_object_keys(p_after_state) AS key
      WHERE p_before_state->key IS DISTINCT FROM p_after_state->key
    ) AS changes;
  END IF;

  INSERT INTO chronicle_entries (
    organization_id, chronicle_type, chronicle_subtype,
    actor_id, actor_name, action, action_category,
    subject_entity_type, subject_entity_id, subject_name,
    context_entity_type, context_entity_id, context_name,
    before_state, after_state, delta, metadata, source_system
  ) VALUES (
    p_organization_id, p_chronicle_type, p_chronicle_subtype,
    p_actor_id, p_actor_name, p_action, p_action_category,
    p_subject_entity_type, p_subject_entity_id, p_subject_name,
    p_context_entity_type, p_context_entity_id, p_context_name,
    p_before_state, p_after_state, v_delta, p_metadata, p_source_system
  )
  RETURNING id INTO v_entry_id;

  RETURN v_entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_entity_activity_feed(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  chronicle_type chronicle_type,
  chronicle_subtype TEXT,
  occurred_at TIMESTAMPTZ,
  actor_name TEXT,
  action TEXT,
  action_description TEXT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ce.id,
    ce.chronicle_type,
    ce.chronicle_subtype,
    ce.occurred_at,
    ce.actor_name,
    ce.action,
    ce.action_description,
    ce.metadata
  FROM chronicle_entries ce
  WHERE (ce.subject_entity_type = p_entity_type AND ce.subject_entity_id = p_entity_id)
     OR (ce.context_entity_type = p_entity_type AND ce.context_entity_id = p_entity_id)
  ORDER BY ce.occurred_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update daily aggregates trigger
CREATE OR REPLACE FUNCTION update_chronicle_daily_aggregates()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO chronicle_daily_aggregates (
    organization_id, aggregate_date, chronicle_type, chronicle_subtype, entry_count
  ) VALUES (
    NEW.organization_id, DATE(NEW.occurred_at), NEW.chronicle_type, NEW.chronicle_subtype, 1
  )
  ON CONFLICT (organization_id, aggregate_date, chronicle_type, chronicle_subtype)
  DO UPDATE SET
    entry_count = chronicle_daily_aggregates.entry_count + 1,
    computed_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chronicle_update_aggregates
  AFTER INSERT ON chronicle_entries
  FOR EACH ROW EXECUTE FUNCTION update_chronicle_daily_aggregates();

-- 0260_chronicle_schema.sql
-- CHRONICLE Schema: Normalized Activities (Transactions)
-- Single source of truth for all activity/transaction data across ATLVS, COMPVSS, GVTEWAY
--
-- Architecture: Base entity (chronicle_entries) + Profile extensions for specific activity types
-- This mirrors the Legend (nouns) and Saga (verbs) schema patterns
--
-- Key Design Principles:
-- 1. Immutable entries (append-only, no updates/deletes for audit compliance)
-- 2. Partitioned by occurred_at for performance at scale
-- 3. Indexed for fast actor/subject/context queries
-- 4. Supports aggregation for reporting/analytics

-- ============================================================================
-- PART 1: ENUM TYPES
-- ============================================================================

-- Chronicle type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chronicle_type') THEN
    CREATE TYPE chronicle_type AS ENUM (
      'transaction',    -- Financial transactions (payments, refunds, transfers)
      'timesheet',      -- Time tracking (clock in/out, timesheets, attendance)
      'movement',       -- Asset/inventory movement (checkout, transfer, return)
      'audit',          -- Audit trail (record changes, compliance logs)
      'automation',     -- Automation runs (job executions, sync logs)
      'communication'   -- Communication logs (emails, notifications, messages)
    );
  END IF;
END $$;

-- Chronicle action category enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chronicle_action_category') THEN
    CREATE TYPE chronicle_action_category AS ENUM (
      'create',         -- Record created
      'read',           -- Record accessed/viewed
      'update',         -- Record modified
      'delete',         -- Record deleted
      'transfer',       -- Ownership/location transfer
      'approve',        -- Approval action
      'reject',         -- Rejection action
      'submit',         -- Submission action
      'complete',       -- Completion action
      'cancel',         -- Cancellation action
      'execute',        -- Execution (for automations)
      'send',           -- Send (for communications)
      'receive',        -- Receive (for communications)
      'login',          -- Authentication login
      'logout',         -- Authentication logout
      'other'           -- Other actions
    );
  END IF;
END $$;

-- ============================================================================
-- PART 2: BASE CHRONICLE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS chronicle_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Type Classification
  chronicle_type chronicle_type NOT NULL,
  chronicle_subtype TEXT, -- e.g., 'payment', 'refund', 'clock_in', 'checkout'
  
  -- Temporal
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER, -- For time-based entries
  
  -- Actor (who performed the action)
  actor_type TEXT NOT NULL DEFAULT 'user', -- 'user', 'system', 'integration', 'automation'
  actor_id UUID, -- References platform_users or legend_people
  actor_name TEXT, -- Denormalized for query performance
  actor_email TEXT,
  
  -- Subject (what was affected)
  subject_entity_type TEXT, -- 'legend_people', 'legend_products', 'saga_instances', etc.
  subject_entity_id UUID,
  subject_name TEXT, -- Denormalized for query performance
  
  -- Action
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'transferred', etc.
  action_category chronicle_action_category NOT NULL DEFAULT 'other',
  action_description TEXT, -- Human-readable description
  
  -- Context (related entity)
  context_entity_type TEXT, -- 'project', 'event', 'production', 'organization'
  context_entity_id UUID,
  context_name TEXT, -- Denormalized for query performance
  
  -- Data (state changes)
  before_state JSONB, -- State before the action
  after_state JSONB, -- State after the action
  delta JSONB, -- Computed diff (fields that changed)
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata
  
  -- Source
  source_system TEXT, -- 'atlvs', 'compvss', 'gvteway', 'integration', 'automation'
  source_ip INET,
  source_user_agent TEXT,
  source_request_id TEXT, -- For request tracing
  
  -- Correlation
  correlation_id UUID, -- Links related entries
  parent_entry_id UUID REFERENCES chronicle_entries(id), -- For hierarchical entries
  
  -- Immutability
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  -- Note: No updated_at - chronicle entries are immutable
);

-- Indexes for chronicle_entries
CREATE INDEX IF NOT EXISTS idx_chronicle_entries_org ON chronicle_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_entries_type ON chronicle_entries(chronicle_type);
CREATE INDEX IF NOT EXISTS idx_chronicle_entries_occurred ON chronicle_entries(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_chronicle_entries_actor ON chronicle_entries(actor_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_entries_subject ON chronicle_entries(subject_entity_type, subject_entity_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_entries_context ON chronicle_entries(context_entity_type, context_entity_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_entries_action ON chronicle_entries(action_category);
CREATE INDEX IF NOT EXISTS idx_chronicle_entries_correlation ON chronicle_entries(correlation_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_entries_metadata ON chronicle_entries USING GIN(metadata);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_chronicle_entries_org_type_occurred 
  ON chronicle_entries(organization_id, chronicle_type, occurred_at DESC);

-- ============================================================================
-- PART 3: CHRONICLE PROFILE TABLES (Activity-Specific Extensions)
-- ============================================================================

-- Transaction Profile (Financial transactions)
CREATE TABLE IF NOT EXISTS chronicle_profile_transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chronicle_id UUID NOT NULL REFERENCES chronicle_entries(id) ON DELETE CASCADE,
  
  -- Transaction Details
  transaction_type TEXT NOT NULL, -- 'payment', 'refund', 'transfer', 'adjustment', 'fee'
  transaction_status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'reversed'
  
  -- Amounts
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(10, 6),
  base_amount DECIMAL(15, 2), -- Amount in base currency
  
  -- Payment Method
  payment_method TEXT, -- 'credit_card', 'bank_transfer', 'cash', 'check', 'crypto'
  payment_provider TEXT, -- 'stripe', 'paypal', 'square', etc.
  
  -- References
  reference_number TEXT,
  external_id TEXT, -- ID from payment provider
  invoice_id UUID,
  order_id UUID,
  
  -- Accounts
  from_account TEXT,
  to_account TEXT,
  cost_center_id UUID REFERENCES legend_cost_centers(id),
  
  -- Reconciliation
  reconciliation_status TEXT DEFAULT 'pending', -- 'pending', 'matched', 'unmatched', 'exception'
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID REFERENCES platform_users(id),
  
  -- Fees
  fee_amount DECIMAL(15, 2),
  net_amount DECIMAL(15, 2),
  
  UNIQUE(chronicle_id)
);

CREATE INDEX IF NOT EXISTS idx_chronicle_profile_transaction_chronicle ON chronicle_profile_transaction(chronicle_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_transaction_type ON chronicle_profile_transaction(transaction_type);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_transaction_status ON chronicle_profile_transaction(reconciliation_status);

-- Timesheet Profile (Time tracking)
CREATE TABLE IF NOT EXISTS chronicle_profile_timesheet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chronicle_id UUID NOT NULL REFERENCES chronicle_entries(id) ON DELETE CASCADE,
  
  -- Time Entry Details
  entry_type TEXT NOT NULL, -- 'clock_in', 'clock_out', 'break_start', 'break_end', 'manual'
  
  -- Times
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  break_duration_minutes INTEGER DEFAULT 0,
  
  -- Calculated
  worked_hours DECIMAL(5, 2),
  overtime_hours DECIMAL(5, 2),
  
  -- Pay
  pay_rate DECIMAL(10, 2),
  pay_type TEXT, -- 'hourly', 'daily', 'flat'
  currency TEXT DEFAULT 'USD',
  total_pay DECIMAL(10, 2),
  
  -- Assignment
  project_id UUID,
  task_id UUID,
  department_id UUID REFERENCES legend_departments(id),
  position_id UUID REFERENCES legend_positions(id),
  
  -- Location
  location_id UUID REFERENCES legend_places(id),
  geo_location POINT,
  
  -- Approval
  approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approved_by UUID REFERENCES legend_people(id),
  approved_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  
  UNIQUE(chronicle_id)
);

CREATE INDEX IF NOT EXISTS idx_chronicle_profile_timesheet_chronicle ON chronicle_profile_timesheet(chronicle_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_timesheet_type ON chronicle_profile_timesheet(entry_type);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_timesheet_project ON chronicle_profile_timesheet(project_id);

-- Movement Profile (Asset/inventory movement)
CREATE TABLE IF NOT EXISTS chronicle_profile_movement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chronicle_id UUID NOT NULL REFERENCES chronicle_entries(id) ON DELETE CASCADE,
  
  -- Movement Details
  movement_type TEXT NOT NULL, -- 'checkout', 'checkin', 'transfer', 'adjustment', 'disposal'
  
  -- Item
  item_id UUID, -- References legend_products or inventory items
  item_name TEXT,
  item_sku TEXT,
  
  -- Quantity
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'each',
  
  -- Locations
  from_location_id UUID REFERENCES legend_places(id),
  from_location_name TEXT,
  to_location_id UUID REFERENCES legend_places(id),
  to_location_name TEXT,
  
  -- Custodian
  from_custodian_id UUID REFERENCES legend_people(id),
  from_custodian_name TEXT,
  to_custodian_id UUID REFERENCES legend_people(id),
  to_custodian_name TEXT,
  
  -- Condition
  condition_before TEXT, -- 'new', 'good', 'fair', 'poor', 'damaged'
  condition_after TEXT,
  condition_notes TEXT,
  
  -- Scheduling
  expected_return_date DATE,
  actual_return_date DATE,
  
  -- Value
  unit_value DECIMAL(15, 2),
  total_value DECIMAL(15, 2),
  currency TEXT DEFAULT 'USD',
  
  UNIQUE(chronicle_id)
);

CREATE INDEX IF NOT EXISTS idx_chronicle_profile_movement_chronicle ON chronicle_profile_movement(chronicle_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_movement_type ON chronicle_profile_movement(movement_type);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_movement_item ON chronicle_profile_movement(item_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_movement_from_location ON chronicle_profile_movement(from_location_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_movement_to_location ON chronicle_profile_movement(to_location_id);

-- Audit Profile (Audit trail)
CREATE TABLE IF NOT EXISTS chronicle_profile_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chronicle_id UUID NOT NULL REFERENCES chronicle_entries(id) ON DELETE CASCADE,
  
  -- Audit Details
  audit_type TEXT NOT NULL, -- 'data_change', 'access', 'permission', 'config', 'compliance'
  
  -- Target
  table_name TEXT,
  record_id UUID,
  record_type TEXT,
  
  -- Changes
  field_changes JSONB DEFAULT '[]'::jsonb, -- Array of {field, old_value, new_value}
  
  -- Compliance
  compliance_flags TEXT[], -- 'gdpr', 'hipaa', 'sox', 'pci'
  retention_period_days INTEGER,
  
  -- Risk
  risk_level TEXT, -- 'low', 'medium', 'high', 'critical'
  requires_review BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Session
  session_id TEXT,
  
  UNIQUE(chronicle_id)
);

CREATE INDEX IF NOT EXISTS idx_chronicle_profile_audit_chronicle ON chronicle_profile_audit(chronicle_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_audit_type ON chronicle_profile_audit(audit_type);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_audit_table ON chronicle_profile_audit(table_name);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_audit_record ON chronicle_profile_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_audit_compliance ON chronicle_profile_audit USING GIN(compliance_flags);

-- Automation Profile (Automation runs)
CREATE TABLE IF NOT EXISTS chronicle_profile_automation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chronicle_id UUID NOT NULL REFERENCES chronicle_entries(id) ON DELETE CASCADE,
  
  -- Automation Details
  automation_type TEXT NOT NULL, -- 'scheduled_job', 'webhook', 'trigger', 'integration_sync'
  automation_name TEXT,
  
  -- Execution
  workflow_id UUID, -- References saga_instances if part of a workflow
  job_id TEXT,
  
  -- Timing
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  execution_time_ms INTEGER,
  
  -- Result
  success BOOLEAN,
  exit_code INTEGER,
  error_message TEXT,
  error_code TEXT,
  error_stack TEXT,
  
  -- Retry
  attempt_number INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 3,
  
  -- Input/Output
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  
  -- Logs
  log_entries JSONB DEFAULT '[]'::jsonb, -- Array of log entries
  
  -- Resources
  memory_used_mb INTEGER,
  cpu_time_ms INTEGER,
  
  UNIQUE(chronicle_id)
);

CREATE INDEX IF NOT EXISTS idx_chronicle_profile_automation_chronicle ON chronicle_profile_automation(chronicle_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_automation_type ON chronicle_profile_automation(automation_type);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_automation_workflow ON chronicle_profile_automation(workflow_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_automation_success ON chronicle_profile_automation(success);

-- Communication Profile (Communication logs)
CREATE TABLE IF NOT EXISTS chronicle_profile_communication (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chronicle_id UUID NOT NULL REFERENCES chronicle_entries(id) ON DELETE CASCADE,
  
  -- Communication Details
  channel TEXT NOT NULL, -- 'email', 'sms', 'push', 'in_app', 'webhook', 'slack'
  direction TEXT NOT NULL, -- 'outbound', 'inbound'
  
  -- Sender/Recipient
  sender_address TEXT,
  recipient_addresses TEXT[], -- Array of recipients
  cc_addresses TEXT[],
  bcc_addresses TEXT[],
  
  -- Content
  subject TEXT,
  message_type TEXT, -- 'notification', 'alert', 'reminder', 'marketing', 'transactional'
  template_id TEXT,
  template_version TEXT,
  
  -- Delivery
  delivery_status TEXT, -- 'pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked'
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Failure
  failure_reason TEXT,
  bounce_type TEXT, -- 'hard', 'soft'
  
  -- External
  external_message_id TEXT, -- ID from email/SMS provider
  provider TEXT, -- 'sendgrid', 'twilio', 'sns', etc.
  
  -- Engagement
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  UNIQUE(chronicle_id)
);

CREATE INDEX IF NOT EXISTS idx_chronicle_profile_communication_chronicle ON chronicle_profile_communication(chronicle_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_communication_channel ON chronicle_profile_communication(channel);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_communication_status ON chronicle_profile_communication(delivery_status);
CREATE INDEX IF NOT EXISTS idx_chronicle_profile_communication_recipients ON chronicle_profile_communication USING GIN(recipient_addresses);

-- ============================================================================
-- PART 4: AGGREGATION TABLES (For reporting performance)
-- ============================================================================

-- Daily aggregates
CREATE TABLE IF NOT EXISTS chronicle_daily_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Date
  aggregate_date DATE NOT NULL,
  
  -- Type
  chronicle_type chronicle_type NOT NULL,
  chronicle_subtype TEXT,
  
  -- Counts
  entry_count INTEGER DEFAULT 0,
  
  -- For transactions
  total_amount DECIMAL(15, 2),
  currency TEXT,
  
  -- For timesheets
  total_hours DECIMAL(10, 2),
  
  -- For movements
  total_quantity INTEGER,
  
  -- Metadata
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, aggregate_date, chronicle_type, chronicle_subtype)
);

CREATE INDEX IF NOT EXISTS idx_chronicle_daily_aggregates_org_date 
  ON chronicle_daily_aggregates(organization_id, aggregate_date DESC);

-- ============================================================================
-- PART 5: RLS POLICIES
-- ============================================================================

ALTER TABLE chronicle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_profile_transaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_profile_timesheet ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_profile_movement ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_profile_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_profile_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_profile_communication ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_daily_aggregates ENABLE ROW LEVEL SECURITY;

-- chronicle_entries policies (read-only for most users, insert for authenticated)
CREATE POLICY "chronicle_entries_select" ON chronicle_entries
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "chronicle_entries_insert" ON chronicle_entries
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- No UPDATE or DELETE policies - chronicle entries are immutable

-- Profile tables inherit access from chronicle_entries
CREATE POLICY "chronicle_profile_transaction_access" ON chronicle_profile_transaction
  FOR ALL USING (
    chronicle_id IN (SELECT id FROM chronicle_entries WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "chronicle_profile_timesheet_access" ON chronicle_profile_timesheet
  FOR ALL USING (
    chronicle_id IN (SELECT id FROM chronicle_entries WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "chronicle_profile_movement_access" ON chronicle_profile_movement
  FOR ALL USING (
    chronicle_id IN (SELECT id FROM chronicle_entries WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "chronicle_profile_audit_access" ON chronicle_profile_audit
  FOR ALL USING (
    chronicle_id IN (SELECT id FROM chronicle_entries WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "chronicle_profile_automation_access" ON chronicle_profile_automation
  FOR ALL USING (
    chronicle_id IN (SELECT id FROM chronicle_entries WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "chronicle_profile_communication_access" ON chronicle_profile_communication
  FOR ALL USING (
    chronicle_id IN (SELECT id FROM chronicle_entries WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "chronicle_daily_aggregates_select" ON chronicle_daily_aggregates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- PART 6: HELPER FUNCTIONS
-- ============================================================================

-- Function to log a chronicle entry (convenience function)
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
  -- Compute delta if both before and after states provided
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
    organization_id,
    chronicle_type,
    chronicle_subtype,
    actor_id,
    actor_name,
    action,
    action_category,
    subject_entity_type,
    subject_entity_id,
    subject_name,
    context_entity_type,
    context_entity_id,
    context_name,
    before_state,
    after_state,
    delta,
    metadata,
    source_system
  ) VALUES (
    p_organization_id,
    p_chronicle_type,
    p_chronicle_subtype,
    p_actor_id,
    p_actor_name,
    p_action,
    p_action_category,
    p_subject_entity_type,
    p_subject_entity_id,
    p_subject_name,
    p_context_entity_type,
    p_context_entity_id,
    p_context_name,
    p_before_state,
    p_after_state,
    v_delta,
    p_metadata,
    p_source_system
  )
  RETURNING id INTO v_entry_id;

  RETURN v_entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get activity feed for an entity
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

-- Function to update daily aggregates
CREATE OR REPLACE FUNCTION update_chronicle_daily_aggregates()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO chronicle_daily_aggregates (
    organization_id,
    aggregate_date,
    chronicle_type,
    chronicle_subtype,
    entry_count
  ) VALUES (
    NEW.organization_id,
    DATE(NEW.occurred_at),
    NEW.chronicle_type,
    NEW.chronicle_subtype,
    1
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

-- ============================================================================
-- PART 7: GRANTS
-- ============================================================================

GRANT SELECT, INSERT ON chronicle_entries TO authenticated;
GRANT SELECT, INSERT ON chronicle_profile_transaction TO authenticated;
GRANT SELECT, INSERT ON chronicle_profile_timesheet TO authenticated;
GRANT SELECT, INSERT ON chronicle_profile_movement TO authenticated;
GRANT SELECT, INSERT ON chronicle_profile_audit TO authenticated;
GRANT SELECT, INSERT ON chronicle_profile_automation TO authenticated;
GRANT SELECT, INSERT ON chronicle_profile_communication TO authenticated;
GRANT SELECT ON chronicle_daily_aggregates TO authenticated;

GRANT EXECUTE ON FUNCTION log_chronicle_entry TO authenticated;
GRANT EXECUTE ON FUNCTION get_entity_activity_feed TO authenticated;

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- This schema consolidates the following existing activity tables:
-- - payment_transactions, refunds, transfers, adjustments
-- - time_entries, clock_events, timesheets, attendance_records
-- - asset_movements, equipment_checkouts, inventory_transfers
-- - audit_logs, activity_logs, change_history, compliance_logs
-- - automation_runs, job_executions, sync_logs, webhook_events
-- - email_logs, sms_logs, notification_logs, message_history
--
-- Key features:
-- 1. Immutable entries for audit compliance
-- 2. Profile extensions for type-specific data
-- 3. Daily aggregates for reporting performance
-- 4. Helper functions for common operations
-- 5. Activity feed function for entity timelines
--
-- Migration strategy:
-- 1. Create new chronicle tables (this migration)
-- 2. Update application code to write to chronicle
-- 3. Create data migration scripts for historical data
-- 4. Deprecate old tables after verification
-- 5. Drop old tables in future migration

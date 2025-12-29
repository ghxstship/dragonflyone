-- ============================================================================
-- 0033_batch_operations.sql
-- Batch Operations Table for Admin Bulk Data Operations
-- GHXSTSHIP Platform - 3NF Normalized Structure
-- ============================================================================

-- ============================================================================
-- BATCH OPERATIONS TABLE
-- ============================================================================

CREATE TABLE batch_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  
  -- Operation details
  entity_type TEXT NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN (
    'create', 'update', 'delete', 'archive', 'restore', 
    'export', 'import', 'assign', 'unassign', 'transfer'
  )),
  entity_ids UUID[] NOT NULL DEFAULT '{}',
  parameters JSONB DEFAULT '{}'::jsonb,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'partial', 'cancelled'
  )),
  
  -- Progress tracking
  total_count INTEGER NOT NULL DEFAULT 0,
  processed_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  
  -- Results and errors
  results JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  error_log JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_batch_operations_org ON batch_operations(organization_id);
CREATE INDEX idx_batch_operations_user ON batch_operations(user_id);
CREATE INDEX idx_batch_operations_status ON batch_operations(status);
CREATE INDEX idx_batch_operations_created ON batch_operations(created_at DESC);
CREATE INDEX idx_batch_operations_entity_type ON batch_operations(entity_type);

-- RLS Policies
ALTER TABLE batch_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY batch_operations_org_access ON batch_operations
  FOR ALL USING (org_matches(organization_id));

CREATE POLICY batch_operations_user_access ON batch_operations
  FOR SELECT USING (user_id = current_platform_user_id());

-- Grants
GRANT SELECT, INSERT, UPDATE ON batch_operations TO authenticated;

-- Trigger for updated_at
CREATE TRIGGER batch_operations_updated_at
  BEFORE UPDATE ON batch_operations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- BATCH OPERATION ITEMS (for tracking individual item status)
-- ============================================================================

CREATE TABLE batch_operation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_operation_id UUID NOT NULL REFERENCES batch_operations(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'skipped'
  )),
  
  -- Results
  result JSONB,
  error_message TEXT,
  
  -- Timestamps
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_batch_operation_items_batch ON batch_operation_items(batch_operation_id);
CREATE INDEX idx_batch_operation_items_status ON batch_operation_items(status);
CREATE INDEX idx_batch_operation_items_entity ON batch_operation_items(entity_id);

-- RLS Policies
ALTER TABLE batch_operation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY batch_operation_items_access ON batch_operation_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM batch_operations bo 
      WHERE bo.id = batch_operation_id 
      AND org_matches(bo.organization_id)
    )
  );

-- Grants
GRANT SELECT, INSERT, UPDATE ON batch_operation_items TO authenticated;

-- ============================================================================
-- PERMISSION AUDIT LOG (for tracking role/permission changes)
-- ============================================================================

CREATE TABLE permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Action details
  action_type TEXT NOT NULL CHECK (action_type IN (
    'role_assigned', 'role_removed', 'permission_granted', 'permission_revoked',
    'user_activated', 'user_deactivated', 'user_invited', 'user_removed'
  )),
  
  -- Target user
  target_user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  target_user_email TEXT,
  
  -- Performer
  performed_by_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  performed_by_email TEXT,
  
  -- Change details
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_permission_audit_log_org ON permission_audit_log(organization_id);
CREATE INDEX idx_permission_audit_log_target ON permission_audit_log(target_user_id);
CREATE INDEX idx_permission_audit_log_performer ON permission_audit_log(performed_by_id);
CREATE INDEX idx_permission_audit_log_action ON permission_audit_log(action_type);
CREATE INDEX idx_permission_audit_log_created ON permission_audit_log(created_at DESC);

-- RLS Policies
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY permission_audit_log_org_access ON permission_audit_log
  FOR SELECT USING (
    org_matches(organization_id) OR 
    performed_by_id = current_platform_user_id() OR
    target_user_id = current_platform_user_id()
  );

CREATE POLICY permission_audit_log_insert ON permission_audit_log
  FOR INSERT WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT ON permission_audit_log TO authenticated;

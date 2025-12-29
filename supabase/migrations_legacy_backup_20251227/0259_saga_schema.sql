-- 0259_saga_schema.sql
-- SAGA Schema: Normalized Workflows (Verbs)
-- Single source of truth for all workflow/process data across ATLVS, COMPVSS, GVTEWAY
--
-- Architecture: Base entity (saga_instances) + Profile extensions for specific workflow types
-- This mirrors the Legend schema pattern for entities (nouns)

-- ============================================================================
-- PART 1: ENUM TYPES
-- ============================================================================

-- Saga type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'saga_type') THEN
    CREATE TYPE saga_type AS ENUM (
      'approval',      -- Approval workflows (expense, purchase, leave, etc.)
      'request',       -- Request workflows (resource, access, equipment, etc.)
      'submission',    -- Submission workflows (applications, proposals, bids)
      'process',       -- Multi-step processes (onboarding, production, etc.)
      'automation',    -- Automated workflows (scheduled jobs, triggers)
      'change'         -- Change management (change orders, amendments)
    );
  END IF;
END $$;

-- Saga state enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'saga_state') THEN
    CREATE TYPE saga_state AS ENUM (
      'draft',         -- Not yet submitted
      'pending',       -- Awaiting action
      'in_progress',   -- Being worked on
      'review',        -- Under review
      'approved',      -- Approved (for approval workflows)
      'rejected',      -- Rejected (for approval workflows)
      'completed',     -- Successfully completed
      'cancelled',     -- Cancelled by user
      'failed',        -- Failed (for automations)
      'expired'        -- Expired due to timeout
    );
  END IF;
END $$;

-- Saga priority enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'saga_priority') THEN
    CREATE TYPE saga_priority AS ENUM (
      'low',
      'normal',
      'high',
      'urgent',
      'critical'
    );
  END IF;
END $$;

-- ============================================================================
-- PART 2: BASE SAGA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saga_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Type Classification
  saga_type saga_type NOT NULL,
  saga_subtype TEXT, -- e.g., 'expense_approval', 'leave_request', 'vendor_order'
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  reference_number TEXT, -- Auto-generated or manual reference
  
  -- State Machine
  current_state saga_state NOT NULL DEFAULT 'draft',
  previous_state saga_state,
  state_changed_at TIMESTAMPTZ DEFAULT now(),
  state_changed_by UUID REFERENCES platform_users(id),
  
  -- Ownership & Assignment
  initiated_by UUID REFERENCES legend_people(id),
  assigned_to UUID REFERENCES legend_people(id),
  owned_by UUID REFERENCES legend_people(id),
  
  -- Subject (what the workflow is about)
  subject_entity_type TEXT, -- 'legend_people', 'legend_products', 'legend_events', etc.
  subject_entity_id UUID,
  
  -- Priority & Deadlines
  priority saga_priority DEFAULT 'normal',
  due_date TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  escalation_date TIMESTAMPTZ,
  
  -- Progress Tracking
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 1,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Audit
  created_by UUID REFERENCES platform_users(id),
  updated_by UUID REFERENCES platform_users(id)
);

-- Indexes for saga_instances
CREATE INDEX IF NOT EXISTS idx_saga_instances_org ON saga_instances(organization_id);
CREATE INDEX IF NOT EXISTS idx_saga_instances_type ON saga_instances(saga_type);
CREATE INDEX IF NOT EXISTS idx_saga_instances_state ON saga_instances(current_state);
CREATE INDEX IF NOT EXISTS idx_saga_instances_initiated_by ON saga_instances(initiated_by);
CREATE INDEX IF NOT EXISTS idx_saga_instances_assigned_to ON saga_instances(assigned_to);
CREATE INDEX IF NOT EXISTS idx_saga_instances_subject ON saga_instances(subject_entity_type, subject_entity_id);
CREATE INDEX IF NOT EXISTS idx_saga_instances_due_date ON saga_instances(due_date);
CREATE INDEX IF NOT EXISTS idx_saga_instances_tags ON saga_instances USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_saga_instances_metadata ON saga_instances USING GIN(metadata);

-- ============================================================================
-- PART 3: SAGA PROFILE TABLES (Workflow-Specific Extensions)
-- ============================================================================

-- Approval Profile
CREATE TABLE IF NOT EXISTS saga_profile_approval (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  
  -- Approval Chain
  approval_level INTEGER DEFAULT 1,
  required_approvers INTEGER DEFAULT 1,
  current_approvers INTEGER DEFAULT 0,
  approval_chain JSONB DEFAULT '[]'::jsonb, -- Array of approver configs
  
  -- Decision
  decision TEXT CHECK (decision IN ('approved', 'rejected', 'pending', 'delegated')),
  decision_reason TEXT,
  decision_date TIMESTAMPTZ,
  decided_by UUID REFERENCES legend_people(id),
  
  -- Amount (for financial approvals)
  amount DECIMAL(15, 2),
  currency TEXT DEFAULT 'USD',
  budget_code TEXT,
  cost_center_id UUID REFERENCES legend_cost_centers(id),
  
  -- Delegation
  delegated_to UUID REFERENCES legend_people(id),
  delegation_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(saga_id)
);

CREATE INDEX IF NOT EXISTS idx_saga_profile_approval_saga ON saga_profile_approval(saga_id);
CREATE INDEX IF NOT EXISTS idx_saga_profile_approval_decided_by ON saga_profile_approval(decided_by);

-- Request Profile
CREATE TABLE IF NOT EXISTS saga_profile_request (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  
  -- Request Details
  request_type TEXT NOT NULL, -- 'leave', 'resource', 'access', 'equipment', 'advance'
  request_category TEXT,
  
  -- Dates
  requested_start_date DATE,
  requested_end_date DATE,
  requested_duration_hours DECIMAL(10, 2),
  
  -- Quantities
  requested_quantity INTEGER,
  approved_quantity INTEGER,
  
  -- Amounts
  requested_amount DECIMAL(15, 2),
  approved_amount DECIMAL(15, 2),
  currency TEXT DEFAULT 'USD',
  
  -- Justification
  justification TEXT,
  business_case TEXT,
  
  -- Fulfillment
  fulfillment_status TEXT CHECK (fulfillment_status IN ('pending', 'partial', 'fulfilled', 'cancelled')),
  fulfilled_at TIMESTAMPTZ,
  fulfilled_by UUID REFERENCES legend_people(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(saga_id)
);

CREATE INDEX IF NOT EXISTS idx_saga_profile_request_saga ON saga_profile_request(saga_id);
CREATE INDEX IF NOT EXISTS idx_saga_profile_request_type ON saga_profile_request(request_type);

-- Submission Profile
CREATE TABLE IF NOT EXISTS saga_profile_submission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  
  -- Submission Details
  submission_type TEXT NOT NULL, -- 'application', 'proposal', 'bid', 'rfp_response', 'registration'
  submission_category TEXT,
  
  -- Submitted Data
  submitted_data JSONB DEFAULT '{}'::jsonb,
  form_version TEXT,
  
  -- Review
  review_status TEXT CHECK (review_status IN ('pending', 'in_review', 'reviewed', 'accepted', 'rejected')),
  reviewer_id UUID REFERENCES legend_people(id),
  review_date TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Scoring
  score DECIMAL(5, 2),
  max_score DECIMAL(5, 2),
  scoring_criteria JSONB DEFAULT '{}'::jsonb,
  
  -- Feedback
  feedback TEXT,
  feedback_date TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(saga_id)
);

CREATE INDEX IF NOT EXISTS idx_saga_profile_submission_saga ON saga_profile_submission(saga_id);
CREATE INDEX IF NOT EXISTS idx_saga_profile_submission_type ON saga_profile_submission(submission_type);

-- Process Profile (Multi-step workflows)
CREATE TABLE IF NOT EXISTS saga_profile_process (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  
  -- Template
  process_template_id UUID,
  process_template_version TEXT,
  
  -- Steps
  step_definitions JSONB DEFAULT '[]'::jsonb, -- Array of step configs
  step_data JSONB DEFAULT '{}'::jsonb, -- Data collected at each step
  
  -- Branching
  current_branch TEXT,
  branch_history JSONB DEFAULT '[]'::jsonb,
  
  -- Parallel Execution
  parallel_tasks JSONB DEFAULT '[]'::jsonb,
  completed_parallel_tasks INTEGER DEFAULT 0,
  
  -- Checkpoints
  last_checkpoint_at TIMESTAMPTZ,
  checkpoint_data JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(saga_id)
);

CREATE INDEX IF NOT EXISTS idx_saga_profile_process_saga ON saga_profile_process(saga_id);
CREATE INDEX IF NOT EXISTS idx_saga_profile_process_template ON saga_profile_process(process_template_id);

-- Automation Profile
CREATE TABLE IF NOT EXISTS saga_profile_automation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  
  -- Trigger
  trigger_type TEXT NOT NULL, -- 'schedule', 'event', 'webhook', 'manual', 'condition'
  trigger_config JSONB DEFAULT '{}'::jsonb,
  trigger_source TEXT,
  
  -- Execution
  execution_started_at TIMESTAMPTZ,
  execution_ended_at TIMESTAMPTZ,
  execution_duration_ms INTEGER,
  
  -- Results
  success BOOLEAN,
  error_message TEXT,
  error_code TEXT,
  error_stack TEXT,
  
  -- Retry
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  
  -- Output
  output_data JSONB DEFAULT '{}'::jsonb,
  execution_log JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(saga_id)
);

CREATE INDEX IF NOT EXISTS idx_saga_profile_automation_saga ON saga_profile_automation(saga_id);
CREATE INDEX IF NOT EXISTS idx_saga_profile_automation_trigger ON saga_profile_automation(trigger_type);

-- Change Profile (Change Management)
CREATE TABLE IF NOT EXISTS saga_profile_change (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  
  -- Change Details
  change_type TEXT NOT NULL, -- 'change_order', 'amendment', 'modification', 'correction'
  change_category TEXT,
  change_reason TEXT NOT NULL,
  
  -- Impact
  impact_assessment TEXT,
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  affected_areas JSONB DEFAULT '[]'::jsonb,
  
  -- Before/After State
  before_state JSONB DEFAULT '{}'::jsonb,
  after_state JSONB DEFAULT '{}'::jsonb,
  delta JSONB DEFAULT '{}'::jsonb,
  
  -- Financial Impact
  cost_impact DECIMAL(15, 2),
  schedule_impact_days INTEGER,
  
  -- Approval
  requires_approval BOOLEAN DEFAULT true,
  approval_threshold DECIMAL(15, 2),
  
  -- Implementation
  implementation_plan TEXT,
  implementation_date TIMESTAMPTZ,
  implemented_by UUID REFERENCES legend_people(id),
  rollback_plan TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(saga_id)
);

CREATE INDEX IF NOT EXISTS idx_saga_profile_change_saga ON saga_profile_change(saga_id);
CREATE INDEX IF NOT EXISTS idx_saga_profile_change_type ON saga_profile_change(change_type);

-- ============================================================================
-- PART 4: SUPPORTING TABLES
-- ============================================================================

-- Saga Steps (Individual steps within a workflow)
CREATE TABLE IF NOT EXISTS saga_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  
  -- Step Info
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT, -- 'action', 'decision', 'approval', 'notification', 'wait'
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'failed')),
  
  -- Assignment
  assigned_to UUID REFERENCES legend_people(id),
  completed_by UUID REFERENCES legend_people(id),
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  
  -- Data
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saga_steps_saga ON saga_steps(saga_id);
CREATE INDEX IF NOT EXISTS idx_saga_steps_status ON saga_steps(status);
CREATE INDEX IF NOT EXISTS idx_saga_steps_assigned ON saga_steps(assigned_to);

-- Saga Transitions (State transition history)
CREATE TABLE IF NOT EXISTS saga_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  
  -- Transition
  from_state saga_state,
  to_state saga_state NOT NULL,
  
  -- Actor
  transitioned_by UUID REFERENCES platform_users(id),
  
  -- Context
  reason TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  transitioned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saga_transitions_saga ON saga_transitions(saga_id);
CREATE INDEX IF NOT EXISTS idx_saga_transitions_at ON saga_transitions(transitioned_at);

-- Saga Participants (People involved in the workflow)
CREATE TABLE IF NOT EXISTS saga_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  
  -- Role
  role TEXT NOT NULL, -- 'initiator', 'approver', 'reviewer', 'assignee', 'observer', 'stakeholder'
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'removed')),
  
  -- Action
  action_required BOOLEAN DEFAULT false,
  action_due_date TIMESTAMPTZ,
  action_completed_at TIMESTAMPTZ,
  
  -- Timestamps
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_at TIMESTAMPTZ,
  
  UNIQUE(saga_id, person_id, role)
);

CREATE INDEX IF NOT EXISTS idx_saga_participants_saga ON saga_participants(saga_id);
CREATE INDEX IF NOT EXISTS idx_saga_participants_person ON saga_participants(person_id);
CREATE INDEX IF NOT EXISTS idx_saga_participants_action ON saga_participants(action_required) WHERE action_required = true;

-- Saga Comments
CREATE TABLE IF NOT EXISTS saga_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  
  -- Comment
  content TEXT NOT NULL,
  
  -- Author
  author_id UUID NOT NULL REFERENCES legend_people(id),
  
  -- Reply
  parent_comment_id UUID REFERENCES saga_comments(id),
  
  -- Visibility
  is_internal BOOLEAN DEFAULT false, -- Internal comments not visible to all participants
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_saga_comments_saga ON saga_comments(saga_id);
CREATE INDEX IF NOT EXISTS idx_saga_comments_author ON saga_comments(author_id);

-- Saga Attachments
CREATE TABLE IF NOT EXISTS saga_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  
  -- File Info
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  
  -- Metadata
  description TEXT,
  uploaded_by UUID REFERENCES legend_people(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saga_attachments_saga ON saga_attachments(saga_id);

-- Saga Templates (Reusable workflow templates)
CREATE TABLE IF NOT EXISTS saga_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Template Info
  name TEXT NOT NULL,
  description TEXT,
  saga_type saga_type NOT NULL,
  saga_subtype TEXT,
  
  -- Configuration
  step_definitions JSONB DEFAULT '[]'::jsonb,
  default_priority saga_priority DEFAULT 'normal',
  default_sla_hours INTEGER,
  
  -- Approval Chain
  approval_chain_config JSONB DEFAULT '{}'::jsonb,
  
  -- Automation
  auto_assign_rules JSONB DEFAULT '{}'::jsonb,
  notification_config JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES platform_users(id),
  
  UNIQUE(organization_id, name, version)
);

CREATE INDEX IF NOT EXISTS idx_saga_templates_org ON saga_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_saga_templates_type ON saga_templates(saga_type);
CREATE INDEX IF NOT EXISTS idx_saga_templates_active ON saga_templates(is_active) WHERE is_active = true;

-- ============================================================================
-- PART 5: RLS POLICIES
-- ============================================================================

ALTER TABLE saga_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_profile_approval ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_profile_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_profile_submission ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_profile_process ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_profile_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_profile_change ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_templates ENABLE ROW LEVEL SECURITY;

-- saga_instances policies
CREATE POLICY "saga_instances_select" ON saga_instances
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "saga_instances_insert" ON saga_instances
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "saga_instances_update" ON saga_instances
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "saga_instances_delete" ON saga_instances
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Profile tables inherit access from saga_instances
CREATE POLICY "saga_profile_approval_access" ON saga_profile_approval
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "saga_profile_request_access" ON saga_profile_request
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "saga_profile_submission_access" ON saga_profile_submission
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "saga_profile_process_access" ON saga_profile_process
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "saga_profile_automation_access" ON saga_profile_automation
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "saga_profile_change_access" ON saga_profile_change
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

-- Supporting tables policies
CREATE POLICY "saga_steps_access" ON saga_steps
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "saga_transitions_access" ON saga_transitions
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "saga_participants_access" ON saga_participants
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "saga_comments_access" ON saga_comments
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "saga_attachments_access" ON saga_attachments
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "saga_templates_select" ON saga_templates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "saga_templates_modify" ON saga_templates
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- PART 6: TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saga_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saga_instances_updated_at
  BEFORE UPDATE ON saga_instances
  FOR EACH ROW EXECUTE FUNCTION update_saga_updated_at();

CREATE TRIGGER saga_profile_approval_updated_at
  BEFORE UPDATE ON saga_profile_approval
  FOR EACH ROW EXECUTE FUNCTION update_saga_updated_at();

CREATE TRIGGER saga_profile_request_updated_at
  BEFORE UPDATE ON saga_profile_request
  FOR EACH ROW EXECUTE FUNCTION update_saga_updated_at();

CREATE TRIGGER saga_profile_submission_updated_at
  BEFORE UPDATE ON saga_profile_submission
  FOR EACH ROW EXECUTE FUNCTION update_saga_updated_at();

CREATE TRIGGER saga_profile_process_updated_at
  BEFORE UPDATE ON saga_profile_process
  FOR EACH ROW EXECUTE FUNCTION update_saga_updated_at();

CREATE TRIGGER saga_profile_automation_updated_at
  BEFORE UPDATE ON saga_profile_automation
  FOR EACH ROW EXECUTE FUNCTION update_saga_updated_at();

CREATE TRIGGER saga_profile_change_updated_at
  BEFORE UPDATE ON saga_profile_change
  FOR EACH ROW EXECUTE FUNCTION update_saga_updated_at();

-- Record state transitions
CREATE OR REPLACE FUNCTION record_saga_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_state IS DISTINCT FROM NEW.current_state THEN
    INSERT INTO saga_transitions (saga_id, from_state, to_state, transitioned_by)
    VALUES (NEW.id, OLD.current_state, NEW.current_state, NEW.state_changed_by);
    
    NEW.previous_state = OLD.current_state;
    NEW.state_changed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saga_state_transition
  BEFORE UPDATE ON saga_instances
  FOR EACH ROW EXECUTE FUNCTION record_saga_transition();

-- Generate reference number
CREATE OR REPLACE FUNCTION generate_saga_reference()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  seq_num INTEGER;
BEGIN
  -- Set prefix based on saga type
  prefix := CASE NEW.saga_type
    WHEN 'approval' THEN 'APR'
    WHEN 'request' THEN 'REQ'
    WHEN 'submission' THEN 'SUB'
    WHEN 'process' THEN 'PRC'
    WHEN 'automation' THEN 'AUT'
    WHEN 'change' THEN 'CHG'
    ELSE 'SAG'
  END;
  
  -- Get next sequence number for this org and type
  SELECT COALESCE(MAX(
    CASE 
      WHEN reference_number ~ ('^' || prefix || '-[0-9]+$')
      THEN CAST(SUBSTRING(reference_number FROM prefix || '-([0-9]+)$') AS INTEGER)
      ELSE 0
    END
  ), 0) + 1 INTO seq_num
  FROM saga_instances
  WHERE organization_id = NEW.organization_id
    AND saga_type = NEW.saga_type;
  
  NEW.reference_number := prefix || '-' || LPAD(seq_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saga_generate_reference
  BEFORE INSERT ON saga_instances
  FOR EACH ROW
  WHEN (NEW.reference_number IS NULL)
  EXECUTE FUNCTION generate_saga_reference();

-- ============================================================================
-- PART 7: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON saga_instances TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_profile_approval TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_profile_request TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_profile_submission TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_profile_process TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_profile_automation TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_profile_change TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_steps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_transitions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_attachments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_templates TO authenticated;

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- This schema consolidates the following existing workflow tables:
-- - approval_requests, expense_approvals, vendor_order_approvals, leave_approvals
-- - leave_requests, resource_requests, access_requests, equipment_requests
-- - applications, registrations, proposals, bids, rfp_responses
-- - workflow_instances, workflow_steps, workflow_transitions
-- - change_orders, change_requests, amendment_requests
-- - scheduled_jobs, automation_runs, job_executions
--
-- Migration strategy:
-- 1. Create new saga tables (this migration)
-- 2. Create data migration scripts to copy existing data
-- 3. Update application code to use saga hooks/APIs
-- 4. Deprecate old tables after verification
-- 5. Drop old tables in future migration

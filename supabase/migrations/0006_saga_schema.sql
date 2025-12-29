-- ============================================================================
-- 0006_saga_schema.sql
-- SAGA Schema: Normalized Workflows (Verbs)
-- Single source of truth for all workflow/process data
-- GHXSTSHIP Platform - 3NF Normalized Structure
-- ============================================================================

-- ============================================================================
-- BASE SAGA TABLE
-- ============================================================================

CREATE TABLE saga_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Type Classification
  saga_type saga_type NOT NULL,
  saga_subtype TEXT,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  reference_number TEXT,
  
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
  subject_entity_type TEXT,
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

CREATE INDEX idx_saga_instances_org ON saga_instances(organization_id);
CREATE INDEX idx_saga_instances_type ON saga_instances(saga_type);
CREATE INDEX idx_saga_instances_state ON saga_instances(current_state);
CREATE INDEX idx_saga_instances_initiated_by ON saga_instances(initiated_by);
CREATE INDEX idx_saga_instances_assigned_to ON saga_instances(assigned_to);
CREATE INDEX idx_saga_instances_subject ON saga_instances(subject_entity_type, subject_entity_id);
CREATE INDEX idx_saga_instances_due_date ON saga_instances(due_date);
CREATE INDEX idx_saga_instances_tags ON saga_instances USING GIN(tags);
CREATE INDEX idx_saga_instances_metadata ON saga_instances USING GIN(metadata);

-- ============================================================================
-- SAGA PROFILE TABLES
-- ============================================================================

-- Approval Profile
CREATE TABLE saga_profile_approval (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  approval_level INTEGER DEFAULT 1,
  required_approvers INTEGER DEFAULT 1,
  current_approvers INTEGER DEFAULT 0,
  approval_chain JSONB DEFAULT '[]'::jsonb,
  decision TEXT CHECK (decision IN ('approved', 'rejected', 'pending', 'delegated')),
  decision_reason TEXT,
  decision_date TIMESTAMPTZ,
  decided_by UUID REFERENCES legend_people(id),
  amount DECIMAL(15, 2),
  currency TEXT DEFAULT 'USD',
  budget_code TEXT,
  cost_center_id UUID REFERENCES legend_cost_centers(id),
  delegated_to UUID REFERENCES legend_people(id),
  delegation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(saga_id)
);

CREATE INDEX idx_saga_profile_approval_saga ON saga_profile_approval(saga_id);
CREATE INDEX idx_saga_profile_approval_decided_by ON saga_profile_approval(decided_by);

-- Request Profile
CREATE TABLE saga_profile_request (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  request_category TEXT,
  requested_start_date DATE,
  requested_end_date DATE,
  requested_duration_hours DECIMAL(10, 2),
  requested_quantity INTEGER,
  approved_quantity INTEGER,
  requested_amount DECIMAL(15, 2),
  approved_amount DECIMAL(15, 2),
  currency TEXT DEFAULT 'USD',
  justification TEXT,
  business_case TEXT,
  fulfillment_status TEXT CHECK (fulfillment_status IN ('pending', 'partial', 'fulfilled', 'cancelled')),
  fulfilled_at TIMESTAMPTZ,
  fulfilled_by UUID REFERENCES legend_people(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(saga_id)
);

CREATE INDEX idx_saga_profile_request_saga ON saga_profile_request(saga_id);
CREATE INDEX idx_saga_profile_request_type ON saga_profile_request(request_type);

-- Submission Profile
CREATE TABLE saga_profile_submission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL,
  submission_category TEXT,
  submitted_data JSONB DEFAULT '{}'::jsonb,
  form_version TEXT,
  review_status TEXT CHECK (review_status IN ('pending', 'in_review', 'reviewed', 'accepted', 'rejected')),
  reviewer_id UUID REFERENCES legend_people(id),
  review_date TIMESTAMPTZ,
  review_notes TEXT,
  score DECIMAL(5, 2),
  max_score DECIMAL(5, 2),
  scoring_criteria JSONB DEFAULT '{}'::jsonb,
  feedback TEXT,
  feedback_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(saga_id)
);

CREATE INDEX idx_saga_profile_submission_saga ON saga_profile_submission(saga_id);
CREATE INDEX idx_saga_profile_submission_type ON saga_profile_submission(submission_type);

-- Process Profile
CREATE TABLE saga_profile_process (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  process_template_id UUID,
  process_template_version TEXT,
  step_definitions JSONB DEFAULT '[]'::jsonb,
  step_data JSONB DEFAULT '{}'::jsonb,
  current_branch TEXT,
  branch_history JSONB DEFAULT '[]'::jsonb,
  parallel_tasks JSONB DEFAULT '[]'::jsonb,
  completed_parallel_tasks INTEGER DEFAULT 0,
  last_checkpoint_at TIMESTAMPTZ,
  checkpoint_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(saga_id)
);

CREATE INDEX idx_saga_profile_process_saga ON saga_profile_process(saga_id);
CREATE INDEX idx_saga_profile_process_template ON saga_profile_process(process_template_id);

-- Automation Profile
CREATE TABLE saga_profile_automation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  trigger_source TEXT,
  execution_started_at TIMESTAMPTZ,
  execution_ended_at TIMESTAMPTZ,
  execution_duration_ms INTEGER,
  success BOOLEAN,
  error_message TEXT,
  error_code TEXT,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  output_data JSONB DEFAULT '{}'::jsonb,
  execution_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(saga_id)
);

CREATE INDEX idx_saga_profile_automation_saga ON saga_profile_automation(saga_id);
CREATE INDEX idx_saga_profile_automation_trigger ON saga_profile_automation(trigger_type);

-- Change Profile
CREATE TABLE saga_profile_change (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL,
  change_category TEXT,
  change_reason TEXT NOT NULL,
  impact_assessment TEXT,
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  affected_areas JSONB DEFAULT '[]'::jsonb,
  before_state JSONB DEFAULT '{}'::jsonb,
  after_state JSONB DEFAULT '{}'::jsonb,
  delta JSONB DEFAULT '{}'::jsonb,
  cost_impact DECIMAL(15, 2),
  schedule_impact_days INTEGER,
  requires_approval BOOLEAN DEFAULT true,
  approval_threshold DECIMAL(15, 2),
  implementation_plan TEXT,
  implementation_date TIMESTAMPTZ,
  implemented_by UUID REFERENCES legend_people(id),
  rollback_plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(saga_id)
);

CREATE INDEX idx_saga_profile_change_saga ON saga_profile_change(saga_id);
CREATE INDEX idx_saga_profile_change_type ON saga_profile_change(change_type);

-- ============================================================================
-- SAGA SUPPORTING TABLES
-- ============================================================================

-- Saga Steps
CREATE TABLE saga_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'failed')),
  assigned_to UUID REFERENCES legend_people(id),
  completed_by UUID REFERENCES legend_people(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_saga_steps_saga ON saga_steps(saga_id);
CREATE INDEX idx_saga_steps_status ON saga_steps(status);
CREATE INDEX idx_saga_steps_assigned ON saga_steps(assigned_to);

-- Saga Transitions
CREATE TABLE saga_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  from_state saga_state,
  to_state saga_state NOT NULL,
  transitioned_by UUID REFERENCES platform_users(id),
  reason TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  transitioned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_saga_transitions_saga ON saga_transitions(saga_id);
CREATE INDEX idx_saga_transitions_at ON saga_transitions(transitioned_at);

-- Saga Participants
CREATE TABLE saga_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'removed')),
  action_required BOOLEAN DEFAULT false,
  action_due_date TIMESTAMPTZ,
  action_completed_at TIMESTAMPTZ,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_at TIMESTAMPTZ,
  UNIQUE(saga_id, person_id, role)
);

CREATE INDEX idx_saga_participants_saga ON saga_participants(saga_id);
CREATE INDEX idx_saga_participants_person ON saga_participants(person_id);
CREATE INDEX idx_saga_participants_action ON saga_participants(action_required) WHERE action_required = true;

-- Saga Comments
CREATE TABLE saga_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES legend_people(id),
  parent_comment_id UUID REFERENCES saga_comments(id),
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_saga_comments_saga ON saga_comments(saga_id);
CREATE INDEX idx_saga_comments_author ON saga_comments(author_id);

-- Saga Attachments
CREATE TABLE saga_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_id UUID NOT NULL REFERENCES saga_instances(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES legend_people(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_saga_attachments_saga ON saga_attachments(saga_id);

-- Saga Templates
CREATE TABLE saga_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  saga_type saga_type NOT NULL,
  saga_subtype TEXT,
  step_definitions JSONB DEFAULT '[]'::jsonb,
  default_priority saga_priority DEFAULT 'normal',
  default_sla_hours INTEGER,
  approval_chain_config JSONB DEFAULT '{}'::jsonb,
  auto_assign_rules JSONB DEFAULT '{}'::jsonb,
  notification_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES platform_users(id),
  UNIQUE(organization_id, name, version)
);

CREATE INDEX idx_saga_templates_org ON saga_templates(organization_id);
CREATE INDEX idx_saga_templates_type ON saga_templates(saga_type);
CREATE INDEX idx_saga_templates_active ON saga_templates(is_active) WHERE is_active = true;

-- ============================================================================
-- SAGA TRIGGERS
-- ============================================================================

CREATE TRIGGER saga_instances_updated_at BEFORE UPDATE ON saga_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER saga_profile_approval_updated_at BEFORE UPDATE ON saga_profile_approval FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER saga_profile_request_updated_at BEFORE UPDATE ON saga_profile_request FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER saga_profile_submission_updated_at BEFORE UPDATE ON saga_profile_submission FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER saga_profile_process_updated_at BEFORE UPDATE ON saga_profile_process FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER saga_profile_automation_updated_at BEFORE UPDATE ON saga_profile_automation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER saga_profile_change_updated_at BEFORE UPDATE ON saga_profile_change FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER saga_steps_updated_at BEFORE UPDATE ON saga_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER saga_comments_updated_at BEFORE UPDATE ON saga_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER saga_templates_updated_at BEFORE UPDATE ON saga_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
  prefix := CASE NEW.saga_type
    WHEN 'approval' THEN 'APR'
    WHEN 'request' THEN 'REQ'
    WHEN 'submission' THEN 'SUB'
    WHEN 'process' THEN 'PRC'
    WHEN 'automation' THEN 'AUT'
    WHEN 'change' THEN 'CHG'
    ELSE 'SAG'
  END;
  
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

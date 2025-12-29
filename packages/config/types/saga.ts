/**
 * Saga Types - Normalized Workflows (Verbs)
 * TypeScript types for the Saga schema
 */

// ============================================================================
// ENUMS
// ============================================================================

export type SagaType = 
  | 'approval'
  | 'request'
  | 'submission'
  | 'process'
  | 'automation'
  | 'change';

export type SagaState = 
  | 'draft'
  | 'pending'
  | 'in_progress'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'expired';

export type SagaPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'
  | 'critical';

// ============================================================================
// BASE SAGA INSTANCE
// ============================================================================

export interface SagaInstance {
  id: string;
  organization_id: string;
  
  // Type Classification
  saga_type: SagaType;
  saga_subtype?: string;
  
  // Basic Info
  title: string;
  description?: string;
  reference_number?: string;
  
  // State Machine
  current_state: SagaState;
  previous_state?: SagaState;
  state_changed_at?: string;
  state_changed_by?: string;
  
  // Ownership & Assignment
  initiated_by?: string;
  assigned_to?: string;
  owned_by?: string;
  
  // Subject
  subject_entity_type?: string;
  subject_entity_id?: string;
  
  // Priority & Deadlines
  priority: SagaPriority;
  due_date?: string;
  sla_deadline?: string;
  escalation_date?: string;
  
  // Progress
  current_step: number;
  total_steps: number;
  progress_percent: number;
  
  // Metadata
  metadata: Record<string, unknown>;
  tags: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  
  // Audit
  created_by?: string;
  updated_by?: string;
  
  // Joined data (optional)
  initiated_by_person?: { id: string; display_name: string };
  assigned_to_person?: { id: string; display_name: string };
  steps?: SagaStep[];
  participants?: SagaParticipant[];
  comments?: SagaComment[];
  attachments?: SagaAttachment[];
  profile?: SagaProfileApproval | SagaProfileRequest | SagaProfileSubmission | SagaProfileProcess | SagaProfileAutomation | SagaProfileChange;
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

export interface SagaProfileApproval {
  id: string;
  saga_id: string;
  
  // Approval Chain
  approval_level: number;
  required_approvers: number;
  current_approvers: number;
  approval_chain: ApprovalChainItem[];
  
  // Decision
  decision?: 'approved' | 'rejected' | 'pending' | 'delegated';
  decision_reason?: string;
  decision_date?: string;
  decided_by?: string;
  
  // Amount
  amount?: number;
  currency: string;
  budget_code?: string;
  cost_center_id?: string;
  
  // Delegation
  delegated_to?: string;
  delegation_reason?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ApprovalChainItem {
  level: number;
  approver_id: string;
  approver_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  decided_at?: string;
  notes?: string;
}

export interface SagaProfileRequest {
  id: string;
  saga_id: string;
  
  // Request Details
  request_type: string;
  request_category?: string;
  
  // Dates
  requested_start_date?: string;
  requested_end_date?: string;
  requested_duration_hours?: number;
  
  // Quantities
  requested_quantity?: number;
  approved_quantity?: number;
  
  // Amounts
  requested_amount?: number;
  approved_amount?: number;
  currency: string;
  
  // Justification
  justification?: string;
  business_case?: string;
  
  // Fulfillment
  fulfillment_status?: 'pending' | 'partial' | 'fulfilled' | 'cancelled';
  fulfilled_at?: string;
  fulfilled_by?: string;
  
  created_at: string;
  updated_at: string;
}

export interface SagaProfileSubmission {
  id: string;
  saga_id: string;
  
  // Submission Details
  submission_type: string;
  submission_category?: string;
  
  // Submitted Data
  submitted_data: Record<string, unknown>;
  form_version?: string;
  
  // Review
  review_status?: 'pending' | 'in_review' | 'reviewed' | 'accepted' | 'rejected';
  reviewer_id?: string;
  review_date?: string;
  review_notes?: string;
  
  // Scoring
  score?: number;
  max_score?: number;
  scoring_criteria: Record<string, unknown>;
  
  // Feedback
  feedback?: string;
  feedback_date?: string;
  
  created_at: string;
  updated_at: string;
}

export interface SagaProfileProcess {
  id: string;
  saga_id: string;
  
  // Template
  process_template_id?: string;
  process_template_version?: string;
  
  // Steps
  step_definitions: ProcessStepDefinition[];
  step_data: Record<string, unknown>;
  
  // Branching
  current_branch?: string;
  branch_history: BranchHistoryItem[];
  
  // Parallel Execution
  parallel_tasks: ParallelTask[];
  completed_parallel_tasks: number;
  
  // Checkpoints
  last_checkpoint_at?: string;
  checkpoint_data: Record<string, unknown>;
  
  created_at: string;
  updated_at: string;
}

export interface ProcessStepDefinition {
  step_number: number;
  name: string;
  type: string;
  config: Record<string, unknown>;
  conditions?: Record<string, unknown>;
}

export interface BranchHistoryItem {
  branch: string;
  entered_at: string;
  exited_at?: string;
  reason?: string;
}

export interface ParallelTask {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assigned_to?: string;
}

export interface SagaProfileAutomation {
  id: string;
  saga_id: string;
  
  // Trigger
  trigger_type: 'schedule' | 'event' | 'webhook' | 'manual' | 'condition';
  trigger_config: Record<string, unknown>;
  trigger_source?: string;
  
  // Execution
  execution_started_at?: string;
  execution_ended_at?: string;
  execution_duration_ms?: number;
  
  // Results
  success?: boolean;
  error_message?: string;
  error_code?: string;
  error_stack?: string;
  
  // Retry
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  
  // Output
  output_data: Record<string, unknown>;
  execution_log: ExecutionLogEntry[];
  
  created_at: string;
  updated_at: string;
}

export interface ExecutionLogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, unknown>;
}

export interface SagaProfileChange {
  id: string;
  saga_id: string;
  
  // Change Details
  change_type: 'change_order' | 'amendment' | 'modification' | 'correction';
  change_category?: string;
  change_reason: string;
  
  // Impact
  impact_assessment?: string;
  impact_level?: 'low' | 'medium' | 'high' | 'critical';
  affected_areas: string[];
  
  // Before/After State
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  delta: Record<string, unknown>;
  
  // Financial Impact
  cost_impact?: number;
  schedule_impact_days?: number;
  
  // Approval
  requires_approval: boolean;
  approval_threshold?: number;
  
  // Implementation
  implementation_plan?: string;
  implementation_date?: string;
  implemented_by?: string;
  rollback_plan?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface SagaStep {
  id: string;
  saga_id: string;
  
  // Step Info
  step_number: number;
  step_name: string;
  step_type?: string;
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  
  // Assignment
  assigned_to?: string;
  completed_by?: string;
  
  // Timing
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  
  // Data
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface SagaTransition {
  id: string;
  saga_id: string;
  
  from_state?: SagaState;
  to_state: SagaState;
  
  transitioned_by?: string;
  reason?: string;
  notes?: string;
  metadata: Record<string, unknown>;
  
  transitioned_at: string;
}

export interface SagaParticipant {
  id: string;
  saga_id: string;
  person_id: string;
  
  role: 'initiator' | 'approver' | 'reviewer' | 'assignee' | 'observer' | 'stakeholder';
  status: 'active' | 'completed' | 'removed';
  
  action_required: boolean;
  action_due_date?: string;
  action_completed_at?: string;
  
  added_at: string;
  removed_at?: string;
  
  // Joined
  person?: { id: string; display_name: string; email?: string };
}

export interface SagaComment {
  id: string;
  saga_id: string;
  
  content: string;
  author_id: string;
  parent_comment_id?: string;
  is_internal: boolean;
  
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Joined
  author?: { id: string; display_name: string };
  replies?: SagaComment[];
}

export interface SagaAttachment {
  id: string;
  saga_id: string;
  
  file_name: string;
  file_type?: string;
  file_size?: number;
  file_url: string;
  storage_path?: string;
  
  description?: string;
  uploaded_by?: string;
  
  created_at: string;
}

export interface SagaTemplate {
  id: string;
  organization_id: string;
  
  name: string;
  description?: string;
  saga_type: SagaType;
  saga_subtype?: string;
  
  step_definitions: ProcessStepDefinition[];
  default_priority: SagaPriority;
  default_sla_hours?: number;
  
  approval_chain_config: Record<string, unknown>;
  auto_assign_rules: Record<string, unknown>;
  notification_config: Record<string, unknown>;
  
  is_active: boolean;
  version: number;
  
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface SagaFilters {
  search?: string;
  saga_type?: SagaType;
  saga_subtype?: string;
  current_state?: SagaState;
  priority?: SagaPriority;
  initiated_by?: string;
  assigned_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  tags?: string[];
}

// ============================================================================
// PAYLOAD TYPES
// ============================================================================

export interface CreateSagaPayload {
  saga_type: SagaType;
  saga_subtype?: string;
  title: string;
  description?: string;
  priority?: SagaPriority;
  due_date?: string;
  assigned_to?: string;
  subject_entity_type?: string;
  subject_entity_id?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateSagaPayload {
  id: string;
  title?: string;
  description?: string;
  priority?: SagaPriority;
  due_date?: string;
  assigned_to?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface TransitionSagaPayload {
  id: string;
  to_state: SagaState;
  reason?: string;
  notes?: string;
}

export interface CreateSagaStepPayload {
  saga_id: string;
  step_number: number;
  step_name: string;
  step_type?: string;
  assigned_to?: string;
  due_date?: string;
  input_data?: Record<string, unknown>;
}

export interface CreateSagaCommentPayload {
  saga_id: string;
  content: string;
  parent_comment_id?: string;
  is_internal?: boolean;
}

export interface CreateSagaAttachmentPayload {
  saga_id: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  file_url: string;
  storage_path?: string;
  description?: string;
}

// ============================================================================
// COUNTS
// ============================================================================

export interface SagaCounts {
  total: number;
  by_type: Record<SagaType, number>;
  by_state: Record<SagaState, number>;
  by_priority: Record<SagaPriority, number>;
  overdue: number;
  due_today: number;
  my_pending_actions: number;
}

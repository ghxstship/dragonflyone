/**
 * Chronicle Types - Normalized Activities (Transactions)
 * TypeScript types for the Chronicle schema
 */

// ============================================================================
// ENUMS
// ============================================================================

export type ChronicleType = 
  | 'transaction'
  | 'timesheet'
  | 'movement'
  | 'audit'
  | 'automation'
  | 'communication';

export type ChronicleActionCategory = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'transfer'
  | 'approve'
  | 'reject'
  | 'submit'
  | 'complete'
  | 'cancel'
  | 'execute'
  | 'send'
  | 'receive'
  | 'login'
  | 'logout'
  | 'other';

// ============================================================================
// BASE CHRONICLE ENTRY
// ============================================================================

export interface ChronicleEntry {
  id: string;
  organization_id: string;
  
  // Type Classification
  chronicle_type: ChronicleType;
  chronicle_subtype?: string;
  
  // Temporal
  occurred_at: string;
  duration_seconds?: number;
  
  // Actor
  actor_type: 'user' | 'system' | 'integration' | 'automation';
  actor_id?: string;
  actor_name?: string;
  actor_email?: string;
  
  // Subject
  subject_entity_type?: string;
  subject_entity_id?: string;
  subject_name?: string;
  
  // Action
  action: string;
  action_category: ChronicleActionCategory;
  action_description?: string;
  
  // Context
  context_entity_type?: string;
  context_entity_id?: string;
  context_name?: string;
  
  // Data
  before_state?: Record<string, unknown>;
  after_state?: Record<string, unknown>;
  delta?: Record<string, unknown>;
  metadata: Record<string, unknown>;
  
  // Source
  source_system?: string;
  source_ip?: string;
  source_user_agent?: string;
  source_request_id?: string;
  
  // Correlation
  correlation_id?: string;
  parent_entry_id?: string;
  
  // Timestamp
  created_at: string;
  
  // Joined profile (optional)
  profile?: ChronicleProfileTransaction | ChronicleProfileTimesheet | ChronicleProfileMovement | ChronicleProfileAudit | ChronicleProfileAutomation | ChronicleProfileCommunication;
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

export interface ChronicleProfileTransaction {
  id: string;
  chronicle_id: string;
  
  // Transaction Details
  transaction_type: 'payment' | 'refund' | 'transfer' | 'adjustment' | 'fee';
  transaction_status: 'pending' | 'completed' | 'failed' | 'reversed';
  
  // Amounts
  amount: number;
  currency: string;
  exchange_rate?: number;
  base_amount?: number;
  
  // Payment Method
  payment_method?: string;
  payment_provider?: string;
  
  // References
  reference_number?: string;
  external_id?: string;
  invoice_id?: string;
  order_id?: string;
  
  // Accounts
  from_account?: string;
  to_account?: string;
  cost_center_id?: string;
  
  // Reconciliation
  reconciliation_status: 'pending' | 'matched' | 'unmatched' | 'exception';
  reconciled_at?: string;
  reconciled_by?: string;
  
  // Fees
  fee_amount?: number;
  net_amount?: number;
}

export interface ChronicleProfileTimesheet {
  id: string;
  chronicle_id: string;
  
  // Time Entry Details
  entry_type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end' | 'manual';
  
  // Times
  clock_in?: string;
  clock_out?: string;
  break_duration_minutes: number;
  
  // Calculated
  worked_hours?: number;
  overtime_hours?: number;
  
  // Pay
  pay_rate?: number;
  pay_type?: 'hourly' | 'daily' | 'flat';
  currency: string;
  total_pay?: number;
  
  // Assignment
  project_id?: string;
  task_id?: string;
  department_id?: string;
  position_id?: string;
  
  // Location
  location_id?: string;
  geo_location?: { x: number; y: number };
  
  // Approval
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  
  // Notes
  notes?: string;
}

export interface ChronicleProfileMovement {
  id: string;
  chronicle_id: string;
  
  // Movement Details
  movement_type: 'checkout' | 'checkin' | 'transfer' | 'adjustment' | 'disposal';
  
  // Item
  item_id?: string;
  item_name?: string;
  item_sku?: string;
  
  // Quantity
  quantity: number;
  unit: string;
  
  // Locations
  from_location_id?: string;
  from_location_name?: string;
  to_location_id?: string;
  to_location_name?: string;
  
  // Custodian
  from_custodian_id?: string;
  from_custodian_name?: string;
  to_custodian_id?: string;
  to_custodian_name?: string;
  
  // Condition
  condition_before?: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
  condition_after?: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
  condition_notes?: string;
  
  // Scheduling
  expected_return_date?: string;
  actual_return_date?: string;
  
  // Value
  unit_value?: number;
  total_value?: number;
  currency: string;
}

export interface ChronicleProfileAudit {
  id: string;
  chronicle_id: string;
  
  // Audit Details
  audit_type: 'data_change' | 'access' | 'permission' | 'config' | 'compliance';
  
  // Target
  table_name?: string;
  record_id?: string;
  record_type?: string;
  
  // Changes
  field_changes: FieldChange[];
  
  // Compliance
  compliance_flags: string[];
  retention_period_days?: number;
  
  // Risk
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  requires_review: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  
  // Session
  session_id?: string;
}

export interface FieldChange {
  field: string;
  old_value: unknown;
  new_value: unknown;
}

export interface ChronicleProfileAutomation {
  id: string;
  chronicle_id: string;
  
  // Automation Details
  automation_type: 'scheduled_job' | 'webhook' | 'trigger' | 'integration_sync';
  automation_name?: string;
  
  // Execution
  workflow_id?: string;
  job_id?: string;
  
  // Timing
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  execution_time_ms?: number;
  
  // Result
  success?: boolean;
  exit_code?: number;
  error_message?: string;
  error_code?: string;
  error_stack?: string;
  
  // Retry
  attempt_number: number;
  max_attempts: number;
  
  // Input/Output
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  
  // Logs
  log_entries: AutomationLogEntry[];
  
  // Resources
  memory_used_mb?: number;
  cpu_time_ms?: number;
}

export interface AutomationLogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, unknown>;
}

export interface ChronicleProfileCommunication {
  id: string;
  chronicle_id: string;
  
  // Communication Details
  channel: 'email' | 'sms' | 'push' | 'in_app' | 'webhook' | 'slack';
  direction: 'outbound' | 'inbound';
  
  // Sender/Recipient
  sender_address?: string;
  recipient_addresses: string[];
  cc_addresses: string[];
  bcc_addresses: string[];
  
  // Content
  subject?: string;
  message_type?: 'notification' | 'alert' | 'reminder' | 'marketing' | 'transactional';
  template_id?: string;
  template_version?: string;
  
  // Delivery
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked';
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  
  // Failure
  failure_reason?: string;
  bounce_type?: 'hard' | 'soft';
  
  // External
  external_message_id?: string;
  provider?: string;
  
  // Engagement
  open_count: number;
  click_count: number;
}

// ============================================================================
// AGGREGATION TYPES
// ============================================================================

export interface ChronicleDailyAggregate {
  id: string;
  organization_id: string;
  
  aggregate_date: string;
  chronicle_type: ChronicleType;
  chronicle_subtype?: string;
  
  entry_count: number;
  total_amount?: number;
  currency?: string;
  total_hours?: number;
  total_quantity?: number;
  
  computed_at: string;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ChronicleFilters {
  chronicle_type?: ChronicleType;
  chronicle_subtype?: string;
  action_category?: ChronicleActionCategory;
  actor_id?: string;
  subject_entity_type?: string;
  subject_entity_id?: string;
  context_entity_type?: string;
  context_entity_id?: string;
  occurred_from?: string;
  occurred_to?: string;
  source_system?: string;
}

// ============================================================================
// PAYLOAD TYPES
// ============================================================================

export interface CreateChronicleEntryPayload {
  chronicle_type: ChronicleType;
  chronicle_subtype?: string;
  action: string;
  action_category: ChronicleActionCategory;
  action_description?: string;
  actor_type?: 'user' | 'system' | 'integration' | 'automation';
  actor_id?: string;
  actor_name?: string;
  subject_entity_type?: string;
  subject_entity_id?: string;
  subject_name?: string;
  context_entity_type?: string;
  context_entity_id?: string;
  context_name?: string;
  before_state?: Record<string, unknown>;
  after_state?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  source_system?: string;
  correlation_id?: string;
}

export interface CreateTransactionPayload extends CreateChronicleEntryPayload {
  transaction_type: 'payment' | 'refund' | 'transfer' | 'adjustment' | 'fee';
  amount: number;
  currency: string;
  payment_method?: string;
  reference_number?: string;
  from_account?: string;
  to_account?: string;
}

export interface CreateTimesheetEntryPayload extends CreateChronicleEntryPayload {
  entry_type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end' | 'manual';
  clock_in?: string;
  clock_out?: string;
  project_id?: string;
  location_id?: string;
  notes?: string;
}

export interface CreateMovementPayload extends CreateChronicleEntryPayload {
  movement_type: 'checkout' | 'checkin' | 'transfer' | 'adjustment' | 'disposal';
  item_id: string;
  quantity: number;
  from_location_id?: string;
  to_location_id?: string;
  from_custodian_id?: string;
  to_custodian_id?: string;
  expected_return_date?: string;
}

// ============================================================================
// ACTIVITY FEED TYPES
// ============================================================================

export interface ActivityFeedItem {
  id: string;
  chronicle_type: ChronicleType;
  chronicle_subtype?: string;
  occurred_at: string;
  actor_name?: string;
  action: string;
  action_description?: string;
  metadata: Record<string, unknown>;
}

export interface ActivityFeedResponse {
  items: ActivityFeedItem[];
  total: number;
  has_more: boolean;
}

// ============================================================================
// COUNTS & STATS
// ============================================================================

export interface ChronicleCounts {
  total: number;
  by_type: Record<ChronicleType, number>;
  by_action_category: Record<ChronicleActionCategory, number>;
  today: number;
  this_week: number;
  this_month: number;
}

export interface ChronicleStats {
  transactions: {
    total_amount: number;
    currency: string;
    count: number;
  };
  timesheets: {
    total_hours: number;
    count: number;
  };
  movements: {
    total_quantity: number;
    count: number;
  };
}

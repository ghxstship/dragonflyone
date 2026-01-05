export type TriggerType = 
  | "status_change"
  | "date_reached"
  | "field_update"
  | "threshold_exceeded"
  | "schedule"
  | "record_created"
  | "record_deleted";

export type ActionType =
  | "send_notification"
  | "send_email"
  | "update_field"
  | "create_record"
  | "call_webhook"
  | "assign_task"
  | "delay";

export type ConditionOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "not_contains" | "is_empty" | "is_not_empty";

export interface TriggerConfig {
  id: string;
  type: TriggerType;
  config: Record<string, unknown>;
}

export interface ConditionConfig {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: unknown;
  logic?: "and" | "or";
}

export interface ActionConfig {
  id: string;
  type: ActionType;
  config: Record<string, unknown>;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: TriggerConfig;
  conditions: ConditionConfig[];
  actions: ActionConfig[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AutomationBuilderProps {
  /** Initial workflow configuration */
  workflow?: AutomationWorkflow;
  /** Available entity types for triggers/actions */
  entityTypes?: Array<{ id: string; label: string; fields: Array<{ id: string; label: string; type: string }> }>;
  /** Called when workflow is saved */
  onSave?: (workflow: AutomationWorkflow) => void;
  /** Called when workflow is tested */
  onTest?: (workflow: AutomationWorkflow) => Promise<{ success: boolean; message: string }>;
  /** Called when workflow is deleted */
  onDelete?: (workflowId: string) => void;
  /** Additional class name */
  className?: string;
}

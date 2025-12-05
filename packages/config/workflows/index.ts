/**
 * Automated Workflow Triggers
 * Status-based and date-based automation for GHXSTSHIP platform
 */

// =============================================================================
// TYPES
// =============================================================================

export type WorkflowTriggerType = 
  | 'status_change'
  | 'date_reached'
  | 'field_update'
  | 'record_created'
  | 'record_deleted'
  | 'threshold_exceeded'
  | 'schedule';

export type WorkflowActionType =
  | 'send_notification'
  | 'send_email'
  | 'update_field'
  | 'create_record'
  | 'call_webhook'
  | 'assign_task'
  | 'change_status';

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: unknown;
}

export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  table: string;
  conditions?: WorkflowCondition[];
  // For status_change
  fromStatus?: string;
  toStatus?: string;
  // For date_reached
  dateField?: string;
  offsetDays?: number;
  // For threshold_exceeded
  thresholdField?: string;
  thresholdValue?: number;
  // For schedule
  cronExpression?: string;
}

export interface WorkflowAction {
  type: WorkflowActionType;
  // For notifications/emails
  recipients?: string[];
  template?: string;
  subject?: string;
  // For field updates
  targetField?: string;
  targetValue?: unknown;
  // For record creation
  targetTable?: string;
  recordData?: Record<string, unknown>;
  // For webhooks
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  webhookPayload?: Record<string, unknown>;
  // For task assignment
  assigneeField?: string;
  taskTitle?: string;
  taskDueDate?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
}

// =============================================================================
// PREDEFINED WORKFLOWS
// =============================================================================

export const PRODUCTION_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-prod-status-active',
    name: 'Production Activated',
    description: 'Notify team when production status changes to active',
    enabled: true,
    trigger: {
      type: 'status_change',
      table: 'productions',
      toStatus: 'active',
    },
    actions: [
      {
        type: 'send_notification',
        recipients: ['team_leads', 'production_managers'],
        template: 'production_activated',
      },
      {
        type: 'create_record',
        targetTable: 'production_milestones',
        recordData: {
          milestone_type: 'activation',
          status: 'completed',
        },
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    triggerCount: 0,
  },
  {
    id: 'wf-prod-deadline-reminder',
    name: 'Production Deadline Reminder',
    description: 'Send reminder 7 days before production start date',
    enabled: true,
    trigger: {
      type: 'date_reached',
      table: 'productions',
      dateField: 'start_date',
      offsetDays: -7,
    },
    actions: [
      {
        type: 'send_email',
        recipients: ['production_team'],
        template: 'deadline_reminder',
        subject: 'Production Starting in 7 Days',
      },
      {
        type: 'assign_task',
        taskTitle: 'Pre-production checklist review',
        taskDueDate: '-3d',
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    triggerCount: 0,
  },
  {
    id: 'wf-budget-threshold',
    name: 'Budget Threshold Alert',
    description: 'Alert when budget utilization exceeds 80%',
    enabled: true,
    trigger: {
      type: 'threshold_exceeded',
      table: 'production_budgets',
      thresholdField: 'utilization_percentage',
      thresholdValue: 80,
    },
    actions: [
      {
        type: 'send_notification',
        recipients: ['finance_managers', 'production_managers'],
        template: 'budget_threshold_alert',
      },
      {
        type: 'update_field',
        targetField: 'budget_status',
        targetValue: 'at_risk',
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    triggerCount: 0,
  },
];

export const CREW_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-crew-assignment',
    name: 'Crew Assignment Notification',
    description: 'Notify crew member when assigned to a production',
    enabled: true,
    trigger: {
      type: 'record_created',
      table: 'crew_assignments',
    },
    actions: [
      {
        type: 'send_notification',
        recipients: ['assigned_crew'],
        template: 'crew_assignment',
      },
      {
        type: 'send_email',
        recipients: ['assigned_crew'],
        template: 'crew_assignment_email',
        subject: 'New Production Assignment',
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    triggerCount: 0,
  },
  {
    id: 'wf-credential-expiry',
    name: 'Credential Expiry Warning',
    description: 'Warn crew member 30 days before credential expires',
    enabled: true,
    trigger: {
      type: 'date_reached',
      table: 'crew_credentials',
      dateField: 'expiry_date',
      offsetDays: -30,
    },
    actions: [
      {
        type: 'send_email',
        recipients: ['credential_holder'],
        template: 'credential_expiry_warning',
        subject: 'Credential Expiring Soon',
      },
      {
        type: 'assign_task',
        taskTitle: 'Renew credential',
        taskDueDate: '-7d',
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    triggerCount: 0,
  },
];

export const EVENT_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-event-published',
    name: 'Event Published',
    description: 'Trigger marketing automation when event is published',
    enabled: true,
    trigger: {
      type: 'status_change',
      table: 'events',
      toStatus: 'published',
    },
    actions: [
      {
        type: 'call_webhook',
        webhookUrl: '${MARKETING_WEBHOOK_URL}',
        webhookMethod: 'POST',
        webhookPayload: {
          event_type: 'event_published',
          event_id: '${event_id}',
        },
      },
      {
        type: 'send_notification',
        recipients: ['marketing_team'],
        template: 'event_published',
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    triggerCount: 0,
  },
  {
    id: 'wf-ticket-low-inventory',
    name: 'Low Ticket Inventory Alert',
    description: 'Alert when ticket inventory drops below 10%',
    enabled: true,
    trigger: {
      type: 'threshold_exceeded',
      table: 'ticket_tiers',
      thresholdField: 'remaining_percentage',
      thresholdValue: 10,
    },
    conditions: [
      {
        field: 'remaining_percentage',
        operator: 'less_than',
        value: 10,
      },
    ],
    actions: [
      {
        type: 'send_notification',
        recipients: ['event_managers'],
        template: 'low_inventory_alert',
      },
      {
        type: 'update_field',
        targetField: 'inventory_status',
        targetValue: 'low',
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    triggerCount: 0,
  },
];

// =============================================================================
// WORKFLOW ENGINE
// =============================================================================

export interface WorkflowExecutionContext {
  workflowId: string;
  triggeredBy: string;
  triggerData: Record<string, unknown>;
  executedAt: string;
}

export interface WorkflowExecutionResult {
  success: boolean;
  workflowId: string;
  actionsExecuted: number;
  errors?: string[];
  duration: number;
}

/**
 * Evaluate workflow conditions
 */
export function evaluateConditions(
  conditions: WorkflowCondition[],
  data: Record<string, unknown>
): boolean {
  return conditions.every((condition) => {
    const fieldValue = data[condition.field];

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'is_empty':
        return fieldValue === null || fieldValue === undefined || fieldValue === '';
      case 'is_not_empty':
        return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
      default:
        return false;
    }
  });
}

/**
 * Get all workflows for a specific table
 */
export function getWorkflowsForTable(table: string): Workflow[] {
  const allWorkflows = [
    ...PRODUCTION_WORKFLOWS,
    ...CREW_WORKFLOWS,
    ...EVENT_WORKFLOWS,
  ];

  return allWorkflows.filter(
    (workflow) => workflow.enabled && workflow.trigger.table === table
  );
}

/**
 * Get workflows by trigger type
 */
export function getWorkflowsByTriggerType(
  triggerType: WorkflowTriggerType
): Workflow[] {
  const allWorkflows = [
    ...PRODUCTION_WORKFLOWS,
    ...CREW_WORKFLOWS,
    ...EVENT_WORKFLOWS,
  ];

  return allWorkflows.filter(
    (workflow) => workflow.enabled && workflow.trigger.type === triggerType
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export const ALL_WORKFLOWS = [
  ...PRODUCTION_WORKFLOWS,
  ...CREW_WORKFLOWS,
  ...EVENT_WORKFLOWS,
];

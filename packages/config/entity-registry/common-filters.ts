/**
 * Common Filter Definitions
 * 
 * Reusable filter definitions for common fields across all entities.
 * Import and spread these into entity-specific filter arrays.
 */

import type { FilterDefinition, FilterOption } from './types';

// ============================================================================
// Status Filter Options
// ============================================================================

/**
 * Universal status options
 */
export const universalStatusOptions: FilterOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'archived', label: 'Archived' },
];

/**
 * Credential status options
 */
export const credentialStatusOptions: FilterOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'revoked', label: 'Revoked' },
  { value: 'expired', label: 'Expired' },
];

/**
 * Financial document status options
 */
export const financialStatusOptions: FilterOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

/**
 * Order status options
 */
export const orderStatusOptions: FilterOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

/**
 * Payment status options
 */
export const paymentStatusOptions: FilterOption[] = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

/**
 * Ticket status options
 */
export const ticketStatusOptions: FilterOption[] = [
  { value: 'valid', label: 'Valid' },
  { value: 'used', label: 'Used' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

/**
 * Document/SOP status options
 */
export const documentStatusOptions: FilterOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'archived', label: 'Archived' },
];

/**
 * Task/Issue status options
 */
export const taskStatusOptions: FilterOption[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
  { value: 'blocked', label: 'Blocked' },
];

/**
 * Equipment status options
 */
export const equipmentStatusOptions: FilterOption[] = [
  { value: 'available', label: 'Available' },
  { value: 'in_use', label: 'In Use' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'retired', label: 'Retired' },
];

/**
 * Crew status options
 */
export const crewStatusOptions: FilterOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'available', label: 'Available' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'on_break', label: 'On Break' },
  { value: 'off_duty', label: 'Off Duty' },
];

/**
 * Event status options
 */
export const eventStatusOptions: FilterOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

/**
 * Project status options
 */
export const projectStatusOptions: FilterOption[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

/**
 * Certification status options
 */
export const certificationStatusOptions: FilterOption[] = [
  { value: 'valid', label: 'Valid' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' },
  { value: 'revoked', label: 'Revoked' },
];

/**
 * Incident status options
 */
export const incidentStatusOptions: FilterOption[] = [
  { value: 'reported', label: 'Reported' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

/**
 * Delivery status options
 */
export const deliveryStatusOptions: FilterOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' },
];

/**
 * Maintenance status options
 */
export const maintenanceStatusOptions: FilterOption[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'overdue', label: 'Overdue' },
];

// ============================================================================
// Priority Options
// ============================================================================

/**
 * Priority options
 */
export const priorityOptions: FilterOption[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

/**
 * Severity options
 */
export const severityOptions: FilterOption[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'major', label: 'Major' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'minor', label: 'Minor' },
];

/**
 * Risk level options
 */
export const riskLevelOptions: FilterOption[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'minimal', label: 'Minimal' },
];

// ============================================================================
// Boolean Options
// ============================================================================

/**
 * Yes/No options
 */
export const yesNoOptions: FilterOption[] = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

/**
 * Active/Inactive options
 */
export const activeInactiveOptions: FilterOption[] = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

// ============================================================================
// Common Filter Definitions
// ============================================================================

/**
 * Generic status filter
 */
export function statusFilter(
  options: FilterOption[] = universalStatusOptions,
  config: Partial<FilterDefinition> = {}
): FilterDefinition {
  return {
    key: 'status',
    label: 'Status',
    type: 'select',
    options,
    ...config,
  };
}

/**
 * Payment status filter
 */
export const paymentStatusFilter: FilterDefinition = {
  key: 'payment_status',
  label: 'Payment Status',
  type: 'select',
  options: paymentStatusOptions,
};

/**
 * Priority filter
 */
export const priorityFilter: FilterDefinition = {
  key: 'priority',
  label: 'Priority',
  type: 'select',
  options: priorityOptions,
};

/**
 * Severity filter
 */
export const severityFilter: FilterDefinition = {
  key: 'severity',
  label: 'Severity',
  type: 'select',
  options: severityOptions,
};

/**
 * Date range filter
 */
export function dateRangeFilter(
  key: string,
  label: string
): FilterDefinition {
  return {
    key,
    label,
    type: 'daterange',
  };
}

/**
 * Created date filter
 */
export const createdAtFilter: FilterDefinition = {
  key: 'created_at',
  label: 'Created Date',
  type: 'daterange',
};

/**
 * Due date filter
 */
export const dueDateFilter: FilterDefinition = {
  key: 'due_date',
  label: 'Due Date',
  type: 'daterange',
};

/**
 * Category filter (dynamic options)
 */
export function categoryFilter(
  optionsLoader?: () => Promise<FilterOption[]>
): FilterDefinition {
  return {
    key: 'category_id',
    label: 'Category',
    type: 'select',
    options: [],
    optionsLoader,
  };
}

/**
 * Type filter (dynamic options)
 */
export function typeFilter(
  key: string = 'type_id',
  label: string = 'Type',
  optionsLoader?: () => Promise<FilterOption[]>
): FilterDefinition {
  return {
    key,
    label,
    type: 'select',
    options: [],
    optionsLoader,
  };
}

/**
 * Boolean filter
 */
export function booleanFilter(
  key: string,
  label: string,
  options: { trueLabel?: string; falseLabel?: string } = {}
): FilterDefinition {
  const { trueLabel = 'Yes', falseLabel = 'No' } = options;
  return {
    key,
    label,
    type: 'select',
    options: [
      { value: 'true', label: trueLabel },
      { value: 'false', label: falseLabel },
    ],
  };
}

/**
 * Search/text filter
 */
export function textFilter(
  key: string,
  label: string,
  placeholder?: string
): FilterDefinition {
  return {
    key,
    label,
    type: 'text',
    placeholder,
  };
}

/**
 * Number range filter
 */
export function numberFilter(
  key: string,
  label: string
): FilterDefinition {
  return {
    key,
    label,
    type: 'number',
  };
}

// ============================================================================
// Entity-Specific Status Filters
// ============================================================================

/**
 * Credential status filter
 */
export const credentialStatusFilter: FilterDefinition = statusFilter(credentialStatusOptions);

/**
 * Financial status filter
 */
export const financialStatusFilter: FilterDefinition = statusFilter(financialStatusOptions);

/**
 * Order status filter
 */
export const orderStatusFilter: FilterDefinition = statusFilter(orderStatusOptions);

/**
 * Ticket status filter
 */
export const ticketStatusFilter: FilterDefinition = statusFilter(ticketStatusOptions);

/**
 * Document status filter
 */
export const documentStatusFilter: FilterDefinition = statusFilter(documentStatusOptions);

/**
 * Task status filter
 */
export const taskStatusFilter: FilterDefinition = statusFilter(taskStatusOptions);

/**
 * Equipment status filter
 */
export const equipmentStatusFilter: FilterDefinition = statusFilter(equipmentStatusOptions);

/**
 * Crew status filter
 */
export const crewStatusFilter: FilterDefinition = statusFilter(crewStatusOptions);

/**
 * Event status filter
 */
export const eventStatusFilter: FilterDefinition = statusFilter(eventStatusOptions);

/**
 * Project status filter
 */
export const projectStatusFilter: FilterDefinition = statusFilter(projectStatusOptions);

/**
 * Certification status filter
 */
export const certificationStatusFilter: FilterDefinition = statusFilter(certificationStatusOptions);

/**
 * Incident status filter
 */
export const incidentStatusFilter: FilterDefinition = statusFilter(incidentStatusOptions);

/**
 * Delivery status filter
 */
export const deliveryStatusFilter: FilterDefinition = statusFilter(deliveryStatusOptions);

/**
 * Maintenance status filter
 */
export const maintenanceStatusFilter: FilterDefinition = statusFilter(maintenanceStatusOptions);

// ============================================================================
// Export All Common Filters
// ============================================================================

export const commonFilters = {
  // Status filters
  status: statusFilter,
  paymentStatus: paymentStatusFilter,
  credentialStatus: credentialStatusFilter,
  financialStatus: financialStatusFilter,
  orderStatus: orderStatusFilter,
  ticketStatus: ticketStatusFilter,
  documentStatus: documentStatusFilter,
  taskStatus: taskStatusFilter,
  equipmentStatus: equipmentStatusFilter,
  crewStatus: crewStatusFilter,
  eventStatus: eventStatusFilter,
  projectStatus: projectStatusFilter,
  certificationStatus: certificationStatusFilter,
  incidentStatus: incidentStatusFilter,
  deliveryStatus: deliveryStatusFilter,
  maintenanceStatus: maintenanceStatusFilter,
  
  // Other filters
  priority: priorityFilter,
  severity: severityFilter,
  dateRange: dateRangeFilter,
  createdAt: createdAtFilter,
  dueDate: dueDateFilter,
  category: categoryFilter,
  type: typeFilter,
  boolean: booleanFilter,
  text: textFilter,
  number: numberFilter,
};

// ============================================================================
// Status Options Lookup
// ============================================================================

/**
 * Entity to status options mapping
 */
export const ENTITY_STATUS_OPTIONS: Record<string, FilterOption[]> = {
  credentials: credentialStatusOptions,
  bills: financialStatusOptions,
  invoices: financialStatusOptions,
  budgets: financialStatusOptions,
  expenses: financialStatusOptions,
  orders: orderStatusOptions,
  tickets: ticketStatusOptions,
  sops: documentStatusOptions,
  documents: documentStatusOptions,
  tasks: taskStatusOptions,
  issues: taskStatusOptions,
  equipment: equipmentStatusOptions,
  assets: equipmentStatusOptions,
  crew: crewStatusOptions,
  team: crewStatusOptions,
  events: eventStatusOptions,
  projects: projectStatusOptions,
  productions: projectStatusOptions,
  certifications: certificationStatusOptions,
  incidents: incidentStatusOptions,
  emergencies: incidentStatusOptions,
  deliveries: deliveryStatusOptions,
  maintenance: maintenanceStatusOptions,
};

/**
 * Get status options for a specific entity type
 */
export function getEntityStatusOptions(entityType: string): FilterOption[] {
  return ENTITY_STATUS_OPTIONS[entityType.toLowerCase()] || universalStatusOptions;
}

/**
 * Get status filter for a specific entity type
 */
export function getEntityStatusFilter(entityType: string): FilterDefinition {
  return statusFilter(getEntityStatusOptions(entityType));
}

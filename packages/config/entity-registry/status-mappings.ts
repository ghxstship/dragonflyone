/**
 * Centralized Status Color Mappings
 * 
 * Single source of truth for status-to-color mappings across all entities.
 * This eliminates inconsistent status coloring throughout the application.
 */

import type { StatusVariant } from './types';

// ============================================================================
// Universal Status Mappings
// ============================================================================

/**
 * Common status values used across multiple entities
 */
export const UNIVERSAL_STATUS_COLORS: Record<string, StatusVariant> = {
  // Active/Success states
  active: 'success',
  approved: 'success',
  completed: 'success',
  confirmed: 'success',
  delivered: 'success',
  fulfilled: 'success',
  paid: 'success',
  published: 'success',
  resolved: 'success',
  valid: 'success',
  verified: 'success',
  
  // Warning/Pending states
  pending: 'warning',
  review: 'warning',
  processing: 'warning',
  in_progress: 'warning',
  'in-progress': 'warning',
  inProgress: 'warning',
  partial: 'warning',
  suspended: 'warning',
  waiting: 'warning',
  on_hold: 'warning',
  'on-hold': 'warning',
  onHold: 'warning',
  expiring: 'warning',
  
  // Error/Danger states
  cancelled: 'error',
  canceled: 'error',
  declined: 'error',
  denied: 'error',
  expired: 'error',
  failed: 'error',
  rejected: 'error',
  revoked: 'error',
  overdue: 'error',
  blocked: 'error',
  
  // Info states
  info: 'info',
  new: 'info',
  open: 'info',
  scheduled: 'info',
  assigned: 'info',
  
  // Neutral/Ghost states
  draft: 'ghost',
  archived: 'ghost',
  inactive: 'ghost',
  closed: 'ghost',
  unknown: 'ghost',
  
  // Outline states
  refunded: 'outline',
  used: 'outline',
  transferred: 'outline',
};

// ============================================================================
// Entity-Specific Status Mappings
// ============================================================================

/**
 * Credential-specific status colors
 */
export const CREDENTIAL_STATUS_COLORS: Record<string, StatusVariant> = {
  ...UNIVERSAL_STATUS_COLORS,
  active: 'success',
  pending: 'warning',
  suspended: 'warning',
  revoked: 'error',
  expired: 'error',
};

/**
 * Bill/Invoice status colors
 */
export const FINANCIAL_STATUS_COLORS: Record<string, StatusVariant> = {
  ...UNIVERSAL_STATUS_COLORS,
  pending: 'warning',
  approved: 'info',
  partial: 'info',
  paid: 'success',
  cancelled: 'error',
  overdue: 'error',
};

/**
 * Order status colors
 */
export const ORDER_STATUS_COLORS: Record<string, StatusVariant> = {
  ...UNIVERSAL_STATUS_COLORS,
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  completed: 'success',
  cancelled: 'error',
  refunded: 'outline',
};

/**
 * Payment status colors
 */
export const PAYMENT_STATUS_COLORS: Record<string, StatusVariant> = {
  paid: 'success',
  pending: 'warning',
  failed: 'error',
  refunded: 'outline',
  partial: 'info',
};

/**
 * Ticket status colors
 */
export const TICKET_STATUS_COLORS: Record<string, StatusVariant> = {
  valid: 'success',
  used: 'info',
  cancelled: 'error',
  refunded: 'warning',
  expired: 'error',
  transferred: 'outline',
};

/**
 * SOP/Document status colors
 */
export const DOCUMENT_STATUS_COLORS: Record<string, StatusVariant> = {
  approved: 'success',
  review: 'warning',
  draft: 'ghost',
  archived: 'ghost',
  published: 'success',
};

/**
 * Task/Issue status colors
 */
export const TASK_STATUS_COLORS: Record<string, StatusVariant> = {
  open: 'info',
  in_progress: 'warning',
  'in-progress': 'warning',
  inProgress: 'warning',
  completed: 'success',
  closed: 'ghost',
  blocked: 'error',
  on_hold: 'warning',
};

/**
 * Equipment/Asset status colors
 */
export const EQUIPMENT_STATUS_COLORS: Record<string, StatusVariant> = {
  available: 'success',
  in_use: 'info',
  'in-use': 'info',
  inUse: 'info',
  maintenance: 'warning',
  repair: 'warning',
  retired: 'ghost',
  damaged: 'error',
  lost: 'error',
};

/**
 * Crew/Personnel status colors
 */
export const CREW_STATUS_COLORS: Record<string, StatusVariant> = {
  active: 'success',
  available: 'success',
  assigned: 'info',
  on_break: 'warning',
  'on-break': 'warning',
  onBreak: 'warning',
  off_duty: 'ghost',
  'off-duty': 'ghost',
  offDuty: 'ghost',
  unavailable: 'ghost',
};

/**
 * Event status colors
 */
export const EVENT_STATUS_COLORS: Record<string, StatusVariant> = {
  draft: 'ghost',
  scheduled: 'info',
  confirmed: 'info',
  in_progress: 'warning',
  'in-progress': 'warning',
  inProgress: 'warning',
  completed: 'success',
  cancelled: 'error',
  postponed: 'warning',
};

/**
 * Project status colors
 */
export const PROJECT_STATUS_COLORS: Record<string, StatusVariant> = {
  planning: 'ghost',
  active: 'success',
  in_progress: 'info',
  'in-progress': 'info',
  inProgress: 'info',
  on_hold: 'warning',
  'on-hold': 'warning',
  onHold: 'warning',
  completed: 'success',
  archived: 'ghost',
  cancelled: 'error',
};

/**
 * Certification/Training status colors
 */
export const CERTIFICATION_STATUS_COLORS: Record<string, StatusVariant> = {
  valid: 'success',
  active: 'success',
  pending: 'warning',
  expiring: 'warning',
  expired: 'error',
  revoked: 'error',
  suspended: 'warning',
};

/**
 * Incident/Emergency status colors
 */
export const INCIDENT_STATUS_COLORS: Record<string, StatusVariant> = {
  reported: 'error',
  investigating: 'warning',
  in_progress: 'warning',
  'in-progress': 'warning',
  inProgress: 'warning',
  resolved: 'success',
  closed: 'ghost',
  escalated: 'error',
};

/**
 * Delivery status colors
 */
export const DELIVERY_STATUS_COLORS: Record<string, StatusVariant> = {
  pending: 'warning',
  scheduled: 'info',
  in_transit: 'info',
  'in-transit': 'info',
  inTransit: 'info',
  delivered: 'success',
  failed: 'error',
  returned: 'warning',
};

/**
 * Maintenance status colors
 */
export const MAINTENANCE_STATUS_COLORS: Record<string, StatusVariant> = {
  scheduled: 'info',
  in_progress: 'warning',
  'in-progress': 'warning',
  inProgress: 'warning',
  completed: 'success',
  cancelled: 'error',
  overdue: 'error',
};

// ============================================================================
// Priority Mappings
// ============================================================================

/**
 * Priority level colors
 */
export const PRIORITY_COLORS: Record<string, StatusVariant> = {
  critical: 'error',
  high: 'error',
  urgent: 'error',
  medium: 'warning',
  normal: 'info',
  low: 'ghost',
  none: 'ghost',
};

// ============================================================================
// Severity Mappings
// ============================================================================

/**
 * Severity level colors
 */
export const SEVERITY_COLORS: Record<string, StatusVariant> = {
  critical: 'error',
  major: 'error',
  high: 'error',
  moderate: 'warning',
  medium: 'warning',
  minor: 'info',
  low: 'ghost',
  informational: 'ghost',
};

// ============================================================================
// Risk Level Mappings
// ============================================================================

/**
 * Risk level colors
 */
export const RISK_COLORS: Record<string, StatusVariant> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'info',
  minimal: 'ghost',
  none: 'ghost',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get status color for any status value
 * Falls back to universal mappings if entity-specific not found
 */
export function getStatusColor(
  status: string,
  entityMapping?: Record<string, StatusVariant>
): StatusVariant {
  const normalizedStatus = status.toLowerCase().replace(/[\s_-]+/g, '_');
  
  // Check entity-specific mapping first
  if (entityMapping) {
    const entityColor = entityMapping[status] || entityMapping[normalizedStatus];
    if (entityColor) return entityColor;
  }
  
  // Fall back to universal mapping
  return UNIVERSAL_STATUS_COLORS[status] || UNIVERSAL_STATUS_COLORS[normalizedStatus] || 'ghost';
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string): StatusVariant {
  const normalized = priority.toLowerCase();
  return PRIORITY_COLORS[normalized] || 'ghost';
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: string): StatusVariant {
  const normalized = severity.toLowerCase();
  return SEVERITY_COLORS[normalized] || 'ghost';
}

/**
 * Get risk color
 */
export function getRiskColor(risk: string): StatusVariant {
  const normalized = risk.toLowerCase();
  return RISK_COLORS[normalized] || 'ghost';
}

/**
 * Entity to status mapping lookup
 */
/**
 * People status colors
 */
export const PEOPLE_STATUS_COLORS: Record<string, StatusVariant> = {
  active: 'success',
  inactive: 'ghost',
  pending: 'warning',
  archived: 'error',
  draft: 'ghost',
};

/**
 * People type colors
 */
export const PEOPLE_TYPE_COLORS: Record<string, StatusVariant> = {
  contact: 'info',
  employee: 'success',
  crew: 'warning',
  artist: 'error',
  volunteer: 'info',
  candidate: 'ghost',
};

/**
 * Places status colors
 */
export const PLACES_STATUS_COLORS: Record<string, StatusVariant> = {
  active: 'success',
  inactive: 'ghost',
  maintenance: 'warning',
  closed: 'error',
  draft: 'ghost',
};

/**
 * Places type colors
 */
export const PLACES_TYPE_COLORS: Record<string, StatusVariant> = {
  venue: 'info',
  warehouse: 'warning',
  office: 'success',
  studio: 'error',
  outdoor: 'info',
  other: 'ghost',
};

/**
 * Organization status colors
 */
export const ORGANIZATION_STATUS_COLORS: Record<string, StatusVariant> = {
  active: 'success',
  inactive: 'ghost',
  pending: 'warning',
  suspended: 'error',
  draft: 'ghost',
};

/**
 * Organization type colors
 */
export const ORGANIZATION_TYPE_COLORS: Record<string, StatusVariant> = {
  vendor: 'warning',
  client: 'success',
  sponsor: 'info',
  partner: 'info',
  agency: 'warning',
  other: 'ghost',
};

/**
 * Production status colors
 */
export const PRODUCTION_STATUS_COLORS: Record<string, StatusVariant> = {
  active: 'success',
  planning: 'warning',
  upcoming: 'info',
  completed: 'info',
  past: 'ghost',
  draft: 'ghost',
  cancelled: 'error',
};

/**
 * Proposal status colors
 */
export const PROPOSAL_STATUS_COLORS: Record<string, StatusVariant> = {
  draft: 'ghost',
  sent: 'info',
  viewed: 'warning',
  accepted: 'success',
  declined: 'error',
  expired: 'ghost',
};

/**
 * Purchase order status colors
 */
export const PURCHASE_ORDER_STATUS_COLORS: Record<string, StatusVariant> = {
  draft: 'ghost',
  pending: 'warning',
  approved: 'info',
  ordered: 'info',
  received: 'success',
  cancelled: 'error',
};

/**
 * Budget status colors
 */
export const BUDGET_STATUS_COLORS: Record<string, StatusVariant> = {
  draft: 'ghost',
  active: 'success',
  closed: 'info',
  over_budget: 'error',
};

/**
 * Expense status colors
 */
export const EXPENSE_STATUS_COLORS: Record<string, StatusVariant> = {
  draft: 'ghost',
  submitted: 'info',
  approved: 'success',
  rejected: 'error',
  paid: 'success',
  reimbursed: 'success',
};

export const ENTITY_STATUS_MAPPINGS: Record<string, Record<string, StatusVariant>> = {
  credentials: CREDENTIAL_STATUS_COLORS,
  bills: FINANCIAL_STATUS_COLORS,
  invoices: FINANCIAL_STATUS_COLORS,
  budgets: BUDGET_STATUS_COLORS,
  expenses: EXPENSE_STATUS_COLORS,
  proposals: PROPOSAL_STATUS_COLORS,
  'purchase-orders': PURCHASE_ORDER_STATUS_COLORS,
  orders: ORDER_STATUS_COLORS,
  tickets: TICKET_STATUS_COLORS,
  sops: DOCUMENT_STATUS_COLORS,
  documents: DOCUMENT_STATUS_COLORS,
  tasks: TASK_STATUS_COLORS,
  issues: TASK_STATUS_COLORS,
  equipment: EQUIPMENT_STATUS_COLORS,
  assets: EQUIPMENT_STATUS_COLORS,
  crew: CREW_STATUS_COLORS,
  team: CREW_STATUS_COLORS,
  people: PEOPLE_STATUS_COLORS,
  places: PLACES_STATUS_COLORS,
  organizations: ORGANIZATION_STATUS_COLORS,
  events: EVENT_STATUS_COLORS,
  projects: PROJECT_STATUS_COLORS,
  productions: PRODUCTION_STATUS_COLORS,
  certifications: CERTIFICATION_STATUS_COLORS,
  incidents: INCIDENT_STATUS_COLORS,
  emergencies: INCIDENT_STATUS_COLORS,
  deliveries: DELIVERY_STATUS_COLORS,
  maintenance: MAINTENANCE_STATUS_COLORS,
};

/**
 * Get status color for a specific entity type
 */
export function getEntityStatusColor(entityType: string, status: string): StatusVariant {
  const entityMapping = ENTITY_STATUS_MAPPINGS[entityType.toLowerCase()];
  return getStatusColor(status, entityMapping);
}

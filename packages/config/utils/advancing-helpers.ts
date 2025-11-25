// packages/config/utils/advancing-helpers.ts
import type { AdvanceStatus, FulfillmentStatus, ProductionAdvance, ProductionAdvanceItem } from '../types/advancing';

/**
 * Calculate total estimated cost for advance items
 */
export function calculateEstimatedCost(items: Array<{ quantity: number; unit_cost?: number | null }>): number {
  return items.reduce((total, item) => {
    if (item.unit_cost && item.quantity) {
      return total + item.unit_cost * item.quantity;
    }
    return total;
  }, 0);
}

/**
 * Calculate fulfillment progress percentage
 */
export function calculateFulfillmentProgress(items: ProductionAdvanceItem[]): number {
  if (items.length === 0) return 0;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const fulfilledQuantity = items.reduce((sum, item) => sum + (item.quantity_fulfilled || 0), 0);

  return totalQuantity > 0 ? Math.round((fulfilledQuantity / totalQuantity) * 100) : 0;
}

/**
 * Get overall fulfillment status from items
 */
export function getOverallFulfillmentStatus(items: ProductionAdvanceItem[]): FulfillmentStatus {
  if (items.length === 0) return 'pending';

  const allComplete = items.every((item) => item.fulfillment_status === 'complete');
  const anyFulfilled = items.some((item) => item.quantity_fulfilled > 0);

  if (allComplete) return 'complete';
  if (anyFulfilled) return 'partial';
  return 'pending';
}

/**
 * Check if an advance can be edited
 */
export function canEditAdvance(status: AdvanceStatus): boolean {
  return ['draft', 'submitted'].includes(status);
}

/**
 * Check if an advance can be deleted
 */
export function canDeleteAdvance(status: AdvanceStatus): boolean {
  return status === 'draft';
}

/**
 * Check if an advance can be approved/rejected
 */
export function canReviewAdvance(status: AdvanceStatus): boolean {
  return ['submitted', 'under_review'].includes(status);
}

/**
 * Check if an advance can be fulfilled
 */
export function canFulfillAdvance(status: AdvanceStatus): boolean {
  return ['approved', 'in_progress'].includes(status);
}

/**
 * Get status badge color
 */
export function getAdvanceStatusColor(status: AdvanceStatus): 'default' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'draft':
      return 'default';
    case 'submitted':
    case 'under_review':
      return 'warning';
    case 'approved':
    case 'in_progress':
    case 'fulfilled':
      return 'success';
    case 'rejected':
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Get next possible statuses from current status
 */
export function getNextStatuses(currentStatus: AdvanceStatus): AdvanceStatus[] {
  switch (currentStatus) {
    case 'draft':
      return ['submitted', 'cancelled'];
    case 'submitted':
      return ['under_review', 'approved', 'rejected', 'cancelled'];
    case 'under_review':
      return ['approved', 'rejected'];
    case 'approved':
      return ['in_progress', 'cancelled'];
    case 'in_progress':
      return ['fulfilled', 'cancelled'];
    case 'fulfilled':
      return [];
    case 'rejected':
    case 'cancelled':
      return [];
    default:
      return [];
  }
}

/**
 * Format currency consistently
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format date consistently
 */
export function formatAdvanceDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format datetime consistently
 */
export function formatAdvanceDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate cost variance (estimated vs actual)
 */
export function calculateCostVariance(estimated: number | null, actual: number | null): {
  variance: number;
  percentage: number;
  isOverBudget: boolean;
} | null {
  if (!estimated || !actual) return null;

  const variance = actual - estimated;
  const percentage = (variance / estimated) * 100;

  return {
    variance,
    percentage,
    isOverBudget: variance > 0,
  };
}

/**
 * Group items by category
 */
export function groupItemsByCategory(items: ProductionAdvanceItem[]): Record<string, ProductionAdvanceItem[]> {
  return items.reduce((acc, item) => {
    const category = item.catalog_item?.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ProductionAdvanceItem[]>);
}

/**
 * Validate advance request before submission
 */
export function validateAdvanceRequest(advance: Partial<ProductionAdvance>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!advance.items || advance.items.length === 0) {
    errors.push('At least one item is required');
  }

  if (advance.items) {
    advance.items.forEach((item, index) => {
      if (!item.item_name || item.item_name.trim() === '') {
        errors.push(`Item ${index + 1}: Name is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (!item.unit || item.unit.trim() === '') {
        errors.push(`Item ${index + 1}: Unit is required`);
      }
    });
  }

  if (!advance.team_workspace && !advance.activation_name) {
    errors.push('Either team/workspace or activation name is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get readable status label
 */
export function getStatusLabel(status: AdvanceStatus): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get fulfillment status label
 */
export function getFulfillmentStatusLabel(status: FulfillmentStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Check if item is fully fulfilled
 */
export function isItemFullyFulfilled(item: ProductionAdvanceItem): boolean {
  return item.quantity_fulfilled >= item.quantity;
}

/**
 * Get remaining quantity to fulfill
 */
export function getRemainingQuantity(item: ProductionAdvanceItem): number {
  return Math.max(0, item.quantity - item.quantity_fulfilled);
}

// packages/config/analytics/advancing-analytics.ts
import type { AdvanceStatus, ProductionAdvance, ProductionCatalogItem } from '../types/advancing';

/**
 * Analytics events for advancing catalog
 */
export const ADVANCING_EVENTS = {
  // Catalog Events
  CATALOG_VIEWED: 'advancing_catalog_viewed',
  CATALOG_SEARCHED: 'advancing_catalog_searched',
  CATALOG_FILTERED: 'advancing_catalog_filtered',
  CATALOG_ITEM_VIEWED: 'advancing_catalog_item_viewed',
  CATALOG_ITEM_SELECTED: 'advancing_catalog_item_selected',

  // Request Events
  REQUEST_CREATED: 'advancing_request_created',
  REQUEST_SUBMITTED: 'advancing_request_submitted',
  REQUEST_UPDATED: 'advancing_request_updated',
  REQUEST_DELETED: 'advancing_request_deleted',
  REQUEST_VIEWED: 'advancing_request_viewed',

  // Workflow Events
  REQUEST_APPROVED: 'advancing_request_approved',
  REQUEST_REJECTED: 'advancing_request_rejected',
  REQUEST_FULFILLED: 'advancing_request_fulfilled',
  ITEM_FULFILLED: 'advancing_item_fulfilled',

  // User Actions
  COST_OVERRIDDEN: 'advancing_cost_overridden',
  NOTES_ADDED: 'advancing_notes_added',
} as const;

export type AdvancingEventName = (typeof ADVANCING_EVENTS)[keyof typeof ADVANCING_EVENTS];

/**
 * Track catalog view
 */
export function trackCatalogView(filters?: {
  category?: string;
  subcategory?: string;
  search?: string;
}): void {
  if (typeof window === 'undefined') return;

  // Analytics integration point
  if (window.gtag) {
    window.gtag('event', ADVANCING_EVENTS.CATALOG_VIEWED, {
      category: filters?.category,
      subcategory: filters?.subcategory,
      search_query: filters?.search,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track catalog item selection
 */
export function trackCatalogItemSelected(item: ProductionCatalogItem): void {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', ADVANCING_EVENTS.CATALOG_ITEM_SELECTED, {
      item_id: item.id,
      item_name: item.item_name,
      category: item.category,
      subcategory: item.subcategory,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track request creation
 */
export function trackRequestCreated(advance: ProductionAdvance): void {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', ADVANCING_EVENTS.REQUEST_CREATED, {
      request_id: advance.id,
      item_count: advance.items?.length || 0,
      estimated_cost: advance.estimated_cost,
      has_project: !!advance.project_id,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track request status change
 */
export function trackRequestStatusChange(
  requestId: string,
  oldStatus: AdvanceStatus,
  newStatus: AdvanceStatus,
  metadata?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  const eventMap: Record<AdvanceStatus, AdvancingEventName> = {
    draft: ADVANCING_EVENTS.REQUEST_CREATED,
    submitted: ADVANCING_EVENTS.REQUEST_SUBMITTED,
    under_review: ADVANCING_EVENTS.REQUEST_VIEWED,
    approved: ADVANCING_EVENTS.REQUEST_APPROVED,
    in_progress: ADVANCING_EVENTS.REQUEST_FULFILLED,
    fulfilled: ADVANCING_EVENTS.REQUEST_FULFILLED,
    rejected: ADVANCING_EVENTS.REQUEST_REJECTED,
    cancelled: ADVANCING_EVENTS.REQUEST_DELETED,
  };

  const eventName = eventMap[newStatus] || ADVANCING_EVENTS.REQUEST_UPDATED;

  if (window.gtag) {
    window.gtag('event', eventName, {
      request_id: requestId,
      old_status: oldStatus,
      new_status: newStatus,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track cost override
 */
export function trackCostOverride(
  requestId: string,
  estimatedCost: number,
  approvedCost: number
): void {
  if (typeof window === 'undefined') return;

  const variance = approvedCost - estimatedCost;
  const variancePercent = (variance / estimatedCost) * 100;

  if (window.gtag) {
    window.gtag('event', ADVANCING_EVENTS.COST_OVERRIDDEN, {
      request_id: requestId,
      estimated_cost: estimatedCost,
      approved_cost: approvedCost,
      variance,
      variance_percent: variancePercent,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track fulfillment
 */
export function trackFulfillment(
  requestId: string,
  itemsFulfilled: number,
  totalItems: number,
  actualCost?: number
): void {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', ADVANCING_EVENTS.REQUEST_FULFILLED, {
      request_id: requestId,
      items_fulfilled: itemsFulfilled,
      total_items: totalItems,
      fulfillment_percent: (itemsFulfilled / totalItems) * 100,
      actual_cost: actualCost,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track search query
 */
export function trackCatalogSearch(query: string, resultsCount: number): void {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', ADVANCING_EVENTS.CATALOG_SEARCHED, {
      search_query: query,
      results_count: resultsCount,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Batch track multiple events
 */
export function trackAdvancingMetrics(metrics: {
  totalRequests?: number;
  avgCostPerRequest?: number;
  avgFulfillmentTime?: number;
  topCategories?: string[];
  topItems?: string[];
}): void {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', 'advancing_metrics', {
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  }
}

// Type augmentation for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}

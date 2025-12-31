/**
 * Supabase Table Type Exports
 * 
 * Provides convenient type aliases for Supabase table rows, inserts, and updates.
 * Use these types instead of defining local interfaces in hooks.
 * 
 * This eliminates the need for 'as unknown as' type casts.
 * 
 * @example
 * // WRONG - local interface requires type cast
 * interface Deal { id: string; name: string; }
 * return data as unknown as Deal[];
 * 
 * // CORRECT - use exported type, no cast needed
 * import type { Deal } from '@ghxstship/config';
 * return data; // Types match automatically
 */

import type { Database } from './supabase-types';

// ============================================================================
// Helper Types
// ============================================================================

type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

// ============================================================================
// Core Entity Types (Legend Schema)
// ============================================================================

export type LegendDocument = Tables['legend_documents']['Row'];
export type LegendDocumentInsert = Tables['legend_documents']['Insert'];
export type LegendDocumentUpdate = Tables['legend_documents']['Update'];

export type LegendPerson = Tables['legend_people']['Row'];
export type LegendPersonInsert = Tables['legend_people']['Insert'];
export type LegendPersonUpdate = Tables['legend_people']['Update'];

export type LegendPlace = Tables['legend_places']['Row'];
export type LegendPlaceInsert = Tables['legend_places']['Insert'];
export type LegendPlaceUpdate = Tables['legend_places']['Update'];

export type LegendOrganization = Tables['legend_organizations']['Row'];
export type LegendOrganizationInsert = Tables['legend_organizations']['Insert'];
export type LegendOrganizationUpdate = Tables['legend_organizations']['Update'];

export type LegendEvent = Tables['legend_events']['Row'];
export type LegendEventInsert = Tables['legend_events']['Insert'];
export type LegendEventUpdate = Tables['legend_events']['Update'];

export type LegendProduct = Tables['legend_products']['Row'];
export type LegendProductInsert = Tables['legend_products']['Insert'];
export type LegendProductUpdate = Tables['legend_products']['Update'];

// ============================================================================
// Project & Production Types
// ============================================================================

export type Project = Tables['projects']['Row'];
export type ProjectInsert = Tables['projects']['Insert'];
export type ProjectUpdate = Tables['projects']['Update'];

// ============================================================================
// Asset Types
// ============================================================================

export type Asset = Tables['assets']['Row'];
export type AssetInsert = Tables['assets']['Insert'];
export type AssetUpdate = Tables['assets']['Update'];

// ============================================================================
// Deal Types
// ============================================================================

export type Deal = Tables['deals']['Row'];
export type DealInsert = Tables['deals']['Insert'];
export type DealUpdate = Tables['deals']['Update'];

// ============================================================================
// Finance Types
// ============================================================================

export type Budget = Tables['budgets']['Row'];
export type BudgetInsert = Tables['budgets']['Insert'];
export type BudgetUpdate = Tables['budgets']['Update'];

export type Bill = Tables['bills']['Row'];
export type BillInsert = Tables['bills']['Insert'];
export type BillUpdate = Tables['bills']['Update'];

export type FinanceExpense = Tables['finance_expenses']['Row'];
export type FinanceExpenseInsert = Tables['finance_expenses']['Insert'];
export type FinanceExpenseUpdate = Tables['finance_expenses']['Update'];

export type FinancePurchaseOrder = Tables['finance_purchase_orders']['Row'];
export type FinancePurchaseOrderInsert = Tables['finance_purchase_orders']['Insert'];
export type FinancePurchaseOrderUpdate = Tables['finance_purchase_orders']['Update'];

export type LedgerEntry = Tables['ledger_entries']['Row'];
export type LedgerEntryInsert = Tables['ledger_entries']['Insert'];
export type LedgerEntryUpdate = Tables['ledger_entries']['Update'];

// ============================================================================
// Contact & Organization Types
// ============================================================================

export type Contact = Tables['contacts']['Row'];
export type ContactInsert = Tables['contacts']['Insert'];
export type ContactUpdate = Tables['contacts']['Update'];

// ============================================================================
// Workforce Types
// ============================================================================

export type WorkforceCertification = Tables['workforce_certifications']['Row'];
export type WorkforceCertificationInsert = Tables['workforce_certifications']['Insert'];
export type WorkforceCertificationUpdate = Tables['workforce_certifications']['Update'];

export type WorkforceTimeEntry = Tables['workforce_time_entries']['Row'];
export type WorkforceTimeEntryInsert = Tables['workforce_time_entries']['Insert'];
export type WorkforceTimeEntryUpdate = Tables['workforce_time_entries']['Update'];

// ============================================================================
// Order & Delivery Types
// ============================================================================

export type Order = Tables['orders']['Row'];
export type OrderInsert = Tables['orders']['Insert'];
export type OrderUpdate = Tables['orders']['Update'];

export type Delivery = Tables['deliveries']['Row'];
export type DeliveryInsert = Tables['deliveries']['Insert'];
export type DeliveryUpdate = Tables['deliveries']['Update'];

// ============================================================================
// Document Types
// ============================================================================

export type DocsProfileContract = Tables['docs_profile_contract']['Row'];
export type DocsProfileContractInsert = Tables['docs_profile_contract']['Insert'];
export type DocsProfileContractUpdate = Tables['docs_profile_contract']['Update'];

// ============================================================================
// Vendor Types
// ============================================================================

export type VendorContract = Tables['vendor_contracts']['Row'];
export type VendorContractInsert = Tables['vendor_contracts']['Insert'];
export type VendorContractUpdate = Tables['vendor_contracts']['Update'];

// ============================================================================
// Show & Production Types
// ============================================================================

export type ShowCue = Tables['show_cues']['Row'];
export type ShowCueInsert = Tables['show_cues']['Insert'];
export type ShowCueUpdate = Tables['show_cues']['Update'];

// ============================================================================
// Incident & Safety Types
// ============================================================================

export type Incident = Tables['incidents']['Row'];
export type IncidentInsert = Tables['incidents']['Insert'];
export type IncidentUpdate = Tables['incidents']['Update'];

export type Permit = Tables['permits']['Row'];
export type PermitInsert = Tables['permits']['Insert'];
export type PermitUpdate = Tables['permits']['Update'];

// ============================================================================
// API & Integration Types
// ============================================================================

export type ApiKey = Tables['api_keys']['Row'];
export type ApiKeyInsert = Tables['api_keys']['Insert'];
export type ApiKeyUpdate = Tables['api_keys']['Update'];

export type Webhook = Tables['webhooks']['Row'];
export type WebhookInsert = Tables['webhooks']['Insert'];
export type WebhookUpdate = Tables['webhooks']['Update'];

export type AuditLog = Tables['audit_log']['Row'];
export type AuditLogInsert = Tables['audit_log']['Insert'];
export type AuditLogUpdate = Tables['audit_log']['Update'];

// ============================================================================
// KPI & Analytics Types
// ============================================================================

export type KpiReport = Tables['kpi_reports']['Row'];
export type KpiReportInsert = Tables['kpi_reports']['Insert'];
export type KpiReportUpdate = Tables['kpi_reports']['Update'];

// ============================================================================
// Platform Types
// ============================================================================

export type PlatformUser = Tables['platform_users']['Row'];
export type PlatformUserInsert = Tables['platform_users']['Insert'];
export type PlatformUserUpdate = Tables['platform_users']['Update'];

// ============================================================================
// Review Types
// ============================================================================

export type Review = Tables['reviews']['Row'];
export type ReviewInsert = Tables['reviews']['Insert'];
export type ReviewUpdate = Tables['reviews']['Update'];

// ============================================================================
// Ticket Types
// ============================================================================

export type ProductsProfileTicket = Tables['products_profile_ticket']['Row'];
export type ProductsProfileTicketInsert = Tables['products_profile_ticket']['Insert'];
export type ProductsProfileTicketUpdate = Tables['products_profile_ticket']['Update'];

// ============================================================================
// Time & Attendance Types
// ============================================================================

export type TimeClockEntry = Tables['time_clock_entries']['Row'];
export type TimeClockEntryInsert = Tables['time_clock_entries']['Insert'];
export type TimeClockEntryUpdate = Tables['time_clock_entries']['Update'];

// ============================================================================
// Profile Types
// ============================================================================

export type PeopleProfileArtist = Tables['people_profile_artist']['Row'];
export type PeopleProfileArtistInsert = Tables['people_profile_artist']['Insert'];
export type PeopleProfileArtistUpdate = Tables['people_profile_artist']['Update'];

// ============================================================================
// Enum Types (re-exported for convenience)
// ============================================================================

export type AccessStatus = Enums['access_status'];
export type AdvanceStatus = Enums['advance_status'];
export type ApplicationStatus = Enums['application_status'];
export type AssetState = Enums['asset_state'];
export type AutomationKind = Enums['automation_kind'];
export type AutomationStatus = Enums['automation_status'];
export type BackgroundCheckStatus = Enums['background_check_status'];
export type BidStatus = Enums['bid_status'];

// ============================================================================
// Type Guards
// ============================================================================

export function isLegendDocument(obj: unknown): obj is LegendDocument {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'legend_type' in obj;
}

export function isProject(obj: unknown): obj is Project {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj;
}

export function isAsset(obj: unknown): obj is Asset {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'asset_tag' in obj;
}

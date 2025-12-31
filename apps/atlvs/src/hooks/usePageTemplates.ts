/**
 * Hook to get relevant templates for a specific page
 * Maps page paths to their corresponding downloadable templates
 */

import { TEMPLATES, type Template } from "@ghxstship/config/marketing-content";

interface PageTemplateConfig {
  templateIds: string[];
  importEnabled: boolean;
}

const PAGE_TEMPLATE_MAP: Record<string, PageTemplateConfig> = {
  // Production Planning
  "/budgets": { templateIds: ["pp-001"], importEnabled: true },
  "/finance/budgets": { templateIds: ["pp-001"], importEnabled: true },
  "/events": { templateIds: ["pp-002"], importEnabled: true },
  "/productions": { templateIds: ["pp-003", "pp-004", "pp-005"], importEnabled: true },
  
  // Crew Management
  "/workforce": { templateIds: ["cm-001", "cm-002", "cm-003", "cm-006"], importEnabled: true },
  "/workforce/timesheets": { templateIds: ["cm-002"], importEnabled: true },
  "/workforce/schedules": { templateIds: ["cm-006"], importEnabled: true },
  "/workforce/availability": { templateIds: ["cm-005"], importEnabled: true },
  
  // Financial
  "/finance/expenses": { templateIds: ["fi-002"], importEnabled: true },
  "/finance/purchase-orders": { templateIds: ["fi-006"], importEnabled: true },
  "/finance/invoices": { templateIds: ["fi-005"], importEnabled: true },
  "/invoices": { templateIds: ["fi-005"], importEnabled: true },
  "/deals": { templateIds: ["fi-001"], importEnabled: true },
  "/finance/settlements": { templateIds: ["fi-003"], importEnabled: true },
  
  // Advancing
  "/advancing": { templateIds: ["ad-001", "ad-002", "ad-003", "ad-004"], importEnabled: true },
  
  // Contracts
  "/contracts": { templateIds: ["co-001", "co-002", "co-003", "co-004"], importEnabled: false },
  "/vendors": { templateIds: ["co-001"], importEnabled: true },
  
  // Safety & Compliance
  "/safety": { templateIds: ["sc-001", "sc-002", "sc-003", "sc-004"], importEnabled: true },
  "/incidents": { templateIds: ["sc-002"], importEnabled: true },
  
  // Marketing
  "/marketing": { templateIds: ["mk-001", "mk-002", "mk-003", "mk-004"], importEnabled: false },
  
  // Ticketing
  "/ticketing": { templateIds: ["tk-001", "tk-002", "tk-003", "tk-004"], importEnabled: true },
  "/guest-lists": { templateIds: ["tk-002"], importEnabled: true },
  
  // Assets
  "/assets": { templateIds: [], importEnabled: true },
  
  // People/Contacts
  "/people": { templateIds: [], importEnabled: true },
  "/contacts": { templateIds: [], importEnabled: true },
  
  // Venues
  "/venues": { templateIds: ["pp-007"], importEnabled: true },
};

export function usePageTemplates(pathname: string): {
  templates: Template[];
  importEnabled: boolean;
  primaryTemplate: Template | null;
} {
  const config = PAGE_TEMPLATE_MAP[pathname];
  
  if (!config) {
    return {
      templates: [],
      importEnabled: false,
      primaryTemplate: null,
    };
  }
  
  const templates = config.templateIds
    .map((id) => TEMPLATES.find((t) => t.id === id))
    .filter((t): t is Template => t !== undefined);
  
  return {
    templates,
    importEnabled: config.importEnabled,
    primaryTemplate: templates[0] || null,
  };
}

export function getTemplateForPage(pathname: string): Template | null {
  const config = PAGE_TEMPLATE_MAP[pathname];
  if (!config || config.templateIds.length === 0) return null;
  return TEMPLATES.find((t) => t.id === config.templateIds[0]) || null;
}

export function isImportEnabledForPage(pathname: string): boolean {
  const config = PAGE_TEMPLATE_MAP[pathname];
  return config?.importEnabled ?? false;
}

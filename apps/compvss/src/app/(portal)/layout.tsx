"use client";

import { CompvssAppLayout } from "@/components/app-layout";
import { createPortalLayout } from "@ghxstship/config/layouts";

/**
 * Portal Route Group Layout
 * Wraps all external stakeholder pages with minimal branded layout
 * 
 * This layout applies to all pages under the (portal) route group:
 * - Credential verification pages
 * - Timesheet submission portals
 * - Vendor/subcontractor access
 * 
 * Authentication:
 * - Token-based or magic-link authentication
 * - No session required - access via unique URLs
 */
export default createPortalLayout({
  platform: "compvss",
  authType: "token",
  invalidTokenPath: "/auth/invalid-link",
  backgroundClass: "bg-white",
  LayoutComponent: CompvssAppLayout,
  layoutVariant: "portal",
});

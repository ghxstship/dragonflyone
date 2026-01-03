"use client";

import { GvtewayAppLayout } from "@/components/app-layout";
import { createPortalLayout } from "@ghxstship/config/layouts";

/**
 * Portal Route Group Layout
 * Wraps all external stakeholder pages with minimal branded layout
 * 
 * This layout applies to all pages under the (portal) route group:
 * - Order confirmation pages
 * - Event embed/share pages
 * - Survey pages
 * 
 * Authentication:
 * - Token-based or public access
 * - No session required - access via unique URLs
 */
export default createPortalLayout({
  platform: "gvteway",
  authType: "public",
  invalidTokenPath: "/",
  backgroundClass: "bg-surface-inverse",
  LayoutComponent: GvtewayAppLayout,
  layoutVariant: "portal",
});

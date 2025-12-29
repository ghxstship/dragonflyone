"use client";

import { AtlvsAppLayout } from "@/components/app-layout";
import { createPortalLayout } from "@ghxstship/config/layouts";

/**
 * Portal Route Group Layout
 * Wraps all external stakeholder pages with minimal branded layout
 * 
 * This layout applies to all pages under the (portal) route group:
 * - Payment pages (pay/[token])
 * - Proposal pages (proposal/[token])
 * - Artist/Vendor/Sponsor/Investor portals
 * 
 * Authentication:
 * - Token-based or magic-link authentication
 * - No session required - access via unique URLs
 */
export default createPortalLayout({
  platform: "atlvs",
  authType: "token",
  invalidTokenPath: "/auth/invalid-link",
  backgroundClass: "bg-ink-950",
  LayoutComponent: AtlvsAppLayout,
  layoutVariant: "portal",
});

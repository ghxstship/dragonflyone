"use client";

import { GvtewayAppLayout } from "@/components/app-layout";
import { createMarketingLayout } from "@ghxstship/config/layouts";

/**
 * Marketing Route Group Layout
 * Wraps all public/marketing pages with the public navigation header and footer
 * 
 * This layout applies to all pages under the (marketing) route group:
 * - Help center and support pages
 * - About and company pages
 * - Legal pages (privacy, terms, etc.)
 */
export default createMarketingLayout({
  platform: "gvteway",
  backgroundClass: "bg-ink-950",
  LayoutComponent: GvtewayAppLayout,
  layoutVariant: "consumer-public",
  background: "black",
});

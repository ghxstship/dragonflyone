"use client";

import { CompvssAppLayout } from "@/components/app-layout";
import { createMarketingLayout } from "@ghxstship/config/layouts";

/**
 * Marketing Route Group Layout
 * Wraps all public/marketing pages with the public navigation header and footer
 * 
 * This layout applies to all pages under the (marketing) route group:
 * - Landing pages (products, features, pricing, etc.)
 * - Company pages (about, careers, press, contact, etc.)
 * - Resource pages (blog, docs, guides, case-studies, etc.)
 * - Legal pages (privacy, terms, etc.)
 */
export default createMarketingLayout({
  platform: "compvss",
  backgroundClass: "bg-white",
  LayoutComponent: CompvssAppLayout,
  layoutVariant: "public",
  background: "white",
});

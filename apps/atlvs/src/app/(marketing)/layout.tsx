"use client";

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

import { ReactNode } from "react";
import { AtlvsAppLayout } from "../../components/app-layout";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <AtlvsAppLayout variant="public" background="black">
      {children}
    </AtlvsAppLayout>
  );
}

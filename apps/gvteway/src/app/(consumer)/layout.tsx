"use client";

import { GvtewayAppLayout } from "@/components/app-layout";
import { createConsumerLayout } from "@ghxstship/config/layouts";

/**
 * Consumer Route Group Layout
 * Wraps all public browsing pages with consumer navigation
 * 
 * This layout applies to all pages under the (consumer) route group:
 * - Event browsing and discovery
 * - Shopping and merchandise
 * - Cart and checkout
 * - Reviews and community features
 * 
 * Authentication:
 * - Optional - enhances experience when logged in
 * - Cart persistence, wishlists, saved events
 */
export default createConsumerLayout({
  platform: "gvteway",
  backgroundClass: "bg-surface-inverse",
  LayoutComponent: GvtewayAppLayout,
  layoutVariant: "consumer",
  showAuthFeatures: true,
});

"use client";

import React from "react";
import { Container } from "../../foundations/layout.js";
import { Stack } from "../../foundations/layout.js";
import { Display, Body } from "../../atoms/Typography/index.js";
import { marketingPageVariants } from "./MarketingPage.variants.js";
import type { MarketingPageProps } from "./MarketingPage.types.js";

/**
 * MarketingPage component - Bold Contemporary Pop Art Adventure
 * 
 * A marketing page layout with:
 * - Hero section
 * - Content sections
 * - Responsive design
 * - Marketing-focused styling
 */
export function MarketingPage({
  title,
  subtitle,
  children,
  className,
}: MarketingPageProps) {
  return (
    <div className={marketingPageVariants({ className })}>
      {/* Hero Section */}
      <section className="border-b-2 border-border bg-surface-elevated">
        <Container>
          <Stack direction="vertical" gap={32} className="py-16">
            <div className="text-center">
              <Display className="text-text-primary">{title}</Display>
              {subtitle && (
                <Body className="text-text-muted mt-4 max-w-3xl mx-auto text-lg">
                  {subtitle}
                </Body>
              )}
            </div>
          </Stack>
        </Container>
      </section>

      {/* Main Content */}
      <main className="flex-1">
        <Container>
          <Stack direction="vertical" gap={64} className="py-16">
            {children}
          </Stack>
        </Container>
      </main>
    </div>
  );
}

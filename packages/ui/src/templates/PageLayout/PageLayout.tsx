"use client";

import React from "react";
import { Container } from "../../foundations/layout.js";
import { Stack } from "../../foundations/layout.js";
import { pageLayoutVariants } from "./PageLayout.variants.js";
import type { PageLayoutProps } from "./PageLayout.types.js";

/**
 * PageLayout component - Bold Contemporary Pop Art Adventure
 * 
 * A basic page layout container
 */
export function PageLayout({
  children,
  className,
  header,
  footer,
}: PageLayoutProps) {
  return (
    <div className={pageLayoutVariants({ className })}>
      {header && (
        <header>
          {header}
        </header>
      )}
      <Container>
        <Stack direction="vertical" gap={32} className="py-8">
          {children}
        </Stack>
      </Container>
      {footer && (
        <footer>
          {footer}
        </footer>
      )}
    </div>
  );
}

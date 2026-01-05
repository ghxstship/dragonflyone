"use client";

import React from "react";
import { Container } from "../../foundations/layout.js";
import { Stack } from "../../foundations/layout.js";
import { Display, Body } from "../../atoms/Typography/index.js";
import { settingsHubPageVariants } from "./SettingsHubPage.variants.js";
import type { SettingsHubPageProps } from "./SettingsHubPage.types.js";

/**
 * SettingsHubPage component - Bold Contemporary Pop Art Adventure
 * 
 * A settings hub page with:
 * - Header section
 * - Settings grid layout
 * - Responsive design
 */
export function SettingsHubPage({
  title,
  subtitle,
  children,
  className,
}: SettingsHubPageProps) {
  return (
    <div className={settingsHubPageVariants({ className })}>
      {/* Header */}
      <header className="border-b-2 border-border bg-surface-elevated">
        <Container>
          <Stack direction="vertical" gap={24} className="py-8">
            <div className="text-center">
              <Display className="text-text-primary">{title}</Display>
              {subtitle && (
                <Body className="text-text-muted mt-2 max-w-2xl mx-auto">
                  {subtitle}
                </Body>
              )}
            </div>
          </Stack>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Container>
          <Stack direction="vertical" gap={32} className="py-8">
            {children}
          </Stack>
        </Container>
      </main>
    </div>
  );
}

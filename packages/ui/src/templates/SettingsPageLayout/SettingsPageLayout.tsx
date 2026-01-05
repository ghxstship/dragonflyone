"use client";

import React from "react";
import { Container } from "../../foundations/layout.js";
import { Grid, Stack } from "../../foundations/layout.js";
import { Display, Body } from "../../atoms/Typography/index.js";
import { Link } from "../../atoms/Link/index.js";
import { settingsPageLayoutVariants } from "./SettingsPageLayout.variants.js";
import type { SettingsPageLayoutProps } from "./SettingsPageLayout.types.js";

/**
 * SettingsPageLayout component - Bold Contemporary Pop Art Adventure
 * 
 * A settings page layout with:
 * - Header with navigation
 * - Sidebar with settings sections
 * - Main content area
 * - Responsive design
 * - Consistent spacing and typography
 */
export function SettingsPageLayout({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  sections,
  activeSection,
  onSectionChange,
  children,
  className,
}: SettingsPageLayoutProps) {
  return (
    <div className={settingsPageLayoutVariants({ className })}>
      {/* Header */}
      <header className="border-b-2 border-border bg-surface-elevated">
        <Container>
          <div className="flex items-center justify-between py-6">
            {/* Left: Navigation */}
            <div className="flex items-center gap-4">
              {backHref && (
                <Link
                  href={backHref}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-mono bg-surface-primary text-text-primary border-2 border-border rounded-badge hover:bg-muted"
                >
                  ← {backLabel}
                </Link>
              )}
            </div>

            {/* Right: Title */}
            <div className="text-center flex-1">
              <Display className="text-text-primary">{title}</Display>
              {subtitle && (
                <Body className="text-text-muted mt-1">
                  {subtitle}
                </Body>
              )}
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Container>
          <Grid cols={4} gap={32} className="py-8">
            {/* Sidebar */}
            <div className="col-span-1">
              <Stack direction="vertical" gap={8}>
                <Body className="font-heading text-sm font-bold text-text-muted uppercase tracking-wider">
                  Settings
                </Body>
                <nav className="space-y-1">
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => onSectionChange?.(section.id)}
                      className={`
                        w-full text-left px-4 py-3 rounded-button font-mono text-sm border-2 transition-all duration-200
                        ${
                          activeSection === section.id
                            ? "border-primary bg-surface-primary text-primary shadow-primary"
                            : "border-border bg-surface-primary text-text-primary hover:bg-muted"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {section.icon}
                        <span>{section.title}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </Stack>
            </div>

            {/* Content */}
            <div className="col-span-3">
              <Stack direction="vertical" gap={24}>
                {children}
              </Stack>
            </div>
          </Grid>
        </Container>
      </main>
    </div>
  );
}

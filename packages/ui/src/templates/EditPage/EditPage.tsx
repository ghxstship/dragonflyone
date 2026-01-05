"use client";

import React from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "../../atoms/Button/index.js";
import { Container } from "../../foundations/layout.js";
import { Stack } from "../../foundations/layout.js";
import { Display, Body } from "../../atoms/Typography/index.js";
import { Link } from "../../atoms/Link/index.js";
import { editPageVariants } from "./EditPage.variants.js";
import type { EditPageProps } from "./EditPage.types.js";

/**
 * EditPage component - Bold Contemporary Pop Art Adventure
 * 
 * A standardized layout for editing existing records with:
 * - Header with back navigation and save action
 * - Main content area with form sections
 * - Responsive design
 * - Consistent spacing and typography
 */
export function EditPage({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  saveLabel = "Save Changes",
  onSave,
  saving = false,
  disabled = false,
  children,
  className,
  actions,
  breadcrumbs,
}: EditPageProps) {
  return (
    <div className={editPageVariants({ className })}>
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
                  <ArrowLeft className="w-4 h-4" />
                  {backLabel}
                </Link>
              )}
              
              {/* Breadcrumbs */}
              {breadcrumbs && (
                <nav className="flex items-center gap-2 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <span className="text-text-muted">/</span>
                      )}
                      {crumb.href ? (
                        <Link
                          href={crumb.href}
                          className="text-text-primary hover:text-primary transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-text-muted">{crumb.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {actions}
              <Button
                onClick={onSave}
                disabled={disabled || saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : saveLabel}
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Container>
          <Stack direction="vertical" gap={32} className="py-8">
            {/* Page Title */}
            <div className="text-center">
              <Display className="text-text-primary">{title}</Display>
              {subtitle && (
                <Body className="text-text-muted mt-2 max-w-2xl mx-auto">
                  {subtitle}
                </Body>
              )}
            </div>

            {/* Form Content */}
            <div className="mt-8">
              {children}
            </div>
          </Stack>
        </Container>
      </main>
    </div>
  );
}

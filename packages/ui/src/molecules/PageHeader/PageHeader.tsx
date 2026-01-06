"use client";

import React from "react";
import clsx from "clsx";
import { Display, H1, Body, Label } from "../../atoms/Typography/index.js";
import { pageHeaderVariants } from "./PageHeader.variants.js";
import type { PageHeaderProps } from "./PageHeader.types.js";

/**
 * PageHeader - Unified page header component
 *
 * Consolidates functionality from MarketingPageHeader into a molecule.
 * Supports kicker, title, subtitle/description, actions with full alignment and theming options.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   kicker="Dashboard"
 *   title="Analytics Overview"
 *   subtitle="Monitor your key metrics and performance indicators"
 *   actions={<Button>Export Data</Button>}
 *   align="center"
 *   size="lg"
 * />
 * ```
 */
export function PageHeader({
  kicker,
  title,
  subtitle,
  actions,
  align = "left",
  displayTitle = false,
  
  size = "md",
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={clsx(pageHeaderVariants({ align, size, className }))}
      {...props}
    >
      <div className="flex flex-col gap-3 flex-1">
        {kicker && (
          <Label
            size="xs"
            className={clsx(
              "uppercase tracking-[0.2em]",
              "text-[var(--color-text-muted)]"
            )}
          >
            {kicker}
          </Label>
        )}

        {displayTitle ? (
          <Display
            size={size === "lg" ? "lg" : "md"}
            className="text-[var(--color-text-primary)]"
          >
            {title}
          </Display>
        ) : (
          <H1
            size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
            className="text-[var(--color-text-primary)]"
          >
            {title}
          </H1>
        )}

        {subtitle && (
          <Body
            size={size === "sm" ? "sm" : "md"}
            className={clsx(
              "text-[var(--color-text-secondary)]",
              align === "center" ? "mx-auto max-w-2xl" : "max-w-3xl"
            )}
          >
            {subtitle}
          </Body>
        )}
      </div>

      {actions && (
        <div className={clsx("flex gap-4", align === "center" && "justify-center")}>
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;

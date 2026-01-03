"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { Container, Stack } from "../foundations/layout.js";
import { Kicker } from "../atoms/kicker.js";
import { Body, H2 } from "../atoms/typography.js";
import { Check, X, Minus } from "lucide-react";

/**
 * ComparisonTable - Feature comparison matrix
 * 2026 Best Practices:
 * - Clear visual indicators (check/x)
 * - Sticky header for long tables
 * - Highlighted recommended column
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface ComparisonColumn {
  id: string;
  name: string;
  highlighted?: boolean;
  price?: string;
}

export interface ComparisonRow {
  feature: string;
  category?: string;
  values: Record<string, boolean | string>;
}

export interface ComparisonTableProps {
  /** Section kicker text */
  kicker?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Column definitions */
  columns: ComparisonColumn[];
  /** Row data */
  rows: ComparisonRow[];
  /** 
   * Section theme variant
   * - "dark": Force dark theme (default)
   * - "light": Force light theme
   * - "inverted": Invert relative to page theme
   */
  sectionVariant?: "dark" | "light" | "inverted";
  /** Show category headers */
  showCategories?: boolean;
  className?: string;
}

export const ComparisonTable = forwardRef<HTMLElement, ComparisonTableProps>(
  function ComparisonTable(
    {
      kicker,
      title,
      description,
      columns,
      rows,
      sectionVariant = "dark",
      showCategories = true,
      className,
    },
    ref
  ) {
    const sectionVariantClasses = {
      dark: "section-dark bg-surface-primary",
      light: "section-light bg-surface-primary",
      inverted: "section-inverted bg-surface-primary",
    };

    // Group rows by category
    const groupedRows = showCategories
      ? rows.reduce((acc, row) => {
          const category = row.category || "Features";
          if (!acc[category]) acc[category] = [];
          acc[category].push(row);
          return acc;
        }, {} as Record<string, ComparisonRow[]>)
      : { Features: rows };

    const renderValue = (value: boolean | string) => {
      if (value === true) {
        return <Check className="size-5 text-success mx-auto" />;
      }
      if (value === false) {
        return <X className="size-5 text-text-disabled mx-auto" />;
      }
      if (value === "partial") {
        return <Minus className="size-5 text-warning mx-auto" />;
      }
      return (
        <Body size="sm" className="text-text-secondary text-center">
          {value}
        </Body>
      );
    };

    return (
      <section
        ref={ref}
        className={clsx("py-12 sm:py-16 md:py-24 lg:py-32", sectionVariantClasses[sectionVariant], className)}
      >
        <Container size="xl">
          {/* Section Header */}
          {(kicker || title || description) && (
            <Stack gap={4} className="mb-8 sm:mb-10 md:mb-12 text-center items-center">
              {kicker && <Kicker>{kicker}</Kicker>}
              {title && <H2 className="text-text-primary">{title}</H2>}
              {description && (
                <Body size="lg" className="text-text-muted max-w-2xl">
                  {description}
                </Body>
              )}
            </Stack>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Header */}
              <thead className="sticky top-0 z-10">
                <tr className="border-b-2 border-border">
                  <th className="p-4 text-left bg-surface-inverse">
                    <Body className="text-text-muted font-semibold">Feature</Body>
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className={clsx(
                        "p-4 text-center min-w-[140px]",
                        col.highlighted
                          ? "bg-primary/10 border-x-2 border-t-2 border-primary"
                          : "bg-surface-inverse"
                      )}
                    >
                      <Stack gap={1} className="items-center">
                        <Body
                          className={clsx(
                            "font-semibold",
                            col.highlighted ? "text-primary" : "text-text-primary"
                          )}
                        >
                          {col.name}
                        </Body>
                        {col.price && (
                          <Body size="sm" className="text-text-muted">
                            {col.price}
                          </Body>
                        )}
                      </Stack>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {Object.entries(groupedRows).map(([category, categoryRows]) => (
                  <>
                    {/* Category Header */}
                    {showCategories && Object.keys(groupedRows).length > 1 && (
                      <tr key={`category-${category}`}>
                        <td
                          colSpan={columns.length + 1}
                          className="p-4 bg-surface-elevated/50"
                        >
                          <Body className="text-text-primary font-semibold uppercase tracking-wider text-sm">
                            {category}
                          </Body>
                        </td>
                      </tr>
                    )}

                    {/* Feature Rows */}
                    {categoryRows.map((row, idx) => (
                      <tr
                        key={`${category}-${idx}`}
                        className="border-b border-border hover:bg-surface-elevated/30 transition-colors"
                      >
                        <td className="p-4">
                          <Body className="text-text-secondary">{row.feature}</Body>
                        </td>
                        {columns.map((col) => (
                          <td
                            key={col.id}
                            className={clsx(
                              "p-4",
                              col.highlighted && "bg-primary/5 border-x-2 border-primary"
                            )}
                          >
                            {renderValue(row.values[col.id])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>
    );
  }
);

export default ComparisonTable;

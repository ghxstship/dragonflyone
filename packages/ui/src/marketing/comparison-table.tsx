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
  /** Background color */
  background?: "black" | "ink" | "grey";
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
      background = "ink",
      showCategories = true,
      className,
    },
    ref
  ) {
    const bgClasses = {
      black: "bg-black text-white",
      ink: "bg-ink-950 text-white",
      grey: "bg-grey-900 text-white",
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
        return <X className="size-5 text-grey-600 mx-auto" />;
      }
      if (value === "partial") {
        return <Minus className="size-5 text-warning mx-auto" />;
      }
      return (
        <Body size="sm" className="text-grey-300 text-center">
          {value}
        </Body>
      );
    };

    return (
      <section
        ref={ref}
        className={clsx("py-20 md:py-32", bgClasses[background], className)}
      >
        <Container size="xl">
          {/* Section Header */}
          {(kicker || title || description) && (
            <Stack gap={4} className="mb-12 text-center items-center">
              {kicker && <Kicker>{kicker}</Kicker>}
              {title && <H2 className="text-white">{title}</H2>}
              {description && (
                <Body size="lg" className="text-grey-400 max-w-2xl">
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
                <tr className="border-b-2 border-grey-800">
                  <th className="p-4 text-left bg-ink-950">
                    <Body className="text-grey-400 font-semibold">Feature</Body>
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className={clsx(
                        "p-4 text-center min-w-[140px]",
                        col.highlighted
                          ? "bg-primary/10 border-x-2 border-t-2 border-primary"
                          : "bg-ink-950"
                      )}
                    >
                      <Stack gap={1} className="items-center">
                        <Body
                          className={clsx(
                            "font-semibold",
                            col.highlighted ? "text-primary" : "text-white"
                          )}
                        >
                          {col.name}
                        </Body>
                        {col.price && (
                          <Body size="sm" className="text-grey-400">
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
                          className="p-4 bg-grey-900/50"
                        >
                          <Body className="text-white font-semibold uppercase tracking-wider text-sm">
                            {category}
                          </Body>
                        </td>
                      </tr>
                    )}

                    {/* Feature Rows */}
                    {categoryRows.map((row, idx) => (
                      <tr
                        key={`${category}-${idx}`}
                        className="border-b border-grey-800 hover:bg-grey-900/30 transition-colors"
                      >
                        <td className="p-4">
                          <Body className="text-grey-300">{row.feature}</Body>
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

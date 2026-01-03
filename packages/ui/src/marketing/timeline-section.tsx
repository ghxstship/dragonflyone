"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { Container, Stack } from "../foundations/layout.js";
import { Kicker } from "../atoms/kicker.js";
import { Body, H2, H3 } from "../atoms/typography.js";
import { Badge } from "../atoms/badge.js";

/**
 * TimelineSection - Display roadmap or history
 * 2026 Best Practices:
 * - Visual timeline with milestones
 * - Status indicators
 * - Responsive vertical/horizontal layouts
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  status?: "completed" | "in-progress" | "upcoming";
  icon?: React.ReactNode;
}

export interface TimelineSectionProps {
  /** Section kicker text */
  kicker?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Timeline items */
  items: TimelineItem[];
  /** Layout orientation */
  orientation?: "vertical" | "horizontal";
  /** 
   * Section theme variant
   * - "dark": Force dark theme (default)
   * - "light": Force light theme
   * - "inverted": Invert relative to page theme
   */
  sectionVariant?: "dark" | "light" | "inverted";
  className?: string;
}

export const TimelineSection = forwardRef<HTMLElement, TimelineSectionProps>(
  function TimelineSection(
    {
      kicker,
      title,
      description,
      items,
      orientation = "vertical",
      sectionVariant = "dark",
      className,
    },
    ref
  ) {
    const sectionVariantClasses = {
      dark: "section-dark bg-surface-primary",
      light: "section-light bg-surface-primary",
      inverted: "section-inverted bg-surface-primary",
    };

    const statusColors = {
      completed: "bg-success",
      "in-progress": "bg-primary",
      upcoming: "bg-muted",
    };

    const statusBadgeVariants = {
      completed: "success" as const,
      "in-progress": "warning" as const,
      upcoming: "outline" as const,
    };

    return (
      <section
        ref={ref}
        className={clsx("py-20 md:py-32", sectionVariantClasses[sectionVariant], className)}
      >
        <Container size="lg">
          {/* Section Header */}
          {(kicker || title || description) && (
            <Stack gap={4} className="mb-12 md:mb-16 text-center items-center">
              {kicker && <Kicker>{kicker}</Kicker>}
              {title && <H2 className="text-text-primary">{title}</H2>}
              {description && (
                <Body size="lg" className="text-text-muted max-w-2xl">
                  {description}
                </Body>
              )}
            </Stack>
          )}

          {/* Vertical Timeline */}
          {orientation === "vertical" && (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

              {/* Timeline Items */}
              <div className="space-y-12">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={clsx(
                      "relative flex items-start gap-8",
                      idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    )}
                  >
                    {/* Content */}
                    <div
                      className={clsx(
                        "flex-1 ml-12 md:ml-0",
                        idx % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"
                      )}
                    >
                      <Stack gap={2}>
                        <Stack
                          direction="horizontal"
                          gap={3}
                          className={clsx(
                            "items-center flex-wrap",
                            idx % 2 === 0 ? "md:justify-end" : "md:justify-start"
                          )}
                        >
                          <Body size="sm" className="text-text-disabled font-mono">
                            {item.date}
                          </Body>
                          {item.status && (
                            <Badge variant={statusBadgeVariants[item.status]} size="sm">
                              {item.status === "in-progress" ? "In Progress" : item.status}
                            </Badge>
                          )}
                        </Stack>
                        <H3 size="sm" className="text-text-primary">
                          {item.title}
                        </H3>
                        <Body className="text-text-muted">
                          {item.description}
                        </Body>
                      </Stack>
                    </div>

                    {/* Timeline Dot */}
                    <div
                      className={clsx(
                        "absolute left-4 md:left-1/2 -translate-x-1/2 size-4 rounded-[var(--radius-circle)] border-4 border-surface-inverse",
                        statusColors[item.status || "upcoming"]
                      )}
                    />

                    {/* Spacer for alternating layout */}
                    <div className="hidden md:block flex-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Horizontal Timeline */}
          {orientation === "horizontal" && (
            <div className="relative overflow-x-auto pb-4">
              <div className="flex gap-8 min-w-max">
                {items.map((item, idx) => (
                  <div key={item.id} className="relative flex flex-col items-center w-64">
                    {/* Timeline Line */}
                    {idx < items.length - 1 && (
                      <div className="absolute top-3 left-1/2 w-full h-0.5 bg-border" />
                    )}

                    {/* Timeline Dot */}
                    <div
                      className={clsx(
                        "relative z-10 size-6 rounded-[var(--radius-circle)] border-4 border-surface-inverse mb-4",
                        statusColors[item.status || "upcoming"]
                      )}
                    />

                    {/* Content */}
                    <Stack gap={2} className="text-center">
                      <Body size="sm" className="text-text-disabled font-mono">
                        {item.date}
                      </Body>
                      <H3 size="sm" className="text-text-primary">
                        {item.title}
                      </H3>
                      <Body size="sm" className="text-text-muted">
                        {item.description}
                      </Body>
                      {item.status && (
                        <Badge variant={statusBadgeVariants[item.status]} size="sm" className="mx-auto">
                          {item.status === "in-progress" ? "In Progress" : item.status}
                        </Badge>
                      )}
                    </Stack>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    );
  }
);

export default TimelineSection;

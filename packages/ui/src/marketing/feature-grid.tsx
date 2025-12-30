"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { Container, Stack, Grid } from "../foundations/layout.js";
import { Card } from "../molecules/card.js";
import { Kicker } from "../atoms/kicker.js";
import { Body, H2, H3 } from "../atoms/typography.js";

/**
 * FeatureGrid - Showcase product features in a grid layout
 * 2026 Best Practices:
 * - Visual hierarchy with icons
 * - Scannable bullet points
 * - Responsive grid (1-2-3-4 columns)
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface FeatureItem {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  highlights?: string[];
  href?: string;
}

export interface FeatureGridProps {
  /** Section kicker text */
  kicker?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Feature items to display */
  features: FeatureItem[];
  /** Number of columns (responsive) */
  columns?: 2 | 3 | 4;
  /** Card variant */
  variant?: "bordered" | "surface" | "ghost";
  /** Background color */
  background?: "black" | "ink" | "grey";
  /** Pattern overlay */
  pattern?: "none" | "halftone" | "grid";
  /** Content alignment */
  align?: "left" | "center";
  /** Click handler for feature cards */
  onFeatureClick?: (feature: FeatureItem) => void;
  className?: string;
}

export const FeatureGrid = forwardRef<HTMLElement, FeatureGridProps>(
  function FeatureGrid(
    {
      kicker,
      title,
      description,
      features,
      columns = 3,
      variant = "bordered",
      background = "ink",
      pattern = "none",
      align = "left",
      onFeatureClick,
      className,
    },
    ref
  ) {
    const bgClasses = {
      black: "bg-black text-white",
      ink: "bg-ink-950 text-white",
      grey: "bg-grey-900 text-white",
    };

    const colClasses = {
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    };

    const cardVariantClasses = {
      bordered: "border-2 border-grey-800 hover:border-primary/50 transition-colors",
      surface: "bg-grey-900/50 hover:bg-grey-800/50 transition-colors",
      ghost: "hover:bg-grey-900/30 transition-colors",
    };

    const patternStyles = {
      none: {},
      halftone: {
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      },
      grid: {
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      },
    };

    return (
      <section
        ref={ref}
        className={clsx("relative py-20 md:py-32", bgClasses[background], className)}
      >
        {/* Pattern Overlay */}
        {pattern !== "none" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={patternStyles[pattern]}
          />
        )}

        <Container size="xl" className="relative z-10">
          {/* Section Header */}
          {(kicker || title || description) && (
            <Stack
              gap={4}
              className={clsx(
                "mb-12 md:mb-16",
                align === "center" ? "text-center items-center" : "text-left"
              )}
            >
              {kicker && <Kicker>{kicker}</Kicker>}
              {title && (
                <H2 className="text-white max-w-3xl">{title}</H2>
              )}
              {description && (
                <Body size="lg" className="text-on-dark-muted max-w-2xl">
                  {description}
                </Body>
              )}
            </Stack>
          )}

          {/* Feature Grid */}
          <Grid cols={columns} gap={6} className={colClasses[columns]}>
            {features.map((feature) => (
              <Card
                key={feature.id}
                className={clsx(
                  "p-6 md:p-8 rounded-card",
                  cardVariantClasses[variant],
                  onFeatureClick && "cursor-pointer"
                )}
                onClick={() => onFeatureClick?.(feature)}
              >
                <Stack gap={4}>
                  {/* Icon */}
                  <div className="p-3 bg-primary/20 rounded-card text-primary w-fit">
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <H3 size="sm" className="text-white">
                    {feature.title}
                  </H3>

                  {/* Description */}
                  <Body className="text-on-dark-muted">
                    {feature.description}
                  </Body>

                  {/* Highlights */}
                  {feature.highlights && feature.highlights.length > 0 && (
                    <Stack gap={2} className="mt-2">
                      {feature.highlights.map((highlight, idx) => (
                        <Stack
                          key={idx}
                          direction="horizontal"
                          gap={2}
                          className="items-center"
                        >
                          <div className="size-1.5 rounded-full bg-primary flex-shrink-0" />
                          <Body size="sm" className="text-on-dark-secondary">
                            {highlight}
                          </Body>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>
    );
  }
);

export default FeatureGrid;

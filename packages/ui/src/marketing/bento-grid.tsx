"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { Container, Stack } from "../foundations/layout.js";
import { Card } from "../molecules/Card/index.js";
import { Kicker } from "../atoms/Kicker/index.js";
import { Body, Display, H2, H3 } from "../atoms/Typography/index.js";

/**
 * BentoGrid - Modern asymmetric feature layout
 * 2026 Best Practices:
 * - Visual interest through varied card sizes
 * - Highlight key features with larger cards
 * - Responsive grid adaptation
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface BentoItem {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  image?: string;
  size?: "small" | "medium" | "large";
  background?: "default" | "primary" | "accent" | "gradient";
}

export interface BentoGridProps {
  /** Section kicker text */
  kicker?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Bento items */
  items: BentoItem[];
  /** 
   * Section theme variant
   * - "dark": Force dark theme (default)
   * - "light": Force light theme
   * - "inverted": Invert relative to page theme
   */
  sectionVariant?: "dark" | "light" | "inverted";
  className?: string;
}

export const BentoGrid = forwardRef<HTMLElement, BentoGridProps>(
  function BentoGrid(
    {
      kicker,
      title,
      description,
      items,
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

    const itemBgClasses = {
      default: "bg-surface-elevated/50 border-2 border-border",
      primary: "bg-primary/20 border-2 border-primary/30",
      accent: "bg-accent/20 border-2 border-accent/30",
      gradient: "bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30",
    };

    const sizeClasses = {
      small: "col-span-1 row-span-1",
      medium: "col-span-1 md:col-span-2 row-span-1",
      large: "col-span-1 md:col-span-2 row-span-1 md:row-span-2",
    };

    return (
      <section
        ref={ref}
        className={clsx("py-20 md:py-32", sectionVariantClasses[sectionVariant], className)}
      >
        <Container size="xl">
          {/* Section Header */}
          {(kicker || title || description) && (
            <Stack gap={4} className="mb-12 md:mb-16 text-center items-center">
              {kicker && <Kicker>{kicker}</Kicker>}
              {title && <Display size="md" className="text-text-primary">{title}</Display>}
              {description && (
                <Body size="lg" className="text-text-muted max-w-2xl">
                  {description}
                </Body>
              )}
            </Stack>
          )}

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(200px,auto)]">
            {items.map((item) => (
              <Card
                key={item.id}
                className={clsx(
                  "p-6 md:p-8 rounded-card overflow-hidden relative group",
                  sizeClasses[item.size || "small"],
                  itemBgClasses[item.background || "default"],
                  "hover:scale-[1.02] transition-transform duration-300"
                )}
              >
                {/* Background Image */}
                {item.image && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                )}

                {/* Content */}
                <Stack gap={4} className="relative z-10 h-full justify-between">
                  {/* Icon */}
                  {item.icon && (
                    <div className="p-3 bg-white/10 rounded-card w-fit">
                      {item.icon}
                    </div>
                  )}

                  {/* Text */}
                  <Stack gap={2}>
                    <H3
                      size={item.size === "large" ? "md" : "sm"}
                      className="text-text-primary"
                    >
                      {item.title}
                    </H3>
                    <Body
                      size={item.size === "large" ? "md" : "sm"}
                      className="text-text-secondary"
                    >
                      {item.description}
                    </Body>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    );
  }
);

export default BentoGrid;

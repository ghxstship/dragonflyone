"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { Container, Stack, Grid } from "../foundations/layout.js";
import { Card } from "../molecules/card.js";
import { Kicker } from "../atoms/kicker.js";
import { Body, H2 } from "../atoms/typography.js";
import { Badge } from "../atoms/badge.js";
import { ArrowRight } from "lucide-react";

/**
 * IntegrationGrid - Display integrations/partners
 * 2026 Best Practices:
 * - Category filtering
 * - Status indicators (new, popular, etc.)
 * - Hover effects for interactivity
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface Integration {
  id: string;
  name: string;
  description: string;
  logo?: string;
  icon?: ReactNode;
  category: string;
  status?: "new" | "popular" | "coming-soon";
  href?: string;
}

export interface IntegrationGridProps {
  /** Section kicker text */
  kicker?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Integrations to display */
  integrations: Integration[];
  /** Show category filters */
  showFilters?: boolean;
  /** Number of columns */
  columns?: 3 | 4;
  /** Background color */
  background?: "black" | "ink" | "grey";
  /** Click handler */
  onIntegrationClick?: (integration: Integration) => void;
  className?: string;
}

export const IntegrationGrid = forwardRef<HTMLElement, IntegrationGridProps>(
  function IntegrationGrid(
    {
      kicker,
      title,
      description,
      integrations,
      showFilters = false,
      columns = 4,
      background = "ink",
      onIntegrationClick,
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
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    };

    const statusBadgeVariants = {
      new: "success" as const,
      popular: "warning" as const,
      "coming-soon": "outline" as const,
    };

    const statusLabels = {
      new: "New",
      popular: "Popular",
      "coming-soon": "Coming Soon",
    };

    // Get unique categories
    const categories = Array.from(new Set(integrations.map((i) => i.category)));

    return (
      <section
        ref={ref}
        className={clsx("py-20 md:py-32", bgClasses[background], className)}
      >
        <Container size="xl">
          {/* Section Header */}
          {(kicker || title || description) && (
            <Stack gap={4} className="mb-12 md:mb-16 text-center items-center">
              {kicker && <Kicker>{kicker}</Kicker>}
              {title && <H2 className="text-white">{title}</H2>}
              {description && (
                <Body size="lg" className="text-grey-400 max-w-2xl">
                  {description}
                </Body>
              )}
            </Stack>
          )}

          {/* Category Filters */}
          {showFilters && categories.length > 1 && (
            <Stack
              direction="horizontal"
              gap={2}
              className="mb-8 flex-wrap justify-center"
            >
              <Badge variant="solid" className="cursor-pointer">
                All
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="cursor-pointer hover:bg-grey-800"
                >
                  {category}
                </Badge>
              ))}
            </Stack>
          )}

          {/* Integration Grid */}
          <Grid cols={columns} gap={4} className={colClasses[columns]}>
            {integrations.map((integration) => (
              <Card
                key={integration.id}
                className={clsx(
                  "p-6 border-2 border-grey-800 rounded-card group",
                  "hover:border-primary/50 transition-all duration-300",
                  onIntegrationClick && "cursor-pointer"
                )}
                onClick={() => onIntegrationClick?.(integration)}
              >
                <Stack gap={4}>
                  {/* Header */}
                  <Stack direction="horizontal" gap={4} className="items-start justify-between">
                    {/* Logo/Icon */}
                    <div className="p-3 bg-grey-800 rounded-card">
                      {integration.icon || (
                        integration.logo ? (
                          <img
                            src={integration.logo}
                            alt={integration.name}
                            className="size-8 object-contain"
                          />
                        ) : (
                          <div className="size-8 bg-grey-700 rounded" />
                        )
                      )}
                    </div>

                    {/* Status Badge */}
                    {integration.status && (
                      <Badge
                        variant={statusBadgeVariants[integration.status]}
                        size="sm"
                      >
                        {statusLabels[integration.status]}
                      </Badge>
                    )}
                  </Stack>

                  {/* Content */}
                  <Stack gap={1}>
                    <Body className="text-white font-semibold group-hover:text-primary transition-colors">
                      {integration.name}
                    </Body>
                    <Body size="sm" className="text-grey-400 line-clamp-2">
                      {integration.description}
                    </Body>
                  </Stack>

                  {/* Link Indicator */}
                  {(integration.href || onIntegrationClick) && (
                    <ArrowRight className="size-4 text-grey-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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

export default IntegrationGrid;

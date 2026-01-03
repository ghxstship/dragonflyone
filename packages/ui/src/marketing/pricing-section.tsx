"use client";

import { forwardRef, useState, ReactNode } from "react";
import clsx from "clsx";
import { Container, Stack, Grid } from "../foundations/layout.js";
import { Card } from "../molecules/card.js";
import { Kicker } from "../atoms/kicker.js";
import { Body, H2, H3 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { Badge } from "../atoms/badge.js";
import { Check, X } from "lucide-react";

/**
 * PricingSection - Interactive pricing table
 * 2026 Best Practices:
 * - Monthly/annual toggle with savings highlight
 * - Feature comparison
 * - Highlighted recommended plan
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface PricingFeature {
  name: string;
  included: boolean | string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  currency?: string;
  features: PricingFeature[];
  cta: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  highlighted?: boolean;
  badge?: string;
}

export interface PricingSectionProps {
  /** Section kicker text */
  kicker?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Pricing plans */
  plans: PricingPlan[];
  /** Show billing toggle */
  showBillingToggle?: boolean;
  /** Default billing period */
  defaultBilling?: "monthly" | "annual";
  /** Annual savings percentage */
  annualSavings?: number;
  /** 
   * Section theme variant
   * - "dark": Force dark theme (default - matches GHXSTSHIP aesthetic)
   * - "light": Force light theme
   * - "inverted": Invert relative to page theme
   */
  variant?: "dark" | "light" | "inverted";
  /** Additional content below pricing */
  footer?: ReactNode;
  className?: string;
}

export const PricingSection = forwardRef<HTMLElement, PricingSectionProps>(
  function PricingSection(
    {
      kicker,
      title,
      description,
      plans,
      showBillingToggle = true,
      defaultBilling = "annual",
      annualSavings = 20,
      variant = "dark",
      footer,
      className,
    },
    ref
  ) {
    const [billing, setBilling] = useState<"monthly" | "annual">(defaultBilling);

    const variantClasses = {
      dark: "section-dark bg-surface-primary",
      light: "section-light bg-surface-primary",
      inverted: "section-inverted bg-surface-primary",
    };

    const formatPrice = (price: number, currency = "USD") => {
      if (price === 0) return "Custom";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    };

    return (
      <section
        ref={ref}
        className={clsx("py-12 sm:py-16 md:py-24 lg:py-32", variantClasses[variant], className)}
      >
        <Container size="xl">
          {/* Section Header */}
          <Stack gap={4} className="mb-8 sm:mb-10 md:mb-12 lg:mb-16 text-center items-center">
            {kicker && <Kicker>{kicker}</Kicker>}
            {title && <H2 className="text-text-primary">{title}</H2>}
            {description && (
              <Body size="lg" className="text-text-muted max-w-2xl">
                {description}
              </Body>
            )}

            {/* Billing Toggle */}
            {showBillingToggle && (
              <div className="mt-6 bg-surface-elevated p-1 rounded-card inline-flex">
                <Button
                  variant={billing === "monthly" ? "solid" : "ghost"}
                  size="sm"
                  onClick={() => setBilling("monthly")}
                >
                  Monthly
                </Button>
                <Button
                  variant={billing === "annual" ? "solid" : "ghost"}
                  size="sm"
                  onClick={() => setBilling("annual")}
                  className="flex items-center gap-2"
                >
                  Annual
                  {annualSavings > 0 && (
                    <Badge variant="success" size="sm">
                      Save {annualSavings}%
                    </Badge>
                  )}
                </Button>
              </div>
            )}
          </Stack>

          {/* Pricing Cards */}
          <Grid
            cols={plans.length as 2 | 3 | 4}
            gap={6}
            className={clsx(
              "grid-cols-1",
              plans.length === 2 && "md:grid-cols-2",
              plans.length === 3 && "md:grid-cols-3",
              plans.length >= 4 && "md:grid-cols-2 lg:grid-cols-4"
            )}
          >
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={clsx(
                  "p-4 sm:p-6 md:p-8 rounded-card relative h-full flex flex-col",
                  plan.highlighted
                    ? "border-2 border-primary ring-2 ring-primary/20"
                    : "border-2 border-border"
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <Badge
                    variant="warning"
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                  >
                    {plan.badge}
                  </Badge>
                )}

                {/* Card content - grows to fill available space */}
                <Stack gap={6} className="flex-1">
                  {/* Plan Header */}
                  <Stack gap={2}>
                    <H3 size="sm" className="text-text-primary">
                      {plan.name}
                    </H3>
                    <Body size="sm" className="text-text-muted">
                      {plan.description}
                    </Body>
                  </Stack>

                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl md:text-5xl text-text-primary">
                        {formatPrice(
                          billing === "monthly"
                            ? plan.price.monthly
                            : plan.price.annual,
                          plan.currency
                        )}
                      </span>
                      {plan.price.monthly > 0 && (
                        <span className="text-text-disabled">/month</span>
                      )}
                    </div>
                    {billing === "annual" && plan.price.monthly > 0 && (
                      <Body size="sm" className="text-text-disabled mt-1">
                        Billed annually
                      </Body>
                    )}
                  </div>

                  {/* Features */}
                  <Stack gap={3}>
                    {plan.features.map((feature, idx) => (
                      <Stack
                        key={idx}
                        direction="horizontal"
                        gap={3}
                        className="items-start"
                      >
                        {feature.included === true ? (
                          <Check className="size-5 text-success flex-shrink-0 mt-0.5" />
                        ) : feature.included === false ? (
                          <X className="size-5 text-text-disabled flex-shrink-0 mt-0.5" />
                        ) : (
                          <Check className="size-5 text-success flex-shrink-0 mt-0.5" />
                        )}
                        <Body
                          size="sm"
                          className={clsx(
                            feature.included === false
                              ? "text-text-disabled"
                              : "text-text-secondary"
                          )}
                        >
                          {typeof feature.included === "string"
                            ? feature.included
                            : feature.name}
                        </Body>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>

                {/* CTA - anchored at bottom with mt-auto */}
                <Button
                  variant={plan.highlighted ? "solid" : "outline"}
                  className="w-full mt-6"
                  onClick={plan.cta.onClick}
                >
                  {plan.cta.label}
                </Button>
              </Card>
            ))}
          </Grid>

          {/* Footer */}
          {footer && <div className="mt-12 text-center">{footer}</div>}
        </Container>
      </section>
    );
  }
);

export default PricingSection;

"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { Container, Stack } from "../foundations/layout.js";
import { Body, H2 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { ArrowRight } from "lucide-react";

/**
 * CTABanner - Full-width call-to-action section
 * 2026 Best Practices:
 * - Clear, action-oriented headline
 * - Single primary CTA
 * - Optional secondary action
 * - High contrast for visibility
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface CTABannerProps {
  /** Main headline */
  title: string;
  /** Supporting description */
  description?: string;
  /** Primary CTA button */
  primaryCta: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  /** Secondary CTA button */
  secondaryCta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** 
   * Section theme variant
   * - "dark": Force dark theme (default)
   * - "light": Force light theme
   * - "inverted": Invert relative to page theme
   */
  variant?: "dark" | "light" | "inverted";
  /** Background style */
  backgroundStyle?: "primary" | "accent" | "gradient" | "solid";
  /** Pattern overlay */
  pattern?: "none" | "halftone" | "stripes";
  /** Content alignment */
  align?: "left" | "center";
  className?: string;
}

export const CTABanner = forwardRef<HTMLElement, CTABannerProps>(
  function CTABanner(
    {
      title,
      description,
      primaryCta,
      secondaryCta,
      variant = "dark",
      backgroundStyle = "primary",
      pattern = "halftone",
      align = "center",
      className,
    },
    ref
  ) {
    const variantClasses = {
      dark: "section-dark",
      light: "section-light",
      inverted: "section-inverted",
    };

    const bgStyleClasses = {
      primary: "bg-primary",
      accent: "bg-accent",
      gradient: "bg-gradient-to-r from-primary to-secondary",
      solid: "bg-surface-primary",
    };

    const isLightBg = backgroundStyle === "accent";

    const patternStyles = {
      none: {},
      halftone: {
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "12px 12px",
      },
      stripes: {
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)",
      },
    };

    const alignClasses = {
      left: "text-left items-start",
      center: "text-center items-center",
    };

    return (
      <section
        ref={ref}
        className={clsx(
          "relative py-12 sm:py-16 md:py-20 lg:py-24",
          variantClasses[variant],
          bgStyleClasses[backgroundStyle],
          className
        )}
      >
        {/* Pattern Overlay */}
        {pattern !== "none" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={patternStyles[pattern]}
          />
        )}

        <Container size="lg" className="relative z-10">
          <Stack gap={6} className={alignClasses[align]}>
            {/* Title */}
            <H2
              className={clsx(
                "max-w-3xl",
                isLightBg ? "text-black" : "text-text-primary"
              )}
            >
              {title}
            </H2>

            {/* Description */}
            {description && (
              <Body
                size="lg"
                className={clsx(
                  "max-w-2xl",
                  isLightBg ? "text-black/80" : "text-text-secondary"
                )}
              >
                {description}
              </Body>
            )}

            {/* CTAs */}
            <Stack
              direction="horizontal"
              gap={4}
              className={clsx(
                "flex-wrap",
                align === "center" ? "justify-center" : "justify-start"
              )}
            >
              <Button
                variant={isLightBg ? "solid" : "outline"}
                size="lg"
                onClick={primaryCta.onClick}
                icon={primaryCta.icon || <ArrowRight className="size-5" />}
                iconPosition="right"
                className={clsx(
                  !isLightBg && "border-white text-white hover:bg-white hover:text-black"
                )}
              >
                {primaryCta.label}
              </Button>
              {secondaryCta && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={secondaryCta.onClick}
                  className={clsx(
                    isLightBg
                      ? "text-black hover:bg-black/10"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  {secondaryCta.label}
                </Button>
              )}
            </Stack>
          </Stack>
        </Container>
      </section>
    );
  }
);

export default CTABanner;

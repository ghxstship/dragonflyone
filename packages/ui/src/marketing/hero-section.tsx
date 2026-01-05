"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { Container, Stack } from "../foundations/layout.js";
import { Button } from "../atoms/Button/index.js";
import { Kicker } from "../atoms/Kicker/index.js";
import { ArrowRight, Play } from "lucide-react";

/**
 * HeroSection - Full-viewport marketing hero
 * 2026 Best Practices:
 * - Above-fold impact with clear value proposition
 * - Dual CTAs (primary action + secondary)
 * - Optional video/image background
 * - Animated text entrance
 * - Social proof integration
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface HeroSectionProps {
  /** Small uppercase label above title */
  kicker?: string;
  /** Main headline - should be <10 words */
  title: string | ReactNode;
  /** Supporting description - 1-2 sentences */
  description?: string | ReactNode;
  /** Primary CTA button config */
  primaryCta?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  /** Secondary CTA button config */
  secondaryCta?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  /** Video button for demo/explainer */
  videoButton?: {
    label: string;
    onClick: () => void;
  };
  /** 
   * Section theme variant
   * - "dark": Force dark theme (default - matches GHXSTSHIP aesthetic)
   * - "light": Force light theme
   * - "inverted": Invert relative to page theme
   */
  variant?: "dark" | "light" | "inverted";
  /** Background style */
  backgroundStyle?: "solid" | "gradient" | "image";
  /** Background image URL (when backgroundStyle="image") */
  backgroundImage?: string;
  /** Pattern overlay */
  pattern?: "none" | "halftone" | "grid" | "stripes";
  /** Full viewport height */
  fullHeight?: boolean;
  /** Content alignment */
  align?: "left" | "center";
  /** Social proof element (logos, stats, etc.) */
  socialProof?: ReactNode;
  /** Additional content below CTAs */
  children?: ReactNode;
  className?: string;
}

export const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(
  function HeroSection(
    {
      kicker,
      title,
      description,
      primaryCta,
      secondaryCta,
      videoButton,
      variant = "dark",
      backgroundStyle = "solid",
      backgroundImage,
      pattern = "halftone",
      fullHeight = true,
      align = "center",
      socialProof,
      children,
      className,
    },
    ref
  ) {
    const variantClasses = {
      dark: "section-dark",
      light: "section-light",
      inverted: "section-inverted",
    };

    // Background is handled by parent FullBleedSection when used in MarketingPage
    // Only apply background when HeroSection is used standalone
    const bgStyleClasses = {
      solid: "bg-surface-primary",
      gradient: "", // Transparent - let parent handle gradient
      image: "", // Transparent - background image handled separately
    };

    const alignClasses = {
      left: "text-left items-start",
      center: "text-center items-center",
    };

    const patternStyles = {
      none: {},
      halftone: {
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      },
      grid: {
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "64px 64px",
      },
      stripes: {
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)",
      },
    };

    return (
      <section
        ref={ref}
        className={clsx(
          "relative overflow-hidden text-[var(--color-text-primary)]",
          fullHeight ? "min-h-[100dvh]" : "min-h-[60vh] md:min-h-[70vh]",
          variantClasses[variant],
          bgStyleClasses[backgroundStyle],
          className
        )}
      >
        {/* Background Image */}
        {backgroundStyle === "image" && backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            <div className="absolute inset-0 bg-surface-primary/70" />
          </div>
        )}

        {/* Pattern Overlay */}
        {pattern !== "none" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={patternStyles[pattern]}
          />
        )}

        {/* Content */}
        <Container size="2xl" className="relative z-10 h-full">
          <div
            className={clsx(
              "flex flex-col justify-center h-full py-12 sm:py-16 md:py-24 lg:py-32",
              fullHeight && "min-h-[100dvh]",
              alignClasses[align]
            )}
          >
            <Stack gap={6} className={clsx("max-w-4xl", alignClasses[align])}>
              {/* Kicker */}
              {kicker && (
                <Kicker className="animate-fade-in">{kicker}</Kicker>
              )}

              {/* Title */}
              {typeof title === "string" ? (
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl uppercase leading-[0.9] tracking-tight animate-slide-up-bounce">
                  {title}
                </h1>
              ) : (
                <div className="animate-slide-up-bounce">{title}</div>
              )}

              {/* Description */}
              {description && (
                <div className="max-w-2xl animate-fade-in animation-delay-200">
                  {typeof description === "string" ? (
                    <p className="font-body text-lg md:text-xl lg:text-2xl text-text-secondary leading-relaxed">
                      {description}
                    </p>
                  ) : (
                    description
                  )}
                </div>
              )}

              {/* CTAs */}
              {(primaryCta || secondaryCta || videoButton) && (
                <Stack
                  direction="horizontal"
                  gap={4}
                  className={clsx(
                    "flex-wrap animate-fade-in animation-delay-300",
                    align === "center" ? "justify-center" : "justify-start"
                  )}
                >
                  {primaryCta && (
                    <Button
                      variant="solid"
                      size="lg"
                      onClick={primaryCta.onClick}
                      icon={primaryCta.icon || <ArrowRight className="size-5" />}
                      iconPosition="right"
                      className="shadow-primary"
                    >
                      {primaryCta.label}
                    </Button>
                  )}
                  {secondaryCta && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={secondaryCta.onClick}
                      icon={secondaryCta.icon}
                      iconPosition="right"
                    >
                      {secondaryCta.label}
                    </Button>
                  )}
                  {videoButton && (
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={videoButton.onClick}
                      icon={<Play className="size-5" />}
                    >
                      {videoButton.label}
                    </Button>
                  )}
                </Stack>
              )}

              {/* Additional Content */}
              {children && (
                <div className="animate-fade-in animation-delay-400">
                  {children}
                </div>
              )}
            </Stack>

            {/* Social Proof */}
            {socialProof && (
              <div className="mt-16 md:mt-24 animate-fade-in animation-delay-500">
                {socialProof}
              </div>
            )}
          </div>
        </Container>
      </section>
    );
  }
);

export default HeroSection;

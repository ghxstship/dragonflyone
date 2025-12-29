"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { Container, Stack } from "../foundations/layout.js";
import { Button } from "../atoms/button.js";
import { Kicker } from "../atoms/kicker.js";
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
  /** Background variant */
  background?: "black" | "ink" | "gradient" | "image";
  /** Background image URL (when background="image") */
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
      background = "black",
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
    const bgClasses = {
      black: "bg-black",
      ink: "bg-ink-950",
      gradient: "bg-gradient-to-br from-ink-950 via-ink-900 to-primary/20",
      image: "bg-black",
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
          "relative overflow-hidden text-white",
          fullHeight ? "min-h-screen" : "min-h-[70vh]",
          bgClasses[background],
          className
        )}
      >
        {/* Background Image */}
        {background === "image" && backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            <div className="absolute inset-0 bg-black/70" />
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
        <Container size="xl" className="relative z-10 h-full">
          <div
            className={clsx(
              "flex flex-col justify-center h-full py-20 md:py-32",
              fullHeight && "min-h-screen",
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
                    <p className="font-body text-lg md:text-xl lg:text-2xl text-grey-300 leading-relaxed">
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

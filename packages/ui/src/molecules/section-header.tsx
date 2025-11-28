import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { Kicker } from "../atoms/kicker.js";
import { H2 } from "../atoms/typography.js";
import { Body } from "../atoms/typography.js";
import { Stack } from "../foundations/layout.js";

export type SectionHeaderProps = HTMLAttributes<HTMLDivElement> & {
  /** Small uppercase label above the title */
  kicker?: string;
  /** Main section title */
  title?: string | ReactNode;
  /** Description text below the title */
  description?: string | ReactNode;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Title size variant */
  titleSize?: "md" | "lg" | "xl";
  /** Gap between elements */
  gap?: "sm" | "md" | "lg";
  /** Background context for WCAG-compliant contrast */
  colorScheme?: "on-dark" | "on-light" | "on-mid";
};

/**
 * SectionHeader - Bold Contemporary Pop Art Adventure
 * 
 * Consistent header pattern for page sections with:
 * - Bold uppercase titles
 * - Clear visual hierarchy
 * - WCAG AA compliant contrast
 * 
 * Color scheme determines text color for WCAG AA compliance:
 * - on-dark: For dark backgrounds (ink-700 to ink-950) - default
 * - on-light: For light backgrounds (ink-50 to ink-200)
 * - on-mid: For mid-tone backgrounds (ink-400 to ink-600)
 */
export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  function SectionHeader(
    { 
      kicker, 
      title, 
      description, 
      align = "left", 
      titleSize = "lg",
      gap = "md",
      colorScheme = "on-dark",
      className, 
      children,
      ...props 
    }, 
    ref
  ) {
    const alignClasses = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };

    const titleSizeClasses = {
      md: "text-h3-sm md:text-h3-md",
      lg: "text-h2-sm md:text-h2-md",
      xl: "text-h1-sm md:text-h1-md uppercase",
    };

    const gapValues = {
      sm: 2,
      md: 3,
      lg: 4,
    };

    // WCAG AA compliant description colors based on background context
    const descriptionColorClasses = {
      "on-dark": "text-ink-300",   // 12.6:1 contrast on ink-950
      "on-light": "text-ink-600",  // 5.7:1 contrast on ink-50
      "on-mid": "text-ink-200",    // 5.3:1 contrast on ink-500
    };

    const descriptionClasses = clsx(
      descriptionColorClasses[colorScheme],
      align === "center" ? "mx-auto max-w-2xl" : "max-w-3xl"
    );

    return (
      <Stack
        ref={ref}
        gap={gapValues[gap]}
        className={clsx(alignClasses[align], className)}
        {...props}
      >
        {kicker && <Kicker colorScheme={colorScheme}>{kicker}</Kicker>}
        {title && (
          typeof title === "string" ? (
            <H2 className={clsx(titleSizeClasses[titleSize], colorScheme === "on-dark" ? "text-white" : "text-black")}>{title}</H2>
          ) : (
            title
          )
        )}
        {description && (
          typeof description === "string" ? (
            <Body className={descriptionClasses}>{description}</Body>
          ) : (
            description
          )
        )}
        {children}
      </Stack>
    );
  }
);

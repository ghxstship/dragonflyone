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
};

/**
 * SectionHeader - Consistent header pattern for page sections
 * Used across ATLVS, COMPVSS, and GVTEWAY landing pages
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
      md: "text-2xl md:text-3xl",
      lg: "text-3xl md:text-4xl",
      xl: "text-4xl md:text-5xl uppercase",
    };

    const gapValues = {
      sm: 2,
      md: 3,
      lg: 4,
    };

    const descriptionClasses = clsx(
      "text-ink-300",
      align === "center" ? "mx-auto max-w-2xl" : "max-w-3xl"
    );

    return (
      <Stack
        ref={ref}
        gap={gapValues[gap]}
        className={clsx(alignClasses[align], className)}
        {...props}
      >
        {kicker && <Kicker>{kicker}</Kicker>}
        {title && (
          typeof title === "string" ? (
            <H2 className={titleSizeClasses[titleSize]}>{title}</H2>
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

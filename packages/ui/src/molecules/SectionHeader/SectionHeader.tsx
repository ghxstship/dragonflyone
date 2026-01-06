"use client";

import { forwardRef } from "react";
import { 
  sectionHeaderVariants,
  sectionHeaderContainerVariants,
  sectionHeaderKickerVariants,
  sectionHeaderTitleVariants,
  sectionHeaderDescriptionVariants 
} from "./SectionHeader.variants.js";
import type { 
  SectionHeaderProps,
  SectionHeaderAlign,
  SectionHeaderTitleSize,
  SectionHeaderGap,
  SectionHeaderColorScheme 
} from "./SectionHeader.types.js";

/**
 * SectionHeader component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Section header with kicker, title, and description
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <SectionHeader
 *   kicker="FEATURES"
 *   title="Amazing Features"
 *   description="Discover what makes our product special"
 *   align="center"
 *   titleSize="xl"
 *   inverted={false}
 * />
 * ```
 */
export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  function SectionHeader(
    { 
      kicker, 
      title, 
      description, 
      align = "left" as SectionHeaderAlign, 
      titleSize = "lg" as SectionHeaderTitleSize,
      gap = "md" as SectionHeaderGap,
      colorScheme = "on-dark" as SectionHeaderColorScheme,
      inverted = false,
      className, 
      children,
      ...props 
    },
    ref
  ) {
    return (
      <div 
        className={sectionHeaderVariants({ align, className })}
        ref={ref}
        {...props}
      >
        <div className={sectionHeaderContainerVariants({ gap })}>
          {/* Kicker */}
          {kicker && (
            <div className={sectionHeaderKickerVariants({ colorScheme })}>
              {kicker}
            </div>
          )}
          
          {/* Title */}
          {title && (
            <h2 className={sectionHeaderTitleVariants({ titleSize, colorScheme })}>
              {title}
            </h2>
          )}
          
          {/* Description */}
          {description && (
            <p className={sectionHeaderDescriptionVariants({ colorScheme })}>
              {description}
            </p>
          )}
          
          {/* Children */}
          {children}
        </div>
      </div>
    );
  }
);

SectionHeader.displayName = "SectionHeader";

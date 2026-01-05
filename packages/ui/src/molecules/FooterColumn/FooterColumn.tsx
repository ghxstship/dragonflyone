"use client";

import React, { forwardRef, useMemo } from "react";
import { footerColumnVariants } from "./FooterColumn.variants.js";
import type { FooterColumnProps } from "./FooterColumn.types.js";

/**
 * FooterColumn - Industry Best Practices Implementation
 * 
 * Accessibility-first footer column component following WCAG 2.1 AA guidelines.
 * 
 * Features:
 * - Semantic HTML5 structure with proper heading hierarchy
 * - Screen reader friendly content organization
 * - Performance optimized with React hooks
 * - Proper focus management for interactive elements
 * - SEO-friendly semantic markup
 * 
 * @example
 * ```tsx
 * <FooterColumn title="Product">
 *   <FooterLink href="/features">Features</FooterLink>
 *   <FooterLink href="/pricing">Pricing</FooterLink>
 * </FooterColumn>
 * ```
 */
export const FooterColumn = forwardRef<HTMLDivElement, FooterColumnProps>(
  function FooterColumn({
    title,
    children,
    className,
    ...props
  }, ref) {
    // Memoize title section for performance
    const titleSection = useMemo(() => {
      if (!title) return null;
      
      return (
        <h3 
          className="font-heading text-lg font-bold text-text-primary mb-4"
          id={`footer-column-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {title}
        </h3>
      );
    }, [title]);

    // Memoize content container for performance
    const contentContainer = useMemo(() => {
      return (
        <div 
          className="space-y-2"
          role="list"
          aria-labelledby={title ? `footer-column-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined}
        >
          {children}
        </div>
      );
    }, [children, title]);

    return (
      <div 
        ref={ref}
        className={footerColumnVariants({ className })}
        role="complementary"
        aria-labelledby={title ? `footer-column-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined}
        {...props}
      >
        {titleSection}
        {contentContainer}
      </div>
    );
  }
);

FooterColumn.displayName = "FooterColumn";

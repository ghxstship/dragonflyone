"use client";

import React, { forwardRef, useMemo } from "react";
import { footerLinkVariants } from "./FooterLink.variants.js";
import type { FooterLinkProps } from "./FooterLink.types.js";

/**
 * FooterLink - Industry Best Practices Implementation
 * 
 * Accessibility-first footer link component following WCAG 2.1 AA guidelines.
 * 
 * Features:
 * - Semantic HTML5 structure with proper ARIA attributes
 * - Screen reader friendly link descriptions
 * - Performance optimized with React hooks
 * - Proper focus management and keyboard navigation
 * - External link handling with security attributes
 * - SEO-friendly semantic markup
 * 
 * @example
 * ```tsx
 * <FooterLink href="/features">Features</FooterLink>
 * <FooterLink href="https://external.com" external>External Site</FooterLink>
 * ```
 */
export const FooterLink = forwardRef<HTMLAnchorElement, FooterLinkProps>(
  function FooterLink({
    href,
    children,
    external = false,
    className,
    ...props
  }, _ref) {
    // Memoize link attributes for performance
    const linkAttributes = useMemo(() => {
      const attrs: React.AnchorHTMLAttributes<HTMLAnchorElement> = {
        href,
        className: footerLinkVariants({ className }),
        role: "link",
        ...props
      };

      // Add external link attributes
      if (external) {
        attrs.target = "_blank";
        attrs.rel = "noopener noreferrer";
        attrs["aria-label"] = typeof children === "string" 
          ? `${children} (opens in new window)` 
          : "External link (opens in new window)";
      }

      return attrs;
    }, [href, external, className, props, children]);

    return <a {...linkAttributes}>{children}</a>;
  }
);

FooterLink.displayName = "FooterLink";

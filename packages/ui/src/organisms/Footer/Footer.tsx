import { forwardRef } from "react";
import { footerVariants, footerCopyrightVariants } from "./Footer.variants.js";
import type { FooterProps } from "./Footer.types.js";

/**
 * Footer component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Substantial 4px top border for maximum impact
 * - Bold section headers
 * - Generous spacing
 * - CVA-based variants for consistent theming
 * - Responsive grid layout
 * 
 * @example
 * ```tsx
 * <Footer
 *   logo={<CompanyLogo />}
 *   copyright="© 2024 Company. All rights reserved."
 *   inverted={true}
 * >
 *   <FooterSection title="Product">
 *     <a href="/features">Features</a>
 *     <a href="/pricing">Pricing</a>
 *   </FooterSection>
 *   <FooterSection title="Company">
 *     <a href="/about">About</a>
 *     <a href="/careers">Careers</a>
 *   </FooterSection>
 * </Footer>
 * ```
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(
  function Footer({ 
    logo, 
    children, 
    copyright, 
    inverted = true, 
    variant = "default",
    className, 
    ...props 
  }, ref) {
    return (
      <footer
        ref={ref}
        className={footerVariants({ variant, inverted, className })}
        {...props}
      >
        <div className="container mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
          {/* Logo */}
          {logo && (
            <div className="mb-6 sm:mb-8">
              {logo}
            </div>
          )}

          {/* Content Sections */}
          {children && (
            <div className="grid grid-cols-2 gap-6 mb-6 sm:gap-8 sm:mb-8 md:grid-cols-4">
              {children}
            </div>
          )}

          {/* Copyright */}
          {copyright && (
            <div className={footerCopyrightVariants({ inverted })}>
              <p>{copyright}</p>
            </div>
          )}
        </div>
      </footer>
    );
  }
);

Footer.displayName = "Footer";

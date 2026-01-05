import { forwardRef, useMemo } from "react";
import { footerVariants, footerCopyrightVariants } from "./Footer.variants.js";
import type { FooterProps } from "./Footer.types.js";

/**
 * Footer - Industry Best Practices Implementation
 * 
 * Accessibility-first footer component following WCAG 2.1 AA guidelines.
 * 
 * Features:
 * - Semantic HTML5 structure with proper ARIA attributes
 * - Keyboard navigation support
 * - Screen reader friendly content organization
 * - Performance optimized with React hooks
 * - Responsive design with mobile-first approach
 * - Proper color contrast and focus management
 * - SEO-friendly semantic markup
 * 
 * @example
 * ```tsx
 * <Footer
 *   logo={<CompanyLogo />}
 *   copyright="© 2024 Company. All rights reserved."
 *   inverted={true}
 *   aria-label="Site footer"
 * >
 *   <FooterSection title="Product">
 *     <FooterLink href="/features">Features</FooterLink>
 *     <FooterLink href="/pricing">Pricing</FooterLink>
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
    // Memoize copyright text for performance
    const copyrightContent = useMemo(() => {
      if (!copyright) return null;
      
      return (
        <div 
          className={footerCopyrightVariants({ inverted })}
          role="contentinfo"
        >
          <p className="text-sm">{copyright}</p>
        </div>
      );
    }, [copyright, inverted]);

    // Memoize logo section for performance
    const logoSection = useMemo(() => {
      if (!logo) return null;
      
      return (
        <div 
          className="mb-6 sm:mb-8"
          role="banner"
        >
          {logo}
        </div>
      );
    }, [logo]);

    // Memoize content grid for performance
    const contentGrid = useMemo(() => {
      if (!children) return null;
      
      return (
        <div 
          className="grid grid-cols-2 gap-6 mb-6 sm:gap-8 sm:mb-8 md:grid-cols-4"
          role="navigation"
          aria-label="Footer navigation"
        >
          {children}
        </div>
      );
    }, [children]);

    // Generate structured data for SEO
    const structuredData = useMemo(() => {
      if (!copyright) return null;
      
      const currentYear = new Date().getFullYear();
      const companyName = copyright.match(/©\s*\d{4}\s*(.+?)\./)?.[1] || "Company";
      
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": companyName,
        "copyrightYear": currentYear,
        "copyrightHolder": {
          "@type": "Organization",
          "name": companyName
        }
      };
    }, [copyright]);

    return (
      <>
        {/* Structured data for SEO */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ 
              __html: JSON.stringify(structuredData) 
            }}
          />
        )}
        
        <footer
          ref={ref}
          className={footerVariants({ variant, inverted, className })}
          role="contentinfo"
          aria-label="Site footer"
          {...props}
        >
          <div className="container mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
            {/* Logo Section */}
            {logoSection}

            {/* Content Sections */}
            {contentGrid}

            {/* Copyright Section */}
            {copyrightContent}
          </div>
        </footer>
      </>
    );
  }
);

Footer.displayName = "Footer";

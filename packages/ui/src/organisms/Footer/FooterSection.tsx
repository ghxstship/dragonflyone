import { forwardRef } from "react";
import { footerSectionVariants, footerSectionTitleVariants } from "./Footer.variants.js";
import type { FooterSectionProps } from "./Footer.types.js";

/**
 * FooterSection component
 * 
 * A section within the footer for organizing links and content.
 * 
 * @example
 * ```tsx
 * <FooterSection title="Company" inverted={true}>
 *   <ul>
 *     <li><a href="/about">About</a></li>
 *     <li><a href="/careers">Careers</a></li>
 *   </ul>
 * </FooterSection>
 * ```
 */
export const FooterSection = forwardRef<HTMLDivElement, FooterSectionProps>(
  function FooterSection({ title, children = false, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={footerSectionVariants({ className })}
        {...props}
      >
        {title && (
          <h3 className={footerSectionTitleVariants({})}>
            {title}
          </h3>
        )}
        
        <div className="space-y-2">
          {children}
        </div>
      </div>
    );
  }
);

FooterSection.displayName = "FooterSection";

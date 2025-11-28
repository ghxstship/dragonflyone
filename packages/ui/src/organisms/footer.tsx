import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type FooterProps = HTMLAttributes<HTMLElement> & {
  logo?: ReactNode;
  children?: ReactNode;
  copyright?: string;
  inverted?: boolean;
};

/**
 * Footer component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Substantial 4px top border for maximum impact
 * - Bold section headers
 * - Generous spacing
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(
  function Footer({ logo, children, copyright, inverted = true, className, ...props }, ref) {
    return (
      <footer
        ref={ref}
        className={clsx(
          "border-t-4 py-12",
          inverted
            ? "bg-black text-white border-white"
            : "bg-white text-black border-black",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          {logo ? <div className="mb-8">{logo}</div> : null}
          {children ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">{children}</div> : null}
          {copyright ? (
            <div className={clsx("pt-8 border-t-2", inverted ? "border-grey-800" : "border-grey-200")}>
              <p className={clsx(
                "font-code text-xs uppercase tracking-widest font-bold",
                inverted ? "text-grey-500" : "text-grey-400"
              )}>{copyright}</p>
            </div>
          ) : null}
        </div>
      </footer>
    );
  }
);

export type FooterColumnProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  inverted?: boolean;
};

export const FooterColumn = forwardRef<HTMLDivElement, FooterColumnProps>(
  function FooterColumn({ title, inverted = true, className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("flex flex-col gap-4", className)} {...props}>
        <h3 className={clsx(
          "font-heading text-sm uppercase tracking-wider font-bold",
          inverted ? "text-white" : "text-black"
        )}>{title}</h3>
        {children}
      </div>
    );
  }
);

export type FooterLinkProps = HTMLAttributes<HTMLAnchorElement> & {
  href: string;
  inverted?: boolean;
};

export const FooterLink = forwardRef<HTMLAnchorElement, FooterLinkProps>(
  function FooterLink({ href, inverted = true, className, children, ...props }, ref) {
    return (
      <a
        ref={ref}
        href={href}
        className={clsx(
          "font-body text-sm transition-all duration-100",
          "hover:-translate-x-0.5",
          inverted
            ? "text-grey-400 hover:text-white"
            : "text-grey-600 hover:text-black",
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);

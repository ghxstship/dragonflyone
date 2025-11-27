import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type FooterProps = HTMLAttributes<HTMLElement> & {
  logo?: ReactNode;
  children?: ReactNode;
  copyright?: string;
  inverted?: boolean;
};

export const Footer = forwardRef<HTMLElement, FooterProps>(
  function Footer({ logo, children, copyright, inverted = true, className, ...props }, ref) {
    return (
      <footer
        ref={ref}
        className={clsx(
          "border-t-2 py-spacing-12",
          inverted
            ? "bg-black text-white border-white"
            : "bg-white text-black border-black",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-spacing-4">
          {logo ? <div className="mb-spacing-8">{logo}</div> : null}
          {children ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gap-lg mb-spacing-8">{children}</div> : null}
          {copyright ? (
            <div className={clsx("pt-spacing-8 border-t-2", inverted ? "border-grey-800" : "border-grey-200")}>
              <p className={clsx(
                "font-code text-mono-xs uppercase tracking-widest",
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
      <div ref={ref} className={clsx("flex flex-col gap-gap-md", className)} {...props}>
        <h3 className={clsx(
          "font-heading text-h5-sm uppercase tracking-wider",
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
          "font-body text-body-sm transition-colors",
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

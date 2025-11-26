import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type FooterProps = HTMLAttributes<HTMLElement> & {
  logo?: ReactNode;
  children?: ReactNode;
  copyright?: string;
};

export const Footer = forwardRef<HTMLElement, FooterProps>(
  function Footer({ logo, children, copyright, className, ...props }, ref) {
    return (
      <footer
        ref={ref}
        className={clsx("bg-black text-white border-t-2 border-white py-12", className)}
        {...props}
      >
        <div className="container mx-auto px-4">
          {logo ? <div className="mb-8">{logo}</div> : null}
          {children ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">{children}</div> : null}
          {copyright ? (
            <div className="pt-8 border-t-2 border-grey-800">
              <p className="font-code text-mono-xs uppercase tracking-widest text-grey-500">{copyright}</p>
            </div>
          ) : null}
        </div>
      </footer>
    );
  }
);

export type FooterColumnProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
};

export const FooterColumn = forwardRef<HTMLDivElement, FooterColumnProps>(
  function FooterColumn({ title, className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("flex flex-col gap-4", className)} {...props}>
        <h3 className="font-heading text-h5-sm uppercase tracking-wider">{title}</h3>
        {children}
      </div>
    );
  }
);

export const FooterLink = forwardRef<HTMLAnchorElement, HTMLAttributes<HTMLAnchorElement> & { href: string }>(
  function FooterLink({ href, className, children, ...props }, ref) {
    return (
      <a
        ref={ref}
        href={href}
        className={clsx("font-body text-body-sm text-grey-400 hover:text-white transition-colors", className)}
        {...props}
      >
        {children}
      </a>
    );
  }
);

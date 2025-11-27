import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

// Main - semantic main content wrapper
export const Main = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & { background?: "white" | "black" | "grey" | "ink" }>(
  function Main({ background = "white", className, children, ...props }, ref) {
    const bgClasses = {
      white: "bg-surface-primary text-text-primary",
      black: "bg-surface-inverse text-text-inverse",
      grey: "bg-surface-secondary text-text-primary",
      ink: "bg-ink-950 text-ink-50",
    };

    return (
      <main
        ref={ref}
        className={clsx("relative min-h-screen", bgClasses[background], className)}
        {...props}
      >
        {children}
      </main>
    );
  }
);

// Header - semantic header wrapper
export const Header = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & { variant?: "page" | "section" | "card" }>(
  function Header({ variant = "page", className, children, ...props }, ref) {
    const variantClasses = {
      page: "flex flex-col gap-spacing-6 md:flex-row md:items-center md:justify-between",
      section: "flex flex-col gap-spacing-4",
      card: "flex items-center justify-between",
    };

    return (
      <header
        ref={ref}
        className={clsx(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </header>
    );
  }
);

// Article - semantic article wrapper
export const Article = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & { variant?: "default" | "card" | "bordered" }>(
  function Article({ variant = "default", className, children, ...props }, ref) {
    const variantClasses = {
      default: "",
      card: "border-2 border-ink-800 p-spacing-6",
      bordered: "border-2 border-ink-800 p-spacing-6 hover:border-ink-600 transition-colors",
    };

    return (
      <article
        ref={ref}
        className={clsx(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </article>
    );
  }
);

// Aside - semantic aside wrapper
export const Aside = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function Aside({ className, children, ...props }, ref) {
    return (
      <aside
        ref={ref}
        className={clsx("", className)}
        {...props}
      >
        {children}
      </aside>
    );
  }
);

// Nav - semantic nav wrapper (for non-primary navigation)
export const Nav = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & { variant?: "horizontal" | "vertical" }>(
  function Nav({ variant = "horizontal", className, children, ...props }, ref) {
    const variantClasses = {
      horizontal: "flex items-center gap-spacing-4",
      vertical: "flex flex-col gap-spacing-2",
    };

    return (
      <nav
        ref={ref}
        className={clsx(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </nav>
    );
  }
);

// Figure - semantic figure wrapper for images/media
export const Figure = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & { caption?: string }>(
  function Figure({ caption, className, children, ...props }, ref) {
    return (
      <figure
        ref={ref}
        className={clsx("", className)}
        {...props}
      >
        {children}
        {caption && (
          <figcaption className="mt-spacing-2 text-mono-sm text-grey-500 font-code">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }
);

// Box - generic div wrapper with common patterns
export const Box = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { 
  variant?: "default" | "bordered" | "card" | "surface";
  padding?: "none" | "sm" | "md" | "lg";
}>(
  function Box({ variant = "default", padding = "none", className, children, ...props }, ref) {
    const variantClasses = {
      default: "",
      bordered: "border border-ink-800",
      card: "border-2 border-ink-800 bg-black/60",
      surface: "surface",
    };

    const paddingClasses = {
      none: "",
      sm: "p-spacing-4",
      md: "p-spacing-6",
      lg: "p-spacing-8",
    };

    return (
      <div
        ref={ref}
        className={clsx(variantClasses[variant], paddingClasses[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// GridOverlay - decorative grid background
export const GridOverlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function GridOverlay({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx("pointer-events-none absolute inset-0 grid-overlay opacity-40", className)}
        {...props}
      />
    );
  }
);

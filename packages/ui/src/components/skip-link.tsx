"use client";

/**
 * Skip Link Component
 * Provides keyboard users a way to skip navigation and jump to main content
 * WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks)
 */

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

export function SkipLink({ 
  href = "#main-content", 
  children = "Skip to main content" 
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-skip-link focus:rounded-md focus:bg-surface-inverse focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {children}
    </a>
  );
}

/**
 * Main Content Wrapper
 * Provides the target for skip links
 */
interface MainContentProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function MainContent({ 
  children, 
  id = "main-content",
  className = ""
}: MainContentProps) {
  return (
    <main 
      id={id} 
      tabIndex={-1}
      className={`outline-none ${className}`}
      role="main"
    >
      {children}
    </main>
  );
}

/**
 * Visually Hidden Component
 * Hides content visually but keeps it accessible to screen readers
 */
interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export function VisuallyHidden({ 
  children, 
  as: Component = "span" 
}: VisuallyHiddenProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}

/**
 * Live Region Component
 * Announces dynamic content changes to screen readers
 */
interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: "polite" | "assertive" | "off";
  atomic?: boolean;
  relevant?: "additions" | "removals" | "text" | "all" | "additions text";
}

export function LiveRegion({
  children,
  politeness = "polite",
  atomic = true,
  relevant = "additions text",
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className="sr-only"
    >
      {children}
    </div>
  );
}

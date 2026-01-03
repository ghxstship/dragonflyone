import { forwardRef } from "react";
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Size classes - Bold Contemporary Pop Art Adventure
 * Generous padding, bold presence
 */
const sizeClasses = {
  sm: "px-4 py-2 text-xs min-h-[36px]",
  md: "px-6 py-3 text-sm min-h-[44px]",
  lg: "px-8 py-4 text-base min-h-[52px]",
  xl: "px-10 py-5 text-lg min-h-[60px]",
  icon: "p-3 min-h-[44px] min-w-[44px]",
};

export type ButtonVariant = "solid" | "outline" | "ghost" | "primary" | "accent" | "destructive";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: keyof typeof sizeClasses;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  inverted?: boolean;
  /** Show loading spinner and disable button */
  isLoading?: boolean;
  /** Text to show while loading (defaults to children) */
  loadingText?: string;
};

/**
 * Button component - Bold Contemporary Pop Art Adventure
 * 
 * NORMALIZED POP-ART SHADOW STRATEGY:
 * - Resting state: Neutral shadows (black) - clean, professional
 * - Hover state: Accent color shadow appears - rewards interaction
 * - Active state: Shadow shrinks - confirms action
 * 
 * Variants:
 * - solid: Standard filled button (neutral shadows)
 * - outline: Border button that fills on hover (neutral shadows)
 * - ghost: Minimal button for tertiary actions (no shadow)
 * - primary: Brand emphasis - neutral resting, PRIMARY color on hover
 * - accent: Special promotions - neutral resting, ACCENT color on hover  
 * - destructive: Error/delete actions (red themed)
 * 
 * The `inverted` prop controls light/dark background adaptation:
 * - inverted=true (default): For dark backgrounds
 * - inverted=false: For light backgrounds
 */
// Loading spinner component
const LoadingSpinner = () => (
  <svg 
    className="animate-spin h-4 w-4" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "solid", size = "md", icon, iconPosition = "right", fullWidth = false, inverted = true, isLoading = false, loadingText, className, children, disabled, ...props },
  ref,
) {
  // Base classes - Bold Contemporary Pop Art Adventure aesthetic
  const baseClasses = clsx(
    "inline-flex items-center justify-center gap-2",
    "font-heading uppercase tracking-wider font-bold leading-none",
    "border-2 rounded-[var(--radius-button)]",
    "transition-all duration-[100ms] ease-[var(--ease-bounce)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    // Hover lift effect
    "hover:-translate-x-0.5 hover:-translate-y-0.5",
    // Active press effect
    "active:translate-x-0.5 active:translate-y-0.5"
  );

  const getVariantClasses = () => {
    // Destructive variant - same on both backgrounds
    if (variant === "destructive") {
      return clsx(
        "bg-error-500 text-on-dark-primary border-error-500",
        "shadow-md",
        "hover:bg-error-600 hover:border-error-600 hover:shadow-lg",
        "active:shadow-xs",
        "focus-visible:ring-error-500"
      );
    }

    // Primary variant - accent color appears on HOVER (brand emphasis)
    if (variant === "primary") {
      return clsx(
        inverted
          ? "bg-surface-inverse text-on-light-primary border-surface-inverse"
          : "bg-surface-primary text-on-dark-primary border-surface-primary",
        "shadow-md",
        "hover:shadow-primary",
        "active:shadow-xs",
        inverted
          ? "focus-visible:ring-surface-inverse focus-visible:ring-offset-surface-primary"
          : "focus-visible:ring-surface-primary focus-visible:ring-offset-surface-inverse"
      );
    }

    // Accent variant - accent color appears on HOVER (special promotions)
    if (variant === "accent") {
      return clsx(
        inverted
          ? "bg-surface-inverse text-on-light-primary border-surface-inverse"
          : "bg-surface-primary text-on-dark-primary border-surface-primary",
        "shadow-md",
        "hover:shadow-accent",
        "active:shadow-xs",
        inverted
          ? "focus-visible:ring-surface-inverse focus-visible:ring-offset-surface-primary"
          : "focus-visible:ring-surface-primary focus-visible:ring-offset-surface-inverse"
      );
    }

    // Standard variants with inverted support
    // inverted=true: For dark backgrounds (white/light elements)
    // inverted=false: For light backgrounds (black/dark elements)
    if (inverted) {
      switch (variant) {
        case "solid":
          return clsx(
            "bg-surface-inverse text-on-light-primary border-surface-inverse",
            "shadow-md",
            "hover:bg-muted hover:shadow-lg",
            "active:shadow-xs",
            "focus-visible:ring-surface-inverse focus-visible:ring-offset-surface-primary"
          );
        case "outline":
          return clsx(
            "border-on-dark-primary text-on-dark-primary bg-transparent",
            "shadow-sm",
            "hover:bg-surface-inverse hover:text-on-light-primary hover:shadow-md",
            "active:bg-muted active:shadow-xs",
            "focus-visible:ring-surface-inverse focus-visible:ring-offset-surface-primary"
          );
        case "ghost":
          return clsx(
            "border-transparent text-on-dark-primary bg-transparent shadow-none",
            "hover:bg-surface-inverse/10 hover:border-surface-inverse/20",
            "active:bg-surface-inverse/20",
            "focus-visible:ring-surface-inverse focus-visible:ring-offset-surface-primary"
          );
        default:
          return "";
      }
    } else {
      switch (variant) {
        case "solid":
          return clsx(
            "bg-surface-primary text-on-dark-primary border-surface-primary",
            "shadow-md",
            "hover:bg-surface-inverse hover:shadow-lg",
            "active:shadow-xs",
            "focus-visible:ring-surface-primary focus-visible:ring-offset-surface-inverse"
          );
        case "outline":
          return clsx(
            "border-on-light-primary text-on-light-primary bg-transparent",
            "shadow-sm",
            "hover:bg-surface-primary hover:text-on-dark-primary hover:shadow-md",
            "active:bg-surface-inverse active:shadow-xs",
            "focus-visible:ring-surface-primary focus-visible:ring-offset-surface-inverse"
          );
        case "ghost":
          return clsx(
            "border-transparent text-on-light-primary bg-transparent shadow-none",
            "hover:bg-surface-primary/5 hover:border-surface-primary/10",
            "active:bg-surface-primary/10",
            "focus-visible:ring-surface-primary focus-visible:ring-offset-surface-inverse"
          );
        default:
          return "";
      }
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      className={clsx(baseClasses, getVariantClasses(), sizeClasses[size], fullWidth && "w-full", className)}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <span className="inline-flex items-center gap-2">{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" ? <span className="text-lg">{icon}</span> : null}
          <span className="inline-flex items-center gap-2">{children}</span>
          {icon && iconPosition === "right" ? <span className="text-lg">{icon}</span> : null}
        </>
      )}
    </button>
  );
});

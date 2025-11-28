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

export type ButtonVariant = "solid" | "outline" | "ghost" | "outlineWhite" | "outlineInk" | "pop" | "destructive" | "secondary";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: keyof typeof sizeClasses;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  inverted?: boolean;
};

/**
 * Button component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - 2px bold borders
 * - Hard offset shadows (comic panel style)
 * - Bounce hover animation with lift effect
 * - Press effect on active state
 * 
 * Variants:
 * - solid: Primary action button with hard shadow
 * - secondary: Secondary action with violet accent
 * - outline: Bold border, inverts on hover
 * - ghost: Minimal button for tertiary actions
 * - pop: Maximum impact - 4px border, accent shadow
 * - destructive: Error/delete actions
 * - outlineWhite: White border for dark backgrounds
 * - outlineInk: Subtle ink border for dark backgrounds
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "solid", size = "md", icon, iconPosition = "right", fullWidth = false, inverted = false, className, children, ...props },
  ref,
) {
  // Base classes - Bold Contemporary Pop Art Adventure aesthetic
  const baseClasses = clsx(
    "inline-flex items-center justify-center gap-2",
    "font-heading uppercase tracking-wider font-bold",
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
    // Explicit dark-background variants (no inverted prop needed)
    switch (variant) {
      case "outlineWhite":
        return clsx(
          "border-white text-white bg-transparent",
          "shadow-[3px_3px_0_rgba(255,255,255,0.2)]",
          "hover:bg-white hover:text-black hover:shadow-[5px_5px_0_rgba(255,255,255,0.3)]",
          "active:shadow-[1px_1px_0_rgba(255,255,255,0.2)]",
          "focus-visible:ring-white focus-visible:ring-offset-ink-950"
        );
      case "outlineInk":
        return clsx(
          "border-ink-700 text-ink-400 bg-transparent",
          "shadow-[3px_3px_0_rgba(255,255,255,0.1)]",
          "hover:border-white hover:text-white hover:shadow-[5px_5px_0_rgba(255,255,255,0.2)]",
          "active:shadow-[1px_1px_0_rgba(255,255,255,0.1)]",
          "focus-visible:ring-white focus-visible:ring-offset-ink-950"
        );
      case "pop":
        return clsx(
          "border-4 border-current",
          inverted 
            ? "bg-ink-950 text-white shadow-[4px_4px_0_hsl(239,84%,67%)]" 
            : "bg-white text-black shadow-[4px_4px_0_hsl(239,84%,67%)]",
          "hover:shadow-[6px_6px_0_hsl(239,84%,67%)]",
          "active:shadow-[2px_2px_0_hsl(239,84%,67%)]",
          inverted ? "focus-visible:ring-white" : "focus-visible:ring-black"
        );
      case "destructive":
        return clsx(
          "bg-error-500 text-white border-error-500",
          "shadow-[3px_3px_0_rgba(239,68,68,0.3)]",
          "hover:bg-error-600 hover:border-error-600 hover:shadow-[5px_5px_0_rgba(239,68,68,0.4)]",
          "active:shadow-[1px_1px_0_rgba(239,68,68,0.3)]",
          "focus-visible:ring-error-500"
        );
      case "secondary":
        return clsx(
          "bg-violet-500 text-white border-violet-500",
          "shadow-[3px_3px_0_rgba(139,92,246,0.3)]",
          "hover:bg-violet-600 hover:border-violet-600 hover:shadow-[5px_5px_0_rgba(139,92,246,0.4)]",
          "active:shadow-[1px_1px_0_rgba(139,92,246,0.3)]",
          "focus-visible:ring-violet-500"
        );
    }

    // Standard variants with inverted support
    if (inverted) {
      switch (variant) {
        case "solid":
          return clsx(
            "bg-white text-black border-white",
            "shadow-[3px_3px_0_rgba(255,255,255,0.2)]",
            "hover:bg-grey-200 hover:shadow-[5px_5px_0_rgba(255,255,255,0.3)]",
            "active:shadow-[1px_1px_0_rgba(255,255,255,0.2)]",
            "focus-visible:ring-white focus-visible:ring-offset-ink-950"
          );
        case "outline":
          return clsx(
            "border-white text-white bg-transparent",
            "shadow-[3px_3px_0_rgba(255,255,255,0.2)]",
            "hover:bg-white hover:text-black hover:shadow-[5px_5px_0_rgba(255,255,255,0.3)]",
            "active:shadow-[1px_1px_0_rgba(255,255,255,0.2)]",
            "focus-visible:ring-white focus-visible:ring-offset-ink-950"
          );
        case "ghost":
          return clsx(
            "border-transparent text-white bg-transparent shadow-none",
            "hover:bg-grey-800 hover:border-grey-700",
            "active:bg-grey-700",
            "focus-visible:ring-white focus-visible:ring-offset-ink-950"
          );
        default:
          return "";
      }
    } else {
      switch (variant) {
        case "solid":
          return clsx(
            "bg-black text-white border-black",
            "shadow-[3px_3px_0_rgba(0,0,0,0.2)]",
            "hover:bg-grey-900 hover:shadow-[5px_5px_0_rgba(0,0,0,0.25)]",
            "active:shadow-[1px_1px_0_rgba(0,0,0,0.2)]",
            "focus-visible:ring-black focus-visible:ring-offset-white"
          );
        case "outline":
          return clsx(
            "border-black text-black bg-white",
            "shadow-[3px_3px_0_rgba(0,0,0,0.15)]",
            "hover:bg-black hover:text-white hover:shadow-[5px_5px_0_rgba(0,0,0,0.2)]",
            "active:shadow-[1px_1px_0_rgba(0,0,0,0.15)]",
            "focus-visible:ring-black focus-visible:ring-offset-white"
          );
        case "ghost":
          return clsx(
            "border-transparent text-black bg-transparent shadow-none",
            "hover:bg-grey-100 hover:border-grey-200",
            "active:bg-grey-200",
            "focus-visible:ring-black focus-visible:ring-offset-white"
          );
        default:
          return "";
      }
    }
  };

  return (
    <button
      ref={ref}
      className={clsx(baseClasses, getVariantClasses(), sizeClasses[size], fullWidth && "w-full", className)}
      {...props}
    >
      {icon && iconPosition === "left" ? <span className="text-lg">{icon}</span> : null}
      <span>{children}</span>
      {icon && iconPosition === "right" ? <span className="text-lg">{icon}</span> : null}
    </button>
  );
});

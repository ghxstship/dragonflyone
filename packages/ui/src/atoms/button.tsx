import { forwardRef } from "react";
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const sizeClasses = {
  sm: "px-spacing-4 py-spacing-2 text-body-sm min-h-spacing-10",
  md: "px-spacing-6 py-spacing-3 text-body-md min-h-spacing-12",
  lg: "px-spacing-8 py-spacing-4 text-body-lg min-h-spacing-14",
};

export type ButtonVariant = "solid" | "outline" | "ghost" | "outlineWhite" | "outlineInk";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: keyof typeof sizeClasses;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  inverted?: boolean;
};

/**
 * Button component with multiple variants for different contexts
 * 
 * Variants:
 * - solid: Primary action button (black bg on light, white bg on dark when inverted)
 * - outline: Secondary action with border (black border on light, white border when inverted)
 * - ghost: Minimal button for tertiary actions
 * - outlineWhite: White border button for dark backgrounds (explicit, no inverted prop needed)
 * - outlineInk: Subtle ink-colored border for dark backgrounds
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "solid", size = "md", icon, iconPosition = "right", fullWidth = false, inverted = false, className, children, ...props },
  ref,
) {
  const baseClasses =
    "inline-flex items-center justify-center gap-gap-xs font-heading uppercase tracking-wider transition-colors duration-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed min-h-spacing-12";

  const getVariantClasses = () => {
    // Explicit dark-background variants (no inverted prop needed)
    switch (variant) {
      case "outlineWhite":
        return "border-2 border-white text-white bg-transparent hover:bg-white hover:text-black active:scale-95 focus-visible:outline-white";
      case "outlineInk":
        return "border-2 border-ink-700 text-ink-400 bg-transparent hover:border-white hover:text-white active:scale-95 focus-visible:outline-white";
    }

    // Standard variants with inverted support
    if (inverted) {
      switch (variant) {
        case "solid":
          return "bg-white text-black hover:bg-grey-200 active:scale-95 focus-visible:outline-white";
        case "outline":
          return "border-2 border-white text-white bg-transparent hover:bg-white hover:text-black active:scale-95 focus-visible:outline-white";
        case "ghost":
          return "text-white hover:bg-grey-800 active:bg-grey-700 focus-visible:outline-white";
        default:
          return "";
      }
    } else {
      switch (variant) {
        case "solid":
          return "bg-black text-white hover:bg-grey-900 active:scale-95 focus-visible:outline-black";
        case "outline":
          return "border-2 border-black text-black bg-white hover:bg-black hover:text-white active:scale-95 focus-visible:outline-black";
        case "ghost":
          return "text-black hover:bg-grey-100 active:bg-grey-200 focus-visible:outline-black";
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
      {icon && iconPosition === "left" ? <span className="text-body-lg">{icon}</span> : null}
      <span>{children}</span>
      {icon && iconPosition === "right" ? <span className="text-body-lg">{icon}</span> : null}
    </button>
  );
});

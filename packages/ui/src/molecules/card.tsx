import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type CardVariant = "default" | "outlined" | "elevated" | "primary" | "accent";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  interactive?: boolean;
  inverted?: boolean;
  /** When true and onClick is provided, makes the card keyboard accessible */
  asButton?: boolean;
};

/**
 * Card component - Bold Contemporary Pop Art Adventure
 * 
 * NORMALIZED POP-ART SHADOW STRATEGY:
 * - Resting state: Neutral shadows (black) - clean, professional
 * - Hover state (interactive): Accent color shadow appears - rewards interaction
 * - Active state: Shadow shrinks - confirms action
 * 
 * Variants:
 * - default: Standard card with neutral shadow
 * - outlined: Transparent background with border
 * - elevated: Stronger neutral shadow for emphasis
 * - primary: Neutral resting, PRIMARY color shadow on hover
 * - accent: Neutral resting, ACCENT (pink) color shadow on hover
 * 
 * The `inverted` prop controls light/dark background adaptation:
 * - inverted=true (default): For dark backgrounds
 * - inverted=false: For light backgrounds
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card({ variant = "default", interactive, inverted = true, asButton, className, children, onClick, onKeyDown, ...props }, ref) {
    // Determine if card should be keyboard accessible
    const isClickable = !!onClick;
    const shouldBeAccessible = isClickable || asButton;

    // Handle keyboard activation (Enter/Space)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (shouldBeAccessible && onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
      onKeyDown?.(e);
    };
    const getVariantClasses = () => {
      // Primary variant - accent color on hover
      if (variant === "primary") {
        return clsx(
          inverted
            ? "bg-ink-900 border-2 border-ink-700 text-white"
            : "bg-white border-2 border-black text-black",
          "shadow-[4px_4px_0_rgba(0,0,0,0.2)]"
        );
      }

      // Accent variant - pink accent color on hover
      if (variant === "accent") {
        return clsx(
          inverted
            ? "bg-ink-900 border-2 border-ink-700 text-white"
            : "bg-white border-2 border-black text-black",
          "shadow-[4px_4px_0_rgba(0,0,0,0.2)]"
        );
      }

      if (inverted) {
        // Dark background cards - use subtle shadows
        switch (variant) {
          case "default":
            return clsx(
              "bg-ink-900 border-2 border-ink-700 text-white",
              "shadow-[4px_4px_0_rgba(0,0,0,0.3)]"
            );
          case "outlined":
            return clsx(
              "bg-transparent border-2 border-ink-600 text-white",
              "shadow-[4px_4px_0_rgba(0,0,0,0.2)]"
            );
          case "elevated":
            return clsx(
              "bg-ink-900 border-2 border-ink-600 text-white",
              "shadow-[6px_6px_0_rgba(0,0,0,0.4)]"
            );
          default:
            return "";
        }
      } else {
        // Light background cards - use black shadows
        switch (variant) {
          case "default":
            return clsx(
              "bg-white border-2 border-black text-black",
              "shadow-[4px_4px_0_rgba(0,0,0,0.15)]"
            );
          case "outlined":
            return clsx(
              "bg-transparent border-2 border-black text-black",
              "shadow-[4px_4px_0_rgba(0,0,0,0.1)]"
            );
          case "elevated":
            return clsx(
              "bg-white border-2 border-grey-300 text-black",
              "shadow-[6px_6px_0_rgba(0,0,0,0.2)]"
            );
          default:
            return "";
        }
      }
    };

    const interactiveClasses = interactive
      ? clsx(
          "cursor-pointer",
          "transition-all duration-100 ease-[var(--ease-bounce)]",
          "hover:-translate-x-0.5 hover:-translate-y-0.5",
          // Accent color shadow on hover for primary/accent variants
          variant === "primary"
            ? "hover:shadow-[6px_6px_0_hsl(var(--primary))] active:shadow-[2px_2px_0_hsl(var(--primary)/0.7)]"
            : variant === "accent"
              ? "hover:shadow-[6px_6px_0_hsl(var(--brand-pink))] active:shadow-[2px_2px_0_hsl(var(--brand-pink)/0.7)]"
              : "hover:shadow-[6px_6px_0_rgba(0,0,0,0.25)] active:shadow-[2px_2px_0_rgba(0,0,0,0.15)]",
          "active:translate-x-0.5 active:translate-y-0.5"
        )
      : "";

    return (
      <div
        ref={ref}
        role={shouldBeAccessible ? "button" : undefined}
        tabIndex={shouldBeAccessible ? 0 : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={clsx(
          "p-4 sm:p-5 md:p-6 rounded-[var(--radius-card)]",
          getVariantClasses(),
          interactiveClasses,
          shouldBeAccessible && "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  inverted?: boolean;
};

/**
 * CardHeader - Bold Contemporary Pop Art Adventure
 * Features bold bottom border for panel separation
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader({ inverted = true, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "pb-4 mb-4 border-b-2",
          inverted ? "text-white border-grey-700" : "text-black border-grey-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  inverted?: boolean;
};

/**
 * CardTitle - Bold uppercase heading
 */
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  function CardTitle({ inverted = true, className, children, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={clsx(
          "font-heading text-lg uppercase tracking-wider font-bold",
          inverted ? "text-white" : "text-black",
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement> & {
  inverted?: boolean;
};

/**
 * CardDescription - Muted subtitle text
 */
export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ inverted = true, className, children, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={clsx(
          "text-sm mt-1",
          inverted ? "text-on-dark-muted" : "text-on-light-muted",
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

export type CardBodyProps = HTMLAttributes<HTMLDivElement> & {
  inverted?: boolean;
};

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  function CardBody({ inverted = true, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "mb-4",
          inverted ? "text-on-dark-secondary" : "text-on-light-muted",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export type CardFooterProps = HTMLAttributes<HTMLDivElement> & {
  inverted?: boolean;
};

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter({ inverted = true, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "mt-4 pt-4 border-t-2",
          inverted ? "border-grey-700" : "border-grey-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

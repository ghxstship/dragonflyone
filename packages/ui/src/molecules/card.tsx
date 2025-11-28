import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type CardVariant = "default" | "outlined" | "elevated" | "pop";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  interactive?: boolean;
  inverted?: boolean;
};

/**
 * Card component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Comic panel aesthetic with bold borders
 * - Hard offset shadows
 * - Hover lift effect for interactive cards
 * - Pop variant for maximum impact
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card({ variant = "default", interactive, inverted = false, className, children, ...props }, ref) {
    const getVariantClasses = () => {
      if (inverted) {
        switch (variant) {
          case "default":
            return clsx(
              "bg-ink-900 border-2 border-grey-700 text-white",
              "shadow-[4px_4px_0_rgba(255,255,255,0.15)]"
            );
          case "outlined":
            return clsx(
              "bg-transparent border-2 border-grey-600 text-white",
              "shadow-[4px_4px_0_rgba(255,255,255,0.1)]"
            );
          case "elevated":
            return clsx(
              "bg-ink-900 border-2 border-grey-600 text-white",
              "shadow-[6px_6px_0_rgba(255,255,255,0.2)]"
            );
          case "pop":
            return clsx(
              "bg-ink-950 border-4 border-white text-white",
              "shadow-[6px_6px_0_hsl(239,84%,67%)]"
            );
          default:
            return "";
        }
      } else {
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
          case "pop":
            return clsx(
              "bg-white border-4 border-black text-black",
              "shadow-[6px_6px_0_hsl(239,84%,67%)]"
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
          inverted
            ? "hover:shadow-[6px_6px_0_rgba(255,255,255,0.25)]"
            : "hover:shadow-[6px_6px_0_rgba(0,0,0,0.2)]",
          "active:translate-x-0.5 active:translate-y-0.5",
          inverted
            ? "active:shadow-[2px_2px_0_rgba(255,255,255,0.15)]"
            : "active:shadow-[2px_2px_0_rgba(0,0,0,0.1)]"
        )
      : "";

    return (
      <div
        ref={ref}
        className={clsx(
          "p-6 rounded-[var(--radius-card)]",
          getVariantClasses(),
          interactiveClasses,
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
  function CardHeader({ inverted = false, className, children, ...props }, ref) {
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
  function CardTitle({ inverted = false, className, children, ...props }, ref) {
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
  function CardDescription({ inverted = false, className, children, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={clsx(
          "text-sm mt-1",
          inverted ? "text-grey-400" : "text-grey-600",
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
  function CardBody({ inverted = false, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "mb-4",
          inverted ? "text-grey-300" : "text-grey-700",
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
  function CardFooter({ inverted = false, className, children, ...props }, ref) {
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

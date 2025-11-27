import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type CardVariant = "default" | "outlined" | "elevated";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  interactive?: boolean;
  inverted?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card({ variant = "default", interactive, inverted = false, className, children, ...props }, ref) {
    const getVariantClasses = () => {
      if (inverted) {
        switch (variant) {
          case "default":
            return "bg-ink-900 border-2 border-grey-700 text-white";
          case "outlined":
            return "bg-transparent border-2 border-grey-600 text-white";
          case "elevated":
            return "bg-ink-900 shadow-hard-white text-white";
          default:
            return "";
        }
      } else {
        switch (variant) {
          case "default":
            return "bg-white border-2 border-black text-black";
          case "outlined":
            return "bg-transparent border-2 border-black text-black";
          case "elevated":
            return "bg-white shadow-hard text-black";
          default:
            return "";
        }
      }
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "p-spacing-6",
          getVariantClasses(),
          interactive && "transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
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

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader({ inverted = false, className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("mb-spacing-4", inverted ? "text-white" : "text-black", className)} {...props}>
        {children}
      </div>
    );
  }
);

export type CardBodyProps = HTMLAttributes<HTMLDivElement> & {
  inverted?: boolean;
};

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  function CardBody({ inverted = false, className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("mb-spacing-4", inverted ? "text-grey-300" : "text-grey-700", className)} {...props}>
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
      <div ref={ref} className={clsx("mt-spacing-4 pt-spacing-4 border-t-2", inverted ? "border-grey-700" : "border-grey-200", className)} {...props}>
        {children}
      </div>
    );
  }
);

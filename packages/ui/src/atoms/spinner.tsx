import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "black" | "white" | "grey";
  /** Optional loading text displayed below the spinner */
  text?: string;
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  function Spinner({ size = "md", variant = "black", text, className, ...props }, ref) {
    const sizeClasses = {
      xs: "w-3 h-3 border-2",
      sm: "w-4 h-4 border-2",
      md: "w-6 h-6 border-2",
      lg: "w-8 h-8 border-[3px]",
      xl: "w-12 h-12 border-[3px]",
    };

    const variantClasses = {
      black: "border-black border-t-transparent",
      white: "border-white border-t-transparent",
      grey: "border-grey-400 border-t-transparent",
    };

    const gapClasses = {
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
      xl: "gap-5",
    };

    const textColorClasses = {
      black: "text-grey-600",
      white: "text-grey-300",
      grey: "text-grey-400",
    };

    const spinner = (
      <div
        className={clsx(
          "inline-block rounded-full animate-spin",
          sizeClasses[size],
          variantClasses[variant]
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );

    if (!text) {
      return (
        <div ref={ref} className={className} {...props}>
          {spinner}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx("flex flex-col items-center justify-center", gapClasses[size], className)}
        {...props}
      >
        {spinner}
        <p className={clsx("font-code text-sm uppercase tracking-wider", textColorClasses[variant])}>
          {text}
        </p>
      </div>
    );
  }
);

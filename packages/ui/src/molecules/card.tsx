import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "outlined" | "elevated";
  interactive?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card({ variant = "default", interactive, className, children, ...props }, ref) {
    const variantClasses = {
      default: "bg-white border-2 border-black",
      outlined: "bg-transparent border-2 border-black",
      elevated: "bg-white shadow-hard",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "p-6",
          variantClasses[variant],
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

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("mb-4", className)} {...props}>
        {children}
      </div>
    );
  }
);

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("mb-4", className)} {...props}>
        {children}
      </div>
    );
  }
);

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("mt-4 pt-4 border-t-2 border-grey-200", className)} {...props}>
        {children}
      </div>
    );
  }
);

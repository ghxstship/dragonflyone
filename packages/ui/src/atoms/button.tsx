import { forwardRef } from "react";
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-heading uppercase tracking-wider transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]";

const variantClasses = {
  solid: "bg-black text-white hover:bg-grey-900 active:scale-95",
  outline: "border-2 border-black text-black bg-white hover:bg-black hover:text-white active:scale-95",
  outlineWhite: "border-2 border-white text-white bg-transparent hover:bg-white hover:text-black active:scale-95",
  ghost: "text-black hover:bg-grey-100 active:bg-grey-200",
};

const sizeClasses = {
  sm: "px-4 py-2 text-[1rem] min-h-[40px]",
  md: "px-6 py-3 text-[1.125rem] min-h-[48px]",
  lg: "px-8 py-4 text-[1.25rem] min-h-[56px]",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "solid", size = "md", icon, iconPosition = "right", fullWidth = false, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], fullWidth && "w-full", className)}
      {...props}
    >
      {icon && iconPosition === "left" ? <span className="text-lg">{icon}</span> : null}
      <span>{children}</span>
      {icon && iconPosition === "right" ? <span className="text-lg">{icon}</span> : null}
    </button>
  );
});

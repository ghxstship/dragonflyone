import { forwardRef } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  fullWidth?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ error, fullWidth, className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(
          "font-body px-4 py-3 border-2 transition-colors",
          "focus:outline-none focus:ring-0",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "placeholder:text-grey-400",
          error
            ? "border-black bg-grey-100 focus:border-black"
            : "border-grey-300 bg-white focus:border-black hover:border-grey-400",
          fullWidth ? "w-full" : "w-auto",
          className
        )}
        {...props}
      />
    );
  }
);

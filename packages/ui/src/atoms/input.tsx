import { forwardRef } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  fullWidth?: boolean;
  inverted?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ error, fullWidth, inverted = false, className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(
          "font-body px-spacing-4 py-spacing-3 border-2 transition-colors",
          "focus:outline-none focus:ring-0",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          inverted ? "placeholder:text-grey-500" : "placeholder:text-grey-400",
          error
            ? inverted
              ? "border-grey-500 bg-grey-900 text-white focus:border-grey-400"
              : "border-black bg-grey-100 text-black focus:border-black"
            : inverted
              ? "border-grey-700 bg-ink-900 text-white focus:border-grey-500 hover:border-grey-600"
              : "border-grey-300 bg-white text-black focus:border-black hover:border-grey-400",
          fullWidth ? "w-full" : "w-auto",
          className
        )}
        {...props}
      />
    );
  }
);

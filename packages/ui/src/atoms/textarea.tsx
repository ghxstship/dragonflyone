import { forwardRef } from "react";
import clsx from "clsx";
import type { TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
  fullWidth?: boolean;
  inverted?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ error, fullWidth, inverted = false, className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={clsx(
          "font-body px-spacing-4 py-spacing-3 border-2 transition-colors resize-y min-h-spacing-28",
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

import { forwardRef } from "react";
import clsx from "clsx";
import type { TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
  fullWidth?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ error, fullWidth, className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={clsx(
          "font-body px-4 py-3 border-2 transition-colors resize-y",
          "focus:outline-none focus:ring-0",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "placeholder:text-grey-400 min-h-[120px]",
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

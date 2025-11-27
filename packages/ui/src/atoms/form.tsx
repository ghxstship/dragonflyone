import { forwardRef } from "react";
import clsx from "clsx";
import type { FormHTMLAttributes } from "react";

export type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  /** Gap between form elements */
  gap?: 2 | 4 | 6 | 8;
  /** Full width form */
  fullWidth?: boolean;
};

/**
 * Form component - Design system wrapper for native form element.
 * Provides consistent styling and prevents default page reload on submit.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(
  function Form({ gap = 6, fullWidth = true, className, onSubmit, children, ...props }, ref) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit?.(e);
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={clsx(
          "flex flex-col",
          gap === 2 && "gap-2",
          gap === 4 && "gap-4",
          gap === 6 && "gap-6",
          gap === 8 && "gap-8",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </form>
    );
  }
);

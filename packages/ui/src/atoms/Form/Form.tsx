"use client";

import { forwardRef } from "react";
import { formVariants } from "./Form.variants.js";
import type { FormProps } from "./Form.types.js";

/**
 * Form component - Design system wrapper for native form element.
 * Provides consistent styling and prevents default page reload on submit.
 * 
 * @example
 * ```tsx
 * <Form gap={4} fullWidth onSubmit={handleSubmit}>
 *   <Input placeholder="Name" />
 *   <Button type="submit">Submit</Button>
 * </Form>
 * ```
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
        className={formVariants({ gap, fullWidth, className })}
        {...props}
      >
        {children}
      </form>
    );
  }
);

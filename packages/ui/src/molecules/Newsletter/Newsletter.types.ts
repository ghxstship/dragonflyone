import type { HTMLAttributes } from "react";

/**
 * Newsletter component props
 */
export interface NewsletterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit?: (email: string) => void | Promise<void>;
  placeholder?: string;
  buttonText?: string;
  inverted?: boolean;
}

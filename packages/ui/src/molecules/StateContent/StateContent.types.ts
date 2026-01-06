import type { ReactNode, ComponentProps } from "react";

export interface StateContentProps extends Omit<ComponentProps<"div">, "className" | "title"> {
  /** Icon to display */
  icon: ReactNode;

  /** Main title */
  title: string;

  /** Descriptive message */
  message: string;

  /** Primary action button/element */
  action?: ReactNode;

  /** Secondary action button/element */
  secondaryAction?: ReactNode;

  /** Suggestions list or component */
  suggestions?: ReactNode;

  /** Inverted theme variant */

  /** Additional CSS classes */
  className?: string;
}

import type { ReactNode, ComponentProps } from "react";

export interface PageHeaderProps extends Omit<ComponentProps<"div">, "className" | "title"> {
  /** Small kicker text above title */
  kicker?: string;
  /** Main page title */
  title: string;
  /** Subtitle or description below title */
  subtitle?: string;
  /** Action buttons/elements on the right */
  actions?: ReactNode;
  /** Alignment of content */
  align?: "left" | "center";
  /** Use Display typography for title (larger) */
  displayTitle?: boolean;
  /** Inverted theme variant */
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
}
